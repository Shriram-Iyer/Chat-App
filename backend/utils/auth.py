from functools import wraps

from flask import request, jsonify, g

from models.user import User


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            jwt_token = request.cookies.get("jwt")
            print(f"JWT Token from cookie: {jwt_token}")  # Debugging line
            if not jwt_token:
                return jsonify({"error": "Authentication required"}), 401
            user = User.validate_auth_token(jwt_token)
            print(f"Authenticated user: {user}")  # Debugging line
            if not user:
                return jsonify({"error": "Invalid or expired token"}), 401
            # Remove password before attaching to context
            g.current_user = user
            print(f"Current user set in context: {g.current_user}")  # Debugging line
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({"error": f"Internal server error: {str(e)}"}), 500

    return decorated_function


def generate_auth_token(user: User):
    try:
        new_token = user.generate_auth_token(expires_in=7 * 24 * 60 * 60)
        if not new_token:
            return False
        return new_token
    except Exception as e:
        print(f"Error generating auth token: {e}")
        return False
