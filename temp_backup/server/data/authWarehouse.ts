/**
 * Auth Data Warehouse - Single Source of Truth for Authentication
 * 
 * This module serves as the central access point for all authentication-related
 * data operations. It provides a clean interface to the database and ensures
 * data consistency across the application.
 */

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, and, desc, sql } from 'drizzle-orm';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import connectPgSimple from 'connect-pg-simple';
import session from 'express-session';

// Import database schema
import {
  users,
  sessions,
  authLogs,
  type User,
  type InsertUser,
  type AuthLog,
  type InsertAuthLog,
} from '@shared/schema';

// Setup database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create connection pool
const pool = new Pool({ connectionString });
const db = drizzle(pool, { schema: { users, sessions, authLogs } });

// Password utilities
const scryptAsync = promisify(scrypt);

// Session store
const PgSessionStore = connectPgSimple(session);
const sessionStore = new PgSessionStore({
  pool,
  tableName: 'sessions',
  createTableIfMissing: true,
});

/**
 * Password Utilities
 */
export const PasswordUtils = {
  /**
   * Hash a password with a random salt
   */
  async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString('hex')}.${salt}`;
  },

  /**
   * Compare a plaintext password with a hashed password
   */
  async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      const [hash, salt] = hashedPassword.split('.');
      const hashBuffer = Buffer.from(hash, 'hex');
      const suppliedBuffer = (await scryptAsync(plainPassword, salt, 64)) as Buffer;
      return timingSafeEqual(hashBuffer, suppliedBuffer);
    } catch (err) {
      console.error('Password comparison error:', err);
      return false;
    }
  },

  /**
   * Generate a secure random token for password reset or email verification
   */
  generateToken(): string {
    return randomBytes(32).toString('hex');
  }
};

/**
 * User Management
 */
export const UserManager = {
  /**
   * Get a user by ID
   */
  async getUserById(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (err) {
      console.error('Error fetching user by ID:', err);
      return undefined;
    }
  },

  /**
   * Get a user by email
   */
  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    } catch (err) {
      console.error('Error fetching user by email:', err);
      return undefined;
    }
  },

  /**
   * Get a user by username
   */
  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (err) {
      console.error('Error fetching user by username:', err);
      return undefined;
    }
  },

  /**
   * Create a new user
   */
  async createUser(userData: InsertUser): Promise<User | undefined> {
    try {
      // Hash the password if it's not already hashed
      if (!userData.password.includes('.')) {
        userData.password = await PasswordUtils.hashPassword(userData.password);
      }

      const [user] = await db.insert(users).values(userData).returning();
      return user;
    } catch (err) {
      console.error('Error creating user:', err);
      return undefined;
    }
  },

  /**
   * Update a user's profile
   */
  async updateUserProfile(userId: number, data: Partial<User>): Promise<User | undefined> {
    try {
      // Don't allow updating sensitive fields
      delete data.password;
      delete data.role;
      delete data.createdAt;
      
      const [user] = await db
        .update(users)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();
      
      return user;
    } catch (err) {
      console.error('Error updating user profile:', err);
      return undefined;
    }
  },

  /**
   * Update a user's password
   */
  async updateUserPassword(userId: number, newPassword: string): Promise<boolean> {
    try {
      const hashedPassword = await PasswordUtils.hashPassword(newPassword);
      
      await db
        .update(users)
        .set({ 
          password: hashedPassword,
          lastPasswordChange: new Date(),
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
      
      return true;
    } catch (err) {
      console.error('Error updating user password:', err);
      return false;
    }
  },

  /**
   * Update a user's last login timestamp
   */
  async updateLastLogin(userId: number): Promise<boolean> {
    try {
      await db
        .update(users)
        .set({ 
          lastLogin: new Date(),
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
      
      return true;
    } catch (err) {
      console.error('Error updating last login:', err);
      return false;
    }
  },

  /**
   * Set a password reset token for a user
   */
  async setPasswordResetToken(userId: number): Promise<string | undefined> {
    try {
      const token = PasswordUtils.generateToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // Token valid for 1 hour
      
      await db
        .update(users)
        .set({ 
          resetToken: token,
          resetTokenExpires: expiresAt,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
      
      return token;
    } catch (err) {
      console.error('Error setting password reset token:', err);
      return undefined;
    }
  },

  /**
   * Get a user by reset token
   */
  async getUserByResetToken(token: string): Promise<User | undefined> {
    try {
      const now = new Date();
      
      const [user] = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.resetToken, token),
            sql`${users.resetTokenExpires} > ${now}`
          )
        );
      
      return user;
    } catch (err) {
      console.error('Error fetching user by reset token:', err);
      return undefined;
    }
  },

  /**
   * Clear a user's reset token
   */
  async clearResetToken(userId: number): Promise<boolean> {
    try {
      await db
        .update(users)
        .set({ 
          resetToken: null,
          resetTokenExpires: null,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
      
      return true;
    } catch (err) {
      console.error('Error clearing reset token:', err);
      return false;
    }
  },

  /**
   * Get a safe user object (without sensitive fields)
   */
  getSafeUser(user: User): Omit<User, 'password' | 'resetToken' | 'resetTokenExpires'> {
    const { 
      password, 
      resetToken, 
      resetTokenExpires,
      twoFactorSecret,
      twoFactorBackupCodes,
      securityQuestions,
      securityAnswers,
      ...safeUser 
    } = user;
    
    return safeUser;
  }
};

/**
 * Auth Log Management
 */
export const AuthLogManager = {
  /**
   * Create a new auth log entry
   */
  async createLog(logData: InsertAuthLog): Promise<AuthLog | undefined> {
    try {
      const [log] = await db.insert(authLogs).values(logData).returning();
      return log;
    } catch (err) {
      console.error('Error creating auth log:', err);
      return undefined;
    }
  },

  /**
   * Get auth logs for a user
   */
  async getLogsForUser(userId: number, limit = 10): Promise<AuthLog[]> {
    try {
      return await db
        .select()
        .from(authLogs)
        .where(eq(authLogs.userId, userId))
        .orderBy(desc(authLogs.createdAt))
        .limit(limit);
    } catch (err) {
      console.error('Error fetching auth logs:', err);
      return [];
    }
  },

  /**
   * Get recent failed login attempts for a user
   */
  async getRecentFailedLogins(userId: number, timeWindowMinutes = 30): Promise<number> {
    try {
      const timeWindow = new Date();
      timeWindow.setMinutes(timeWindow.getMinutes() - timeWindowMinutes);
      
      const results = await db
        .select({ count: sql<number>`count(*)` })
        .from(authLogs)
        .where(
          and(
            eq(authLogs.userId, userId),
            eq(authLogs.action, 'login'),
            eq(authLogs.status, 'failed'),
            sql`${authLogs.createdAt} > ${timeWindow}`
          )
        );
      
      return results[0]?.count || 0;
    } catch (err) {
      console.error('Error counting failed logins:', err);
      return 0;
    }
  }
};

/**
 * Session Management
 */
export const SessionManager = {
  /**
   * Get the session store for Express.js
   */
  getSessionStore(): session.Store {
    return sessionStore;
  },

  /**
   * Delete all sessions for a user
   */
  async deleteUserSessions(userId: number): Promise<boolean> {
    try {
      // This depends on your session table schema
      // For connect-pg-simple, sessions are stored with sess.userId
      await pool.query(
        'DELETE FROM sessions WHERE sess->>\'user\' LIKE $1',
        [`%"id":${userId}%`]
      );
      return true;
    } catch (err) {
      console.error('Error deleting user sessions:', err);
      return false;
    }
  }
};

/**
 * Main export - centralized auth warehouse
 */
export const AuthWarehouse = {
  db,
  pool,
  PasswordUtils,
  UserManager,
  AuthLogManager,
  SessionManager
};