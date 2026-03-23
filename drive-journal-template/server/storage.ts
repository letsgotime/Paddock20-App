import {
  driveEntries,
  vehicles,
  users,
  type DriveEntry,
  type Vehicle,
  type User,
  type InsertDriveEntry,
  type InsertVehicle,
  type InsertUser
} from "../shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Vehicle operations
  getVehicle(id: number): Promise<Vehicle | undefined>;
  getVehiclesByUserId(userId: number): Promise<Vehicle[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: number): Promise<void>;
  
  // Drive entry operations
  getDriveEntry(id: number): Promise<DriveEntry | undefined>;
  getDriveEntriesByUserId(userId: number): Promise<DriveEntry[]>;
  createDriveEntry(entry: InsertDriveEntry): Promise<DriveEntry>;
  updateDriveEntry(id: number, entry: Partial<InsertDriveEntry>): Promise<DriveEntry | undefined>;
  deleteDriveEntry(id: number): Promise<void>;
  
  // Session store
  sessionStore: session.Store;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  sessionStore: session.Store;
  private users: User[] = [];
  private vehicles: Vehicle[] = [];
  private driveEntries: DriveEntry[] = [];
  private nextUserId = 1;
  private nextVehicleId = 1;
  private nextDriveEntryId = 1;
  
  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email === email);
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    const now = new Date();
    const user: User = {
      id: this.nextUserId++,
      ...userData,
      createdAt: now,
      updatedAt: now
    };
    this.users.push(user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return undefined;
    
    const updatedUser = {
      ...this.users[index],
      ...userData,
      updatedAt: new Date()
    };
    
    this.users[index] = updatedUser;
    return updatedUser;
  }
  
  // Vehicle operations
  async getVehicle(id: number): Promise<Vehicle | undefined> {
    return this.vehicles.find(vehicle => vehicle.id === id);
  }
  
  async getVehiclesByUserId(userId: number): Promise<Vehicle[]> {
    return this.vehicles.filter(vehicle => vehicle.userId === userId);
  }
  
  async createVehicle(vehicleData: InsertVehicle): Promise<Vehicle> {
    const now = new Date();
    const vehicle: Vehicle = {
      id: this.nextVehicleId++,
      ...vehicleData,
      createdAt: now,
      updatedAt: now
    };
    this.vehicles.push(vehicle);
    return vehicle;
  }
  
  async updateVehicle(id: number, vehicleData: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const index = this.vehicles.findIndex(vehicle => vehicle.id === id);
    if (index === -1) return undefined;
    
    const updatedVehicle = {
      ...this.vehicles[index],
      ...vehicleData,
      updatedAt: new Date()
    };
    
    this.vehicles[index] = updatedVehicle;
    return updatedVehicle;
  }
  
  async deleteVehicle(id: number): Promise<void> {
    const index = this.vehicles.findIndex(vehicle => vehicle.id === id);
    if (index !== -1) {
      this.vehicles.splice(index, 1);
    }
  }
  
  // Drive entry operations
  async getDriveEntry(id: number): Promise<DriveEntry | undefined> {
    return this.driveEntries.find(entry => entry.id === id);
  }
  
  async getDriveEntriesByUserId(userId: number): Promise<DriveEntry[]> {
    return this.driveEntries.filter(entry => entry.userId === userId);
  }
  
  async createDriveEntry(entryData: InsertDriveEntry): Promise<DriveEntry> {
    const now = new Date();
    const entry: DriveEntry = {
      id: this.nextDriveEntryId++,
      ...entryData,
      createdAt: now,
      updatedAt: now
    };
    this.driveEntries.push(entry);
    return entry;
  }
  
  async updateDriveEntry(id: number, entryData: Partial<InsertDriveEntry>): Promise<DriveEntry | undefined> {
    const index = this.driveEntries.findIndex(entry => entry.id === id);
    if (index === -1) return undefined;
    
    const updatedEntry = {
      ...this.driveEntries[index],
      ...entryData,
      updatedAt: new Date()
    };
    
    this.driveEntries[index] = updatedEntry;
    return updatedEntry;
  }
  
  async deleteDriveEntry(id: number): Promise<void> {
    const index = this.driveEntries.findIndex(entry => entry.id === id);
    if (index !== -1) {
      this.driveEntries.splice(index, 1);
    }
  }
}

// Database storage implementation for when needed
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    const PostgresSessionStore = require('connect-pg-simple')(session);
    this.sessionStore = new PostgresSessionStore({
      createTableIfMissing: true,
      conObject: { 
        connectionString: process.env.DATABASE_URL 
      }
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
  
  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  // Vehicle operations
  async getVehicle(id: number): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle;
  }
  
  async getVehiclesByUserId(userId: number): Promise<Vehicle[]> {
    return db.select().from(vehicles).where(eq(vehicles.userId, userId));
  }
  
  async createVehicle(vehicleData: InsertVehicle): Promise<Vehicle> {
    const [vehicle] = await db.insert(vehicles).values(vehicleData).returning();
    return vehicle;
  }
  
  async updateVehicle(id: number, vehicleData: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const [updatedVehicle] = await db
      .update(vehicles)
      .set({ ...vehicleData, updatedAt: new Date() })
      .where(eq(vehicles.id, id))
      .returning();
    return updatedVehicle;
  }
  
  async deleteVehicle(id: number): Promise<void> {
    await db.delete(vehicles).where(eq(vehicles.id, id));
  }
  
  // Drive entry operations
  async getDriveEntry(id: number): Promise<DriveEntry | undefined> {
    const [entry] = await db.select().from(driveEntries).where(eq(driveEntries.id, id));
    return entry;
  }
  
  async getDriveEntriesByUserId(userId: number): Promise<DriveEntry[]> {
    return db.select().from(driveEntries).where(eq(driveEntries.userId, userId));
  }
  
  async createDriveEntry(entryData: InsertDriveEntry): Promise<DriveEntry> {
    const [entry] = await db.insert(driveEntries).values(entryData).returning();
    return entry;
  }
  
  async updateDriveEntry(id: number, entryData: Partial<InsertDriveEntry>): Promise<DriveEntry | undefined> {
    const [updatedEntry] = await db
      .update(driveEntries)
      .set({ ...entryData, updatedAt: new Date() })
      .where(eq(driveEntries.id, id))
      .returning();
    return updatedEntry;
  }
  
  async deleteDriveEntry(id: number): Promise<void> {
    await db.delete(driveEntries).where(eq(driveEntries.id, id));
  }
}

// Use MemStorage for simplicity in the template
// In a production app, you can switch to DatabaseStorage when needed
export const storage = new MemStorage();