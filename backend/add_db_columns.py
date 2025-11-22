"""
Add missing columns to companies table
"""

from app import create_app
from models.database import db

def add_columns():
    app = create_app()
    with app.app_context():
        try:
            connection = db.engine.raw_connection()
            cursor = connection.cursor()
            
            columns = [
                "ALTER TABLE companies ADD COLUMN IF NOT EXISTS company_size VARCHAR(50)",
                "ALTER TABLE companies ADD COLUMN IF NOT EXISTS country VARCHAR(100)",
                "ALTER TABLE companies ADD COLUMN IF NOT EXISTS city VARCHAR(100)",
                "ALTER TABLE companies ADD COLUMN IF NOT EXISTS funding_purpose TEXT",
                "ALTER TABLE companies ADD COLUMN IF NOT EXISTS funding_amount VARCHAR(100)",
                "ALTER TABLE companies ADD COLUMN IF NOT EXISTS keywords JSON"
            ]
            
            print("Adding missing columns to companies table...")
            for sql in columns:
                cursor.execute(sql)
                print(f"✓ {sql}")
            
            connection.commit()
            cursor.close()
            connection.close()
            
            print("\n✅ Successfully added all columns!")
            
        except Exception as e:
            print(f"✗ Error: {e}")

if __name__ == '__main__':
    add_columns()
