import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { AppError } from '../../shared/errors/AppError';
import { authRepository } from './auth.repository';

export const authService = {
  async register(email: string, password: string) {
    const existing = await authRepository.findByEmail(email);
    if (existing) throw AppError.conflict('Email already registered');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await authRepository.create(email, passwordHash);

    return { token: signToken(user.id, user.email), user: sanitize(user) };
  },

  async login(email: string, password: string) {
    const user = await authRepository.findByEmail(email);
    if (!user) throw AppError.unauthorized('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw AppError.unauthorized('Invalid credentials');

    return { token: signToken(user.id, user.email), user: sanitize(user) };
  },
};

function signToken(userId: string, email: string) {
  return jwt.sign({ email }, env.JWT_SECRET, {
    subject: userId,
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

function sanitize(user: { id: string; email: string; createdAt: Date }) {
  return { id: user.id, email: user.email, createdAt: user.createdAt };
}
