import bcrypt from 'bcrypt';
import crypto from 'crypto';
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

  async login(emailOrUsername: string, password: string) {
    try {
      console.log(`Login attempt with: ${emailOrUsername}`);
      
      // First try to find by email
      let foundUsers = await db.select().from(users).where(eq(users.email, emailOrUsername));
      
      // If not found by email, try by username
      if (foundUsers.length === 0) {
        console.log('User not found by email, trying username');
        foundUsers = await db.select().from(users).where(eq(users.username, emailOrUsername));
      }
      
      if (foundUsers.length === 0) {
        console.log('User not found by email or username');
        throw new Error('Invalid credentials');
      }
      
      const user = foundUsers[0];
      console.log(`Found user: ${user.username}`);
  
      // Check password - handle multiple hash formats
      let isPasswordValid = false;
      
      // First, try standard bcrypt compare (this handles both $2a$ and $2b$ prefixes)
      try {
        isPasswordValid = await bcrypt.compare(password, user.password);
      } catch (e) {
        console.log('Bcrypt compare failed, trying alternate format check');
      }
      
      // If bcrypt compare failed, check if it's a SHA-256 format (hex.salt format)
      if (!isPasswordValid && user.password.includes('.')) {
        const [hashedPart, salt] = user.password.split('.');
        // SHA-256 hash check for databases migrated from older systems
        const calculatedHash = crypto.createHash('sha256')
          .update(password + salt)
          .digest('hex');
        
        isPasswordValid = calculatedHash === hashedPart;
        console.log(`SHA-256 hash check result: ${isPasswordValid}`);
      }

      // For testing only - test accounts hardcoded in DB
      if (process.env.NODE_ENV !== 'production') {
        if ((user.username === 'testuser' || user.username === 'adminuser') && password === 'password') {
          console.log('TEST/ADMIN USER LOGIN: Development mode authentication override');
          isPasswordValid = true;
        }
      }
      
      if (!isPasswordValid) {
        console.log('Password validation failed');
        throw new Error('Invalid credentials');
      }
      
      console.log('Password validated successfully');
  
      // Update lastLogin time
      try {
        await db.update(users)
          .set({ 
            lastLogin: new Date()
          })
          .where(eq(users.id, user.id));
      } catch (updateError) {
        console.warn("Could not update lastLogin time:", updateError);
        // Continue anyway - this is not critical
      }
  
      // Return safe user object (without password)
      return {
        id: user.id,
        email: user.email,
        username: user.username,
        phone: user.phone || null,
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
    if (!req.session) {
      console.log('No session found in request');
      return null;
    }
    
    if (!req.session.user) {
      console.log('No user found in session');
      return null;
    }
    
    console.log('User found in session:', req.session.user.username);
    return req.session.user;
  }
};