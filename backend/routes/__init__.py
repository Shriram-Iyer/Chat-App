from routes.auth_routes import auth_bp
from routes.chat_routes import chat_bp
from routes.user_routes import user_bp
from routes.socket_routes import register_socket_routes, get_receiver_socket_id

__all__ = [
    "auth_bp", "chat_bp", "user_bp", "register_socket_routes", "get_receiver_socket_id"
]
