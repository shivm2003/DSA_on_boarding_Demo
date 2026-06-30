import os
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import urllib.parse

db = SQLAlchemy()

def init_db(app):
    load_dotenv()
    
    db_user = os.getenv("DB_USER", "postgres")
    db_password = os.getenv("DB_PASSWORD", "postgres")
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "5432")
    db_name = os.getenv("DB_NAME", "dsa_db")

    # URL-encode the password to safely handle special characters like '@'
    encoded_password = urllib.parse.quote_plus(db_password)
    app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql://{db_user}:{encoded_password}@{db_host}:{db_port}/{db_name}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    with app.app_context():
        # Explicitly create all tables defined in models.py
        db.create_all()
        print("Database initialized and tables created if they didn't exist.")
