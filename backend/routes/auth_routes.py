from flask import Blueprint, request
from flask_cors import CORS

from config import CORS_ORIGINS, CORS_SUPPORTS_CREDENTIALS
from service import login, sign_up, logout

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')
CORS(auth_bp, origns=CORS_ORIGINS, supports_credentials=CORS_SUPPORTS_CREDENTIALS)


@auth_bp.route('/login', methods=['POST'])
def login_route():
    return login(request)


@auth_bp.route('/signup', methods=['POST'])
def sign_up_route():
    return sign_up(request)


@auth_bp.route('/logout', methods=['POST'])
def logout_route():
    return logout()
