from models.message import Message
from models.user import User


def response_user(user: User, include_timezone: bool = True):
    response_user_dict = {
        "_id": str(user.id),
        "email": user.email,
        "username": user.username,
        "profile_pic": user.profile_pic,
        "about": user.about,
    }
    if include_timezone:
        response_user_dict["created_at"] = user.created_at.isoformat() if user.created_at else None
        response_user_dict["updated_at"] = user.updated_at.isoformat() if user.updated_at else None
    return response_user_dict


def response_message(message: Message, include_timezone: bool = True):
    response_message_dict = {
        "_id": str(message.id),
        "sender_id": str(message.sender.id) if message.sender else None,
        "receiver_id": str(message.receiver.id) if message.receiver else None,
        "text": message.text,
        "image": message.image,
        "video": message.video,
    }
    if include_timezone:
        response_message_dict["created_at"] = message.created_at.isoformat() if message.created_at else None
        response_message_dict["updated_at"] = message.updated_at.isoformat() if message.updated_at else None
    return response_message_dict
