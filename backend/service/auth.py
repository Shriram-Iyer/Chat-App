from flask import make_response, jsonify

from config import FLASK_ENV, cloudinary_instance
from models.user import User
from utils import validate_signup_payload, validate_login_payload, user_validation, generate_auth_token, \
    response_user


def login(request):
    payload = request.get_json()
    valid, result = validate_login_payload(payload)
    if not valid:
        return jsonify({"error": result}), 400
    try:
        existing_user = user_validation(result['email'])
        if not existing_user:
            return jsonify({"error": "Invalid email or password."}), 401
        if not existing_user.check_password(result['password']):
            return jsonify({"error": "Invalid email or password."}), 401
        existing_user_update = existing_user.update_user(status="online")
        new_token = generate_auth_token(existing_user_update)
        if not new_token:
            return jsonify({"error": "Failed to generate auth token."}), 500

        response = make_response(jsonify(response_user(existing_user_update)))
        response.set_cookie("jwt", new_token, httponly=True, max_age=7 * 24 * 60 * 60, samesite='strict',
                            secure=(FLASK_ENV == 'production'))
        return response, 200
    except Exception as e:
        print(f"Error during login: {e}")
        return jsonify({"error": "Internal Server Error"}), 500


def sign_up(request):
    payload = request.get_json()
    valid, result = validate_signup_payload(payload)
    if not valid:
        return jsonify({"error": result}), 400
    try:
        existing_user = user_validation(result['email'])
        if existing_user:
            return jsonify({"error": "User with this email already exists."}), 400
        new_user = User(email=result['email'], password=result['password'], username=result['username'])
        user_obj = new_user.create()
        if not user_obj:
            return jsonify({"error": "Failed to create user."}), 500
        new_token = generate_auth_token(user_obj)
        if not new_token:
            return jsonify({"error": "Failed to generate auth token."}), 500
        response = make_response(jsonify(response_user(user_obj)))
        response.set_cookie("jwt", new_token, httponly=True, max_age=7 * 24 * 60 * 60, samesite='strict',
                            secure=(FLASK_ENV == 'production'))
        return response, 201
    except Exception as e:
        print(f"Error during sign up: {e}")
        return jsonify({"error": "Internal Server Error"}), 500


def logout(user):
    user.update_user(status="offline")
    response = make_response(jsonify({"message": "Logout successful", "success": True}))
    response.set_cookie("jwt", "", expires=0, max_age=0, httponly=True, samesite='strict',
                        secure=(FLASK_ENV == 'production'))
    return response, 200


def upload_profile_pic(request, user):
    image = request.json.get('profile_pic')
    if not image:
        return jsonify({'error': 'Profile Pic is required'}), 400
    try:
        upload_result = cloudinary_instance.uploader.upload(image, resource_type="image")
        updated_user = user.update_user(profile_pic=upload_result.get('secure_url'))
        if not updated_user:
            return jsonify({"error": "User Not Found."}), 404
        return jsonify(response_user(updated_user)), 200
    except Exception as e:
        print(f"Error during image upload: {e}")
        return jsonify({"error": "Internal Server Error"}), 500
