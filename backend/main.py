# app/main.py
from flask import Flask
from flask_socketio import SocketIO

# Import configuration from config.py
from config import SECRET_KEY, FLASK_ENV, HOST, \
    PORT, init_mongoengine, CORS_ORIGINS
from routes import auth_bp, chat_bp, user_bp, register_socket_routes


def create_app():
    web_server = Flask(__name__)

    # Disable strict slashes to avoid 307/308 redirects between /path and /path/
    web_server.url_map.strict_slashes = False

    # Apply configuration
    web_server.config['SECRET_KEY'] = SECRET_KEY
    web_server.config['ENV'] = FLASK_ENV
    # Register Blueprints (example, add your own)
    web_server.register_blueprint(auth_bp)
    web_server.register_blueprint(chat_bp)
    web_server.register_blueprint(user_bp)

    # Initialize MongoEngine connection
    init_mongoengine()
    socketio = SocketIO(web_server, cors_allowed_origins=CORS_ORIGINS)
    register_socket_routes(socketio)
    return web_server, socketio


if __name__ == '__main__':
    server, socket = create_app()
    socket.run(server, debug=True, host=HOST, port=PORT)
