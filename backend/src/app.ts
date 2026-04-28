import express from 'express';
import cors from 'cors';
import { defaultLimiter } from './middlewares/rate-limit.middleware';
import { errorMiddleware } from './middlewares/error.middleware';
import { authRouter } from './modules/auth/auth.routes';
import { companyRouter } from './modules/company/company.routes';
import { chatRouter } from './modules/chat/chat.routes';
import { messageRouter } from './modules/message/message.routes';
import { logger } from './shared/logger/logger';

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(defaultLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/auth', authRouter);
app.use('/companies', companyRouter);
app.use('/chats', chatRouter);
app.use('/messages', messageRouter);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found', code: 'NOT_FOUND' });
});

// Global error handler
app.use(errorMiddleware);

// Log registered routes in development
if (process.env.NODE_ENV === 'development') {
  const routes: string[] = [];
  app._router.stack.forEach((middleware: { route?: { path: string; methods: Record<string, boolean> }; name?: string; handle?: { stack: { route?: { path: string; methods: Record<string, boolean> } }[] } }) => {
    if (middleware.route) {
      routes.push(`${Object.keys(middleware.route.methods).join(',').toUpperCase()} ${middleware.route.path}`);
    } else if (middleware.name === 'router' && middleware.handle?.stack) {
      middleware.handle.stack.forEach((handler: { route?: { path: string; methods: Record<string, boolean> } }) => {
        if (handler.route) {
          routes.push(`${Object.keys(handler.route.methods).join(',').toUpperCase()} ${handler.route.path}`);
        }
      });
    }
  });
}

export { app };
