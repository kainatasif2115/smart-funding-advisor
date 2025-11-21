# Smart Funding Advisor - Backend

Flask REST API for the Smart Funding Advisor system.

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` and set:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Random secret key for JWT tokens
- `ANTHROPIC_API_KEY`: Your Claude API key

### 3. Set up PostgreSQL Database

```bash
# Create database
createdb funding_advisor

# Or using psql
psql -U postgres
CREATE DATABASE funding_advisor;
```

### 4. Run the Application

```bash
python app.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Companies
- `GET /api/companies` - List all companies (auth required)
- `GET /api/companies/:id` - Get company details (auth required)
- `POST /api/companies` - Add company manually (auth required)
- `DELETE /api/companies/:id` - Delete company (auth required)
- `POST /api/companies/search-name` - Search by company name (auth required)
- `POST /api/companies/fetch-by-id` - Fetch by Business ID (auth required)
- `POST /api/companies/fetch-by-selection` - Add from search results (auth required)

### Investors/Funding
- `POST /api/investors/fetch` - Fetch matching funding programs (auth required)
- `GET /api/investors/:company_id` - Get cached results (auth required)

### Health Check
- `GET /api/health` - API health status

## Project Structure

```
backend/
├── app.py                      # Main Flask application
├── requirements.txt            # Python dependencies
├── .env.example               # Environment variables template
├── models/
│   └── database.py            # SQLAlchemy models
├── routes/
│   ├── auth.py                # Authentication routes
│   ├── companies.py           # Company management routes
│   └── investors.py           # Funding matching routes
├── services/
│   ├── ytj_service.py         # Finnish Business Registry integration
│   ├── scraper_service.py     # Funding sources scraper
│   └── ai_matcher.py          # Claude AI matching service
└── utils/
    └── auth.py                # JWT authentication utilities
```

## Features

- JWT-based authentication
- Finnish Business Registry (YTJ) integration
- Real-time funding program data scraping
- AI-powered company-funding matching with Claude
- RESTful API design
- PostgreSQL database with SQLAlchemy ORM
