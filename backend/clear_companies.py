"""
Script to clear all companies from the database
"""

from app import create_app
from models.database import db, Company, FundingMatchCache

def clear_companies():
    app = create_app()
    with app.app_context():
        try:
            # First, delete all funding matches (to avoid foreign key constraint)
            funding_count = FundingMatchCache.query.delete()
            print(f"✓ Deleted {funding_count} funding matches")
            
            # Then delete all companies
            company_count = Company.query.delete()
            print(f"✓ Deleted {company_count} companies")
            
            db.session.commit()
            print(f"\n✅ Successfully cleared the database!")
        except Exception as e:
            db.session.rollback()
            print(f"✗ Error clearing database: {e}")

if __name__ == '__main__':
    confirmation = input("Are you sure you want to delete ALL companies? (yes/no): ")
    if confirmation.lower() == 'yes':
        clear_companies()
    else:
        print("Operation cancelled")
