from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from db import db


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(50), nullable=False, default='channel-manager')
    display_name = db.Column(db.String(255))
    dob = db.Column(db.String(20))
    mobile = db.Column(db.String(20))
    reset_otp = db.Column(db.String(10))
    consent_otp = db.Column(db.String(10))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role,
            'display_name': self.display_name,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }



class ParsedDocument(db.Model):
    __tablename__ = 'parsed_documents'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    filename = db.Column(db.String(255))
    file_size_bytes = db.Column(db.Integer)
    document_type = db.Column(db.String(100))
    parse_time_seconds = db.Column(db.Float)
    extracted_data = db.Column(JSONB)
    raw_text = db.Column(db.Text)
    markdown_text = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.filename,
            'file_size_bytes': self.file_size_bytes,
            'document_type': self.document_type,
            'parse_time_seconds': self.parse_time_seconds,
            'extracted_data': self.extracted_data,
            'raw_text': self.raw_text,
            'markdown_text': self.markdown_text,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Submission(db.Model):
    __tablename__ = 'submissions'

    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(255))
    dsaCode = db.Column(db.String(100))
    date = db.Column(db.String(50))
    status = db.Column(db.String(50), default='Pending')
    step = db.Column(db.String(50))
    data = db.Column(JSONB)
    verificationStatus = db.Column(JSONB)
    remarksHistory = db.Column(JSONB)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'dsaCode': self.dsaCode,
            'date': self.date,
            'status': self.status,
            'step': self.step,
            'data': self.data or {},
            'verificationStatus': self.verificationStatus or {},
            'remarksHistory': self.remarksHistory or []
        }
