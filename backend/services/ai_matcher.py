# CRITICAL: Remove proxy settings before importing Groq
import os
for proxy_var in ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy', 'NO_PROXY', 'no_proxy']:
    if proxy_var in os.environ:
        del os.environ[proxy_var]

from groq import Groq
from typing import List, Dict
import json
from models.database import FundingProgram
from services.embedding_service import get_embedding_service

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
                error_msg = str(e)
                print("=" * 70)
                print("⚠️  WARNING: Could not initialize Groq AI client")
                print(f"    Error: {error_msg}")
                
                # Provide specific suggestions based on error
                if 'api' in error_msg.lower() and 'key' in error_msg.lower():
                    print("    Suggestion: Check your GROQ_API_KEY in .env file")
                elif 'connection' in error_msg.lower() or 'network' in error_msg.lower():
                    print("    Suggestion: Check your internet connection")
                elif 'timeout' in error_msg.lower():
                    print("    Suggestion: Groq API might be slow, try again")
                
                print("    App will continue in FALLBACK MODE (using vector similarity only)")
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
    
    def match_funding_programs_with_rag(self, company_data: Dict, top_k: int = 15) -> List[Dict]:
        """
        NEW: RAG-based matching using vector similarity + LLM
        1. Generate company embedding
        2. Find top-K similar programs from database using pgvector
        3. Send top-K to LLM for detailed analysis
        4. Return all programs sorted by relevance
        """
        print(f"\n🔍 RAG-Based Funding Match (Semantic Search + AI)")
        print(f"   Company: {company_data.get('name', 'Unknown')}")
        
        try:
            # Step 1: Generate company embedding
            print(f"   1. Generating company embedding...")
            embedding_service = get_embedding_service()
            company_embedding = embedding_service.embed_company(company_data)
            print(f"   ✓ Company embedding generated (384 dimensions)")
            
            # Step 2: Vector similarity search
            print(f"   2. Searching for top {top_k} similar programs...")
            similar_programs = FundingProgram.find_similar(company_embedding, limit=top_k)
            print(f"   ✓ Found {len(similar_programs)} similar programs")
            
            if not similar_programs:
                print("   ⚠️  No programs found in database, falling back to keyword matching")
                return self._fallback_matching(company_data, [])
            
            # Step 3: Send to LLM for detailed analysis (if client available)
            if self.client:
                print(f"   3. Sending top {len(similar_programs)} to AI for detailed analysis...")
                ai_analyzed = self._analyze_programs_with_llm(company_data, similar_programs)
                print(f"   ✓ AI analysis complete")
                return ai_analyzed
            else:
                print("   ⚠️  AI client not available, using vector similarity scores only")
                # Return programs with similarity scores as relevance
                for prog in similar_programs:
                    prog['relevance_score'] = int(prog.get('similarity_score', 0.5) * 100)
                    prog['justification'] = f"Semantic similarity: {prog['relevance_score']}% match"
                    prog['eligibility_notes'] = 'AI analysis unavailable - review program details manually'
                    prog['recommended'] = prog['relevance_score'] >= 70
                return similar_programs
                
        except Exception as e:
            print(f"   ❌ Error in RAG matching: {e}")
            print(f"   Falling back to keyword matching")
            import traceback
            traceback.print_exc()
            return self._fallback_matching(company_data, [])
    
    def _analyze_programs_with_llm(self, company_data: Dict, programs: List[Dict]) -> List[Dict]:
        """
        Send pre-filtered programs to LLM for detailed analysis
        """
        # Prepare funding programs summary
        programs_text = "\n\n".join([
            f"Program {i+1}:\n"
            f"Name: {p['name']}\n"
            f"Provider: {p['provider']}\n"
            f"Description: {p['description']}\n"
            f"Eligibility: {json.dumps(p.get('eligibility', {}))}\n"
            f"Focus Areas: {', '.join(p.get('focus_areas', []))}\n"
            f"Deadline: {p.get('deadline', 'N/A')}\n"
            f"Funding Details: {json.dumps(p.get('funding_details', {}))}\n"
            f"URL: {p.get('url', 'N/A')}"
            for i, p in enumerate(programs)
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

        AVAILABLE FUNDING PROGRAMS (Pre-filtered by semantic similarity):
        {programs_text}

        TASK:
        For each funding program, provide:
        1. A relevance score (0-100) indicating how well the program matches the company
        2. A clear justification explaining why this program is or isn't suitable (refer to programs by their NAME, not by number)
        3. Specific eligibility considerations

        IMPORTANT: In your justifications, always refer to programs by their full NAME, never say "Program 1", "Program 2", etc.

        Return ONLY a valid JSON array with this structure:
        [
        {{
            "program_index": 0,
            "relevance_score": 85,
            "justification": "The [Program Name] is a good match because...",
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
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.3-70b-versatile",
                temperature=0.5,
                max_tokens=4096,
            )
            
            response_text = chat_completion.choices[0].message.content.strip()
            
            # Extract JSON from response
            json_start = response_text.find('[')
            json_end = response_text.rfind(']') + 1
            if json_start != -1 and json_end > json_start:
                response_text = response_text[json_start:json_end]
            
            matches = json.loads(response_text)
            
            # Combine matches with original program data
            results = []
            for match in matches:
                program_idx = match.get('program_index', 0)
                if 0 <= program_idx < len(programs):
                    program = programs[program_idx].copy()
                    program['relevance_score'] = match.get('relevance_score', 0)
                    program['justification'] = match.get('justification', '')
                    program['eligibility_notes'] = match.get('eligibility_notes', '')
                    program['recommended'] = match.get('recommended', False)
                    results.append(program)
            
            # Sort by relevance score (highest first)
            results.sort(key=lambda x: x.get('relevance_score', 0), reverse=True)
            
            return results
            
        except Exception as e:
            print(f"   ❌ Error in LLM analysis: {e}")
            # Return programs with just similarity scores
            for prog in programs:
                prog['relevance_score'] = int(prog.get('similarity_score', 0.5) * 100)
                prog['justification'] = f"Semantic similarity: {prog['relevance_score']}%"
                prog['eligibility_notes'] = 'AI analysis failed - review program details'
                prog['recommended'] = prog['relevance_score'] >= 70
            return programs
    
    def match_funding_programs(self, company_data: Dict, funding_programs: List[Dict] = None) -> List[Dict]:
        """
        Match company with funding programs and provide justifications
        
        NEW BEHAVIOR: If funding_programs is None, uses RAG (vector search + LLM)
        OLD BEHAVIOR: If funding_programs provided, uses traditional matching
        
        Returns sorted list of matches with relevance scores
        """
        # NEW: If no programs provided, use RAG approach
        if funding_programs is None:
            try:
                # Check if database has programs
                program_count = FundingProgram.query.count()
                if program_count > 0:
                    print(f"📊 Using RAG with {program_count} programs in database")
                    return self.match_funding_programs_with_rag(company_data, top_k=15)
                else:
                    print("⚠️  No programs in database yet, using fallback")
                    return self._fallback_matching(company_data, [])
            except Exception as e:
                print(f"❌ Error checking database: {e}")
                return self._fallback_matching(company_data, [])
        
        # OLD: Traditional matching with provided programs (backward compatible)
        if not self.client:
            return self._fallback_matching(company_data, funding_programs)
        
        # Prepare funding programs summary
        programs_text = "\n\n".join([
            f"Program {i+1}:\n"
            f"Name: {p['name']}\n"
            f"Provider: {p['provider']}\n"
            f"Description: {p['description']}\n"
            f"Eligibility: {json.dumps(p.get('eligibility', {}))}\n"
            f"Focus Areas: {', '.join(p.get('focus_areas', []))}\n"
            f"Deadline: {p.get('deadline', 'N/A')}\n"
            f"Funding Details: {json.dumps(p.get('funding_details', {}))}\n"
            f"URL: {p.get('url', 'N/A')}"
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
            
            # Try to parse JSON, with fallback for malformed responses
            try:
                matches = json.loads(response_text)
            except json.JSONDecodeError as json_err:
                print(f"JSON parsing error: {json_err}")
                print(f"Response excerpt: {response_text[:500]}...")
                # Fall back to keyword matching if JSON is malformed
                raise Exception(f"Failed to parse AI response: {json_err}")
            
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
