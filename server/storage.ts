import { 
  users, 
  authLogs,
  sessions,
  vehicles,
  savedLocations,
  type User, 
  type InsertUser,
  type AuthLog,
  type InsertAuthLog,
  type Session,
  type InsertSession
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import session from "express-session";
// @ts-ignore
import memorystore from "memorystore";

// Create memory store for sessions
const MemoryStore = memorystore(session);

// Storage interface for database operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLastLogin(userId: number): Promise<User>;
  updateUserPassword(userId: number, password: string): Promise<void>;
  updateUserProfile(userId: number, data: Partial<User>): Promise<User>;
  updatePasswordResetToken(userId: number, token: string, expiresAt: Date): Promise<void>;
  clearPasswordResetToken(userId: number): Promise<void>;
  
  // Auth logs
  createAuthLog(log: InsertAuthLog): Promise<AuthLog>;
  updateAuthLog(id: number, data: Partial<AuthLog>): Promise<AuthLog>;
  
  // Session store for express-session
  sessionStore: session.Store;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // Initialize session store
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Prune expired entries every 24h
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.resetToken, token));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUserLastLogin(userId: number): Promise<User> {
    const now = new Date();
    const [user] = await db
      .update(users)
      .set({ lastLogin: now, updatedAt: now })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserPassword(userId: number, password: string): Promise<void> {
    const now = new Date();
    await db
      .update(users)
      .set({ 
        password, 
        lastPasswordChange: now, 
        updatedAt: now 
      })
      .where(eq(users.id, userId));
  }

  async updateUserProfile(userId: number, data: Partial<User>): Promise<User> {
    const now = new Date();
    const updateData = { ...data, updatedAt: now };
    
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    
    return user;
  }

  async updatePasswordResetToken(userId: number, token: string, expiresAt: Date): Promise<void> {
    await db
      .update(users)
      .set({ 
        resetToken: token, 
        resetTokenExpires: expiresAt,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async clearPasswordResetToken(userId: number): Promise<void> {
    await db
      .update(users)
      .set({ 
        resetToken: null, 
        resetTokenExpires: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  // Auth logs
  async createAuthLog(logData: InsertAuthLog): Promise<AuthLog> {
    const [log] = await db.insert(authLogs).values(logData).returning();
    return log;
  }

  async updateAuthLog(id: number, data: Partial<AuthLog>): Promise<AuthLog> {
    const [log] = await db
      .update(authLogs)
      .set(data)
      .where(eq(authLogs.id, id))
      .returning();
    
    return log;
  }
}

// Export singleton instance of storage
export const storage = new DatabaseStorage();