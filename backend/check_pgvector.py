"""
Check if pgvector is installed and provide installation instructions
"""

from app import create_app
from models.database import db
from sqlalchemy import text

def check_pgvector():
    print("=" * 70)
    print("PGVECTOR DIAGNOSTIC")
    print("=" * 70)
    
    app = create_app()
    with app.app_context():
        try:
            # Check if vector extension exists
            print("\n1. Checking if pgvector extension is available...")
            result = db.session.execute(text("""
                SELECT * FROM pg_available_extensions 
                WHERE name = 'vector'
            """))
            row = result.fetchone()
            
            if row:
                print(f"   ✓ pgvector extension is available")
                print(f"     Version: {row[1]}")
                print(f"     Installed: {row[2] if row[2] else 'No'}")
                
                if not row[2]:  # Not installed
                    print("\n2. Attempting to install pgvector extension...")
                    try:
                        db.session.execute(text("CREATE EXTENSION vector"))
                        db.session.commit()
                        print("   ✓ pgvector extension installed successfully!")
                    except Exception as e:
                        print(f"   ❌ Failed to install: {e}")
                        print("\n   You may need superuser privileges.")
                        print("   Try running as postgres superuser:")
                        print("   psql -d your_database -c 'CREATE EXTENSION vector;'")
                else:
                    print("   ✓ pgvector extension is already installed")
                    
            else:
                print("   ❌ pgvector extension is NOT available")
                print("\n   SOLUTION:")
                print("   1. Check PostgreSQL version (needs 11+)")
                result = db.session.execute(text("SELECT version()"))
                version = result.scalar()
                print(f"      Your version: {version}")
                
                print("\n   2. Install pgvector for PostgreSQL:")
                print("      - If using Homebrew PostgreSQL:")
                print("        brew postgresql-upgrade-database (if needed)")
                print("        brew reinstall pgvector")
                print("\n      - If using Postgres.app:")
                print("        pgvector should be included")
                print("\n      - If using system PostgreSQL:")
                print("        Download from: https://github.com/pgvector/pgvector")
                
        except Exception as e:
            print(f"\n❌ Database connection error: {e}")
            print("\nCheck your DATABASE_URL in .env file")

if __name__ == '__main__':
    check_pgvector()
