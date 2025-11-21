import requests
from bs4 import BeautifulSoup
from typing import List, Dict
import re

class FundingScraperService:
    """Service to scrape funding information from various sources"""
    
    @staticmethod
    def scrape_all_sources() -> List[Dict]:
        """
        Scrape all funding sources and return combined results
        """
        all_funding = []
        
        # Scrape each source
        all_funding.extend(FundingScraperService.scrape_business_finland())
        all_funding.extend(FundingScraperService.scrape_ely())
        all_funding.extend(FundingScraperService.scrape_finnvera())
        all_funding.extend(FundingScraperService.scrape_eu_programmes())
        all_funding.extend(FundingScraperService.get_static_sources())
        
        return all_funding
    
    @staticmethod
    def scrape_business_finland() -> List[Dict]:
        """Scrape Business Finland funding programs"""
        funding_programs = []
        
        try:
            # For hackathon, using static data based on known programs
            programs = [
                {
                    'name': 'Research and Development Funding',
                    'provider': 'Business Finland',
                    'description': 'Funding for research, development and innovation projects that create growth and new business.',
                    'eligibility': 'Companies of all sizes, minimum project cost €100,000',
                    'focus_areas': ['Technology', 'Innovation', 'R&D', 'Product Development'],
                    'url': 'https://www.businessfinland.fi/en/for-finnish-customers/services/funding/research-and-development-funding',
                    'deadline': 'Continuous application',
                    'funding_amount': '25-50% of eligible costs'
                },
                {
                    'name': 'Growth Engine Funding',
                    'provider': 'Business Finland',
                    'description': 'Funding for rapidly growing startups to scale their business internationally.',
                    'eligibility': 'Growth companies with scalable business model',
                    'focus_areas': ['Scaling', 'Growth', 'Internationalization', 'Technology'],
                    'url': 'https://www.businessfinland.fi/en/for-finnish-customers/services/funding/growth-engine',
                    'deadline': 'Continuous application',
                    'funding_amount': 'Up to €2M in loans and grants'
                },
                {
                    'name': 'Innovation Funding for SMEs',
                    'provider': 'Business Finland',
                    'description': 'Funding for SMEs developing new innovative products, services or business models.',
                    'eligibility': 'SMEs with fewer than 250 employees',
                    'focus_areas': ['Innovation', 'Product Development', 'SME', 'Technology'],
                    'url': 'https://www.businessfinland.fi/en/for-finnish-customers/services/funding',
                    'deadline': 'Continuous application',
                    'funding_amount': '35-50% of eligible costs'
                }
            ]
            
            funding_programs.extend(programs)
            
        except Exception as e:
            print(f"Error scraping Business Finland: {e}")
        
        return funding_programs
    
    @staticmethod
    def scrape_ely() -> List[Dict]:
        """Scrape ELY Centre funding programs"""
        funding_programs = []
        
        try:
            programs = [
                {
                    'name': 'Development Grant for Companies',
                    'provider': 'ELY Centre',
                    'description': 'Grant for developing business operations, such as developing products, services, production methods or business processes.',
                    'eligibility': 'SMEs, maximum 250 employees',
                    'focus_areas': ['Business Development', 'SME', 'Product Development', 'Process Innovation'],
                    'url': 'https://www.ely-keskus.fi/kehittamisavustus',
                    'deadline': 'Continuous application',
                    'funding_amount': 'Up to 50% of eligible costs, max €100,000'
                },
                {
                    'name': 'Start-up Grant',
                    'provider': 'ELY Centre',
                    'description': 'Support for entrepreneurs starting a new business.',
                    'eligibility': 'New entrepreneurs, full-time commitment required',
                    'focus_areas': ['Start-up', 'Entrepreneurship', 'New Business'],
                    'url': 'https://www.ely-keskus.fi/starttiraha',
                    'deadline': 'Continuous application',
                    'funding_amount': '€800-1,200/month for 6-12 months'
                }
            ]
            
            funding_programs.extend(programs)
            
        except Exception as e:
            print(f"Error scraping ELY: {e}")
        
        return funding_programs
    
    @staticmethod
    def scrape_finnvera() -> List[Dict]:
        """Scrape Finnvera funding programs"""
        funding_programs = []
        
        try:
            programs = [
                {
                    'name': 'Working Capital Loan',
                    'provider': 'Finnvera',
                    'description': 'Financing for working capital needs of growing companies.',
                    'eligibility': 'SMEs and mid-cap companies',
                    'focus_areas': ['Working Capital', 'Growth', 'SME', 'Financing'],
                    'url': 'https://www.finnvera.fi/en/loans/working-capital-loan',
                    'deadline': 'Continuous application',
                    'funding_amount': 'Loans up to €2M'
                },
                {
                    'name': 'Investment Loan',
                    'provider': 'Finnvera',
                    'description': 'Long-term financing for investments in machinery, equipment, and facilities.',
                    'eligibility': 'SMEs and mid-cap companies',
                    'focus_areas': ['Investment', 'Growth', 'Capital Expenditure', 'Expansion'],
                    'url': 'https://www.finnvera.fi/en/loans/investment-loan',
                    'deadline': 'Continuous application',
                    'funding_amount': 'Loans up to €5M'
                }
            ]
            
            funding_programs.extend(programs)
            
        except Exception as e:
            print(f"Error scraping Finnvera: {e}")
        
        return funding_programs
    
    @staticmethod
    def scrape_eu_programmes() -> List[Dict]:
        """Scrape EU funding programs"""
        funding_programs = []
        
        try:
            programs = [
                {
                    'name': 'Horizon Europe',
                    'provider': 'European Commission',
                    'description': 'EU research and innovation programme for breakthrough technologies and innovations.',
                    'eligibility': 'Companies, research organizations, universities - international consortia required',
                    'focus_areas': ['Research', 'Innovation', 'Technology', 'Collaboration', 'International'],
                    'url': 'https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/programmes/horizon',
                    'deadline': 'Various calls throughout the year',
                    'funding_amount': 'Up to 70-100% of eligible costs'
                },
                {
                    'name': 'Digital Europe Programme',
                    'provider': 'European Commission',
                    'description': 'Funding for digital transformation: AI, cybersecurity, high-performance computing, digital skills.',
                    'eligibility': 'Companies and organizations in digital sector',
                    'focus_areas': ['Digital', 'AI', 'Cybersecurity', 'Cloud', 'Data', 'Technology'],
                    'url': 'https://digital-strategy.ec.europa.eu/en/activities/digital-programme',
                    'deadline': 'Various calls throughout the year',
                    'funding_amount': 'Up to 50-100% of eligible costs'
                },
                {
                    'name': 'Innovation Fund',
                    'provider': 'European Commission',
                    'description': 'Support for innovative low-carbon technologies and processes in energy-intensive industries.',
                    'eligibility': 'Companies with projects in clean tech and renewable energy',
                    'focus_areas': ['Clean Tech', 'Renewable Energy', 'Climate', 'Sustainability', 'Innovation'],
                    'url': 'https://climate.ec.europa.eu/eu-action/funding-climate-action/innovation-fund_en',
                    'deadline': '2-3 calls per year',
                    'funding_amount': 'Up to 60% of capital costs'
                }
            ]
            
            funding_programs.extend(programs)
            
        except Exception as e:
            print(f"Error scraping EU programmes: {e}")
        
        return funding_programs
    
    @staticmethod
    def get_static_sources() -> List[Dict]:
        """Get additional static funding sources"""
        return [
            {
                'name': 'Nordic Innovation Funding',
                'provider': 'Nordic Energy Research',
                'description': 'Support for Nordic collaboration projects in energy and climate solutions.',
                'eligibility': 'Nordic companies in collaboration projects',
                'focus_areas': ['Energy', 'Climate', 'Nordic Collaboration', 'Sustainability'],
                'url': 'https://www.nordicenergy.org/funding/',
                'deadline': 'Annual calls',
                'funding_amount': 'Up to 50% of project costs'
            }
        ]
