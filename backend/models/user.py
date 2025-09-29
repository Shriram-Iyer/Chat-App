from datetime import datetime, UTC, timedelta

import bcrypt
import jwt
from jwt import ExpiredSignatureError, InvalidTokenError
from mongoengine import Document, StringField, EmailField, ListField, ReferenceField, DateTimeField
from mongoengine import signals

from config import SECRET_KEY


class User(Document):
    username = StringField(required=True, unique=True)
    email = EmailField(required=True, unique=True)
    password = StringField(required=True, min_length=6)
    about = StringField(default="")
    profile_pic = StringField(default="")
    friends = ListField(ReferenceField('User'))
    created_at = DateTimeField(default=lambda: datetime.now(UTC))
    updated_at = DateTimeField(default=lambda: datetime.now(UTC))

    meta = {
        'collection': 'users'
    }

    def create(self, *args, **kwargs):
        """
        Create or save the user document. Sets updated_at and handles errors.
        """
        self.updated_at = datetime.now(UTC)
        try:
            return super(User, self).save(*args, **kwargs)
        except Exception as e:
            print(f"Error creating user: {e}")
            return None

    def update_user(self, **kwargs):
        """
        Partially update user fields. Only fields provided in kwargs are updated.
        Automatically updates updated_at and hashes password if updated.
        Returns the updated user object, or None on error.
        """
        update_fields = {}
        for field, value in kwargs.items():
            if field == "password" and value and not (value.startswith("$2b$") or value.startswith("$2a$")):
                try:
                    salt = bcrypt.gensalt(10)
                    value = bcrypt.hashpw(value.encode("utf-8"), salt).decode("utf-8")
                except Exception as e:
                    print(f"Error hashing password during update: {e}")
                    continue
            update_fields[f"set__{field}"] = value
        update_fields["set__updated_at"] = datetime.now(UTC)
        try:
            updated_count = User.objects(id=self.id).update(**update_fields)
            if updated_count:
                return User.objects(id=self.id).first()
            else:
                return None
        except Exception as e:
            print(f"Error updating user: {e}")
            return None

    def to_dict(self):
        try:
            return {
                "_id": str(self.id) if self.id else None,
                "username": self.username,
                "email": self.email,
                "password": self.password,
                "profile_pic": self.profile_pic,
                "about": self.about,
                "friends": [str(friend.id) for friend in self.friends] if self.friends else [],
                "created_at": self.created_at.isoformat() if self.created_at else None,
                "updated_at": self.updated_at.isoformat() if self.updated_at else None
            }
        except Exception as e:
            print(f"Error serializing user to dict: {e}")
            return {}

    @staticmethod
    def from_dict(data):
        try:
            return User(
                username=data.get("username"),
                email=data.get("email"),
                password=data.get("password"),
                profile_pic=data.get("profile_pic", ""),
                about=data.get("about", ""),
                friends=data.get("friends", []),
                created_at=data.get("created_at", datetime.now(UTC)),
                updated_at=data.get("updated_at", datetime.now(UTC))
            )
        except Exception as e:
            print(f"Error creating user from dict: {e}")
            return None

    def generate_auth_token(self, expires_in=60 * 60):
        """
        Generate JWT auth token for the user. Default expiration is 60 mins.
        """
        try:
            payload = {
                'user_id': str(self.id),
                'email': self.email,
                'exp': datetime.now(UTC) + timedelta(seconds=expires_in)
            }
            token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
            return token
        except Exception as e:
            print(f"Error generating auth token: {e}")
            return None

    def check_password(self, plain_password):
        """
        Check if the provided plain password matches the user's hashed password.
        Returns True if match, False otherwise.
        """
        try:
            return bcrypt.checkpw(plain_password.encode('utf-8'), self.password.encode('utf-8'))
        except Exception as e:
            print(f"Error checking password: {e}")
            return False

    @classmethod
    def validate_auth_token(cls, token):
        """
        Validate JWT auth token. Returns user instance if valid, else None.
        Handles expiry and signature errors.
        """
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user_id = payload.get("user_id")
            if not user_id:
                return None
            user = cls.objects(id=user_id).first()
            return user
        except ExpiredSignatureError:
            print("Token expired.")
            return None
        except InvalidTokenError:
            print("Invalid token.")
            return None
        except Exception as e:
            print(f"Error validating auth token: {e}")
            return None


# Pre-save hook to hash password
@signals.pre_save_post_validation.connect_via(User)
def hash_password(sender, document, **kwargs):
    try:
        password = document.password
        # Only hash if not already hashed (bcrypt hashes start with $2b$ or $2a$)
        if password and not (password.startswith("$2b$") or password.startswith("$2a$")):
            salt = bcrypt.gensalt(10)
            document.password = bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")
    except Exception as e:
        print(f"Error hashing password: {e}")
