from flask import jsonify
from mongoengine.queryset.visitor import Q

from config import cloudinary_uploader
from models.friend_request import FriendRequest
from models.user import User
from utils import validate_update_profile_payload, response_user


def update_profile(request, user):
    payload = request.get_json()
    valid, result = validate_update_profile_payload(payload)
    if not valid:
        return jsonify({"error": "Invalid payload", "details": result}), 400
    try:
        # Extract possible updates from payload
        new_username = result.get('username')
        new_about = result.get('about')
        new_image = result.get('profile_pic')

        update_fields = {}

        # Update only if different from current
        if new_username is not None and new_username != user.username:
            update_fields['username'] = new_username

        if new_about is not None and new_about != user.about:
            update_fields['about'] = new_about

        # Only upload and update profile_pic if a new image is provided and results in a new URL
        if new_image:
            upload_result = cloudinary_uploader.upload(new_image)
            new_url = upload_result.get('secure_url')
            if new_url and new_url != user.profile_pic:
                update_fields['profile_pic'] = new_url

        # If nothing changed, return current user
        if not update_fields:
            return jsonify(response_user(user)), 200
        updated_user = user.update_user(**update_fields)
        if not updated_user:
            return jsonify({"error": "Could not update profile."}), 400
        return jsonify(response_user(updated_user)), 200
    except Exception as e:
        print(f"Error during updating profile: {e}")
        return jsonify({"error": "Internal Server Error"}), 500


def get_all_users(current_user):
    try:
        request_users = set()
        for req in FriendRequest.objects(
                (Q(sender=current_user) | Q(recipient=current_user)) &
                Q(status__in=["pending", "accepted"])
        ):
            request_users.add(req.sender.id)
            request_users.add(req.recipient.id)
        exclude_ids = set([current_user.id] + [friend.id for friend in current_user.friends]) | request_users
        users = User.objects(id__nin=list(exclude_ids))
        users_list = []
        for user in users:
            users_list.append(response_user(user))
        return jsonify(users_list), 200
    except Exception as e:
        print(f"Error fetching all users: {e}")
        return jsonify({"error": "Internal Server Error"}), 500


def get_friends(user):
    try:
        friends = user.friends
        friends_list = []
        for friend in friends:
            friends_list.append(response_user(friend))
        return jsonify(friends_list), 200
    except Exception as e:
        print(f"Error fetching friends: {e}")
        return jsonify({"error": "Internal Server Error"}), 500


def send_request(user, friend_id):
    if str(user.id) == friend_id:
        return jsonify({"error": "You cannot send a friend request to yourself."}), 400
    try:
        friend = User.objects(id=friend_id).first()
        if not friend:
            return jsonify({"error": "Recipient not found."}), 404
        elif friend in user.friends:
            return jsonify({"error": "You are already friends with this user."}), 400
        # Check for existing non-rejected friend request in either direction
        existing_request = FriendRequest.objects(
            Q(sender=user, recipient=friend, status__ne="rejected") |
            Q(sender=friend, recipient=user, status__ne="rejected")
        ).first()
        if existing_request:
            return jsonify({"error": "Friend request already sent"}), 400
        new_request = FriendRequest(sender=user, recipient=friend)
        request_obj = new_request.create()
        if not request_obj:
            return jsonify({"error": "Failed to create friend request."}), 500
        return jsonify({
            "recipient_id": str(request_obj.recipient.id),
            "recipient": response_user(request_obj.recipient),
            "status": request_obj.status,
            "created_at": request_obj.created_at,
            "updated_at": request_obj.updated_at
        }), 200
    except Exception as e:
        print(f"Error sending friend request: {e}")
        return jsonify({"error": "Internal Server Error"}), 500


def accept_request(request_id):
    try:
        received_user = User.objects(id=request_id).first()
        if not received_user:
            return jsonify({"error": "User not found."}), 404
        friend_request = FriendRequest.objects(recipient=received_user, status="pending").first()
        if not friend_request:
            return jsonify({"error": "Friend request not found."}), 404

        sender = friend_request.sender
        recipient = friend_request.recipient

        # Use set to avoid duplicates
        sender_friends = set(sender.friends)
        recipient_friends = set(recipient.friends)

        sender_friends.add(recipient)
        recipient_friends.add(sender)

        sender.update_user(friends=list(sender_friends))
        recipient.update_user(friends=list(recipient_friends))

        # Delete the friend request document after accepting
        friend_request.delete()

        return jsonify({"message": "Friend request accepted"}), 200
    except Exception as e:
        print(f"Error accepting friend request: {e}")
        return jsonify({"error": "Internal Server Error"}), 500


def reject_request(request_id):
    try:
        friend_request = FriendRequest.objects(id=request_id, status="pending").first()
        if not friend_request:
            return jsonify({"error": "Friend request not found."}), 404
        # Delete the friend request document after rejecting
        friend_request.delete()
        return jsonify({"message": "Friend request rejected"}), 200
    except Exception as e:
        print(f"Error rejecting friend request: {e}")
        return jsonify({"error": "Internal Server Error"}), 500


def get_friend_requests(user):
    try:
        # Helper for user info
        def user_info(u, include_email=False):
            user_information = {
                "username": u.username,
                "profile_pic": u.profile_pic,
            }
            if include_email:
                user_information["email"] = getattr(u, "email", None)
            return user_information

        # Incoming (pending) requests
        incoming_requests = FriendRequest.objects(recipient=user, status="pending")
        incoming_requests_list = [
            {
                "_id": str(req.id),
                "recipient_id": str(req.recipient.id),
                "sender": user_info(req.sender, include_email=True),
                "status": req.status,
                "created_at": req.created_at.isoformat() if req.created_at else None,
                "updated_at": req.updated_at.isoformat() if req.updated_at else None
            }
            for req in incoming_requests
        ]
        return jsonify(incoming_requests_list), 200
    except Exception as e:
        print(f"Error fetching friend requests: {e}")
        return jsonify({"error": "Internal Server Error"}), 500


def get_outgoing_friend_request(user):
    try:
        sent_requests = FriendRequest.objects(sender=user, status="pending")
        sent_requests_list = [
            {
                "recipient_id": str(req.recipient.id),
                "recipient": response_user(req.recipient),
                "status": req.status,
                "created_at": req.created_at,
                "updated_at": req.updated_at
            }
            for req in sent_requests
        ]
        return jsonify(sent_requests_list), 200
    except Exception as e:
        print(f"Error fetching sent friend requests: {e}")
        return jsonify({"error": "Internal Server Error"}), 500
