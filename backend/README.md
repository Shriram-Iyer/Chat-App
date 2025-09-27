# Chat-App Backend

This is the Flask backend for the Chat-App project.

## Features
- User authentication and management
- Real-time chat endpoints
- Group and friend request models
- Cloudinary integration for media

## Setup
1. Navigate to `backend/`
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the server:
   ```bash
   python main.py
   ```

## Environment Variables
- Configure database, cloudinary, and other secrets in `.env`

## Project Structure
- `main.py` — Entry point
- `config/` — Configuration files
- `models/` — Database models
- `routes/` — API routes
- `service/` — Business logic
- `utils/` — Utility functions
