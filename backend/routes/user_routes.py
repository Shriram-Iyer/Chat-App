from flask import Blueprint, request, g, jsonify
from flask_cors import CORS

from config import CORS_ORIGINS, CORS_SUPPORTS_CREDENTIALS, CORS_METHODS
from service import update_profile, get_friends, get_all_users, send_request, accept_request, reject_request, \
    get_friend_requests, get_outgoing_friend_request
from utils import login_required
from utils import response_user

user_bp = Blueprint('user', __name__, url_prefix='/api/user')
CORS(user_bp, methods=CORS_METHODS, origns=CORS_ORIGINS, supports_credentials=CORS_SUPPORTS_CREDENTIALS)


@user_bp.route('/update-profile', methods=['POST'])
@login_required
def update_profile_route():
    user = g.current_user
    return update_profile(request, user)


@user_bp.route('/me', methods=['GET'])
@login_required
def get_current_user_route():
    user = getattr(g, 'current_user', None)
    if user is None:
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify(response_user(user)), 200


@user_bp.route('/get-all', methods=['GET'])
@login_required
def get_all_users_route():
    user = g.current_user
    return get_all_users(user)


@user_bp.route('/get-friends', methods=['GET'])
@login_required
def get_friends_route():
    user = g.current_user
    return get_friends(user)


@user_bp.route('/friend-request/<id>', methods=['POST'])
@login_required
def send_friend_request_route(id):
    user = g.current_user
    return send_request(user, id)


@user_bp.route('/friend-request/<id>/accept', methods=['PUT'])
@login_required
def accept_friend_request_route(id):
    return accept_request(id)


@user_bp.route('/friend-request/<id>/reject', methods=['PUT'])
@login_required
def reject_friend_request_route(id):
    return reject_request(id)


@user_bp.route('/friend-requests', methods=['GET'])
@login_required
def get_friend_requests_route():
    user = g.current_user
    return get_friend_requests(user)


@user_bp.route('/outgoing-friend-requests', methods=['GET'])
@login_required
def get_outgoing_friend_request_route():
    user = g.current_user
    return get_outgoing_friend_request(user)
