from flask_socketio import emit, disconnect

from flask import request
connected_users = {}  # user_id: socket_id
def register_socket_routes(socket_app):

    @socket_app.on('connect')
    def handle_connect():
        user_id = request.args.get('user_id')
        print(f'Client attempting to connect with user_id: {user_id}')
        if user_id:
            connected_users[user_id] = request.sid
            print(f'User {user_id} connected with socket id {request.sid}')
            emit('get_online_users', list(connected_users.keys()))
        else:
            disconnect()

    @socket_app.on('disconnect')
    def handle_disconnect():
        print('Client disconnected')
        user_id = request.args.get('user_id')
        del connected_users[user_id]
        emit('get_online_users', list(connected_users.keys()))

    @socket_app.on('message')
    def handle_message(data):
        print(f'Received message: {data}')
        socket_app.send(f'Echo: {data}')