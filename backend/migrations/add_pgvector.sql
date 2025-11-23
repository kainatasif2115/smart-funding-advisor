-- Migration to add pgvector extension and funding_programs table
-- Run this with: psql -d your_database -f backend/migrations/add_pgvector.sql

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create funding_programs table
CREATE TABLE IF NOT EXISTS funding_programs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    eligibility JSON,
    focus_areas JSON,
    deadline VARCHAR(255),
    funding_details JSON,
    url TEXT,
    embedding vector(384),  -- 384 dimensions for sentence-transformers/all-MiniLM-L6-v2
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for vector similarity search (using cosine distance)
CREATE INDEX IF NOT EXISTS funding_programs_embedding_idx 
ON funding_programs 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index for faster lookups by name
CREATE INDEX IF NOT EXISTS funding_programs_name_idx 
ON funding_programs(name);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_funding_programs_updated_at 
BEFORE UPDATE ON funding_programs 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed for your user)
-- GRANT ALL PRIVILEGES ON funding_programs TO your_user;
-- GRANT USAGE, SELECT ON SEQUENCE funding_programs_id_seq TO your_user;
