import { Router } from 'express';
import bcrypt from 'bcrypt';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

const registerSchema = z.object({
  username: z.string().min(3).max(32),
  email: z.string().email(),
  password: z.string().min(6),
});

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ 
    success: false, 
    message: 'Invalid input', 
    errors: parsed.error.format() 
  });

  const { email, password, username } = parsed.data;

  try {
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Check if username is taken
    const existingUsername = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUsername.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'Username already taken' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        username,
        password: hashedPassword,
        role: 'user',
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    // Set up session
    if (req.session) {
      req.session.user = {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role
      };
    }

    // Create auth log
    await db.insert(authLogs).values({
      userId: newUser.id,
      action: 'REGISTER',
      status: 'SUCCESS',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent') || 'unknown',
      device: 'web',
      createdAt: new Date()
    });

    res.status(201).json({ 
      success: true, 
      message: 'Registration successful',
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed. Please try again.' 
    });
  }
});

export default router;