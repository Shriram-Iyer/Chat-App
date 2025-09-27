# Chat-App

A full-stack chat application with real-time messaging, user authentication, and group chat features.

## Project Structure

- `backend/` — Python Flask backend for authentication, chat, and user management
- `frontend/` — Next.js frontend for user interface and chat experience

## Features
- User authentication (signup, login, profile)
- Real-time chat (groups, friends)
- Cloudinary integration for media
- RESTful API endpoints
- Modern UI with theme support

## Getting Started

### Backend
1. Navigate to `backend/`
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the server:
   ```bash
   python main.py
   ```

### Frontend
1. Navigate to `frontend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Environment Variables
- Backend: `.env` for database, cloudinary, etc.
- Frontend: `.env.local` for API URLs

## License
See `LICENSE` for details.