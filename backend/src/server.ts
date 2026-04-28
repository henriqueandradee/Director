import './config/env'; // validate env first
import { app } from './app';
import { env } from './config/env';
import { prisma } from './config/database';
import { logger } from './shared/logger/logger';

async function bootstrap() {
  await prisma.$connect();
  logger.info('Database connected');

  const server = app.listen(env.PORT, () => {
    logger.info(`DiretorIA API running`, { port: env.PORT, env: env.NODE_ENV });
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(async () => {
      await prisma.$disconnect();
      logger.info('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
