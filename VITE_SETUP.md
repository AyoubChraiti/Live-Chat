# Live Chat App with Vite

## Quick Start Guide

### 1. Install Frontend Dependencies
```bash
cd front
npm install
```

### 2. Install Backend Dependencies (if not already done)
```bash
cd ../back
npm install
```

### 3. Start the Backend Server
```bash
cd back
npm start
```
The backend will run on http://localhost:3000

### 4. Start the Frontend (Vite Dev Server)
Open a new terminal:
```bash
cd front
npm run dev
```
The frontend will run on http://localhost:3001

### 5. Access the Application
Open your browser and go to: **http://localhost:3001**

## Architecture

- **Frontend**: Vite dev server on port 3001
- **Backend**: Fastify server on port 3000
- **API**: http://localhost:3000/api/*
- **WebSocket**: ws://localhost:3000/ws

## Message Rendering Fixes

1. **Optimistic UI**: Messages appear immediately when sent
2. **Proper message filtering**: No duplicate messages
3. **Better error handling**: Clear error messages and recovery
4. **Connection status**: Visual indicator of connection state
5. **Improved WebSocket handling**: Better reconnection logic

## Development

- Frontend hot-reload with Vite
- Backend API on separate port
- CORS properly configured
- Console logging for debugging

## Troubleshooting

1. **Messages not showing**: Check browser console for errors
2. **Connection issues**: Ensure both servers are running
3. **CORS errors**: Restart both servers
4. **Port conflicts**: Check ports 3000 and 3001 are available