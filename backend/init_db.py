import os
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from dotenv import load_dotenv

# Load env vars
load_dotenv()

DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "dsa_db")

print(f"Connecting to PostgreSQL as user {DB_USER} at {DB_HOST}:{DB_PORT}...")

try:
    # Connect to the default 'postgres' database to create the new one
    conn = psycopg2.connect(
        dbname='postgres',
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()
    
    # Check if database exists
    cursor.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{DB_NAME}'")
    exists = cursor.fetchone()
    
    if not exists:
        print(f"Creating database '{DB_NAME}'...")
        cursor.execute(f"CREATE DATABASE {DB_NAME}")
        print("Database created successfully!")
    else:
        print(f"Database '{DB_NAME}' already exists.")
        
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"Error creating database: {e}")
    print("\nTroubleshooting:")
    print("1. Ensure PostgreSQL is installed and running on your system.")
    print(f"2. Ensure the user '{DB_USER}' with password '{DB_PASSWORD}' exists.")
    print("3. Check your .env file credentials.")
    sys.exit(1)

# Now, initialize Flask app, create tables, and create user
print("\nInitializing database tables...")

from app import app, db
from models import User

with app.app_context():
    # Create tables
    db.create_all()
    print("Database tables created.")
    
    username = "admin"
    password = "password123"
    display_name = "Admin User"
    
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        print(f"User '{username}' already exists.")
    else:
        new_user = User(
            username=username,
            role="channel-manager",
            display_name=display_name
        )
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()
        print(f"User '{username}' created successfully with password '{password}'!")
