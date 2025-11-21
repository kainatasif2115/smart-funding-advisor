from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import bcrypt

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
    size = db.Column(db.String(50))
    revenue = db.Column(db.String(50))
    employees = db.Column(db.Integer)
    growth_stage = db.Column(db.String(50))
    description = db.Column(db.Text)
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
            'revenue': self.revenue,
            'employees': self.employees,
            'growth_stage': self.growth_stage,
            'description': self.description,
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
