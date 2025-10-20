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

### 🐳 Docker (Recommended)

**Prerequisites:**
- Docker and Docker Compose installed

**Development Setup:**
1. Clone the repository:
   ```bash
   git clone https://github.com/Shriram-Iyer/Chat-App.git
   cd Chat-App
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your Cloudinary credentials

4. Start all services:
   ```bash
   docker-compose up -d
   ```

5. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

**Production Setup:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 🔧 Manual Development Setup

**Backend:**
1. Navigate to `backend/`
2. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set environment variables and run:
   ```bash
   python main.py
   ```

**Frontend:**
1. Navigate to `frontend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set environment variables and run:
   ```bash
   npm run dev
   ```

## Environment Variables
- Backend: `.env` for database, cloudinary, etc.
- Frontend: `.env.local` for API URLs

## License
See `LICENSE` for details.