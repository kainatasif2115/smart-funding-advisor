import requests
from typing import Optional, Dict, List

class YTJService:
    """Service to interact with Finnish Business Registry (YTJ) API"""
    
    BASE_URL = "https://avoindata.prh.fi/opendata-ytj-api/v3"
    
    @staticmethod
    def search_by_business_id(business_id: str) -> Optional[Dict]:
        """
        Fetch company data by Finnish Business ID (Y-tunnus)
        """
        try:
            # Clean business ID (remove dashes)
            clean_id = business_id.replace('-', '')
            
            url = f"{YTJService.BASE_URL}/companies"
            params = {'businessId': business_id}
            
            print(f"YTJ API: Fetching company with Business ID '{clean_id}' at {url}")
            response = requests.get(url, params=params, timeout=10)
            print(f"YTJ API Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                # print(f"YTJ API Response: {data}")
                
                # The response should contain results array
                results = data.get('companies', [])
                if results:
                    # Return the first result
                    return YTJService._parse_company_data(results[0])
                else:
                    print("No company found with that Business ID")
                    return None
            else:
                print(f"YTJ API Error: Status {response.status_code}, Response: {response.text}")
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
            url = f"{YTJService.BASE_URL}/companies"
            params = {
                'name': name,
                'registrationDateStart': '1900-01-01'
            }
            
            print(f"YTJ API: Searching for '{name}' at {url}")
            response = requests.get(url, params=params, timeout=10)
            print(f"YTJ API Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                # print(f"YTJ API Response: {data}")
                results = data.get('companies', [])
                
                # Parse and filter results
                parsed_results = []
                for item in results:
                    # Filter out inactive/ceased companies
                    status = item.get('status', '')
                    if status != '2':  # Status 2 means valid
                        continue
                    
                    parsed = YTJService._parse_company_data(item)
                    if parsed and parsed.get('name'):
                        parsed_results.append(parsed)
                
                # Sort by relevance: exact match > starts with > contains
                search_lower = name.lower()
                
                def relevance_score(company):
                    company_name_lower = company['name'].lower()
                    if company_name_lower == search_lower:
                        return 0  # Exact match (highest priority)
                    elif company_name_lower.startswith(search_lower):
                        return 1  # Starts with
                    elif search_lower in company_name_lower:
                        return 2  # Contains
                    else:
                        return 3  # Other match
                
                parsed_results.sort(key=relevance_score)
                
                # Apply limit
                limited_results = parsed_results[:limit]
                
                print(f"YTJ API: Found {len(limited_results)} active companies from {len(results)} total results (limited to {limit})")
                return limited_results
            else:
                print(f"YTJ API Error: Status {response.status_code}, Response: {response.text}")
                # Fallback to demo data for common companies
                return YTJService._get_demo_data(name)
                
        except Exception as e:
            print(f"Error searching companies by name: {e}")
            # Fallback to demo data
            return YTJService._get_demo_data(name)
    
    @staticmethod
    def _get_demo_data(name: str) -> List[Dict]:
        """
        Provide demo data for common Finnish companies when API fails
        """
        demo_companies = {
            'nokia': {
                'business_id': '0112038-9',
                'name': 'Nokia Oyj',
                'industry': 'Telecommunications equipment manufacturing',
                'company_form': 'Osakeyhtiö',
                'registration_date': '1967-05-12'
            },
            'rovio': {
                'business_id': '1863026-2',
                'name': 'Rovio Entertainment Oyj',
                'industry': 'Computer games and entertainment software',
                'company_form': 'Osakeyhtiö',
                'registration_date': '2003-12-01'
            },
            'supercell': {
                'business_id': '2336509-6',
                'name': 'Supercell Oy',
                'industry': 'Computer games development',
                'company_form': 'Osakeyhtiö',
                'registration_date': '2010-05-06'
            },
            'kone': {
                'business_id': '0521721-2',
                'name': 'KONE Oyj',
                'industry': 'Elevators and escalators manufacturing',
                'company_form': 'Osakeyhtiö',
                'registration_date': '1967-03-30'
            }
        }
        
        # Case insensitive search
        name_lower = name.lower()
        results = []
        
        for key, company in demo_companies.items():
            if name_lower in key or name_lower in company['name'].lower():
                results.append(company)
        
        if results:
            print(f"Using demo data for '{name}', found {len(results)} companies")
        
        return results
    
    @staticmethod
    def _parse_company_data(data: Dict) -> Optional[Dict]:
        """
        Parse raw YTJ API response into structured company data
        """
        try:
            # Extract basic info - handle both direct fields and nested businessId
            if isinstance(data.get('businessId'), dict):
                business_id = data['businessId'].get('value', '')
            else:
                business_id = data.get('businessId', '')
            
            # Get company name - handle names array
            name = ''
            names = data.get('names', [])
            if names:
                # Get the first active name (no endDate or most recent)
                active_names = [n for n in names if n.get('type') == '1' and not n.get('endDate')]
                if active_names:
                    name = active_names[0].get('name', '')
                else:
                    # Fallback to first name with type 1
                    type1_names = [n for n in names if n.get('type') == '1']
                    if type1_names:
                        name = type1_names[0].get('name', '')
                    else:
                        # Last resort: take any name
                        if names:
                            name = names[0].get('name', '')
            
            if not name:
                name = data.get('name', '')
            
            print(f"Parsed company name: {name}")
            
            # Get industry information from mainBusinessLine
            industry = ''
            main_business_line = data.get('mainBusinessLine', {})
            if main_business_line:
                descriptions = main_business_line.get('descriptions', [])
                # Try to get English description (languageCode '3')
                eng_desc = [d for d in descriptions if d.get('languageCode') == '3']
                if eng_desc:
                    industry = eng_desc[0].get('description', '')
                elif descriptions:
                    # Fallback to first description
                    industry = descriptions[0].get('description', '')
            
            # Get company form
            company_form = ''
            company_forms = data.get('companyForms', [])
            if company_forms:
                form_descriptions = company_forms[0].get('descriptions', [])
                eng_form = [d for d in form_descriptions if d.get('languageCode') == '3']
                if eng_form:
                    company_form = eng_form[0].get('description', '')
            
            # Get registration date
            registration_date = data.get('registrationDate', '')
            
            # Extract location information from addresses
            city = None
            country = 'Finland'  # Default for Finnish companies
            
            addresses = data.get('addresses', [])
            if addresses:
                # Get the first active address (no endDate)
                active_addresses = [a for a in addresses if not a.get('endDate')]
                target_address = active_addresses[0] if active_addresses else addresses[0]
                
                # City is in postOffices array
                post_offices = target_address.get('postOffices', [])
                if post_offices:
                    city = post_offices[0].get('city', '')
                    # municipalityCode might be useful too
                
                # Check for direct city field as fallback
                if not city:
                    city = target_address.get('city', '')
            
            # Extract website - it's directly in the data
            website = None
            website_data = data.get('website')
            if website_data and isinstance(website_data, dict):
                website = website_data.get('URL') or website_data.get('url')
            elif isinstance(website_data, str):
                website = website_data
            
            # Only return if we have at least name and business_id
            if not name or not business_id:
                print(f"Warning: Missing required fields - name: {bool(name)}, business_id: {bool(business_id)}")
                return None
            
            # Build structured data
            company_data = {
                'business_id': business_id,
                'name': name,
                'industry': industry,
                'company_form': company_form,
                'registration_date': registration_date,
                'city': city,
                'country': country,
                'website': website,
                'raw_data': data  # Keep raw data for reference
            }
            
            print(f"Successfully parsed: {name} ({business_id}) - Website: {website}")
            return company_data
            
        except Exception as e:
            print(f"Error parsing company data: {e}")
            import traceback
            traceback.print_exc()
            return None
