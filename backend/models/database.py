from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import bcrypt
from pgvector.sqlalchemy import Vector

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    companies = db.relationship('Company', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'created_at': self.created_at.isoformat()
        }

class Company(db.Model):
    __tablename__ = 'companies'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    business_id = db.Column(db.String(20))  # Y-tunnus
    name = db.Column(db.String(255), nullable=False)
    industry = db.Column(db.String(255))
    size = db.Column(db.String(50))  # Revenue size
    company_size = db.Column(db.String(50))  # Company size (small, medium, large)
    revenue = db.Column(db.String(50))
    employees = db.Column(db.Integer)
    growth_stage = db.Column(db.String(50))
    description = db.Column(db.Text)
    country = db.Column(db.String(100))
    city = db.Column(db.String(100))
    website = db.Column(db.String(255))
    funding_purpose = db.Column(db.Text)  # What they need funding for
    funding_amount = db.Column(db.String(100))  # Estimated funding need
    keywords = db.Column(db.JSON)  # Array of keywords/tags
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    funding_matches = db.relationship('FundingMatchCache', backref='company', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'business_id': self.business_id,
            'name': self.name,
            'industry': self.industry,
            'size': self.size,
            'company_size': self.company_size,
            'revenue': self.revenue,
            'employees': self.employees,
            'growth_stage': self.growth_stage,
            'description': self.description,
            'country': self.country,
            'city': self.city,
            'website': self.website,
            'funding_purpose': self.funding_purpose,
            'funding_amount': self.funding_amount,
            'keywords': self.keywords or [],
            'created_at': self.created_at.isoformat()
        }

class FundingMatchCache(db.Model):
    __tablename__ = 'funding_matches_cache'
    
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    funding_data = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'funding_data': self.funding_data,
            'created_at': self.created_at.isoformat()
        }

class FundingProgram(db.Model):
    __tablename__ = 'funding_programs'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, nullable=False)
    provider = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text, nullable=False)
    eligibility = db.Column(db.JSON)
    focus_areas = db.Column(db.JSON)
    deadline = db.Column(db.Text)
    funding_details = db.Column(db.JSON)
    url = db.Column(db.Text)
    embedding = db.Column(Vector(384))  # 384-dimensional vector for sentence-transformers
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'provider': self.provider,
            'description': self.description,
            'eligibility': self.eligibility or {},
            'focus_areas': self.focus_areas or [],
            'deadline': self.deadline,
            'funding_details': self.funding_details or {},
            'url': self.url,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    @staticmethod
    def find_similar(embedding, limit=15):
        """
        Find similar funding programs using cosine similarity
        Returns programs ordered by similarity (most similar first)
        """
        from sqlalchemy import text
        
        # Convert embedding to string format for pgvector
        embedding_str = '[' + ','.join(str(float(x)) for x in embedding) + ']'
        
        # Use pgvector's cosine distance operator (<=>)
        # Lower distance = more similar
        query = text("""
            SELECT id, name, provider, description, eligibility, focus_areas, 
                   deadline, funding_details, url, 
                   (embedding <=> cast(:embedding as vector)) as distance
            FROM funding_programs
            WHERE embedding IS NOT NULL
            ORDER BY distance ASC
            LIMIT :limit
        """)
        
        result = db.session.execute(
            query,
            {'embedding': embedding_str, 'limit': limit}
        )
        
        programs = []
        for row in result:
            programs.append({
                'id': row[0],
                'name': row[1],
                'provider': row[2],
                'description': row[3],
                'eligibility': row[4] or {},
                'focus_areas': row[5] or [],
                'deadline': row[6],
                'funding_details': row[7] or {},
                'url': row[8],
                'similarity_score': 1 - row[9]  # Convert distance to similarity (0-1)
            })
        
        return programs
