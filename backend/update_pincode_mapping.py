import csv
from pathlib import Path
from app import app, db
from models import StatePin

BASE_DIR = Path(__file__).resolve().parent
REPO_ROOT = BASE_DIR.parent
STATE_PIN_FILE = REPO_ROOT / "Mapping" / "Statepin.csv"


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


if __name__ == '__main__':
    update_state_pin(STATE_PIN_FILE)
