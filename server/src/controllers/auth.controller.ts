import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

// Secret keys fallbacks for JWT signatures
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-access-secret-key-123';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-key-456';

/**
 * Handles incoming registration payloads, checks constraints,
 * hashes credentials securely, and writes to PostgreSQL.
 */
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ 
        success: false, 
        message: 'All fields (name, email, password) are required.' 
      });
      return;
    }

    const sanitizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (existingUser) {
      res.status(409).json({ 
        success: false, 
        message: 'An account with this email address already exists.' 
      });
      return;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Persist using the exact database field key: passwordHash
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: sanitizedEmail,
        passwordHash: hashedPassword, // 👈 FIXED: Aligned with your Prisma schema property
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      }
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: newUser,
    });

  } catch (error: any) {
    console.error('Registration controller error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error during account creation.' 
    });
  }
};

/**
 * Validates login credentials against stored hashes and issues tokens.
 */
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials provided.' });
      return;
    }

    // Compare with the correct schema token key: user.passwordHash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash); // 👈 FIXED: Reading from passwordHash
    if (!isPasswordValid) {
      res.status(401).json({ success: false, message: 'Invalid credentials provided.' });
      return;
    }

    // Generate session tokens
    const accessToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    // Set refresh token in secure HTTP-only cookie layout
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      success: true,
      message: 'Authenticated successfully.',
      token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
    
  } catch (error: any) {
    console.error('Login controller error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
};

/**
 * Rotates expired access tokens using the cookie payload state.
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const tokenFromCookie = req.cookies?.refreshToken;

  if (!tokenFromCookie) {
    res.status(401).json({ success: false, message: 'Refresh token session missing.' });
    return;
  }

  try {
    const decoded = jwt.verify(tokenFromCookie, JWT_REFRESH_SECRET) as { id: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      res.status(401).json({ success: false, message: 'User session context not found.' });
      return;
    }

    const newAccessToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '15m' });

    res.status(200).json({
      success: true,
      token: newAccessToken
    });
  } catch (err) {
    res.status(403).json({ success: false, message: 'Session expired or invalid.' });
  }
};

/**
 * Revokes authorization state and clears cookie storage keys.
 */
export const logoutUser = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  
  res.status(200).json({
    success: true,
    message: 'Logged out from session successfully.'
  });
};