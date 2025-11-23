"""
Embedding Service for RAG (Retrieval-Augmented Generation)
Uses sentence-transformers to generate semantic embeddings for funding programs and companies
"""

from sentence_transformers import SentenceTransformer
import numpy as np
from typing import Dict, List, Union
import os

class EmbeddingService:
    """
    Service to generate embeddings using sentence-transformers
    Uses all-MiniLM-L6-v2 model (384 dimensions, lightweight, fast)
    """
    
    _instance = None
    _model = None
    
    def __new__(cls):
        """Singleton pattern to avoid loading model multiple times"""
        if cls._instance is None:
            cls._instance = super(EmbeddingService, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Initialize the embedding model (loads on first use)"""
        if self._model is None:
            print("Loading sentence-transformers model (all-MiniLM-L6-v2)...")
            # This model is ~80MB, downloads on first use
            self._model = SentenceTransformer('all-MiniLM-L6-v2')
            print("✓ Embedding model loaded successfully")
    
    def generate_program_text(self, program: Dict) -> str:
        """
        Create a rich text representation of a funding program for embedding
        Combines key fields that define program eligibility and focus
        """
        parts = []
        
        # Program name and provider
        if program.get('name'):
            parts.append(f"Program: {program['name']}")
        if program.get('provider'):
            parts.append(f"Provider: {program['provider']}")
        
        # Description (most important for semantic matching)
        if program.get('description'):
            parts.append(f"Description: {program['description']}")
        
        # Focus areas
        if program.get('focus_areas'):
            focus = ', '.join(program['focus_areas']) if isinstance(program['focus_areas'], list) else program['focus_areas']
            parts.append(f"Focus Areas: {focus}")
        
        # Eligibility criteria
        if program.get('eligibility'):
            eligibility = program['eligibility']
            if isinstance(eligibility, dict):
                # Extract key eligibility info
                if eligibility.get('company_size'):
                    parts.append(f"Company Size: {eligibility['company_size']}")
                if eligibility.get('stage'):
                    parts.append(f"Stage: {eligibility['stage']}")
                if eligibility.get('industry'):
                    parts.append(f"Industry: {eligibility['industry']}")
                if eligibility.get('location'):
                    parts.append(f"Location: {eligibility['location']}")
        
        # Funding details
        if program.get('funding_details'):
            details = program['funding_details']
            if isinstance(details, dict):
                if details.get('amount_range'):
                    parts.append(f"Funding: {details['amount_range']}")
                if details.get('type'):
                    parts.append(f"Type: {details['type']}")
        
        return " | ".join(parts)
    
    def generate_company_text(self, company: Dict) -> str:
        """
        Create a rich text representation of a company for embedding
        Focuses on characteristics relevant for funding matching
        """
        parts = []
        
        # Company basics
        if company.get('name'):
            parts.append(f"Company: {company['name']}")
        
        # Industry and description
        if company.get('industry'):
            parts.append(f"Industry: {company['industry']}")
        if company.get('description'):
            parts.append(f"Description: {company['description']}")
        
        # Company characteristics
        if company.get('company_size'):
            parts.append(f"Size: {company['company_size']}")
        if company.get('growth_stage'):
            parts.append(f"Stage: {company['growth_stage']}")
        if company.get('employees'):
            parts.append(f"Employees: {company['employees']}")
        if company.get('revenue'):
            parts.append(f"Revenue: {company['revenue']}")
        
        # Location
        if company.get('city'):
            parts.append(f"Location: {company['city']}")
        if company.get('country'):
            parts.append(f"Country: {company['country']}")
        
        # Funding needs
        if company.get('funding_purpose'):
            parts.append(f"Funding Purpose: {company['funding_purpose']}")
        if company.get('funding_amount'):
            parts.append(f"Funding Need: {company['funding_amount']}")
        
        # Keywords
        if company.get('keywords'):
            keywords = ', '.join(company['keywords']) if isinstance(company['keywords'], list) else company['keywords']
            parts.append(f"Keywords: {keywords}")
        
        return " | ".join(parts)
    
    def embed_text(self, text: str) -> List[float]:
        """
        Generate embedding for a single text
        Returns a 384-dimensional vector
        """
        if not text or not text.strip():
            # Return zero vector for empty text
            return [0.0] * 384
        
        embedding = self._model.encode(text, convert_to_numpy=True)
        return embedding.tolist()
    
    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple texts (batch processing)
        More efficient than calling embed_text multiple times
        """
        if not texts:
            return []
        
        # Filter out empty texts
        valid_texts = [t if t and t.strip() else " " for t in texts]
        
        embeddings = self._model.encode(valid_texts, convert_to_numpy=True, show_progress_bar=len(texts) > 10)
        return embeddings.tolist()
    
    def embed_program(self, program: Dict) -> List[float]:
        """Generate embedding for a funding program"""
        text = self.generate_program_text(program)
        return self.embed_text(text)
    
    def embed_programs(self, programs: List[Dict]) -> List[List[float]]:
        """Generate embeddings for multiple funding programs (batch)"""
        texts = [self.generate_program_text(p) for p in programs]
        return self.embed_texts(texts)
    
    def embed_company(self, company: Dict) -> List[float]:
        """Generate embedding for a company profile"""
        text = self.generate_company_text(company)
        return self.embed_text(text)
    
    def calculate_similarity(self, embedding1: Union[List[float], np.ndarray], 
                           embedding2: Union[List[float], np.ndarray]) -> float:
        """
        Calculate cosine similarity between two embeddings
        Returns value between 0 (completely different) and 1 (identical)
        """
        vec1 = np.array(embedding1)
        vec2 = np.array(embedding2)
        
        # Cosine similarity
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return float(dot_product / (norm1 * norm2))


# Global instance
_embedding_service = None

def get_embedding_service() -> EmbeddingService:
    """Get or create the global embedding service instance"""
    global _embedding_service
    if _embedding_service is None:
        _embedding_service = EmbeddingService()
    return _embedding_service
