export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || 'localhost',
  dbPath: process.env.DB_PATH || './chat.db',
  corsOrigins: [
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'http://localhost:3002',
    'http://127.0.0.1:3002',
    'http://localhost:5173',  // for vite
    'http://127.0.0.1:5173'
  ],
  nodeEnv: process.env.NODE_ENV || 'development'
};
