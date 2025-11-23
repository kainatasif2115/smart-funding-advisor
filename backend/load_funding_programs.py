"""
One-time script to load funding programs from JSON and generate embeddings
Run this after the database migration: python backend/load_funding_programs.py
"""

import json
import os
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from app import create_app
from models.database import db, FundingProgram
from services.embedding_service import get_embedding_service

def load_programs_from_json(json_path='backend/data/accurate_funding_programs.json'):
    """Load funding programs from JSON file"""
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Handle both list and dict formats
    if isinstance(data, list):
        return data
    elif isinstance(data, dict) and 'programs' in data:
        return data['programs']
    else:
        return []

def main():
    """Main function to load and embed funding programs"""
    print("=" * 70)
    print("FUNDING PROGRAMS LOADER WITH EMBEDDINGS")
    print("=" * 70)
    
    # Create app context
    app = create_app()
    
    # Check if JSON file exists
    json_path = 'backend/data/accurate_funding_programs.json'
    if not os.path.exists(json_path):
        json_path = 'data/accurate_funding_programs.json'
        if not os.path.exists(json_path):
            print(f"❌ Error: Could not find accurate_funding_programs.json")
            return
    
    print(f"\n1. Loading programs from {json_path}...")
    programs = load_programs_from_json(json_path)
    print(f"   ✓ Loaded {len(programs)} programs")
    
    if not programs:
        print("❌ No programs found in JSON file")
        return
    
    # Initialize embedding service
    print("\n2. Initializing embedding service...")
    try:
        embedding_service = get_embedding_service()
        print("   ✓ Embedding service ready")
    except Exception as e:
        print(f"   ❌ Failed to initialize embedding service: {e}")
        print("\n   Possible issues:")
        print("   - sentence-transformers not installed: pip install sentence-transformers")
        print("   - Model download failed: Check internet connection")
        print("   - Insufficient memory: Need at least 2GB RAM")
        return
    
    # Generate embeddings for all programs
    print(f"\n3. Generating embeddings for {len(programs)} programs...")
    print("   (This may take 30-60 seconds on first run as model downloads)")
    print("   Model: all-MiniLM-L6-v2 (384 dimensions)")
    
    try:
        embeddings = embedding_service.embed_programs(programs)
        print(f"   ✓ Generated {len(embeddings)} embeddings successfully")
        
        # Verify embeddings are valid
        if not embeddings or len(embeddings) != len(programs):
            raise Exception(f"Embedding count mismatch: {len(embeddings)} vs {len(programs)}")
        
        # Check first embedding is valid
        if not embeddings[0] or len(embeddings[0]) != 384:
            raise Exception(f"Invalid embedding dimensions: {len(embeddings[0])} (expected 384)")
        
        print(f"   ✓ All embeddings validated (384 dimensions each)")
        
    except Exception as e:
        print(f"   ❌ Failed to generate embeddings: {e}")
        print("\n   This is a critical error - cannot proceed without embeddings")
        import traceback
        traceback.print_exc()
        return
    
    # Save to database
    print("\n4. Saving to database...")
    
    with app.app_context():
        # Check if programs already exist
        existing_count = FundingProgram.query.count()
        
        if existing_count > 0:
            print(f"   ℹ️  Found {existing_count} existing programs in database")
            print(f"   Checking which programs need to be added/updated...")
            
            # Get existing program names
            existing_programs = {fp.name: fp for fp in FundingProgram.query.all()}
            
            # Separate into new, existing, and updated
            new_programs = []
            skip_count = 0
            update_count = 0
            
            for program, embedding in zip(programs, embeddings):
                name = program.get('name', '')
                if name in existing_programs:
                    # Program exists - check if it needs update
                    existing = existing_programs[name]
                    if existing.embedding is None or len(existing.embedding) != 384:
                        # Missing or invalid embedding - update it
                        existing.embedding = embedding
                        existing.description = program.get('description', '')
                        existing.provider = program.get('provider', '')
                        existing.eligibility = program.get('eligibility', {})
                        existing.focus_areas = program.get('focus_areas', [])
                        existing.deadline = program.get('deadline')
                        existing.funding_details = program.get('funding_details', {})
                        existing.url = program.get('url')
                        update_count += 1
                    else:
                        # Already has valid embedding - skip
                        skip_count += 1
                else:
                    # New program
                    new_programs.append((program, embedding))
            
            if skip_count > 0:
                print(f"   ✓ Skipping {skip_count} programs (already have embeddings)")
            if update_count > 0:
                print(f"   ⚠️  Updating {update_count} programs (missing/invalid embeddings)")
            if new_programs:
                print(f"   ➕ Adding {len(new_programs)} new programs")
            
            # Add new programs
            for i, (program, embedding) in enumerate(new_programs):
                try:
                    fp = FundingProgram(
                        name=program.get('name', ''),
                        provider=program.get('provider', ''),
                        description=program.get('description', ''),
                        eligibility=program.get('eligibility', {}),
                        focus_areas=program.get('focus_areas', []),
                        deadline=program.get('deadline'),
                        funding_details=program.get('funding_details', {}),
                        url=program.get('url'),
                        embedding=embedding
                    )
                    db.session.add(fp)
                except Exception as e:
                    print(f"   ❌ Error adding '{program.get('name', 'Unknown')}': {e}")
            
            # Commit all changes
            try:
                db.session.commit()
                print(f"   ✓ Database updated successfully")
                print(f"      - New: {len(new_programs)}")
                print(f"      - Updated: {update_count}")
                print(f"      - Skipped: {skip_count}")
            except Exception as e:
                print(f"   ❌ Failed to commit changes: {e}")
                db.session.rollback()
                raise
        
        else:
            # No existing programs - insert all
            print(f"   ➕ Adding all {len(programs)} programs (first time setup)")
            success_count = 0
            failed = []
            
            for i, (program, embedding) in enumerate(zip(programs, embeddings)):
                try:
                    fp = FundingProgram(
                        name=program.get('name', ''),
                        provider=program.get('provider', ''),
                        description=program.get('description', ''),
                        eligibility=program.get('eligibility', {}),
                        focus_areas=program.get('focus_areas', []),
                        deadline=program.get('deadline'),
                        funding_details=program.get('funding_details', {}),
                        url=program.get('url'),
                        embedding=embedding
                    )
                    db.session.add(fp)
                    success_count += 1
                    
                    # Commit in batches of 10
                    if (i + 1) % 10 == 0:
                        db.session.commit()
                        print(f"   Progress: {i + 1}/{len(programs)} programs saved...")
                
                except Exception as e:
                    print(f"   ❌ Error saving '{program.get('name', 'Unknown')}': {e}")
                    failed.append(program.get('name', 'Unknown'))
                    db.session.rollback()
            
            # Final commit
            try:
                db.session.commit()
                print(f"   ✓ Successfully saved {success_count}/{len(programs)} programs")
                if failed:
                    print(f"   ⚠️  Failed programs: {', '.join(failed)}")
            except Exception as e:
                print(f"   ❌ Final commit failed: {e}")
                db.session.rollback()
                raise
    
    # Verify
    print("\n5. Verifying...")
    with app.app_context():
        total = FundingProgram.query.count()
        with_embeddings = FundingProgram.query.filter(
            FundingProgram.embedding.isnot(None)
        ).count()
        
        print(f"   ✓ Total programs in database: {total}")
        print(f"   ✓ Programs with embeddings: {with_embeddings}")
    
    print("\n" + "=" * 70)
    print("✓ LOADING COMPLETE!")
    print("=" * 70)
    print("\nYou can now use the AI matcher with semantic search!")
    print("The system will automatically find the most relevant 15 programs")
    print("for each company using vector similarity.\n")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Aborted by user")
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
