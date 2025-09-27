# app/main.py
from flask import Flask

# Import configuration from config.py
from config import SECRET_KEY, FLASK_ENV, HOST, \
    PORT, init_mongoengine
from routes import auth_bp, chat_bp, user_bp


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

    return web_server


if __name__ == '__main__':
    server = create_app()
    server.run(debug=True, host=HOST, port=PORT)
