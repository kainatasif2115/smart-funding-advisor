# Smart Funding Advisor - Technical Architecture

## System Overview

The Smart Funding Advisor is a full-stack web application that uses AI to match Finnish companies with relevant funding programs. It consists of a Flask backend API, PostgreSQL database, Next.js frontend, and integrates with external services including the Finnish Business Registry and Anthropic's Claude AI.

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────┐
│                     User Browser                          │
│                    (Next.js App)                          │
└─────────────────────────┬────────────────────────────────┘
                          │ HTTPS/REST
                          ↓
┌──────────────────────────────────────────────────────────┐
│              Load Balancer / API Gateway                  │
└─────────────────────────┬────────────────────────────────┘
                          │
                          ↓
┌──────────────────────────────────────────────────────────┐
│                   Flask Backend API                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Routes     │  │  Services    │  │   Models     │  │
│  │ - auth       │  │ - YTJ API    │  │ - User       │  │
│  │ - companies  │  │ - Scraper    │  │ - Company    │  │
│  │ - investors  │  │ - AI Matcher │  │ - Cache      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────┬────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┬──────────────┐
        │                 │                 │              │
        ↓                 ↓                 ↓              ↓
┌──────────────┐  ┌──────────────┐  ┌──────────┐  ┌──────────┐
│ PostgreSQL   │  │  YTJ API     │  │ Claude   │  │ Funding  │
│  Database    │  │ (Business    │  │   API    │  │ Sources  │
│              │  │  Registry)   │  │          │  │ (Scraped)│
└──────────────┘  └──────────────┘  └──────────┘  └──────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React Hooks (useState, useEffect)
- **Routing**: Next.js App Router

### Backend
- **Framework**: Flask 3.0
- **Language**: Python 3.9+
- **Database ORM**: SQLAlchemy
- **Authentication**: JWT (PyJWT)
- **Password Hashing**: bcrypt
- **HTTP Requests**: requests library
- **Web Scraping**: BeautifulSoup4
- **AI Integration**: Anthropic SDK (Claude)

### Database
- **System**: PostgreSQL 14+
- **Schema**: 3 main tables (users, companies, funding_matches_cache)
- **Features**: JSON columns for flexible data storage

### External Services
- **YTJ API**: Finnish Business Registry for company data
- **Anthropic Claude**: AI for company profiling and matching
- **Funding Websites**: Live data sources for programs

## Component Architecture

### Backend Components

#### 1. Routes Layer (`/routes`)
Handles HTTP requests and responses.

**auth.py**
- `POST /api/auth/register`: User registration
- `POST /api/auth/login`: User authentication
- Returns JWT tokens for authenticated sessions

**companies.py**
- `GET /api/companies`: List user's companies
- `POST /api/companies`: Create company
- `GET /api/companies/:id`: Get company details
- `DELETE /api/companies/:id`: Delete company
- `POST /api/companies/search-name`: Search by name
- `POST /api/companies/fetch-by-id`: Fetch from YTJ
- `POST /api/companies/fetch-by-selection`: Add selected company

**investors.py**
- `POST /api/investors/fetch`: Generate funding matches
- `GET /api/investors/:company_id`: Retrieve cached matches

#### 2. Services Layer (`/services`)
Business logic and external integrations.

**ytj_service.py**
- `search_by_business_id()`: Fetch company by Y-tunnus
- `search_by_name()`: Search companies by name
- `_parse_company_data()`: Parse YTJ API response

**scraper_service.py**
- `scrape_all_sources()`: Aggregate all funding programs
- `scrape_business_finland()`: Business Finland programs
- `scrape_ely()`: ELY Centre programs
- `scrape_finnvera()`: Finnvera programs
- `scrape_eu_programmes()`: EU funding programs
- `get_static_sources()`: Static funding sources

**ai_matcher.py**
- `generate_company_summary()`: Create AI summary
- `match_funding_programs()`: Match and rank programs
- `_fallback_matching()`: Keyword-based fallback

#### 3. Models Layer (`/models`)
Database schema and ORM models.

**database.py**
- `User`: User accounts with password hashing
- `Company`: Company profiles with metadata
- `FundingMatchCache`: Cached AI analysis results

#### 4. Utils Layer (`/utils`)
Shared utilities and helpers.

**auth.py**
- `generate_token()`: Create JWT tokens
- `decode_token()`: Validate and decode tokens
- `@token_required`: Route protection decorator

### Frontend Components

#### 1. Pages (`/app`)
Next.js App Router pages.

**page.tsx** - Landing page
- Hero section with value proposition
- Features showcase
- Call-to-action sections

**login/page.tsx** - Authentication
- Login/register toggle
- Form validation
- Token storage
- Navigation to dashboard

#### 2. API Client (`/lib`)
**api.ts**
- Axios instance with base configuration
- Request interceptor for JWT token injection
- API methods grouped by resource:
  - `authApi`: register, login
  - `companiesApi`: CRUD operations
  - `investorsApi`: fetch matches

## Data Flow

### Company Analysis Flow

```
1. User enters Business ID or searches by name
   ↓
2. Frontend calls YTJ API via backend
   ↓
3. Backend fetches company data from YTJ
   ↓
4. Backend sends to Claude for summary generation
   ↓
5. Backend saves company to database
   ↓
6. User clicks "Fetch Investors"
   ↓
7. Backend scrapes funding sources
   ↓
8. Backend sends company + programs to Claude
   ↓
9. Claude analyzes and ranks programs
   ↓
10. Backend caches results (24h TTL)
    ↓
11. Frontend displays ranked recommendations
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Companies Table
```sql
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    business_id VARCHAR(20),
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(255),
    size VARCHAR(50),
    revenue VARCHAR(50),
    employees INTEGER,
    growth_stage VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Funding Matches Cache Table
```sql
CREATE TABLE funding_matches_cache (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    funding_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Security Architecture

### Authentication Flow
1. User submits credentials
2. Backend validates and hashes password
3. Backend generates JWT token (7-day expiry)
4. Frontend stores token in localStorage
5. Token included in Authorization header for protected routes
6. Backend validates token on each request

### Security Measures
- **Password Security**: bcrypt hashing with salt
- **API Security**: JWT token validation
- **SQL Injection**: SQLAlchemy ORM prevents injection
- **CORS**: Flask-CORS with configured origins
- **Input Validation**: Server-side validation of all inputs
- **Rate Limiting**: Can be added with Flask-Limiter

## AI Integration Architecture

### Claude API Usage

**Company Summary Generation**
```python
Input: Company metadata (name, industry, size, etc.)
Prompt: Professional business summary request
Output: 2-3 paragraph company profile
Cost: ~$0.02 per summary
```

**Funding Program Matching**
```python
Input: Company profile + All funding programs
Prompt: Analyze and rank programs with justifications
Output: JSON array with scores and explanations
Cost: ~$0.05-0.10 per analysis
```

### Prompt Engineering
- Structured prompts with clear instructions
- JSON output format specification
- Emphasis on transparency and justifications
- Fallback to keyword matching if AI fails

## Scalability Considerations

### Current Limitations
- Single server instance
- No caching layer (except DB cache)
- Synchronous processing

### Scaling Strategies

**Horizontal Scaling**
- Deploy multiple Flask instances
- Load balancer distribution
- Shared PostgreSQL database

**Caching Layer**
- Redis for session management
- Cache YTJ API responses (24h)
- Cache funding program data (1h)

**Async Processing**
- Celery for background tasks
- Queue funding match jobs
- Email notifications when complete

**Database Optimization**
- Indexes on foreign keys
- Materialized views for analytics
- Read replicas for heavy loads

## Deployment Architecture

### Recommended Production Setup

```
┌─────────────────┐
│   CloudFlare    │  CDN + DDoS Protection
└────────┬────────┘
         │
┌────────┴────────┐
│   Vercel        │  Next.js Frontend
└─────────────────┘
         │
         ↓ API Calls
┌─────────────────┐
│   AWS/Azure     │
│  Load Balancer  │
└────────┬────────┘
         │
    ┌────┴────┐
    ↓         ↓
┌────────┐ ┌────────┐
│Flask-1 │ │Flask-2 │  Auto-scaled instances
└────────┘ └────────┘
         │
         ↓
┌─────────────────┐
│   PostgreSQL    │  Managed database
│      RDS        │  with backups
└─────────────────┘
```

### Environment Variables

**Backend (.env)**
```
DATABASE_URL=postgresql://...
JWT_SECRET=random-secret-key
ANTHROPIC_API_KEY=sk-...
FLASK_ENV=production
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=https://api.example.com
```

## Monitoring & Observability

### Metrics to Track
- API response times (p50, p95, p99)
- Error rates by endpoint
- Database query performance
- Claude API costs and usage
- User activity patterns
- Cache hit rates

### Recommended Tools
- **Application Monitoring**: Sentry
- **Infrastructure**: AWS CloudWatch / Azure Monitor
- **Logging**: Structured logging with correlation IDs
- **Uptime**: UptimeRobot or Pingdom

## Performance Optimization

### Backend Optimizations
1. Database connection pooling
2. Eager loading of relationships
3. Response compression (gzip)
4. API request caching
5. Async I/O for external APIs

### Frontend Optimizations
1. Next.js static generation where possible
2. Image optimization
3. Code splitting
4. Lazy loading components
5. Service worker for offline support

## Future Technical Enhancements

1. **Real-time Updates**: WebSocket for live funding updates
2. **Machine Learning**: Train custom model on historical matches
3. **Microservices**: Split into auth, company, and funding services
4. **GraphQL API**: More flexible data fetching
5. **Mobile App**: React Native version
6. **Elasticsearch**: Full-text search across programs
7. **CI/CD Pipeline**: Automated testing and deployment

## Conclusion

The Smart Funding Advisor architecture is designed for rapid MVP development while maintaining paths for future scalability. The modular design allows individual components to be enhanced or replaced as needs evolve.

---

**Document Version**: 1.0  
**Last Updated**: November 2024  
**Authors**: Smart Funding Advisor Development Team
