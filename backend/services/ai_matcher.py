import os
from groq import Groq
from typing import List, Dict
import json

class AIMatcherService:
    """Service to match companies with funding programs using Groq AI"""
    
    def __init__(self):
        api_key = os.getenv('GROQ_API_KEY')
        if not api_key:
            print("Warning: GROQ_API_KEY not found, AI features will use fallback")
            self.client = None
        else:
            try:
                self.client = Groq(api_key=api_key)
            except Exception as e:
                print(f"Error initializing Groq client: {e}")
                self.client = None
    
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
                model="llama-3.1-70b-versatile",
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
                model="llama-3.1-70b-versatile",
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
