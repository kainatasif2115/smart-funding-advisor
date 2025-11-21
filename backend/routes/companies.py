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
        
        # Create company
        company = Company(
            user_id=user_id,
            business_id=data.get('business_id'),
            name=data.get('name'),
            industry=data.get('industry'),
            size=data.get('size'),
            revenue=data.get('revenue'),
            employees=data.get('employees'),
            growth_stage=data.get('growth_stage'),
            description=data.get('description')
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
        
        # Generate AI summary
        ai_service = AIMatcherService()
        summary = ai_service.generate_company_summary(ytj_data)
        
        # Check if company already exists for this user
        existing = Company.query.filter_by(
            user_id=user_id,
            business_id=ytj_data['business_id']
        ).first()
        
        if existing:
            # Update existing company
            existing.name = ytj_data['name']
            existing.industry = ytj_data.get('industry', '')
            existing.description = summary
            company = existing
        else:
            # Create new company
            company = Company(
                user_id=user_id,
                business_id=ytj_data['business_id'],
                name=ytj_data['name'],
                industry=ytj_data.get('industry', ''),
                company_form=ytj_data.get('company_form', ''),
                description=summary
            )
            db.session.add(company)
        
        db.session.commit()
        
        result = company.to_dict()
        result['ai_summary'] = summary
        
        return jsonify({
            'message': 'Company data fetched successfully',
            'company': result
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
        
        # Generate AI summary
        ai_service = AIMatcherService()
        summary = ai_service.generate_company_summary(ytj_data)
        
        # Check if company already exists
        existing = Company.query.filter_by(
            user_id=user_id,
            business_id=business_id
        ).first()
        
        if existing:
            existing.name = ytj_data['name']
            existing.industry = ytj_data.get('industry', '')
            existing.description = summary
            company = existing
        else:
            company = Company(
                user_id=user_id,
                business_id=business_id,
                name=ytj_data['name'],
                industry=ytj_data.get('industry', ''),
                description=summary
            )
            db.session.add(company)
        
        db.session.commit()
        
        result = company.to_dict()
        result['ai_summary'] = summary
        
        return jsonify({
            'message': 'Company added successfully',
            'company': result
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
