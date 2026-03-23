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
  glossLogs, type GlossLog, type InsertGlossLog,
  userRoutes, type UserRoute, type InsertUserRoute
} from "@shared/schema";

import session from "express-session";
import { mockUser, mockVehicles } from './mock-data';
import createMemoryStore from "memorystore";

// EMERGENCY INVESTOR DEMO MODE - Check for environment flag
const DEMO_MODE = process.env.NODE_ENV === 'production';

// Create memory store for session
const MemoryStore = createMemoryStore(session);
const sessionStore = new MemoryStore({
  checkPeriod: 86400000 // prune expired entries every 24h
});

// Core storage interface
export interface IStorage {
  sessionStore: session.Store;
  
  // Basic user methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(limit?: number): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Basic vehicle methods
  getVehicle(id: number): Promise<Vehicle | undefined>;
  getVehiclesByUserId(userId: number): Promise<Vehicle[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  
  // Add stubs for all other methods
  updateUserPassword(id: number, hashedPassword: string): Promise<boolean>;
  updateUserVerification(id: number, isVerified: boolean): Promise<boolean>;
  updatePasswordResetToken(id: number, token: string | null, expires: Date | null): Promise<boolean>;
  checkPasswordResetToken(token: string): Promise<User | undefined>;
  updateUserLastLogin(id: number): Promise<boolean>;
  updateTwoFactorSecret(userId: number, secret: string): Promise<boolean>;
  enableTwoFactor(userId: number, secret: string, backupCodes: string[]): Promise<boolean>; 
  disableTwoFactor(userId: number): Promise<boolean>;
  updateTwoFactorBackupCodes(userId: number, backupCodes: string[]): Promise<boolean>;
  createSession(sessionData: InsertSession): Promise<Session>;
  getSession(id: string): Promise<Session | undefined>;
  deleteSession(id: string): Promise<void>;
  getUserSessions(userId: number): Promise<Session[]>;
  deleteUserSessions(userId: number, currentSessionId?: string): Promise<void>;
  deleteUser(userId: number): Promise<void>;
  updateSessionActivity(id: string): Promise<void>;
  cleanupExpiredSessions(): Promise<void>;
  createAuthLog(log: InsertAuthLog): Promise<AuthLog>;
  getAuthLogsByUserId(userId: number, limit?: number): Promise<AuthLog[]>;
  getRecentFailedLoginAttempts(userId: number, minutes: number): Promise<number>;
  getSavedLocation(id: number): Promise<SavedLocation | undefined>;
  getSavedLocationsByUserId(userId: number): Promise<SavedLocation[]>;
  createSavedLocation(location: InsertSavedLocation): Promise<SavedLocation>;
  updateSavedLocation(id: number, location: Partial<InsertSavedLocation>): Promise<SavedLocation | undefined>;
  deleteSavedLocation(id: number): Promise<void>;
  getPrimarySavedLocation(userId: number): Promise<SavedLocation | undefined>;
  countSavedLocationsByUserId(userId: number): Promise<number>;
  getTire(id: number): Promise<Tire | undefined>;
  getTireByVehicleId(vehicleId: number): Promise<Tire | undefined>;
  createTire(tire: InsertTire): Promise<Tire>;
  updateTire(id: number, tire: Partial<InsertTire>): Promise<Tire | undefined>;
  getMaintenanceRecord(id: number): Promise<MaintenanceRecord | undefined>;
  getMaintenanceRecordByVehicleId(vehicleId: number): Promise<MaintenanceRecord | undefined>;
  createMaintenanceRecord(record: InsertMaintenanceRecord): Promise<MaintenanceRecord>;
  updateMaintenanceRecord(id: number, record: Partial<InsertMaintenanceRecord>): Promise<MaintenanceRecord | undefined>;
  getMaintenanceFlag(id: number): Promise<MaintenanceFlag | undefined>;
  getMaintenanceFlagByVehicleId(vehicleId: number): Promise<MaintenanceFlag | undefined>;
  createMaintenanceFlag(flag: InsertMaintenanceFlag): Promise<MaintenanceFlag>;
  updateMaintenanceFlag(id: number, flag: Partial<InsertMaintenanceFlag>): Promise<MaintenanceFlag | undefined>;
  getGlossTracking(id: number): Promise<GlossTracking | undefined>;
  getGlossTrackingByVehicleId(vehicleId: number): Promise<GlossTracking | undefined>;
  createGlossTracking(tracking: InsertGlossTracking): Promise<GlossTracking>;
  updateGlossTracking(id: number, tracking: Partial<InsertGlossTracking>): Promise<GlossTracking | undefined>;
  getGlossLogs(glossTrackingId: number): Promise<GlossLog[]>;
  createGlossLog(log: InsertGlossLog): Promise<GlossLog>;
  lockAccount(userId: number, durationMinutes: number): Promise<boolean>;
  unlockAccount(userId: number): Promise<boolean>;
  updateFailedLoginAttempts(userId: number, count: number): Promise<boolean>;
  getUserRoute(id: number): Promise<UserRoute | undefined>;
  getUserRoutes(userId: number): Promise<UserRoute[]>;
  createUserRoute(route: InsertUserRoute): Promise<UserRoute>;
  updateUserRoute(id: number, route: Partial<InsertUserRoute>): Promise<UserRoute | undefined>;
  updateRouteFavorite(routeId: number, favorite: boolean): Promise<UserRoute | undefined>;
  deleteUserRoute(id: number): Promise<void>;
  updateBackupCodes(userId: number, backupCodes: string[]): Promise<boolean>;
}

// Mock Storage Implementation for demo mode
class MockStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    this.sessionStore = sessionStore;
  }
  
  // User methods
  async getUser(): Promise<User> { 
    return mockUser; 
  }
  
  async getUserByUsername(): Promise<User> { 
    return mockUser; 
  }
  
  async getUserByEmail(): Promise<User> { 
    return mockUser; 
  }
  
  async getAllUsers(): Promise<User[]> { 
    return [mockUser]; 
  }
  
  async createUser(): Promise<User> { 
    return mockUser; 
  }
  
  async updateUser(): Promise<User> { 
    return mockUser; 
  }
  
  // Vehicle methods  
  async getVehicle(id: number): Promise<Vehicle | undefined> {
    return mockVehicles.find(v => v.id === id);
  }
  
  async getVehiclesByUserId(): Promise<Vehicle[]> {
    return mockVehicles;
  }
  
  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const newId = mockVehicles.length + 1;
    const newVehicle = { 
      ...vehicle, 
      id: newId,
      createdAt: new Date(), 
      updatedAt: new Date(),
      vinLast6: vehicle.vin ? vehicle.vin.slice(-6) : null 
    } as Vehicle;
    return newVehicle;
  }
  
  async updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const existingVehicle = mockVehicles.find(v => v.id === id);
    if (!existingVehicle) return undefined;
    
    return { 
      ...existingVehicle, 
      ...vehicle, 
      updatedAt: new Date() 
    } as Vehicle;
  }
  
  // Stub implementations for all other methods
  async updateUserPassword(): Promise<boolean> { return true; }
  async updateUserVerification(): Promise<boolean> { return true; }
  async updatePasswordResetToken(): Promise<boolean> { return true; }
  async checkPasswordResetToken(): Promise<User | undefined> { return undefined; }
  async updateUserLastLogin(): Promise<boolean> { return true; }
  async updateTwoFactorSecret(): Promise<boolean> { return true; }
  async enableTwoFactor(): Promise<boolean> { return true; }
  async disableTwoFactor(): Promise<boolean> { return true; }
  async updateTwoFactorBackupCodes(): Promise<boolean> { return true; }
  
  async createSession(): Promise<Session> { 
    return { 
      id: '1', 
      userId: 1, 
      expiresAt: new Date(), 
      lastActive: new Date(), 
      createdAt: new Date(),
      userAgent: null,
      ipAddress: null
    }; 
  }
  
  async getSession(): Promise<Session> { 
    return { 
      id: '1', 
      userId: 1, 
      expiresAt: new Date(), 
      lastActive: new Date(), 
      createdAt: new Date(),
      userAgent: null,
      ipAddress: null
    }; 
  }
  
  async deleteSession(): Promise<void> {}
  async getUserSessions(): Promise<Session[]> { return []; }
  async deleteUserSessions(): Promise<void> {}
  async deleteUser(): Promise<void> {}
  async updateSessionActivity(): Promise<void> {}
  async cleanupExpiredSessions(): Promise<void> {}
  
  async createAuthLog(log: InsertAuthLog): Promise<AuthLog> {
    return { 
      id: 1, 
      userId: 1, 
      action: log.action, 
      status: log.status, 
      ipAddress: log.ipAddress || null, 
      userAgent: log.userAgent || null, 
      details: log.details || null, 
      createdAt: new Date() 
    };
  }
  
  async getAuthLogsByUserId(): Promise<AuthLog[]> { return []; }
  async getRecentFailedLoginAttempts(): Promise<number> { return 0; }
  
  async getSavedLocation(): Promise<SavedLocation | undefined> { return undefined; }
  async getSavedLocationsByUserId(): Promise<SavedLocation[]> { return []; }
  
  async createSavedLocation(location: InsertSavedLocation): Promise<SavedLocation> {
    return { 
      id: 1, 
      userId: location.userId, 
      name: location.name, 
      lat: 36.1627, 
      lon: -86.7816, 
      isPrimary: true, 
      country: 'USA',
      state: 'TN',
      lastAccessed: new Date(), 
      createdAt: new Date(),
      notes: null,
      customName: null
    };
  }
  
  async updateSavedLocation(): Promise<SavedLocation> {
    return { 
      id: 1, 
      userId: 1, 
      name: 'Nashville', 
      lat: 36.1627, 
      lon: -86.7816, 
      isPrimary: true, 
      country: 'USA',
      state: 'TN',
      lastAccessed: new Date(), 
      createdAt: new Date(),
      notes: null,
      customName: null
    };
  }
  
  async deleteSavedLocation(): Promise<void> {}
  
  async getPrimarySavedLocation(): Promise<SavedLocation> {
    return { 
      id: 1, 
      userId: 1, 
      name: 'Nashville', 
      lat: 36.1627, 
      lon: -86.7816, 
      isPrimary: true, 
      country: 'USA',
      state: 'TN',
      lastAccessed: new Date(), 
      createdAt: new Date(),
      notes: null,
      customName: null
    };
  }
  
  async countSavedLocationsByUserId(): Promise<number> { return 1; }
  
  async getTire(): Promise<Tire | undefined> { return undefined; }
  async getTireByVehicleId(): Promise<Tire | undefined> { return undefined; }
  
  async createTire(tire: InsertTire): Promise<Tire> { 
    return { 
      id: 1, 
      vehicleId: tire.vehicleId, 
      brand: null,
      model: null,
      type: null,
      frontSize: null,
      rearSize: null,
      pressureFront: null,
      pressureRear: null,
      pressureUnit: null,
      mileage: null,
      notes: null,
      createdAt: new Date(),
      updatedAt: null
    }; 
  }
  
  async updateTire(): Promise<Tire | undefined> { return undefined; }
  async getMaintenanceRecord(): Promise<MaintenanceRecord | undefined> { return undefined; }
  async getMaintenanceRecordByVehicleId(): Promise<MaintenanceRecord | undefined> { return undefined; }
  
  async createMaintenanceRecord(record: InsertMaintenanceRecord): Promise<MaintenanceRecord> { 
    return { 
      id: 1, 
      vehicleId: record.vehicleId, 
      createdAt: new Date(),
      updatedAt: null,
      notes: null
    }; 
  }
  
  async updateMaintenanceRecord(): Promise<MaintenanceRecord | undefined> { return undefined; }
  async getMaintenanceFlag(): Promise<MaintenanceFlag | undefined> { return undefined; }
  async getMaintenanceFlagByVehicleId(): Promise<MaintenanceFlag | undefined> { return undefined; }
  
  async createMaintenanceFlag(flag: InsertMaintenanceFlag): Promise<MaintenanceFlag> { 
    return { 
      id: 1, 
      vehicleId: flag.vehicleId, 
      createdAt: new Date(),
      updatedAt: null,
      notes: null,
      flagType: 'OIL_CHANGE',
      dueDate: null,
      dueMileage: null,
      isDue: null,
      isUrgent: null
    }; 
  }
  
  async updateMaintenanceFlag(): Promise<MaintenanceFlag | undefined> { return undefined; }
  async getGlossTracking(): Promise<GlossTracking | undefined> { return undefined; }
  async getGlossTrackingByVehicleId(): Promise<GlossTracking | undefined> { return undefined; }
  
  async createGlossTracking(tracking: InsertGlossTracking): Promise<GlossTracking> { 
    return { 
      id: 1, 
      vehicleId: tracking.vehicleId, 
      createdAt: new Date(),
      updatedAt: null,
      notes: null,
      currentProduct: null,
      appliedDate: null,
      nextWaxDate: null,
      protectionLevel: null,
      glossLevel: null,
      beadingRating: null
    }; 
  }
  
  async updateGlossTracking(): Promise<GlossTracking | undefined> { return undefined; }
  async getGlossLogs(): Promise<GlossLog[]> { return []; }
  
  async createGlossLog(log: InsertGlossLog): Promise<GlossLog> { 
    return { 
      id: 1, 
      glossTrackingId: log.glossTrackingId, 
      notes: null,
      logDate: new Date(),
      productUsed: null,
      processType: null,
      beforeImages: null,
      afterImages: null,
      createdAt: new Date()
    }; 
  }
  
  async lockAccount(): Promise<boolean> { return true; }
  async unlockAccount(): Promise<boolean> { return true; }
  async updateFailedLoginAttempts(): Promise<boolean> { return true; }
  async getUserRoute(): Promise<UserRoute | undefined> { return undefined; }
  async getUserRoutes(): Promise<UserRoute[]> { return []; }
  
  async createUserRoute(route: InsertUserRoute): Promise<UserRoute> { 
    return { 
      id: 1, 
      userId: route.userId, 
      name: route.name || 'New Route',
      distance: route.distance || 0,
      estimatedDuration: route.estimatedDuration || 0,
      startLat: route.startLat || 0,
      startLon: route.startLon || 0,
      endLat: route.endLat || 0,
      endLon: route.endLon || 0,
      favorite: route.favorite || false,
      type: route.type || 'fun',
      waypoints: route.waypoints || null,
      notes: route.notes || null,
      lastUsed: null,
      createdAt: new Date(),
      updatedAt: new Date()
    } as unknown as UserRoute; 
  }
  
  async updateUserRoute(): Promise<UserRoute | undefined> { return undefined; }
  async updateRouteFavorite(): Promise<UserRoute | undefined> { return undefined; }
  async deleteUserRoute(): Promise<void> {}
  async updateBackupCodes(): Promise<boolean> { return true; }
}

// Export the mock implementation for demo mode
export const storage = new MockStorage();