from marshmallow import Schema, fields, ValidationError, RAISE
from marshmallow.validate import Length

from models.user import User


class SignUpSchema(Schema):
    email = fields.Email(required=True, validate=Length(min=1))
    password = fields.String(required=True, validate=Length(min=6))
    username = fields.String(required=True, validate=Length(min=1))


# You can add more schemas for other payloads as needed

def validate_signup_payload(payload):
    schema = SignUpSchema(unknown=RAISE)
    try:
        result = schema.load(payload)
    except ValidationError as err:
        return False, err.messages
    return True, result


def validate_login_payload(payload):
    schema = SignUpSchema(only=("email", "password"), unknown=RAISE)
    try:
        result = schema.load(payload)
    except ValidationError as err:
        return False, err.messages
    return True, result


def user_validation(email):
    try:
        user = User.objects(email=email).first()
        if user:
            return user
        return False
    except Exception as db_err:
        print(f"Database error during user validation: {str(db_err)}")
        return False


def cookie_validation(cookie):
    try:
        user = User.validate_auth_token(cookie)
        if user:
            return user
        return False
    except Exception as db_err:
        print(f"Database error during cookie validation: {str(db_err)}")
        return False


def validate_update_profile_payload(payload):
    class UpdateProfileSchema(Schema):
        username = fields.String(required=False)
        about = fields.String(required=False)
        profile_pic = fields.String(required=False)

    schema = UpdateProfileSchema(unknown=RAISE)
    try:
        result = schema.load(payload)
    except ValidationError as err:
        return False, err.messages
    return True, result


class SendMessageSchema(Schema):
    text = fields.String(required=False)
    image = fields.String(required=False)
    video = fields.String(required=False)


def validate_send_message_payload(payload):
    schema = SendMessageSchema(unknown=RAISE)
    try:
        result = schema.load(payload)
    except ValidationError as err:
        return False, err.messages
    return True, result
