import csv
import os
from app import app, db
from models import BranchMapping, StatePin

def import_branch_mapping(filepath):
    print(f"Importing Branch Mapping from {filepath}...")
    with app.app_context():
        db.session.query(BranchMapping).delete()
        
        # Open with utf-8-sig to handle possible BOM
        with open(filepath, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                branch_id = row.get('Branch ID', '').strip()
                if not branch_id:
                    continue
                branch = BranchMapping(
                    branch_name=row.get('Branch Name', '').strip()[:255],
                    branch_city=row.get('Branch City', '').strip()[:255],
                    branch_id=branch_id[:100],
                    branch_status=row.get('Branch Status', '').strip()[:50],
                    branch_category=row.get('Branch Category', '').strip()[:50],
                    branch_opening_date=row.get('Branch Opening Date', '').strip()[:50],
                    branch_type=row.get('Branch Type', '').strip()[:50],
                    branch_abm=row.get('Branch ABM: Full Name', '').strip()[:255],
                    branch_rbm=row.get('Branch RBM: Full Name', '').strip()[:255],
                    cluster_manager=row.get('Cluster manager: Full Name', '').strip()[:255],
                    branch_state_head=row.get('Branch State Head: Full Name', '').strip()[:255],
                    portfolio_manager=row.get('Portfolio Manager: Full Name', '').strip()[:255]
                )
                db.session.add(branch)
        db.session.commit()
        print("Branch Mapping imported successfully.")

def import_state_pin(filepath):
    print(f"Importing StatePin from {filepath}...")
    with app.app_context():
        db.session.query(StatePin).delete()
        
        with open(filepath, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    pin_id = int(row['id']) if row.get('id') else None
                except ValueError:
                    pin_id = None
                
                pin = StatePin(
                    id=pin_id,
                    state=row.get('state', '').strip(),
                    district=row.get('district', '').strip(),
                    city=row.get('city', '').strip(),
                    pincode=row.get('pincode', '').strip(),
                    state_code=row.get('state_code', '').strip(),
                    location_type=row.get('location_type', '').strip()
                )
                db.session.add(pin)
        db.session.commit()
        print("StatePin imported successfully.")

if __name__ == '__main__':
    branch_mapping_file = r'D:\Development\DSA\Mapping\Branch Mapping April.csv'
    state_pin_file = r'D:\Development\DSA\Mapping\Statepin.csv'
    
    with app.app_context():
        db.create_all()
        
    import_branch_mapping(branch_mapping_file)
    import_state_pin(state_pin_file)
