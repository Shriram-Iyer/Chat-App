# app/main.py
from flask import Flask, jsonify
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

    # Health check endpoint
    @web_server.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'service': 'chat-app-backend',
            'version': '1.0.0'
        }), 200

    # Initialize MongoEngine connection
    init_mongoengine()
    print("CORS_ORIGINS: {}", CORS_ORIGINS)
    
    # Configure SocketIO with comprehensive CORS settings
    # Handle the case where CORS_ORIGINS might be ["*"] or specific domains
    socketio_origins = CORS_ORIGINS if CORS_ORIGINS != ["*"] else "*"
    print("Socket.IO CORS Origins: {}", socketio_origins)
    
    socketio = SocketIO(
        web_server, 
        cors_allowed_origins=socketio_origins,
        cors_credentials=True,
        logger=True,
        engineio_logger=True,
        async_mode='eventlet'
    )
    register_socket_routes(socketio)
    return web_server, socketio


if __name__ == '__main__':
    server, socket = create_app()
    # Development server only - production uses Gunicorn
    socket.run(server, debug=(FLASK_ENV != 'production'), host=HOST, port=PORT)
