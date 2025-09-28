from flask import jsonify
from mongoengine import Q

from config import cloudinary_instance
from models.message import Message
from models.user import User
from utils import response_message, validate_send_message_payload

def get_messages(user_id, user):
    try:
        other_user = User.objects(id=user_id).first()
        if not other_user:
            return jsonify({"error": "User Not Found."}), 404
        messages = Message.objects(
            Q(sender=other_user, receiver=user) | Q(sender=user, receiver=other_user)
        )
        messages_list = [response_message(msg) for msg in messages]
        return jsonify(messages_list), 200
    except Exception as e:
        print(f"Error fetching messages: {e}")
        return jsonify({"error": "Internal Server Error"}), 500


def send_message(request, receiver_id, user):
    try:
        payload = request.get_json()
        is_valid, result = validate_send_message_payload(payload)
        if not is_valid:
            return jsonify({"error": "Invalid payload", "details": result}), 400
        text = result.get("text", "")
        image = result.get("image", "")
        video = result.get("video", "")
        image_url = ""
        video_url = ""
        receiver = User.objects(id=receiver_id).first()
        if not receiver:
            return jsonify({"error": "User Not Found."}), 404
        if image:
            image_res = cloudinary_instance.uploader.upload(image, resource_type="image")
            image_url = image_res.get("secure_url")
        if video:
            video_res = cloudinary_instance.uploader.upload(video, resource_type="video")
            video_url = video_res.get("secure_url")
        if text or image_url or video_url:
            new_message = Message(sender=user, receiver=receiver, text=text, image=image_url, video=video_url)
            message_obj = new_message.save()
            if not message_obj:
                return jsonify({"error": "Failed to send message."}), 500
            print("message_response",response_message(message_obj))
            return jsonify(response_message(message_obj)), 201
        else:
            return jsonify({"error": "At least one of text, image, or video must be provided."}), 400
    except Exception as e:
        print(f"Error sending message: {e}")
        return jsonify({"error": "Internal Server Error"}), 500
