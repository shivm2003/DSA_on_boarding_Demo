
import os
import json
import time
import logging
import traceback
from pathlib import Path

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

from classifier import identify_document
from extractor import extract_fields
from text_extractor import extract_text_only

app = Flask(__name__, static_folder="static")
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Allowed extensions
ALLOWED_EXTENSIONS = {
    ".pdf", ".docx", ".pptx", ".xlsx", ".html", ".htm",
    ".png", ".jpg", ".jpeg", ".tiff", ".bmp", ".md", ".txt"
}

# Lazy-initialized converter (heavy model downloads happen on first use)
_converter = None


def get_converter():
    """Lazily initialize the Docling converter to avoid blocking app startup."""
    global _converter
    if _converter is not None:
        return _converter

    logger.info("Initializing Docling document converter (first-time setup, may download models)...")

    from docling.document_converter import DocumentConverter, PdfFormatOption
    from docling.datamodel.base_models import InputFormat
    from docling.datamodel.pipeline_options import PdfPipelineOptions, TesseractCliOcrOptions
    from docling.backend.pypdfium2_backend import PyPdfiumDocumentBackend

    # Configure PDF pipeline:
    # - OCR disabled (avoids RapidOCR/torch PP-OCRv6 incompatibility crash)
    # - TesseractCliOcrOptions used as a lightweight fallback that won't
    #   trigger the broken RapidOCR torch model initialization
    # - Table structure detection disabled to skip heavy model downloads
    pdf_pipeline_options = PdfPipelineOptions()
    pdf_pipeline_options.do_ocr = False
    pdf_pipeline_options.ocr_options = TesseractCliOcrOptions()
    pdf_pipeline_options.do_table_structure = False

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
    """Check if the file extension is supported by Docling."""
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS


@app.route("/")
def index():
    """Serve the main UI."""
    return send_from_directory("static", "index.html")


@app.route("/<path:path>")
def static_files(path):
    """Serve static files."""
    return send_from_directory("static", path)


@app.route("/api/parse", methods=["POST"])
def parse_document():
    """
    Parse an uploaded document using Docling.
    Returns raw parsed data in multiple formats: dict, markdown, and document text.
    """
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded. Please select a document."}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected."}), 400

    if not allowed_file(file.filename):
        return jsonify({
            "error": f"Unsupported file type: '{Path(file.filename).suffix}'. "
                     f"Supported formats: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        }), 400

    # Save the uploaded file
    safe_filename = f"{int(time.time())}_{file.filename}"
    filepath = UPLOAD_DIR / safe_filename
    file.save(str(filepath))

    try:
        start_time = time.time()

        # ── STEP 1: Upload received ───────────────────────────────────────────
        file_size_bytes = os.path.getsize(str(filepath))
        sep = "=" * 60
        print(f"\n{sep}")
        print(f"  PIPELINE START — {file.filename}")
        print(sep)
        print(f"  [1/5] File received")
        print(f"        Name : {file.filename}")
        print(f"        Size : {file_size_bytes:,} bytes ({file_size_bytes / 1024:.1f} KB)")
        print(f"        Path : {filepath}")

        # ── STEP 2: Docling conversion ────────────────────────────────────────
        print(f"\n  [2/5] Converting document with Docling...")
        conv = get_converter()
        result = conv.convert(str(filepath))
        document = result.document
        elapsed = round(time.time() - start_time, 2)
        print(f"        Done in {elapsed}s")

        # Export to different formats
        raw_dict = document.export_to_dict()
        markdown_text = document.export_to_markdown()

        # ── STEP 3: Element extraction ────────────────────────────────────────
        texts   = raw_dict.get("texts", [])
        tables  = raw_dict.get("tables", [])
        pictures = raw_dict.get("pictures", [])
        pages   = raw_dict.get("pages", {})

        print(f"\n  [3/5] Elements extracted")
        print(f"        Pages    : {len(pages)}")
        print(f"        Texts    : {len(texts) if isinstance(texts, list) else 0}")
        print(f"        Tables   : {len(tables) if isinstance(tables, list) else 0}")
        print(f"        Pictures : {len(pictures) if isinstance(pictures, list) else 0}")

        # Build combined text
        all_texts = []
        for txt in texts:
            if isinstance(txt, dict) and "text" in txt:
                all_texts.append(txt["text"])
        combined_text = "\n".join(all_texts)

        preview = combined_text[:300].replace("\n", " ").strip()
        print(f"\n        Raw text preview ({len(combined_text)} chars):")
        print(f"        \"{preview}{'…' if len(combined_text) > 300 else ''}\"")

        # ── STEP 4: Document classification ──────────────────────────────────
        print(f"\n  [4/5] Classifying document...")
        doc_type = identify_document(combined_text)
        print(f"        Detected type : {doc_type}")

        # ── STEP 5: Field extraction ──────────────────────────────────────────
        print(f"\n  [5/5] Extracting fields for type '{doc_type}'...")
        extracted_data = extract_fields(doc_type, raw_dict)
        text_only_data = extract_text_only(raw_dict)

        if extracted_data:
            for key, val in extracted_data.items():
                print(f"        {key:<30} : {val}")
        else:
            print(f"        (no structured fields extracted)")

        print(f"\n{sep}")
        print(f"  PIPELINE COMPLETE — {elapsed}s total")
        print(f"{sep}\n")

        # Build response metadata
        metadata = {
            "filename": file.filename,
            "file_size_bytes": file_size_bytes,
            "parse_time_seconds": elapsed,
            "num_pages": pages,
            "document_type": doc_type,
        }

        element_counts = {
            "text_elements": len(texts) if isinstance(texts, list) else 0,
            "tables": len(tables) if isinstance(tables, list) else 0,
            "pictures": len(pictures) if isinstance(pictures, list) else 0,
        }

        return jsonify({
            "success": True,
            "metadata": metadata,
            "element_counts": element_counts,
            "extracted_data": extracted_data,
            "raw_text": text_only_data["text"],
            "markdown": markdown_text,
            "raw_data": raw_dict,
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({
            "error": f"Failed to parse document: {str(e)}",
            "traceback": traceback.format_exc()
        }), 500

    finally:
        # Clean up uploaded file
        if filepath.exists():
            filepath.unlink()


@app.route("/api/supported-formats", methods=["GET"])
def supported_formats():
    """Return list of supported file formats."""
    return jsonify({
        "formats": sorted(list(ALLOWED_EXTENSIONS)),
        "description": "Docling supports PDF, DOCX, PPTX, XLSX, HTML, images, and more."
    })


if __name__ == "__main__":
    print("\n>>> Intelligent Document Parser running at http://localhost:5000\n")
    app.run(debug=True, host="0.0.0.0", port=5000)
