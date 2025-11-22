"""
Add website column to companies table
"""

from app import create_app
from models.database import db

def add_website_column():
    app = create_app()
    with app.app_context():
        try:
            connection = db.engine.raw_connection()
            cursor = connection.cursor()
            
            sql = "ALTER TABLE companies ADD COLUMN IF NOT EXISTS website VARCHAR(255)"
            
            print("Adding website column to companies table...")
            cursor.execute(sql)
            print(f"✓ {sql}")
            
            connection.commit()
            cursor.close()
            connection.close()
            
            print("\n✅ Successfully added website column!")
            
        except Exception as e:
            print(f"✗ Error: {e}")

if __name__ == '__main__':
    add_website_column()
