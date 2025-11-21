import requests
from typing import Optional, Dict, List

class YTJService:
    """Service to interact with Finnish Business Registry (YTJ) API"""
    
    BASE_URL = "https://avoindata.prh.fi/opendata-ytj-api/v1"
    
    @staticmethod
    def search_by_business_id(business_id: str) -> Optional[Dict]:
        """
        Fetch company data by Finnish Business ID (Y-tunnus)
        """
        try:
            # Clean business ID (remove dashes)
            clean_id = business_id.replace('-', '')
            
            url = f"{YTJService.BASE_URL}/business/{clean_id}"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                return YTJService._parse_company_data(data)
            else:
                return None
                
        except Exception as e:
            print(f"Error fetching company by business ID: {e}")
            return None
    
    @staticmethod
    def search_by_name(name: str, limit: int = 10) -> List[Dict]:
        """
        Search companies by name
        Returns list of matching companies
        """
        try:
            url = f"{YTJService.BASE_URL}/businesses"
            params = {
                'name': name,
                'maxResults': limit
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                results = data.get('results', [])
                
                # Parse each result
                parsed_results = []
                for item in results:
                    parsed = YTJService._parse_company_data(item)
                    if parsed:
                        parsed_results.append(parsed)
                
                return parsed_results
            else:
                return []
                
        except Exception as e:
            print(f"Error searching companies by name: {e}")
            return []
    
    @staticmethod
    def _parse_company_data(data: Dict) -> Optional[Dict]:
        """
        Parse raw YTJ API response into structured company data
        """
        try:
            # Extract basic info
            business_id = data.get('businessId', '')
            name = data.get('name', '')
            
            # Extract detailed info
            details = data.get('details', {})
            
            # Get industry information
            industries = data.get('businessLines', [])
            industry = industries[0].get('name', '') if industries else ''
            
            # Get company form and size indicators
            company_form = data.get('companyForm', '')
            
            # Get registration date to estimate stage
            registration_date = data.get('registrationDate', '')
            
            # Build structured data
            company_data = {
                'business_id': business_id,
                'name': name,
                'industry': industry,
                'company_form': company_form,
                'registration_date': registration_date,
                'raw_data': data  # Keep raw data for reference
            }
            
            return company_data
            
        except Exception as e:
            print(f"Error parsing company data: {e}")
            return None
