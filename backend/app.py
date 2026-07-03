
import os
import re
import time
import logging
import traceback
from pathlib import Path
import fitz

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

from db import init_db, db
from models import Submission, ParsedDocument, User
from parsers import get_parser, classify_document
from auth import auth_bp, token_required

# ─── Application Factory ─────────────────────────────────────────────────────

app = Flask(__name__, static_folder="static")

# Production CORS: restrict to known origins
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:5000").split(",")
CORS(app, origins=ALLOWED_ORIGINS, supports_credentials=True)

# ─── Database & Auth ──────────────────────────────────────────────────────────

# Database & Auth
init_db(app)
app.register_blueprint(auth_bp)

# ─── Logging ──────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("dsa-portal")

# ─── File Upload Config ──────────────────────────────────────────────────────

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

MAX_CONTENT_LENGTH = 25 * 1024 * 1024  # 25 MB
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH

ALLOWED_EXTENSIONS = {
    ".pdf", ".docx", ".pptx", ".xlsx", ".html", ".htm",
    ".png", ".jpg", ".jpeg", ".tiff", ".bmp", ".md", ".txt"
}

# ─── Docling Converter (Lazy Init) ───────────────────────────────────────────

_converter = None


def get_converter():
    """Lazily initialize the Docling converter to avoid blocking app startup."""
    global _converter
    if _converter is not None:
        return _converter

    logger.info("Initializing Docling document converter (first-time setup)...")

    from docling.document_converter import DocumentConverter, PdfFormatOption
    from docling.datamodel.base_models import InputFormat
    from docling.datamodel.pipeline_options import PdfPipelineOptions, TesseractCliOcrOptions
    from docling.backend.pypdfium2_backend import PyPdfiumDocumentBackend

    pdf_pipeline_options = PdfPipelineOptions()
    pdf_pipeline_options.do_ocr = True

    _converter = DocumentConverter(
        format_options={
            InputFormat.PDF: PdfFormatOption(
                pipeline_options=pdf_pipeline_options,
                backend=PyPdfiumDocumentBackend
            )
        }
    )

    logger.info("Docling converter initialized successfully.")
    return _converter


def allowed_file(filename: str) -> bool:
    """Check if the file extension is supported."""
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS


# ─── Global Error Handlers ───────────────────────────────────────────────────

@app.errorhandler(400)
def bad_request(e):
    return jsonify({"error": "Bad request."}), 400


@app.errorhandler(401)
def unauthorized(e):
    return jsonify({"error": "Authentication required."}), 401


@app.errorhandler(403)
def forbidden(e):
    return jsonify({"error": "Access denied."}), 403


@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Resource not found."}), 404


@app.errorhandler(413)
def payload_too_large(e):
    return jsonify({"error": f"File too large. Maximum size is {MAX_CONTENT_LENGTH // (1024*1024)} MB."}), 413


@app.errorhandler(500)
def internal_error(e):
    logger.error(f"Internal server error: {e}")
    return jsonify({"error": "An internal server error occurred."}), 500


# ─── Static File Routes ──────────────────────────────────────────────────────

@app.route("/")
def index():
    """Serve the main UI."""
    return send_from_directory("static", "index.html")


@app.route("/<path:path>")
def static_files(path):
    """Serve static files."""
    return send_from_directory("static", path)


# ─── Document Parsing (Protected) ────────────────────────────────────────────

@app.route("/api/parse", methods=["POST"])
@token_required
def parse_document(current_user):
    """
    Parse an uploaded document using Docling.
    Requires valid JWT token.
    """
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded."}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected."}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Unsupported file type."}), 400

    safe_filename = f"{int(time.time())}_{file.filename}"
    filepath = UPLOAD_DIR / safe_filename
    file.save(str(filepath))

    try:
        start_time = time.time()

        file_size_bytes = os.path.getsize(str(filepath))
        logger.info(f"[PARSE] User={current_user.username} File={file.filename} Size={file_size_bytes}B")
        logger.info(f"[PARSE] === STARTED PARSING {file.filename} ===")

        # Step 1 & 2: Text Extraction (PyMuPDF or Docling)
        is_pdf = file.filename.lower().endswith('.pdf')
        combined_text = ""
        markdown_text = ""
        raw_dict = {}
        pages = []
        texts = []
        tables = []
        pictures = []
        
        is_searchable = False
        
        if is_pdf:
            logger.info("[PARSE] Step 1/4: Checking if PDF is searchable with PyMuPDF...")
            try:
                doc = fitz.open(str(filepath))
                pymupdf_text = ""
                for page in doc:
                    pymupdf_text += page.get_text() + "\n"
                doc.close()
                
                # Simple heuristic: if we got significant text, it's searchable
                if len(pymupdf_text.strip()) > 50:
                    is_searchable = True
                    combined_text = pymupdf_text
                    markdown_text = pymupdf_text
                    raw_dict = {"texts": [{"text": pymupdf_text}]}
                    texts = [{"text": pymupdf_text}]
                    elapsed = round(time.time() - start_time, 2)
                    logger.info(f"[PARSE] PyMuPDF extraction finished in {elapsed}s. Extracted {len(combined_text)} chars.")
                else:
                    logger.info("[PARSE] PDF is not searchable or has too little text. Falling back to Docling OCR.")
            except Exception as ex:
                logger.warning(f"[PARSE] PyMuPDF check failed: {ex}. Falling back to Docling OCR.")

        if not is_searchable:
            logger.info("[PARSE] Step 1/4: Running Docling OCR conversion... (This may take a moment)")
            conv = get_converter()
            result = conv.convert(str(filepath))
            document = result.document
            elapsed = round(time.time() - start_time, 2)
            logger.info(f"[PARSE] Docling conversion finished in {elapsed}s.")
    
            raw_dict = document.export_to_dict()
            markdown_text = document.export_to_markdown()
    
            logger.info("[PARSE] Step 2/4: Extracting and combining raw text...")
            texts = raw_dict.get("texts", [])
            tables = raw_dict.get("tables", [])
            pictures = raw_dict.get("pictures", [])
            pages = raw_dict.get("pages", {})
    
            all_texts = []
            for txt in texts:
                if isinstance(txt, dict) and "text" in txt:
                    all_texts.append(txt["text"])
            combined_text = "\n".join(all_texts)
            logger.info(f"[PARSE] Extracted {len(all_texts)} text blocks across {len(pages)} pages.")

        logger.info(f"[PARSE] --- RAW TEXT PREVIEW (First 500 chars) ---")
        logger.info(f"\n{combined_text[:500]}...\n")

        # Step 3: Classification
        logger.info("[PARSE] Step 3/4: Classifying document type...")
        frontend_doc_type = request.form.get("documentType")
        if frontend_doc_type:
            doc_type = frontend_doc_type.upper()
            logger.info(f"[PARSE] Received explicit document type from frontend: {doc_type}")
        else:
            doc_type = classify_document(combined_text)
            logger.info(f"[PARSE] Auto-classified document type: {doc_type}")

        # Step 4: Field extraction
        logger.info(f"[PARSE] Step 4/4: Running Regex field extractors for {doc_type}...")
        parser = get_parser(doc_type)
        extracted_data = {}
        if parser:
            extracted_data = parser.extract_fields(combined_text, combined_text.lower(), raw_dict)
            logger.info(f"[PARSE] Extraction successful. Found {len(extracted_data)} specific fields.")
            # Normalize keys to camelCase expected by frontend/backoffice
            def to_camel(s):
                parts = s.split('_')
                return parts[0] + ''.join(p.title() for p in parts[1:]) if len(parts) > 1 else s

            mapped = {}
            for k, v in (extracted_data or {}).items():
                mapped[to_camel(k)] = v
            extracted_data = mapped
            import json
            logger.info(f"[PARSE] Extracted Data (DEBUG):\n{json.dumps(extracted_data, indent=2)}")
        else:
            logger.warning(f"[PARSE] No specific parser found for {doc_type}. Passing raw text only.")

        # Step 5: Persist to database
        parsed_doc = ParsedDocument(
            filename=file.filename,
            file_size_bytes=file_size_bytes,
            document_type=doc_type,
            parse_time_seconds=elapsed,
            extracted_data=extracted_data if extracted_data else {},
            raw_text=combined_text,
            markdown_text=markdown_text
        )
        db.session.add(parsed_doc)
        db.session.commit()

        logger.info(f"[PARSE] Saved document_id={parsed_doc.id}")

        return jsonify({
            "success": True,
            "document_id": parsed_doc.id,
            "metadata": {
                "filename": file.filename,
                "file_size_bytes": file_size_bytes,
                "parse_time_seconds": elapsed,
                "num_pages": len(pages),
                "document_type": doc_type,
            },
            "element_counts": {
                "text_elements": len(texts) if isinstance(texts, list) else 0,
                "tables": len(tables) if isinstance(tables, list) else 0,
                "pictures": len(pictures) if isinstance(pictures, list) else 0,
            },
            "extracted_data": extracted_data,
            "raw_text": combined_text,
            "markdown": markdown_text,
        })

    except Exception as e:
        logger.error(f"[PARSE] Failed for {file.filename}: {e}")
        logger.debug(traceback.format_exc())
        return jsonify({"error": "Document parsing failed. Please try again."}), 500

    finally:
        if filepath.exists():
            filepath.unlink()


# ─── Submissions (Protected) ─────────────────────────────────────────────────

def generate_application_id():
    """Generate the next application form number in DSA-0001 format."""
    submissions = Submission.query.with_entities(Submission.id, Submission.dsaCode).all()
    highest = 0

    for submission_id, dsa_code in submissions:
        for value in (submission_id, dsa_code):
            match = re.fullmatch(r"DSA-(\d+)", str(value or ""))
            if match:
                highest = max(highest, int(match.group(1)))

    return f"DSA-{highest + 1:04d}"

@app.route("/api/submissions", methods=["GET"])
@token_required
def get_submissions(current_user):
    """Fetch all submissions. Requires valid JWT token."""
    submissions = Submission.query.order_by(Submission.created_at.desc()).all()
    return jsonify([sub.to_dict() for sub in submissions])


@app.route("/api/submissions", methods=["POST"])
@token_required
def create_submission(current_user):
    """Create a new submission. Requires valid JWT token."""
    try:
        data = request.json
        if not data:
            return jsonify({"error": "Request body is required."}), 400

        application_id = data.get('id') or generate_application_id()

        new_sub = Submission(
            id=application_id,
            name=data.get('name'),
            dsaCode=data.get('dsaCode') or application_id,
            date=data.get('date'),
            status=data.get('status', 'Pending'),
            step=data.get('step'),
            data=data.get('data', {}),
            verificationStatus=data.get('verificationStatus', {}),
            remarksHistory=data.get('remarksHistory', [])
        )
        db.session.add(new_sub)
        db.session.commit()

        logger.info(f"[SUBMISSION] Created id={new_sub.id} by user={current_user.username}")
        return jsonify(new_sub.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"[SUBMISSION] Create failed: {e}")
        return jsonify({"error": "Failed to create submission."}), 500


@app.route("/api/submissions/<sub_id>", methods=["GET"])
@token_required
def get_submission(current_user, sub_id):
    """Fetch one submission. Requires valid JWT token."""
    sub = Submission.query.get(sub_id)
    if not sub:
        return jsonify({"error": "Submission not found."}), 404

    return jsonify(sub.to_dict())


@app.route("/api/submissions/<sub_id>", methods=["PUT"])
@token_required
def update_submission(current_user, sub_id):
    """Update a submission. Requires valid JWT token."""
    try:
        sub = Submission.query.get(sub_id)
        if not sub:
            return jsonify({"error": "Submission not found."}), 404

        data = request.json
        if not data:
            return jsonify({"error": "Request body is required."}), 400

        if 'status' in data:
            sub.status = data['status']
        if 'name' in data:
            sub.name = data['name']
        if 'dsaCode' in data:
            sub.dsaCode = data['dsaCode']
        if 'date' in data:
            sub.date = data['date']
        if 'step' in data:
            sub.step = data['step']
        if 'data' in data:
            sub.data = data['data']
        if 'verificationStatus' in data:
            sub.verificationStatus = data['verificationStatus']
        if 'remarksHistory' in data:
            sub.remarksHistory = data['remarksHistory']

        db.session.commit()

        logger.info(f"[SUBMISSION] Updated id={sub_id} by user={current_user.username}")
        return jsonify(sub.to_dict())

    except Exception as e:
        db.session.rollback()
        logger.error(f"[SUBMISSION] Update failed for {sub_id}: {e}")
        return jsonify({"error": "Failed to update submission."}), 500


# ─── Entry Point ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    is_debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    port = int(os.getenv("PORT", 5000))
    logger.info(f"DSA Portal starting on http://localhost:{port} (debug={is_debug})")
    app.run(debug=is_debug, host="0.0.0.0", port=port)
