import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AuthService {
  static generateTokens(userId: string) {
    const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  }

  static async register(email: string, passwordRaw: string, name: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw { statusCode: 400, message: 'Email already in use', code: 'EMAIL_IN_USE' };
    }

    const passwordHash = await bcrypt.hash(passwordRaw, 12);

    const user = await prisma.user.create({
      data: { email, passwordHash, name },
    });

    return this.generateTokens(user.id);
  }

  static async login(email: string, passwordRaw: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw { statusCode: 401, message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' };
    }

    const isValid = await bcrypt.compare(passwordRaw, user.passwordHash);
    if (!isValid) {
      throw { statusCode: 401, message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' };
    }

    const tokens = this.generateTokens(user.id);
    
    return { 
      tokens, 
      user: { id: user.id, email: user.email, name: user.name, role: user.role } 
    };
  }

  static async refresh(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { userId: string };
      
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (!user) throw new Error();

      const tokens = this.generateTokens(user.id);
      
      return { 
        tokens, 
        user: { id: user.id, email: user.email, name: user.name, role: user.role } 
      };
    } catch (error) {
      throw { statusCode: 401, message: 'Invalid or expired refresh token', code: 'TOKEN_EXPIRED' };
    }
  }
}