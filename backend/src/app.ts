import Fastify from 'fastify';
import { chatRoutes } from './routes/chat.route';

const app = Fastify();

// Add routes, plugins, WS, .. later:
app.register(chatRoutes);

export default app;
