-- Add new columns to companies table
-- Run this with: psql -d your_database_name -f add_columns.sql

ALTER TABLE companies ADD COLUMN IF NOT EXISTS company_size VARCHAR(50);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS country VARCHAR(100);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS funding_purpose TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS funding_amount VARCHAR(100);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS keywords JSON;

-- Verify columns were added
\d companies
