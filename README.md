# Live Chat App

A real-time chat application with user authentication, messaging, game invitations, and tournament features.

## Project Structure

```
Chat/
├── back/                 # Backend server
│   ├── server.js        # Main server file
│   ├── package.json     # Backend dependencies
│   └── chat.db          # SQLite database (created automatically)
└── front/               # Frontend files
    ├── index.html       # Main HTML file
    ├── styles.css       # CSS styles
    └── script.js        # JavaScript functionality
```

## Features

- 🔐 User registration and authentication
- 💬 Real-time messaging with WebSocket
- 👥 User list with online/offline status
- 🚫 Block/unblock users
- 🎮 Game invitations
- 🏆 Tournament system
- ⌨️ Typing indicators
- 📱 Responsive design

## Setup Instructions

### 1. Install Backend Dependencies

Navigate to the backend directory and install dependencies:

```bash
cd back
npm install
```

### 2. Start the Backend Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

The server will start on http://localhost:3000

### 3. Access the Application

Open your web browser and go to:
```
http://localhost:3000
```

The frontend is automatically served by the backend server.

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

### Messages
- `GET /api/messages/:userId/:otherUserId` - Get conversation history

### Blocking
- `POST /api/block` - Block a user
- `POST /api/unblock` - Unblock a user
- `GET /api/blocked/:userId` - Get blocked users

### Game Features
- `POST /api/game-invite` - Send game invitation
- `POST /api/game-invite/respond` - Respond to game invitation

### Tournaments
- `POST /api/tournament` - Create tournament
- `POST /api/tournament/:id/notify` - Notify tournament match

## WebSocket Events

### Client to Server
- `auth` - Authenticate user connection
- `message` - Send a message
- `typing` - Send typing status

### Server to Client
- `message` - Receive a message
- `typing` - Receive typing status
- `game_invitation` - Receive game invitation
- `game_invitation_response` - Receive game invitation response
- `tournament_match` - Receive tournament match notification

## Database Schema

The application uses SQLite with the following tables:
- `users` - User accounts and profiles
- `messages` - Chat messages
- `blocked_users` - Blocked user relationships
- `game_invitations` - Game invitation records
- `tournaments` - Tournament information
- `tournament_participants` - Tournament participant data

## Development

### Frontend Development
The frontend files are in the `front/` directory:
- Edit `index.html` for structure changes
- Edit `styles.css` for styling
- Edit `script.js` for functionality

### Backend Development
The backend is in `back/server.js`. The server automatically serves the frontend files from the `front/` directory.

## Troubleshooting

1. **Port already in use**: Make sure port 3000 is not being used by another application
2. **Database errors**: The SQLite database will be created automatically in the `back/` directory
3. **WebSocket connection issues**: Ensure the backend server is running before accessing the frontend
4. **CORS issues**: The server is configured to allow all origins for development

## Technologies Used

### Backend
- **Fastify** - Fast web framework
- **@fastify/websocket** - WebSocket support
- **@fastify/static** - Static file serving
- **@fastify/cors** - CORS handling
- **SQLite3** - Database

### Frontend
- **Vanilla JavaScript** - No frameworks
- **WebSocket API** - Real-time communication
- **Fetch API** - HTTP requests
- **CSS3** - Modern styling with gradients and animations