import bcrypt from 'bcrypt';
import { db } from '../db';
import { users, type User } from '@shared/schema';
import { eq } from 'drizzle-orm';

export const authService = {
  async register(email: string, password: string, username: string) {
    try {
      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.email, email));
      
      if (existingUser.length > 0) {
        throw new Error('User already exists');
      }
      
      // Check if username is taken
      const existingUsername = await db.select().from(users).where(eq(users.username, username));
      
      if (existingUsername.length > 0) {
        throw new Error('Username is already taken');
      }
  
      // Hash password
      const hash = await bcrypt.hash(password, 12);
      
      // Insert only the essential fields that we know exist in the schema
      const newUser = await db.insert(users)
        .values({
          email,
          username,
          password: hash,
          role: 'user'
        })
        .returning()
        .then(users => users[0]);
  
      // Return safe user object (without password)
      return {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role
      };
    } catch (error) {
      console.error("Registration error details:", error);
      throw error;
    }
  },

  async login(email: string, password: string) {
    try {
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
  
      // Update lastLogin time
      await db.update(users)
        .set({ 
          lastLogin: new Date()
        })
        .where(eq(users.id, user.id));
  
      // Return safe user object (without password)
      return {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        firstName: user.firstName || null,
        lastName: user.lastName || null
      };
    } catch (error) {
      console.error("Login error details:", error);
      throw error;
    }
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