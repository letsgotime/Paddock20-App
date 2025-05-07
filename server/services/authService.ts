import bcrypt from 'bcrypt';
import { db } from '../db';
import { users, type User } from '@shared/schema';
import { eq } from 'drizzle-orm';

export const authService = {
  async register(email: string, password: string, username: string) {
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    
    if (existingUser.length > 0) {
      throw new Error('User already exists');
    }

    // Hash password
    const hash = await bcrypt.hash(password, 12);
    
    // Create new user
    const newUsers = await db.insert(users)
      .values({ 
        email, 
        password: hash, 
        username 
      })
      .returning();
      
    const newUser = newUsers[0];

    // Return safe user object (without password)
    return {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username
    };
  },

  async login(email: string, password: string) {
    // Find user
    const foundUsers = await db.select().from(users).where(eq(users.email, email));
    
    if (foundUsers.length === 0) {
      throw new Error('Invalid credentials');
    }
    
    const user = foundUsers[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login time
    await db.update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, user.id));

    // Return safe user object (without password)
    return {
      id: user.id,
      email: user.email,
      username: user.username
    };
  },

  logout(req: any) {
    return new Promise<void>((resolve) => {
      req.session.destroy(() => {
        resolve();
      });
    });
  },

  getSessionUser(req: any) {
    return req.session?.user || null;
  }
};