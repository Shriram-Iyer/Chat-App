from flask import Blueprint, g, request
from flask_cors import CORS

from config import CORS_ORIGINS, CORS_SUPPORTS_CREDENTIALS, CORS_METHODS
from service import get_messages, send_message
from utils import login_required

chat_bp = Blueprint('chat', __name__, url_prefix='/api/chat')
CORS(chat_bp, methods=CORS_METHODS, origns=CORS_ORIGINS, supports_credentials=CORS_SUPPORTS_CREDENTIALS)


@chat_bp.route('/<user_id>', methods=['GET'])
@login_required
def get_messages_route(user_id):
    user = g.current_user
    return get_messages(user_id, user)


@chat_bp.route('/send/<receiver_id>', methods=['POST'])
@login_required
def send_message_route(receiver_id):
    user = g.current_user
    return send_message(request, receiver_id, user)
