from stream_chat import StreamChat

from config import STREAM_API_KEY, STREAM_API_SECRET

client = StreamChat(api_key=STREAM_API_KEY, api_secret=STREAM_API_SECRET)


def upsert_stream_user(user_data):
    try:
        user = client.upsert_user(user_data)
        return user
    except Exception as e:
        print(f"Error upserting stream user: {e}")
        return None


def generate_stream_token(user_id):
    try:
        return client.create_token(str(user_id))
    except Exception as e:
        print(f"Error generating stream token: {e}")
        return None
