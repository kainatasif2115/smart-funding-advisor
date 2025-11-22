from flask import Blueprint, request, jsonify
from models.database import db, Company
from utils.auth import token_required
from services.ytj_service import YTJService
from services.ai_matcher import AIMatcherService

companies_bp = Blueprint('companies', __name__)

@companies_bp.route('', methods=['GET'])
@token_required
def get_companies(user_id):
    """Get all companies for the logged-in user"""
    try:
        companies = Company.query.filter_by(user_id=user_id).order_by(Company.created_at.desc()).all()
        return jsonify({
            'companies': [c.to_dict() for c in companies]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@companies_bp.route('/<int:company_id>', methods=['GET'])
@token_required
def get_company(user_id, company_id):
    """Get a specific company"""
    try:
        company = Company.query.filter_by(id=company_id, user_id=user_id).first()
        if not company:
            return jsonify({'error': 'Company not found'}), 404
        
        return jsonify(company.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@companies_bp.route('', methods=['POST'])
@token_required
def add_company(user_id):
    """Add a new company manually"""
    try:
        data = request.get_json()
        
        # Create company with all fields
        company = Company(
            user_id=user_id,
            business_id=data.get('business_id'),
            name=data.get('name'),
            industry=data.get('industry'),
            size=data.get('size'),
            company_size=data.get('company_size'),
            revenue=data.get('revenue'),
            employees=data.get('employees'),
            growth_stage=data.get('growth_stage'),
            description=data.get('description'),
            country=data.get('country', 'Finland'),
            city=data.get('city'),
            funding_purpose=data.get('funding_purpose'),
            funding_amount=data.get('funding_amount'),
            keywords=data.get('keywords', [])
        )
        
        db.session.add(company)
        db.session.commit()
        
        return jsonify({
            'message': 'Company added successfully',
            'company': company.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@companies_bp.route('/<int:company_id>', methods=['PUT'])
@token_required
def update_company(user_id, company_id):
    """Update a company"""
    try:
        company = Company.query.filter_by(id=company_id, user_id=user_id).first()
        if not company:
            return jsonify({'error': 'Company not found'}), 404
        
        data = request.get_json()
        
        # Update all fields
        if 'name' in data:
            company.name = data['name']
        if 'business_id' in data:
            company.business_id = data['business_id']
        if 'description' in data:
            company.description = data['description']
        if 'industry' in data:
            company.industry = data['industry']
        if 'company_size' in data:
            company.company_size = data['company_size']
        if 'growth_stage' in data:
            company.growth_stage = data['growth_stage']
        if 'employees' in data:
            company.employees = data['employees']
        if 'city' in data:
            company.city = data['city']
        if 'country' in data:
            company.country = data['country']
        if 'funding_purpose' in data:
            company.funding_purpose = data['funding_purpose']
        if 'funding_amount' in data:
            company.funding_amount = data['funding_amount']
        if 'keywords' in data:
            company.keywords = data['keywords']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Company updated successfully',
            'company': company.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@companies_bp.route('/<int:company_id>', methods=['DELETE'])
@token_required
def delete_company(user_id, company_id):
    """Delete a company"""
    try:
        company = Company.query.filter_by(id=company_id, user_id=user_id).first()
        if not company:
            return jsonify({'error': 'Company not found'}), 404
        
        db.session.delete(company)
        db.session.commit()
        
        return jsonify({'message': 'Company deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@companies_bp.route('/search-name', methods=['POST'])
@token_required
def search_by_name(user_id):
    """Search companies by name using YTJ API"""
    try:
        data = request.get_json()
        name = data.get('name')
        
        if not name:
            return jsonify({'error': 'Company name is required'}), 400
        
        # Search using YTJ service
        results = YTJService.search_by_name(name)
        
        return jsonify({
            'results': results
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@companies_bp.route('/preview-by-id', methods=['POST'])
@token_required
def preview_by_business_id(user_id):
    """Preview company data by Business ID without saving to database"""
    try:
        data = request.get_json()
        business_id = data.get('business_id')
        
        if not business_id:
            return jsonify({'error': 'Business ID is required'}), 400
        
        # Fetch from YTJ
        ytj_data = YTJService.search_by_business_id(business_id)
        
        if not ytj_data:
            return jsonify({'error': 'Company not found in Finnish Business Registry'}), 404
        
        # Generate AI-enriched company data
        ai_service = AIMatcherService()
        enriched_data = ai_service.generate_full_company_profile(ytj_data)
        
        return jsonify({
            'company': enriched_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@companies_bp.route('/fetch-by-id', methods=['POST'])
@token_required
def fetch_by_business_id(user_id):
    """Fetch company data by Business ID and save to database"""
    try:
        data = request.get_json()
        business_id = data.get('business_id')
        
        if not business_id:
            return jsonify({'error': 'Business ID is required'}), 400
        
        # Fetch from YTJ
        ytj_data = YTJService.search_by_business_id(business_id)
        
        if not ytj_data:
            return jsonify({'error': 'Company not found in Finnish Business Registry'}), 404
        
        # Generate FULL AI profile with ALL fields
        ai_service = AIMatcherService()
        ai_profile = ai_service.generate_full_company_profile(ytj_data)
        
        # Check if company already exists for this user
        existing = Company.query.filter_by(
            user_id=user_id,
            business_id=ytj_data['business_id']
        ).first()
        
        if existing:
            # Update existing company with ALL fields
            existing.name = ai_profile.get('name')
            existing.industry = ai_profile.get('industry')
            existing.description = ai_profile.get('description')
            existing.company_size = ai_profile.get('company_size')
            existing.growth_stage = ai_profile.get('growth_stage')
            existing.employees = ai_profile.get('employees')
            existing.city = ai_profile.get('city')
            existing.country = ai_profile.get('country', 'Finland')
            existing.website = ai_profile.get('website')
            existing.funding_purpose = ai_profile.get('funding_purpose')
            existing.funding_amount = ai_profile.get('funding_amount')
            existing.keywords = ai_profile.get('keywords', [])
            company = existing
        else:
            # Create new company with ALL fields
            company = Company(
                user_id=user_id,
                business_id=ai_profile.get('business_id'),
                name=ai_profile.get('name'),
                industry=ai_profile.get('industry'),
                description=ai_profile.get('description'),
                company_size=ai_profile.get('company_size'),
                growth_stage=ai_profile.get('growth_stage'),
                employees=ai_profile.get('employees'),
                city=ai_profile.get('city'),
                country=ai_profile.get('country', 'Finland'),
                website=ai_profile.get('website'),
                funding_purpose=ai_profile.get('funding_purpose'),
                funding_amount=ai_profile.get('funding_amount'),
                keywords=ai_profile.get('keywords', [])
            )
            db.session.add(company)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Company data fetched successfully',
            'company': company.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@companies_bp.route('/fetch-by-selection', methods=['POST'])
@token_required
def fetch_by_selection(user_id):
    """Fetch company data after user selects from search results"""
    try:
        data = request.get_json()
        business_id = data.get('business_id')
        ytj_data = data.get('company_data')  # Pre-fetched data from search
        
        if not business_id:
            return jsonify({'error': 'Business ID is required'}), 400
        
        # If no pre-fetched data, fetch from YTJ
        if not ytj_data:
            ytj_data = YTJService.search_by_business_id(business_id)
            if not ytj_data:
                return jsonify({'error': 'Company not found'}), 404
        
        # Generate FULL AI profile with ALL fields
        ai_service = AIMatcherService()
        ai_profile = ai_service.generate_full_company_profile(ytj_data)
        
        # Check if company already exists
        existing = Company.query.filter_by(
            user_id=user_id,
            business_id=business_id
        ).first()
        
        if existing:
            # Update with ALL fields
            existing.name = ai_profile.get('name')
            existing.industry = ai_profile.get('industry')
            existing.description = ai_profile.get('description')
            existing.company_size = ai_profile.get('company_size')
            existing.growth_stage = ai_profile.get('growth_stage')
            existing.employees = ai_profile.get('employees')
            existing.city = ai_profile.get('city')
            existing.country = ai_profile.get('country', 'Finland')
            existing.website = ai_profile.get('website')
            existing.funding_purpose = ai_profile.get('funding_purpose')
            existing.funding_amount = ai_profile.get('funding_amount')
            existing.keywords = ai_profile.get('keywords', [])
            company = existing
        else:
            # Create with ALL fields
            company = Company(
                user_id=user_id,
                business_id=ai_profile.get('business_id'),
                name=ai_profile.get('name'),
                industry=ai_profile.get('industry'),
                description=ai_profile.get('description'),
                company_size=ai_profile.get('company_size'),
                growth_stage=ai_profile.get('growth_stage'),
                employees=ai_profile.get('employees'),
                city=ai_profile.get('city'),
                country=ai_profile.get('country', 'Finland'),
                website=ai_profile.get('website'),
                funding_purpose=ai_profile.get('funding_purpose'),
                funding_amount=ai_profile.get('funding_amount'),
                keywords=ai_profile.get('keywords', [])
            )
            db.session.add(company)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Company added successfully',
            'company': company.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
