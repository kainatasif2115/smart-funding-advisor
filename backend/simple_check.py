"""
Simple pgvector check without importing models
"""

import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def check_and_enable_pgvector():
    print("=" * 70)
    print("PGVECTOR DIAGNOSTIC & INSTALLER")
    print("=" * 70)
    
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("❌ DATABASE_URL not found in .env")
        return
    
    print(f"\n🔗 Connecting to database...")
    
    try:
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        # Check PostgreSQL version
        cur.execute("SELECT version()")
        version = cur.fetchone()[0]
        print(f"✓ Connected: {version[:50]}...")
        
        # Check if vector extension is available
        print("\n1. Checking if pgvector is available...")
        cur.execute("""
            SELECT * FROM pg_available_extensions 
            WHERE name = 'vector'
        """)
        row = cur.fetchone()
        
        if not row:
            print("❌ pgvector is NOT available in this PostgreSQL installation")
            print("\n📦 INSTALL PGVECTOR:")
            print("   brew reinstall pgvector")
            print("   brew services restart postgresql")
            return
        
        print(f"✓ pgvector version {row[1]} is available")
        
        # Check if installed
        print("\n2. Checking if pgvector is enabled...")
        cur.execute("""
            SELECT * FROM pg_extension 
            WHERE extname = 'vector'
        """)
        
        if cur.fetchone():
            print("✓ pgvector extension is already enabled!")
            print("\n✅ Ready for migration! Run: python3 run_migration.py")
        else:
            print("⚠️  pgvector available but not enabled")
            print("\n3. Enabling pgvector extension...")
            try:
                cur.execute("CREATE EXTENSION vector")
                conn.commit()
                print("✓ pgvector extension enabled successfully!")
                print("\n✅ Ready for migration! Run: python3 run_migration.py")
            except Exception as e:
                print(f"❌ Failed: {e}")
                print("\n💡 TRY THIS:")
                print("   psql \"$DATABASE_URL\" -c 'CREATE EXTENSION vector;'")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\n💡 Check your DATABASE_URL in .env file")

if __name__ == '__main__':
    check_and_enable_pgvector()
