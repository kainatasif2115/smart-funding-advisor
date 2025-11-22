# Company Summary Tile Feature

## Overview

The company summary tile is a comprehensive information card that displays all key information about a company in a visually appealing, organized format on the company details page.

## Features

The tile displays:

1. **Company Header**
   - Company name (large, bold title)
   - Y-tunnus / Business ID (subtitle)

2. **Company Description**
   - 2-3 sentence AI-generated summary of what the company does

3. **Status Badges**
   - Company stage (e.g., "growth", "seed", "scale-up")
   - Company size (e.g., "small", "medium", "large")

4. **Information Row**
   - Sector/Industry
   - Location (country and city)
   - Employee count

5. **Funding Need Section**
   - Description of funding purpose
   - Estimated funding amount needed

6. **Keyword Tags**
   - Visual tags for company characteristics and focus areas

## Database Schema Updates

The following new fields have been added to the `companies` table:

```sql
- company_size VARCHAR(50)      -- Company size classification
- country VARCHAR(100)           -- Company country
- city VARCHAR(100)              -- Company city
- funding_purpose TEXT           -- What funding is needed for
- funding_amount VARCHAR(100)    -- Estimated funding need
- keywords JSON                  -- Array of keyword tags
```

## Setup Instructions

### 1. Run Database Migration

Before using the new feature, run the migration script to add the new columns:

```bash
cd backend
python migrate_add_company_fields.py
```

This will add all necessary columns to your existing database without losing any data.

### 2. Backend Changes

The following backend files have been updated:

- `backend/models/database.py` - Updated Company model with new fields
- `backend/routes/companies.py` - Updated to handle new fields
- `backend/services/ytj_service.py` - Extracts location data from YTJ API

### 3. Frontend Changes

- `frontend/app/companies/[id]/page.tsx` - New company summary tile component

## Usage

### Adding Company Data

When adding a company, you can now include these optional fields:

```typescript
{
  name: "Company Name",
  business_id: "1234567-8",
  industry: "Technology",
  company_size: "small",      // new
  growth_stage: "growth",
  employees: 25,
  country: "Finland",          // new
  city: "Helsinki",            // new
  funding_purpose: "...",      // new
  funding_amount: "€200k-€500k", // new
  keywords: [                  // new
    "cloud computing",
    "digital marketing",
    "technology"
  ]
}
```

### Automatic Data Population

- **Location data** (city, country) is automatically extracted from YTJ API when fetching company data
- **AI-generated description** is created automatically using OpenAI
- **Keywords** can be manually added or generated based on company profile

### Manual Data Entry

Users can manually add companies with all these fields through the "Add Company" form, or edit existing companies to add:

- Company size classification
- Funding needs and amounts
- Keywords for better categorization

## Visual Design

The tile uses a card-based design with:

- Clean white background with subtle shadow
- Color-coded badges (purple for stage, blue for size)
- Icon-based information display
- Gradient background for funding section
- Hover effects on keyword tags

## Example Data

Here's an example of a complete company profile:

```json
{
  "name": "TechVentures Oy",
  "business_id": "1234567-8",
  "industry": "Software Development",
  "company_size": "small",
  "growth_stage": "growth",
  "employees": 25,
  "country": "Finland",
  "city": "Helsinki",
  "description": "TechVentures is an innovative software company specializing in cloud-based solutions for SMEs. They develop cutting-edge applications for digital transformation and business process automation.",
  "funding_purpose": "Expansion into Nordic markets and development of AI-powered features for our flagship product line",
  "funding_amount": "€200,000 - €500,000",
  "keywords": [
    "cloud computing",
    "digital transformation",
    "SME solutions",
    "Finland",
    "technology"
  ]
}
```

## Benefits

1. **Better Overview** - All key company information in one place
2. **Professional Presentation** - Clean, modern design
3. **Easy Scanning** - Visual badges and icons for quick information access
4. **Funding Context** - Clear display of funding needs and amounts
5. **Categorization** - Keyword tags for better organization and filtering

## Future Enhancements

Potential improvements for future versions:

- Editable inline fields (click to edit)
- Auto-suggest keywords based on industry
- Company logo display
- Social media links
- Financial metrics visualization
- Company timeline/milestones

## Troubleshooting

### Migration Issues

If you encounter issues running the migration:

1. Check database connection in `backend/.env`
2. Ensure Flask app is properly configured
3. Check database permissions
4. Review error messages for specific column conflicts

### Missing Data

If some fields don't appear:

1. Data may not be available from YTJ API
2. Fields may need to be manually populated
3. Check API response for available data fields

## Support

For questions or issues with this feature, refer to:
- Main README.md
- Technical architecture documentation
- Backend API documentation
