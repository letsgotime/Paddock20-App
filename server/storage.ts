import { 
  users, type User, type InsertUser, 
  sessions, type Session, type InsertSession,
  authLogs, type AuthLog, type InsertAuthLog,
  savedLocations, type SavedLocation, type InsertSavedLocation,
  vehicles, type Vehicle, type InsertVehicle,
  tires, type Tire, type InsertTire,
  maintenanceRecords, type MaintenanceRecord, type InsertMaintenanceRecord,
  maintenanceFlags, type MaintenanceFlag, type InsertMaintenanceFlag, 
  glossTracking, type GlossTracking, type InsertGlossTracking,
  glossLogs, type GlossLog, type InsertGlossLog 
} from "@shared/schema";

import { db } from "./db";
import { eq, and, sql, desc, lt, gt } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

// Create PostgreSQL session store for Express sessions
const PostgresSessionStore = connectPg(session);
const sessionStore = new PostgresSessionStore({
  pool,
  tableName: 'session', // Connect-pg-simple uses lowercase 'session' by default
  createTableIfMissing: true
});

// IStorage interface with all CRUD methods
export interface IStorage {
  // Session store for Express integration
  sessionStore: session.Store;

  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  updateUserPassword(id: number, hashedPassword: string): Promise<boolean>;
  updateUserVerification(id: number, isVerified: boolean): Promise<boolean>;
  updatePasswordResetToken(id: number, token: string | null, expires: Date | null): Promise<boolean>;
  checkPasswordResetToken(token: string): Promise<User | undefined>;
  updateUserLastLogin(id: number): Promise<boolean>;
  
  // Two-factor authentication methods
  updateTwoFactorSecret(userId: number, secret: string): Promise<boolean>;
  enableTwoFactor(userId: number, secret: string, backupCodes: string[]): Promise<boolean>; 
  disableTwoFactor(userId: number): Promise<boolean>;
  updateTwoFactorBackupCodes(userId: number, backupCodes: string[]): Promise<boolean>;
  
  // Authentication methods
  createSession(sessionData: InsertSession): Promise<Session>;
  getSession(id: string): Promise<Session | undefined>;
  deleteSession(id: string): Promise<void>;
  getUserSessions(userId: number): Promise<Session[]>;
  deleteUserSessions(userId: number, currentSessionId?: string): Promise<void>;
  updateSessionActivity(id: string): Promise<void>;
  cleanupExpiredSessions(): Promise<void>;
  
  // Auth logs methods
  createAuthLog(log: InsertAuthLog): Promise<AuthLog>;
  getAuthLogsByUserId(userId: number, limit?: number): Promise<AuthLog[]>;
  getRecentFailedLoginAttempts(userId: number, minutes: number): Promise<number>;
  
  // Saved Locations methods
  getSavedLocation(id: number): Promise<SavedLocation | undefined>;
  getSavedLocationsByUserId(userId: number): Promise<SavedLocation[]>;
  createSavedLocation(location: InsertSavedLocation): Promise<SavedLocation>;
  updateSavedLocation(id: number, location: Partial<InsertSavedLocation>): Promise<SavedLocation | undefined>;
  deleteSavedLocation(id: number): Promise<void>;
  getPrimarySavedLocation(userId: number): Promise<SavedLocation | undefined>;
  countSavedLocationsByUserId(userId: number): Promise<number>;
  
  // Vehicle methods
  getVehicle(id: number): Promise<Vehicle | undefined>;
  getVehiclesByUserId(userId: number): Promise<Vehicle[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  
  // Tire methods
  getTire(id: number): Promise<Tire | undefined>;
  getTireByVehicleId(vehicleId: number): Promise<Tire | undefined>;
  createTire(tire: InsertTire): Promise<Tire>;
  updateTire(id: number, tire: Partial<InsertTire>): Promise<Tire | undefined>;
  
  // Maintenance Record methods
  getMaintenanceRecord(id: number): Promise<MaintenanceRecord | undefined>;
  getMaintenanceRecordByVehicleId(vehicleId: number): Promise<MaintenanceRecord | undefined>;
  createMaintenanceRecord(record: InsertMaintenanceRecord): Promise<MaintenanceRecord>;
  updateMaintenanceRecord(id: number, record: Partial<InsertMaintenanceRecord>): Promise<MaintenanceRecord | undefined>;
  
  // Maintenance Flag methods
  getMaintenanceFlag(id: number): Promise<MaintenanceFlag | undefined>;
  getMaintenanceFlagByVehicleId(vehicleId: number): Promise<MaintenanceFlag | undefined>;
  createMaintenanceFlag(flag: InsertMaintenanceFlag): Promise<MaintenanceFlag>;
  updateMaintenanceFlag(id: number, flag: Partial<InsertMaintenanceFlag>): Promise<MaintenanceFlag | undefined>;
  
  // Gloss Tracking methods
  getGlossTracking(id: number): Promise<GlossTracking | undefined>;
  getGlossTrackingByVehicleId(vehicleId: number): Promise<GlossTracking | undefined>;
  createGlossTracking(tracking: InsertGlossTracking): Promise<GlossTracking>;
  updateGlossTracking(id: number, tracking: Partial<InsertGlossTracking>): Promise<GlossTracking | undefined>;
  
  // Gloss Log methods
  getGlossLogs(glossTrackingId: number): Promise<GlossLog[]>;
  createGlossLog(log: InsertGlossLog): Promise<GlossLog>;
  
  // Two-Factor Authentication methods
  updateTwoFactorSecret(userId: number, secret: string): Promise<boolean>;
  enableTwoFactor(userId: number, secret: string, backupCodes: string[]): Promise<boolean>;
  disableTwoFactor(userId: number): Promise<boolean>;
  updateTwoFactorBackupCodes(userId: number, backupCodes: string[]): Promise<boolean>;
  
  // Security methods
  lockAccount(userId: number, durationMinutes: number): Promise<boolean>;
  unlockAccount(userId: number): Promise<boolean>;
  updateFailedLoginAttempts(userId: number, count: number): Promise<boolean>;
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  // Make sessionStore available
  sessionStore: session.Store;
  
  constructor() {
    this.sessionStore = sessionStore;
  }
  
  // User methods
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async updateUserPassword(id: number, hashedPassword: string): Promise<boolean> {
    const result = await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, id));
    return result.rowCount > 0;
  }
  
  async updateUserVerification(id: number, isVerified: boolean): Promise<boolean> {
    const result = await db
      .update(users)
      .set({
        isEmailVerified: isVerified,
        verificationToken: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, id));
    return result.rowCount > 0;
  }
  
  async updatePasswordResetToken(id: number, token: string | null, expires: Date | null): Promise<boolean> {
    const result = await db
      .update(users)
      .set({
        resetToken: token,
        resetTokenExpires: expires,
        updatedAt: new Date()
      })
      .where(eq(users.id, id));
    return result.rowCount > 0;
  }
  
  async checkPasswordResetToken(token: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.resetToken, token));
    
    // Check if token exists and hasn't expired
    if (user && user.resetTokenExpires && user.resetTokenExpires > new Date()) {
      return user;
    }
    
    return undefined;
  }
  
  async updateUserLastLogin(id: number): Promise<boolean> {
    const result = await db
      .update(users)
      .set({
        lastLogin: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, id));
    return result.rowCount > 0;
  }
  
  // Session methods
  async createSession(sessionData: InsertSession): Promise<Session> {
    const [session] = await db
      .insert(sessions)
      .values(sessionData)
      .returning();
    return session;
  }
  
  async getSession(id: string): Promise<Session | undefined> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, id));
    return session;
  }
  
  async deleteSession(id: string): Promise<void> {
    await db
      .delete(sessions)
      .where(eq(sessions.id, id));
  }
  
  async getUserSessions(userId: number): Promise<Session[]> {
    return await db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, userId))
      .orderBy(desc(sessions.lastActive));
  }
  
  async deleteUserSessions(userId: number, currentSessionId?: string): Promise<void> {
    if (currentSessionId) {
      // Delete all sessions except the current one
      await db
        .delete(sessions)
        .where(and(
          eq(sessions.userId, userId),
          sql`${sessions.id} != ${currentSessionId}`
        ));
    } else {
      // Delete all sessions for this user
      await db
        .delete(sessions)
        .where(eq(sessions.userId, userId));
    }
  }
  
  async updateSessionActivity(id: string): Promise<void> {
    await db
      .update(sessions)
      .set({
        lastActive: new Date()
      })
      .where(eq(sessions.id, id));
  }
  
  async cleanupExpiredSessions(): Promise<void> {
    await db
      .delete(sessions)
      .where(lt(sessions.expiresAt, new Date()));
  }
  
  // Auth logs methods
  async createAuthLog(log: InsertAuthLog): Promise<AuthLog> {
    const [authLog] = await db
      .insert(authLogs)
      .values(log)
      .returning();
    return authLog;
  }
  
  async getAuthLogsByUserId(userId: number, limit: number = 50): Promise<AuthLog[]> {
    return await db
      .select()
      .from(authLogs)
      .where(eq(authLogs.userId, userId))
      .orderBy(desc(authLogs.createdAt))
      .limit(limit);
  }
  
  async getRecentFailedLoginAttempts(userId: number, minutes: number = 30): Promise<number> {
    const cutoffTime = new Date(Date.now() - (minutes * 60 * 1000));
    
    const result = await db
      .select({ count: sql`count(*)` })
      .from(authLogs)
      .where(and(
        eq(authLogs.userId, userId),
        eq(authLogs.action, 'login'),
        eq(authLogs.status, 'failed'),
        gt(authLogs.createdAt, cutoffTime)
      ));
      
    return Number(result[0].count);
  }
  
  // Saved Location methods
  async getSavedLocation(id: number): Promise<SavedLocation | undefined> {
    const [location] = await db.select().from(savedLocations).where(eq(savedLocations.id, id));
    return location;
  }
  
  async getSavedLocationsByUserId(userId: number): Promise<SavedLocation[]> {
    return await db.select().from(savedLocations).where(eq(savedLocations.userId, userId));
  }
  
  async createSavedLocation(location: InsertSavedLocation): Promise<SavedLocation> {
    // If this is marked as primary, first unset any existing primary location
    if (location.isPrimary) {
      await db
        .update(savedLocations)
        .set({ isPrimary: false })
        .where(and(
          eq(savedLocations.userId, location.userId),
          eq(savedLocations.isPrimary, true)
        ));
    }
    
    const [newLocation] = await db.insert(savedLocations).values({
      ...location,
      lastAccessed: new Date(),
    }).returning();
    
    return newLocation;
  }
  
  async updateSavedLocation(id: number, location: Partial<InsertSavedLocation>): Promise<SavedLocation | undefined> {
    // If this is being set as primary, first unset any existing primary
    if (location.isPrimary) {
      const [currentLocation] = await db.select().from(savedLocations).where(eq(savedLocations.id, id));
      
      if (currentLocation) {
        await db
          .update(savedLocations)
          .set({ isPrimary: false })
          .where(
            and(
              eq(savedLocations.userId, currentLocation.userId),
              eq(savedLocations.isPrimary, true),
              sql`${savedLocations.id} != ${id}`
            )
          );
      }
    }
    
    const [updatedLocation] = await db
      .update(savedLocations)
      .set({
        ...location,
        lastAccessed: new Date(),
      })
      .where(eq(savedLocations.id, id))
      .returning();
      
    return updatedLocation;
  }
  
  async deleteSavedLocation(id: number): Promise<void> {
    await db.delete(savedLocations).where(eq(savedLocations.id, id));
  }
  
  async getPrimarySavedLocation(userId: number): Promise<SavedLocation | undefined> {
    const [location] = await db
      .select()
      .from(savedLocations)
      .where(and(
        eq(savedLocations.userId, userId),
        eq(savedLocations.isPrimary, true)
      ));
      
    return location;
  }
  
  async countSavedLocationsByUserId(userId: number): Promise<number> {
    const result = await db
      .select({ count: sql`count(*)` })
      .from(savedLocations)
      .where(eq(savedLocations.userId, userId));
      
    return Number(result[0].count);
  }
  
  // Vehicle methods
  async getVehicle(id: number): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle;
  }
  
  async getVehiclesByUserId(userId: number): Promise<Vehicle[]> {
    return await db.select().from(vehicles).where(eq(vehicles.userId, userId));
  }
  
  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const [newVehicle] = await db.insert(vehicles).values(vehicle).returning();
    return newVehicle;
  }
  
  async updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const [updatedVehicle] = await db
      .update(vehicles)
      .set({ ...vehicle, updatedAt: new Date() })
      .where(eq(vehicles.id, id))
      .returning();
    return updatedVehicle;
  }
  
  // Tire methods
  async getTire(id: number): Promise<Tire | undefined> {
    const [tire] = await db.select().from(tires).where(eq(tires.id, id));
    return tire;
  }
  
  async getTireByVehicleId(vehicleId: number): Promise<Tire | undefined> {
    const [tire] = await db.select().from(tires).where(eq(tires.vehicleId, vehicleId));
    return tire;
  }
  
  async createTire(tire: InsertTire): Promise<Tire> {
    const [newTire] = await db.insert(tires).values(tire).returning();
    return newTire;
  }
  
  async updateTire(id: number, tire: Partial<InsertTire>): Promise<Tire | undefined> {
    const [updatedTire] = await db
      .update(tires)
      .set({ ...tire, updatedAt: new Date() })
      .where(eq(tires.id, id))
      .returning();
    return updatedTire;
  }
  
  // Maintenance Record methods
  async getMaintenanceRecord(id: number): Promise<MaintenanceRecord | undefined> {
    const [record] = await db.select().from(maintenanceRecords).where(eq(maintenanceRecords.id, id));
    return record;
  }
  
  async getMaintenanceRecordByVehicleId(vehicleId: number): Promise<MaintenanceRecord | undefined> {
    const [record] = await db.select().from(maintenanceRecords).where(eq(maintenanceRecords.vehicleId, vehicleId));
    return record;
  }
  
  async createMaintenanceRecord(record: InsertMaintenanceRecord): Promise<MaintenanceRecord> {
    const [newRecord] = await db.insert(maintenanceRecords).values(record).returning();
    return newRecord;
  }
  
  async updateMaintenanceRecord(id: number, record: Partial<InsertMaintenanceRecord>): Promise<MaintenanceRecord | undefined> {
    const [updatedRecord] = await db
      .update(maintenanceRecords)
      .set(record)
      .where(eq(maintenanceRecords.id, id))
      .returning();
    return updatedRecord;
  }
  
  // Maintenance Flag methods
  async getMaintenanceFlag(id: number): Promise<MaintenanceFlag | undefined> {
    const [flag] = await db.select().from(maintenanceFlags).where(eq(maintenanceFlags.id, id));
    return flag;
  }
  
  async getMaintenanceFlagByVehicleId(vehicleId: number): Promise<MaintenanceFlag | undefined> {
    const [flag] = await db.select().from(maintenanceFlags).where(eq(maintenanceFlags.vehicleId, vehicleId));
    return flag;
  }
  
  async createMaintenanceFlag(flag: InsertMaintenanceFlag): Promise<MaintenanceFlag> {
    const [newFlag] = await db.insert(maintenanceFlags).values(flag).returning();
    return newFlag;
  }
  
  async updateMaintenanceFlag(id: number, flag: Partial<InsertMaintenanceFlag>): Promise<MaintenanceFlag | undefined> {
    const [updatedFlag] = await db
      .update(maintenanceFlags)
      .set({ ...flag, updatedAt: new Date() })
      .where(eq(maintenanceFlags.id, id))
      .returning();
    return updatedFlag;
  }
  
  // Gloss Tracking methods
  async getGlossTracking(id: number): Promise<GlossTracking | undefined> {
    const [tracking] = await db.select().from(glossTracking).where(eq(glossTracking.id, id));
    return tracking;
  }
  
  async getGlossTrackingByVehicleId(vehicleId: number): Promise<GlossTracking | undefined> {
    const [tracking] = await db.select().from(glossTracking).where(eq(glossTracking.vehicleId, vehicleId));
    return tracking;
  }
  
  async createGlossTracking(tracking: InsertGlossTracking): Promise<GlossTracking> {
    const [newTracking] = await db.insert(glossTracking).values(tracking).returning();
    return newTracking;
  }
  
  async updateGlossTracking(id: number, tracking: Partial<InsertGlossTracking>): Promise<GlossTracking | undefined> {
    const [updatedTracking] = await db
      .update(glossTracking)
      .set({ ...tracking, updatedAt: new Date() })
      .where(eq(glossTracking.id, id))
      .returning();
    return updatedTracking;
  }
  
  // Gloss Log methods
  async getGlossLogs(glossTrackingId: number): Promise<GlossLog[]> {
    return await db
      .select()
      .from(glossLogs)
      .where(eq(glossLogs.glossTrackingId, glossTrackingId))
      .orderBy(glossLogs.logDate);
  }
  
  async createGlossLog(log: InsertGlossLog): Promise<GlossLog> {
    const [newLog] = await db.insert(glossLogs).values(log).returning();
    return newLog;
  }

  // Two-Factor Authentication methods
  async updateTwoFactorSecret(userId: number, secret: string): Promise<boolean> {
    const result = await db
      .update(users)
      .set({
        twoFactorSecret: secret,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  async enableTwoFactor(userId: number, secret: string, backupCodes: string[]): Promise<boolean> {
    const result = await db
      .update(users)
      .set({
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        twoFactorBackupCodes: backupCodes,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  async disableTwoFactor(userId: number): Promise<boolean> {
    const result = await db
      .update(users)
      .set({
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  async updateTwoFactorBackupCodes(userId: number, backupCodes: string[]): Promise<boolean> {
    const result = await db
      .update(users)
      .set({
        twoFactorBackupCodes: backupCodes,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Security methods
  async lockAccount(userId: number, durationMinutes: number): Promise<boolean> {
    const lockUntil = new Date(Date.now() + durationMinutes * 60 * 1000);
    const result = await db
      .update(users)
      .set({
        accountLocked: true,
        lockedUntil: lockUntil,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    return result.rowCount > 0;
  }

  async unlockAccount(userId: number): Promise<boolean> {
    const result = await db
      .update(users)
      .set({
        accountLocked: false,
        lockedUntil: null,
        failedLoginAttempts: 0,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    return result.rowCount > 0;
  }

  async updateFailedLoginAttempts(userId: number, count: number): Promise<boolean> {
    const result = await db
      .update(users)
      .set({
        failedLoginAttempts: count,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    return result.rowCount > 0;
  }
  
  // Alias for updateTwoFactorBackupCodes for compatibility with two-factor service
  async updateBackupCodes(userId: number, backupCodes: string[]): Promise<boolean> {
    return this.updateTwoFactorBackupCodes(userId, backupCodes);
  }
}

export const storage = new DatabaseStorage();
