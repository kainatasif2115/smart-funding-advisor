from flask import Blueprint, request, jsonify
from models.database import db, Company, FundingMatchCache
from utils.auth import token_required
from services.scraper_service import FundingScraperService
from services.ai_matcher import AIMatcherService
from datetime import datetime, timedelta

investors_bp = Blueprint('investors', __name__)

@investors_bp.route('/fetch', methods=['POST'])
@token_required
def fetch_investors(user_id):
    """
    Fetch matching funding programs/investors for a company
    This is the main "Fetch Investors" functionality
    """
    try:
        data = request.get_json()
        company_id = data.get('company_id')
        
        if not company_id:
            return jsonify({'error': 'Company ID is required'}), 400
        
        # Get company
        company = Company.query.filter_by(id=company_id, user_id=user_id).first()
        if not company:
            return jsonify({'error': 'Company not found'}), 404
        
        # Check if we have recent cached results (less than 24 hours old)
        # cache = FundingMatchCache.query.filter_by(company_id=company_id).first()
        cache = None
        if cache and (datetime.utcnow() - cache.created_at) < timedelta(hours=24):
            return jsonify({
                'message': 'Funding matches retrieved from cache',
                'company': company.to_dict(),
                'matches': cache.funding_data,
                'cached': True,
                'cache_timestamp': cache.created_at.isoformat()
            }), 200
        
        # Fetch fresh funding data
        print("Scraping funding sources...")
        funding_programs = FundingScraperService.scrape_all_sources()
        
        if not funding_programs:
            return jsonify({'error': 'No funding programs found'}), 500
        
        print(f"Found {len(funding_programs)} funding programs")
        
        # Prepare company data for AI matching
        company_data = {
            'name': company.name,
            'business_id': company.business_id,
            'industry': company.industry,
            'size': company.size,
            'revenue': company.revenue,
            'employees': company.employees,
            'growth_stage': company.growth_stage,
            'description': company.description,
            'company_form': getattr(company, 'company_form', None)
        }
        
        # Use AI to match and rank programs
        print("Matching with AI...")
        ai_service = AIMatcherService()
        matches = ai_service.match_funding_programs(company_data, funding_programs)
        
        # Cache the results
        if cache:
            cache.funding_data = matches
            cache.created_at = datetime.utcnow()
        else:
            cache = FundingMatchCache(
                company_id=company_id,
                funding_data=matches
            )
            db.session.add(cache)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Funding matches generated successfully',
            'company': company.to_dict(),
            'matches': matches,
            'cached': False,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        print(f"Error fetching investors: {e}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@investors_bp.route('/<int:company_id>', methods=['GET'])
@token_required
def get_cached_investors(user_id, company_id):
    """Get cached funding matches for a company"""
    try:
        # Verify company belongs to user
        company = Company.query.filter_by(id=company_id, user_id=user_id).first()
        if not company:
            return jsonify({'error': 'Company not found'}), 404
        
        # Get cached results
        cache = FundingMatchCache.query.filter_by(company_id=company_id).first()
        
        if not cache:
            return jsonify({'error': 'No cached results found. Please fetch investors first.'}), 404
        
        return jsonify({
            'company': company.to_dict(),
            'matches': cache.funding_data,
            'cache_timestamp': cache.created_at.isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
