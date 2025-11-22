import json
import os
from typing import List, Dict

class FundingScraperService:
    """Service to load funding information from accurate database"""
    
    @staticmethod
    def scrape_all_sources() -> List[Dict]:
        """
        Load all funding programs from accurate database
        """
        try:
            # Load from accurate database
            json_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'accurate_funding_programs.json')
            with open(json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            programs = data.get('programs', [])
            
            # Convert to format expected by AI matcher
            formatted_programs = []
            for program in programs:
                formatted_program = {
                    'name': program.get('name', ''),
                    'provider': program.get('provider', ''),
                    'url': program.get('url', ''),
                    'description': program.get('description', ''),
                    'eligibility': FundingScraperService._format_eligibility(program.get('eligibility', {})),
                    'focus_areas': program.get('focus_areas', []),
                    'deadline': program.get('deadline', 'Not specified'),
                    'funding_amount': FundingScraperService._format_funding_amount(program.get('funding_details', {}))
                }
                formatted_programs.append(formatted_program)
            
            print(f"✓ Loaded {len(formatted_programs)} funding programs from accurate database")
            return formatted_programs
            
        except Exception as e:
            print(f"Error loading accurate funding programs: {e}")
            # Fallback to minimal set
            return FundingScraperService.get_static_sources()
    
    @staticmethod
    def _format_eligibility(eligibility: Dict) -> str:
        """Format eligibility dict into readable string"""
        parts = []
        
        if eligibility.get('company_type'):
            parts.append(f"Company Type: {eligibility['company_type']}")
        
        if eligibility.get('company_size'):
            parts.append(f"Size: {eligibility['company_size']}")
        
        if eligibility.get('company_age'):
            parts.append(f"Age: {eligibility['company_age']}")
        
        if eligibility.get('requirements'):
            reqs = eligibility['requirements']
            if isinstance(reqs, list):
                parts.append(f"Requirements: {'; '.join(reqs[:3])}")
            else:
                parts.append(f"Requirements: {reqs}")
        
        return '. '.join(parts) if parts else 'See program details for eligibility'
    
    @staticmethod
    def _format_funding_amount(funding_details: Dict) -> str:
        """Format funding details into readable string"""
        parts = []
        
        if funding_details.get('type'):
            parts.append(funding_details['type'])
        
        if funding_details.get('percentage'):
            parts.append(f"{funding_details['percentage']} of costs")
        
        if funding_details.get('amount'):
            parts.append(funding_details['amount'])
        elif funding_details.get('typical_amount'):
            parts.append(funding_details['typical_amount'])
        elif funding_details.get('max_amount'):
            parts.append(f"Up to {funding_details['max_amount']}")
        
        return ' - '.join(parts) if parts else 'Varies by project'
    
    @staticmethod
    def scrape_business_finland() -> List[Dict]:
        """Scrape Business Finland funding programs"""
        funding_programs = []
        
        try:
            # R&D Funding - Main category with sub-programs
            programs = [
                {
                    'name': 'R&D Funding: SMEs and Midcaps',
                    'parent_program': 'Research and Development Funding',
                    'provider': 'Business Finland',
                    'description': 'Accelerate product development, renew or develop entirely new products, services, production methods or business models. Test and verify the functionality of the new solution with customers.',
                    'eligibility': 'Companies of all sizes, research organizations in joint projects',
                    'focus_areas': ['R&D', 'Product Development', 'Innovation', 'Technology'],
                    'url': 'https://www.businessfinland.fi/en/services/funding/funding-services/research-and-development-funding/',
                    'deadline': 'Continuous application',
                    'funding_amount': 'Varies by company size and project type'
                },
                {
                    'name': 'Cooperation between Companies and Research Organizations',
                    'provider': 'Business Finland',
                    'description': 'Research to Business, Co-Creation, Co-Innovation and Co-Research funding for joint projects.',
                    'eligibility': 'Companies and research organizations in collaboration',
                    'focus_areas': ['Research Collaboration', 'Innovation', 'Co-creation', 'Technology Transfer'],
                    'url': 'https://www.businessfinland.fi/en/services/funding/funding-services/cooperation-between-companies-and-research-organizations/',
                    'deadline': 'Continuous application',
                    'funding_amount': 'Varies by project type'
                },
                {
                    'name': 'Tempo Funding',
                    'provider': 'Business Finland',
                    'description': 'Develop a growth vision and strategy, improve readiness for international growth, and map demand in export markets.',
                    'eligibility': 'SMEs and midcap companies',
                    'focus_areas': ['Internationalization', 'Growth Strategy', 'Export Markets', 'Business Development'],
                    'url': 'https://www.businessfinland.fi/en/services/funding/funding-services/Tempo-Funding/',
                    'deadline': 'Continuous application',
                    'funding_amount': 'Up to 50% of eligible costs'
                },
                {
                    'name': 'Talent Funding',
                    'provider': 'Business Finland',
                    'description': 'Improve readiness for international growth by creating work, organisational and management practices, and increase international talents.',
                    'eligibility': 'SMEs and midcap companies',
                    'focus_areas': ['Talent Acquisition', 'International Growth', 'HR Development', 'Management'],
                    'url': 'https://www.businessfinland.fi/en/services/funding/funding-services/Talent-Funding/',
                    'deadline': 'Continuous application',
                    'funding_amount': 'Up to 50% of eligible costs'
                },
                {
                    'name': 'Young Innovative Enterprises (YIC)',
                    'provider': 'Business Finland',
                    'description': 'Scale your business in export markets and develop your business comprehensively.',
                    'eligibility': 'Companies under 6 years old with innovative business model',
                    'focus_areas': ['Startup', 'Scaling', 'Innovation', 'Internationalization'],
                    'url': 'https://www.businessfinland.fi/en/services/funding/funding-services/Young-innovative-companies/',
                    'deadline': 'Continuous application',
                    'funding_amount': 'Loans and grants for growth'
                },
                {
                    'name': 'Production Incentive for the Audiovisual Industry',
                    'provider': 'Business Finland',
                    'description': '25% refund of costs of production carried out in Finland for audiovisual industry.',
                    'eligibility': 'Audiovisual production companies',
                    'focus_areas': ['Film', 'TV', 'Media', 'Creative Industries', 'Production'],
                    'url': 'https://www.businessfinland.fi/en/services/funding/funding-services/Audiovisual-production-incentive/',
                    'deadline': 'Continuous application',
                    'funding_amount': '25% cash rebate on production costs'
                },
                {
                    'name': 'Funding for Leading Companies and Ecosystems',
                    'provider': 'Business Finland',
                    'description': 'Challenges globally operating companies to become drivers of ecosystems formed by companies of different sizes.',
                    'eligibility': 'Large globally operating companies and ecosystems',
                    'focus_areas': ['Ecosystem Development', 'Collaboration', 'Innovation', 'Large Enterprises'],
                    'url': 'https://www.businessfinland.fi/en/services/funding/funding-services/financing-of-leading-companies-and-ecosystems/',
                    'deadline': 'Continuous application',
                    'funding_amount': 'Varies by ecosystem project'
                },
                {
                    'name': 'Innovative Public Procurement',
                    'provider': 'Business Finland',
                    'description': 'Public service providers can develop higher quality services through innovative procurement.',
                    'eligibility': 'Public service providers and their partners',
                    'focus_areas': ['Public Sector', 'Innovation Procurement', 'Service Development'],
                    'url': 'https://www.businessfinland.fi/en/services/funding/funding-services/research-and-development-funding/innovative-public-procurement',
                    'deadline': 'Continuous application',
                    'funding_amount': 'Varies by project'
                },
                {
                    'name': 'Funding for Innovation and Growth Research',
                    'provider': 'Business Finland',
                    'description': 'For research organizations studying impact of global challenges on Finnish businesses and society.',
                    'eligibility': 'Research organizations',
                    'focus_areas': ['Research', 'Innovation Studies', 'Growth Research', 'Policy'],
                    'url': 'https://www.businessfinland.fi/en/services/funding/funding-services/funding-for-innovation-and-growth-research/',
                    'deadline': 'Continuous application',
                    'funding_amount': 'Research funding'
                },
                {
                    'name': 'Deep Tech Accelerator (DTA)',
                    'provider': 'Business Finland',
                    'description': 'Funding for startups commercializing latest research results and expertise in deep tech.',
                    'eligibility': 'Startups under 5 years old commercializing research',
                    'focus_areas': ['Deep Tech', 'Research Commercialization', 'Innovation', 'Startup'],
                    'url': 'https://www.businessfinland.fi/en/services/funding/funding-services/deep-tech-accelerator-dta/',
                    'deadline': 'Continuous application',
                    'funding_amount': 'Accelerator program with funding'
                },
                {
                    'name': 'Energy Aid',
                    'provider': 'Business Finland',
                    'description': 'Support for projects promoting renewable energy production, energy saving, energy efficiency, or reducing environmental damage.',
                    'eligibility': 'Companies with energy or environmental projects',
                    'focus_areas': ['Renewable Energy', 'Energy Efficiency', 'Sustainability', 'Clean Tech'],
                    'url': 'https://www.businessfinland.fi/en/services/funding/funding-services/Energy-support/',
                    'deadline': 'Continuous application',
                    'funding_amount': 'Varies by project type'
                },
                {
                    'name': 'Innovation Aid for Shipbuilding',
                    'provider': 'Business Finland',
                    'description': 'State aid for shipbuilding innovations to secure favorable preconditions for innovation in the sector.',
                    'eligibility': 'Shipbuilding companies',
                    'focus_areas': ['Shipbuilding', 'Maritime', 'Innovation', 'Manufacturing'],
                    'url': 'https://www.businessfinland.fi/en/services/funding/funding-services/innovation-aid-for-shipbuilding/',
                    'deadline': 'Continuous application',
                    'funding_amount': 'Varies by project'
                },
                {
                    'name': 'European Defense Fund National Co-Funding',
                    'provider': 'Business Finland',
                    'description': 'National co-funding for projects that have received EDF funding from EU.',
                    'eligibility': 'Companies with EDF-funded defense projects',
                    'focus_areas': ['Defense', 'Security', 'R&D', 'EU Funding'],
                    'url': 'https://www.businessfinland.fi/en/services/funding/funding-services/european-defense-fund-national-co-funding/',
                    'deadline': 'Continuous application',
                    'funding_amount': 'National co-funding for EDF projects'
                },
                {
                    'name': 'Preparatory Funding for EU Projects',
                    'provider': 'Business Finland',
                    'description': 'Funding for preparation of Horizon Europe, EDF and Innovation Fund project applications.',
                    'eligibility': 'Companies preparing EU project applications',
                    'focus_areas': ['EU Funding', 'Project Preparation', 'Horizon Europe', 'Innovation Fund'],
                    'url': 'https://www.businessfinland.fi/en/services/funding/funding-services/horizon-europe/hakijan-opas/Horizon-EDF-Innovation-Fund-Project-Preparation-Funding/',
                    'deadline': 'Continuous application',
                    'funding_amount': 'Preparation phase funding'
                },
                {
                    'name': 'Investment Aid for Clean Transition',
                    'provider': 'Business Finland',
                    'description': 'Aid for large investments (€30M+) promoting decarbonization and energy efficiency of industrial processes.',
                    'eligibility': 'Large companies with €30M+ eligible investment costs',
                    'focus_areas': ['Clean Tech', 'Decarbonization', 'Energy Efficiency', 'Industrial Transition'],
                    'url': 'https://www.businessfinland.fi/en/services/funding/funding-services/investment-aid-for-large-clean-transition-investments/',
                    'deadline': 'Continuous application',
                    'funding_amount': 'Investment aid for large projects'
                },
                {
                    'name': 'Tax Credit for Clean Transition',
                    'provider': 'Business Finland',
                    'description': 'Tax credit for investments (€50M+) in renewable energy, decarbonization, and climate-neutral equipment production.',
                    'eligibility': 'Companies with €50M+ eligible investment costs',
                    'focus_areas': ['Renewable Energy', 'Clean Tech', 'Manufacturing', 'Climate Transition'],
                    'url': 'https://www.businessfinland.fi/en/services/funding/funding-services/tax-credit-for-large-clean-transition-investments/',
                    'deadline': 'Continuous application',
                    'funding_amount': 'Tax credit for large investments'
                },
                {
                    'name': 'Circular Economy Investment Grant',
                    'provider': 'Business Finland',
                    'description': 'Grant for circular economy investments that improve environmental protection or increase waste recycling.',
                    'eligibility': 'Companies with circular economy projects',
                    'focus_areas': ['Circular Economy', 'Waste Management', 'Recycling', 'Sustainability'],
                    'url': 'https://www.businessfinland.fi/en/services/funding/funding-services/Circular-economy-investment-grant/',
                    'deadline': 'Continuous application',
                    'funding_amount': 'Investment grant'
                },
                {
                    'name': 'Funding for Business Development in Disruptive Circumstances',
                    'provider': 'Business Finland',
                    'description': 'Support for business development during disruptive situations and crises.',
                    'eligibility': 'Companies affected by disruptive circumstances',
                    'focus_areas': ['Crisis Management', 'Business Continuity', 'Resilience', 'Recovery'],
                    'url': 'https://www.businessfinland.fi/en/services/funding/funding-services/disruptive-situations-funding/Instructions-for-the-beneficiary/',
                    'deadline': 'During disruptive periods',
                    'funding_amount': 'Varies by situation'
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
