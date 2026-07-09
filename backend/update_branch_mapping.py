import csv
from pathlib import Path
from sqlalchemy import text
from app import app, db
from models import BranchMapping, StatePin

BASE_DIR = Path(__file__).resolve().parent
REPO_ROOT = BASE_DIR.parent
BRANCH_MAPPING_FILE = REPO_ROOT / "Mapping" / "Branch Update.csv"
STATE_PIN_FILE = REPO_ROOT / "Mapping" / "Statepin.csv"


def update_branch_mapping(filepath):
    print(f"Updating Branch Mapping from {filepath}...")
    with app.app_context():
        try:
            db.session.execute(text("ALTER TABLE branch_mapping ADD COLUMN IF NOT EXISTS branch_state VARCHAR(255)"))
            db.session.commit()
            print("Ensured branch_state column exists.")
        except Exception as e:
            db.session.rollback()
            print(f"Error altering table: {e}")

        db.session.query(BranchMapping).delete()

        with open(filepath, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                branch_id = row.get('Branch ID', '').strip()
                if not branch_id:
                    continue
                branch = BranchMapping(
                    branch_name=row.get('Branch Name', '').strip()[:255],
                    branch_city=row.get('Branch City', '').strip()[:255],
                    branch_state=row.get('Branch State', '').strip()[:255],
                    branch_id=branch_id[:100],
                    branch_category=row.get('Branch Category', '').strip()[:50],
                    branch_opening_date=row.get('Branch Opening Date', '').strip()[:50],
                    branch_type=row.get('Branch Type', '').strip()[:50],
                    branch_abm=row.get('Branch ABM: Full Name', '').strip()[:255],
                    branch_rbm=row.get('Branch RBM: Full Name', '').strip()[:255],
                    cluster_manager=row.get('Cluster manager: Full Name', '').strip()[:255],
                    branch_state_head=row.get('Branch State Head: Full Name', '').strip()[:255]
                )
                db.session.add(branch)
        db.session.commit()
        print("Branch Mapping updated successfully.")


def update_state_pin(filepath):
    print(f"Updating State PIN data from {filepath}...")
    with app.app_context():
        db.session.query(StatePin).delete()

        with open(filepath, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                pin_id = row.get('id', '').strip()
                if not pin_id:
                    continue
                state_pin = StatePin(
                    id=int(pin_id),
                    state=row.get('state', '').strip()[:255],
                    district=row.get('district', '').strip()[:255],
                    city=row.get('city', '').strip()[:255],
                    pincode=row.get('pincode', '').strip()[:20],
                    state_code=row.get('state_code', '').strip()[:20],
                    location_type=row.get('location_type', '').strip()[:100],
                )
                db.session.add(state_pin)
        db.session.commit()
        print("State PIN data updated successfully.")


def update_all():
    update_branch_mapping(BRANCH_MAPPING_FILE)
    update_state_pin(STATE_PIN_FILE)


if __name__ == '__main__':
    update_all()
