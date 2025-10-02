from flask_socketio import emit, disconnect
from flask import request

# Maps user_id to socket_id
connected_users = {}
# Maps socket_id to user_id for reliable disconnect handling
socket_to_user = {}

def emit_online_users():
    """Emit the list of online users to all clients."""
    emit('get_online_users', list(connected_users.keys()), broadcast=True)

def register_socket_routes(socket_app):
    @socket_app.on('connect')
    def handle_connect():
        user_id = request.args.get('user_id')
        print(f'Client attempting to connect with user_id: {user_id}')
        if user_id:
            connected_users[user_id] = request.sid
            socket_to_user[request.sid] = user_id
            print(f'User {user_id} connected with socket id {request.sid}')
            emit_online_users()
        else:
            disconnect()

    @socket_app.on('disconnect')
    def handle_disconnect():
        print('Client disconnected')
        sid = request.sid
        user_id = socket_to_user.pop(sid, None)
        if user_id:
            connected_users.pop(user_id, None)
            print(f'User {user_id} disconnected (socket id {sid})')
        else:
            print(f'Unknown socket id {sid} disconnected')
        print("all connected users after disconnect:", connected_users)
        emit_online_users()

    @socket_app.on('message')
    def handle_message(data):
        print(f'Received message: {data}')
        socket_app.send(f'Echo: {data}')


def get_receiver_socket_id(receiver_id):
    return connected_users.get(receiver_id)

# Note: request.sid is valid in Flask-SocketIO event handlers for getting the socket session ID.
