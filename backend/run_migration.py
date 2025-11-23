"""
Script to run pgvector migration automatically
No need to manually get database URL - uses Flask app context
"""

from app import create_app
from models.database import db
from sqlalchemy import text

def run_migration():
    """Run the pgvector migration"""
    print("=" * 70)
    print("PGVECTOR MIGRATION - AUTOMATIC")
    print("=" * 70)
    
    app = create_app()
    with app.app_context():
        try:
            # Step 1: Enable pgvector extension
            print("\n1. Enabling pgvector extension...")
            db.session.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            print("   ✓ pgvector extension enabled")
            
            # Step 2: Create funding_programs table
            print("\n2. Creating funding_programs table...")
            db.session.execute(text("""
                CREATE TABLE IF NOT EXISTS funding_programs (
                    id SERIAL PRIMARY KEY,
                    name TEXT NOT NULL,
                    provider TEXT NOT NULL,
                    description TEXT NOT NULL,
                    eligibility JSON,
                    focus_areas JSON,
                    deadline TEXT,
                    funding_details JSON,
                    url TEXT,
                    embedding vector(384),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            print("   ✓ funding_programs table created")
            
            # Step 3: Create vector index
            print("\n3. Creating vector similarity index...")
            try:
                db.session.execute(text("""
                    CREATE INDEX IF NOT EXISTS funding_programs_embedding_idx 
                    ON funding_programs 
                    USING ivfflat (embedding vector_cosine_ops)
                    WITH (lists = 100)
                """))
                print("   ✓ Vector index created (IVFFlat, cosine similarity)")
            except Exception as e:
                if "already exists" in str(e).lower():
                    print("   ✓ Vector index already exists")
                else:
                    print(f"   ⚠️  Index creation skipped: {e}")
            
            # Step 4: Create name index
            print("\n4. Creating name index...")
            db.session.execute(text("""
                CREATE INDEX IF NOT EXISTS funding_programs_name_idx 
                ON funding_programs(name)
            """))
            print("   ✓ Name index created")
            
            # Step 5: Create update trigger function
            print("\n5. Creating update trigger...")
            db.session.execute(text("""
                CREATE OR REPLACE FUNCTION update_updated_at_column()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.updated_at = CURRENT_TIMESTAMP;
                    RETURN NEW;
                END;
                $$ language 'plpgsql'
            """))
            print("   ✓ Update trigger function created")
            
            # Step 6: Create trigger
            db.session.execute(text("""
                DROP TRIGGER IF EXISTS update_funding_programs_updated_at ON funding_programs
            """))
            db.session.execute(text("""
                CREATE TRIGGER update_funding_programs_updated_at 
                BEFORE UPDATE ON funding_programs 
                FOR EACH ROW 
                EXECUTE FUNCTION update_updated_at_column()
            """))
            print("   ✓ Update trigger created")
            
            # Commit all changes
            db.session.commit()
            
            # Verify
            print("\n6. Verifying setup...")
            result = db.session.execute(text("SELECT COUNT(*) FROM funding_programs"))
            count = result.scalar()
            print(f"   ✓ funding_programs table accessible (currently {count} programs)")
            
            print("\n" + "=" * 70)
            print("✅ MIGRATION COMPLETE!")
            print("=" * 70)
            print("\nNext step: Run 'python backend/load_funding_programs.py'")
            print("           to load programs and generate embeddings\n")
            
        except Exception as e:
            db.session.rollback()
            print("\n" + "=" * 70)
            print("❌ MIGRATION FAILED")
            print("=" * 70)
            print(f"\nError: {e}")
            print("\nPossible issues:")
            print("1. pgvector extension not installed in PostgreSQL")
            print("   Solution: brew install pgvector  (macOS)")
            print("            or apt install postgresql-pgvector  (Linux)")
            print("\n2. Insufficient database permissions")
            print("   Solution: Use superuser account or grant CREATE permissions")
            print("\n3. Database connection issue")
            print("   Solution: Check DATABASE_URL in .env file\n")
            raise

if __name__ == '__main__':
    print("\nThis will create the pgvector extension and funding_programs table.")
    print("Safe to run multiple times (uses IF NOT EXISTS).\n")
    
    confirmation = input("Continue? (yes/no): ")
    if confirmation.lower() in ['yes', 'y']:
        run_migration()
    else:
        print("❌ Migration cancelled")
