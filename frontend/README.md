# Smart Funding Advisor - Frontend

Next.js frontend application for the Smart Funding Advisor system.

## Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file based on `.env.local.example`:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
frontend/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/
│   │   └── page.tsx          # Login/Register page
│   ├── dashboard/
│   │   └── page.tsx          # Dashboard (to be completed)
│   ├── companies/
│   │   ├── add/
│   │   │   └── page.tsx      # Add company page (to be completed)
│   │   └── [id]/
│   │       └── page.tsx      # Company details (to be completed)
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   └── (UI components to be added)
├── lib/
│   └── api.ts                # API client with axios
├── public/
│   └── (static assets)
└── package.json
```

## Features Implemented

✅ Landing page with hero section and features
✅ Login/Register authentication flow
✅ API client with JWT token management
✅ Tailwind CSS styling
✅ TypeScript configuration

## To Complete for Full MVP

The following pages need to be implemented:

### Dashboard (`/dashboard`)
- Display user's companies
- Quick stats
- Navigation to add/search companies

### Add Company (`/companies/add`)
- Two input methods:
  - Finnish Business ID input
  - Company name search with autocomplete
- Display company summary tile after selection
- "Fetch Investors" button
- Display funding recommendations list

### Company Details (`/companies/[id]`)
- Company profile card
- AI-generated summary
- Funding matches with:
  - Relevance scores
  - Justifications
  - Eligibility notes
  - Application links and deadlines

### Components Needed
- `CompanySummaryTile.tsx` - Display company information
- `InvestorList.tsx` - Display funding program matches
- `SearchBar.tsx` - Company name search
- `Navbar.tsx` - App navigation
- `ProtectedRoute.tsx` - Auth guard for protected pages

## Build for Production

```bash
npm run build
npm start
```

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React Hooks
- **Authentication**: JWT tokens in localStorage
