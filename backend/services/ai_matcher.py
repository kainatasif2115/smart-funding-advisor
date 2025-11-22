# CRITICAL: Remove proxy settings before importing Groq
import os
for proxy_var in ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy', 'NO_PROXY', 'no_proxy']:
    if proxy_var in os.environ:
        del os.environ[proxy_var]

from groq import Groq
from typing import List, Dict
import json

class AIMatcherService:
    """Service to match companies with funding programs using Groq AI"""
    
    def __init__(self):
        api_key = os.getenv('GROQ_API_KEY')
        if not api_key:
            print("⚠️  GROQ_API_KEY not found - using fallback mode (no AI generation)")
            self.client = None
        else:
            try:
                self.client = Groq(api_key=api_key)
                print("✓ Groq AI client initialized successfully")
            except Exception as e:
                print("=" * 70)
                print("⚠️  WARNING: Could not initialize Groq AI client")
                if 'proxies' in str(e).lower() or 'proxy' in str(e).lower():
                    print("    Issue: Proxy settings detected in environment")
                    print("    Solution: Run 'unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy'")
                    print("             in your terminal before starting the app")
                else:
                    print(f"    Error: {e}")
                print("    App will continue in FALLBACK MODE (no AI features)")
                print("=" * 70)
                self.client = None
    
    def generate_full_company_profile(self, company_data: Dict) -> Dict:
        """
        Generate a comprehensive company profile with all fields for the summary tile
        """
        if not self.client:
            return self._fallback_profile(company_data)
        
        prompt = f"""Analyze this Finnish company and provide a comprehensive profile in JSON format:

Company Name: {company_data.get('name', 'N/A')}
Business ID: {company_data.get('business_id', 'N/A')}
Industry: {company_data.get('industry', 'N/A')}
Company Form: {company_data.get('company_form', 'N/A')}
Registration Date: {company_data.get('registration_date', 'N/A')}
City: {company_data.get('city', 'N/A')}

Based on this information, provide:

1. **description**: 2-3 sentence summary of what the company does and for whom
2. **company_size**: Classify as "small", "medium", or "large" based on industry standards
3. **growth_stage**: Classify as "pre-seed", "seed", "early-stage", "growth", or "scale-up"
4. **employees**: Estimate the number of employees (reasonable guess based on company age and type)
5. **revenue**: Estimate annual revenue class as "Under 1M EUR", "1M - 5M EUR", "5M - 20M EUR", or "20M+ EUR"
6. **funding_purpose**: What this type of company typically needs funding for (1 paragraph)
7. **funding_amount**: Typical funding range for this stage/size (e.g., "€50k-€200k")
8. **keywords**: 5-8 relevant keywords/tags (industry, technology, market, location, characteristics)

Return ONLY valid JSON:
{{
  "business_id": "{company_data.get('business_id', '')}",
  "name": "{company_data.get('name', '')}",
  "description": "...",
  "industry": "{company_data.get('industry', '')}",
  "company_size": "small|medium|large",
  "growth_stage": "pre-seed|seed|early-stage|growth|scale-up",
  "employees": 25,
  "revenue": "Under 1M EUR|1M - 5M EUR|5M - 20M EUR|20M+ EUR",
  "city": "{company_data.get('city', '')}",
  "country": "Finland",
  "funding_purpose": "...",
  "funding_amount": "€X-€Y",
  "keywords": ["keyword1", "keyword2", ...]
}}"""
        
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.3-70b-versatile",
                temperature=0.7,
                max_tokens=1024,
            )
            
            response_text = chat_completion.choices[0].message.content.strip()
            
            # Extract JSON
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            if json_start != -1 and json_end > json_start:
                response_text = response_text[json_start:json_end]
            
            profile = json.loads(response_text)
            return profile
            
        except Exception as e:
            print(f"Error generating full company profile: {e}")
            return self._fallback_profile(company_data)
    
    def _fallback_profile(self, company_data: Dict) -> Dict:
        """Fallback profile generation without AI"""
        return {
            'business_id': company_data.get('business_id', ''),
            'name': company_data.get('name', ''),
            'description': f"{company_data.get('name', 'This company')} operates in the {company_data.get('industry', 'business')} sector in Finland.",
            'industry': company_data.get('industry', ''),
            'company_size': 'small',
            'growth_stage': 'growth',
            'employees': 10,
            'revenue': 'Under 1M EUR',
            'city': company_data.get('city', ''),
            'country': 'Finland',
            'funding_purpose': 'Business development and growth initiatives',
            'funding_amount': '€50,000 - €200,000',
            'keywords': [
                company_data.get('industry', 'business')[:20] if company_data.get('industry') else 'business',
                'Finland',
                'SME',
                'growth'
            ]
        }
    
    def generate_company_summary(self, company_data: Dict) -> str:
        """
        Generate a comprehensive company summary using Groq AI
        """
        if not self.client:
            return f"Company profile for {company_data.get('name', 'Unknown Company')} in {company_data.get('industry', 'unspecified industry')}."
        
        prompt = f"""Based on the following company information, create a comprehensive business summary in 2-3 paragraphs:

Company Name: {company_data.get('name', 'N/A')}
Business ID: {company_data.get('business_id', 'N/A')}
Industry: {company_data.get('industry', 'N/A')}
Company Form: {company_data.get('company_form', 'N/A')}
Registration Date: {company_data.get('registration_date', 'N/A')}

Additional details:
Size: {company_data.get('size', 'N/A')}
Employees: {company_data.get('employees', 'N/A')}
Growth Stage: {company_data.get('growth_stage', 'N/A')}
Description: {company_data.get('description', 'N/A')}

Create a professional summary that includes:
1. Company overview and industry position
2. Stage of development and growth trajectory
3. Key characteristics relevant for funding assessment

Keep it concise, factual, and focused on information relevant for funding advisors."""
        
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model="llama-3.3-70b-versatile",
                temperature=0.7,
                max_tokens=1024,
            )
            
            return chat_completion.choices[0].message.content
            
        except Exception as e:
            print(f"Error generating company summary: {e}")
            return f"Company profile for {company_data.get('name', 'Unknown Company')} in {company_data.get('industry', 'unspecified industry')}."
    
    def match_funding_programs(self, company_data: Dict, funding_programs: List[Dict]) -> List[Dict]:
        """
        Match company with funding programs and provide justifications
        Returns sorted list of matches with relevance scores
        """
        if not self.client:
            return self._fallback_matching(company_data, funding_programs)
        
        # Prepare funding programs summary
        programs_text = "\n\n".join([
            f"Program {i+1}:\n"
            f"Name: {p['name']}\n"
            f"Provider: {p['provider']}\n"
            f"Description: {p['description']}\n"
            f"Eligibility: {p['eligibility']}\n"
            f"Focus Areas: {', '.join(p['focus_areas'])}\n"
            f"Deadline: {p['deadline']}\n"
            f"Funding Amount: {p['funding_amount']}\n"
            f"URL: {p['url']}"
            for i, p in enumerate(funding_programs)
        ])
        
        prompt = f"""You are a funding advisor expert. Analyze the following company profile and match it with the most suitable funding programs.

COMPANY PROFILE:
Name: {company_data.get('name', 'N/A')}
Industry: {company_data.get('industry', 'N/A')}
Size: {company_data.get('size', 'N/A')}
Employees: {company_data.get('employees', 'N/A')}
Growth Stage: {company_data.get('growth_stage', 'N/A')}
Company Form: {company_data.get('company_form', 'N/A')}
Description: {company_data.get('description', 'N/A')}

AVAILABLE FUNDING PROGRAMS:
{programs_text}

TASK:
For each funding program, provide:
1. A relevance score (0-100) indicating how well the program matches the company
2. A clear justification explaining why this program is or isn't suitable
3. Specific eligibility considerations

Return ONLY a valid JSON array with this structure:
[
  {{
    "program_index": 0,
    "relevance_score": 85,
    "justification": "Detailed explanation of why this program matches...",
    "eligibility_notes": "Specific eligibility considerations...",
    "recommended": true
  }},
  ...
]

Focus on:
- Company size and stage alignment
- Industry and focus area match
- Eligibility criteria compatibility
- Strategic fit for company's needs

Return ONLY the JSON array, no other text."""
        
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model="llama-3.3-70b-versatile",
                temperature=0.5,
                max_tokens=4096,
            )
            
            response_text = chat_completion.choices[0].message.content.strip()
            
            # Extract JSON from response (in case there's extra text)
            json_start = response_text.find('[')
            json_end = response_text.rfind(']') + 1
            if json_start != -1 and json_end > json_start:
                response_text = response_text[json_start:json_end]
            
            matches = json.loads(response_text)
            
            # Combine matches with original program data
            results = []
            for match in matches:
                program_idx = match.get('program_index', 0)
                if 0 <= program_idx < len(funding_programs):
                    program = funding_programs[program_idx].copy()
                    program['relevance_score'] = match.get('relevance_score', 0)
                    program['justification'] = match.get('justification', '')
                    program['eligibility_notes'] = match.get('eligibility_notes', '')
                    program['recommended'] = match.get('recommended', False)
                    results.append(program)
            
            # Sort by relevance score (highest first)
            results.sort(key=lambda x: x.get('relevance_score', 0), reverse=True)
            
            return results
            
        except Exception as e:
            print(f"Error matching funding programs: {e}")
            # Fallback: return all programs with basic scoring
            return self._fallback_matching(company_data, funding_programs)
    
    def _fallback_matching(self, company_data: Dict, funding_programs: List[Dict]) -> List[Dict]:
        """
        Fallback matching using simple keyword matching
        """
        results = []
        company_keywords = set()
        
        # Extract keywords from company data
        for field in ['industry', 'description', 'growth_stage']:
            value = company_data.get(field, '')
            if value:
                company_keywords.update(value.lower().split())
        
        for program in funding_programs:
            score = 50  # Base score
            
            # Check focus areas
            focus_areas = ' '.join(program.get('focus_areas', [])).lower()
            matches = sum(1 for keyword in company_keywords if keyword in focus_areas)
            score += matches * 10
            
            # Cap at 100
            score = min(score, 100)
            
            program_copy = program.copy()
            program_copy['relevance_score'] = score
            program_copy['justification'] = 'Automated matching based on industry and focus areas.'
            program_copy['eligibility_notes'] = 'Please review detailed eligibility criteria.'
            program_copy['recommended'] = score >= 60
            
            results.append(program_copy)
        
        results.sort(key=lambda x: x['relevance_score'], reverse=True)
        return results
