import { 
  users, type User, type InsertUser,
  vehicles, type Vehicle, type InsertVehicle,
  modifications, type Modification, type InsertModification,
  maintenanceRecords, type MaintenanceRecord, type InsertMaintenanceRecord,
  tireSetups, type TireSetup, type InsertTireSetup,
  detailingSessions, type DetailingSession, type InsertDetailingSession,
  detailingProducts, type DetailingProduct, type InsertDetailingProduct,
  driveJournalEntries, type DriveJournalEntry, type InsertDriveJournalEntry,
  vehicleDocuments, type VehicleDocument, type InsertVehicleDocument,
  goals, type Goal, type InsertGoal,
  goalMilestones, type GoalMilestone, type InsertGoalMilestone,
  pointsTransactions, type PointsTransaction, type InsertPointsTransaction
} from "@shared/schema";

import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

// IStorage interface with all CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: number): Promise<User | undefined>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Vehicle methods
  getVehicle(id: number, userId?: number): Promise<Vehicle | undefined>;
  getAllVehicles(userId?: number): Promise<Vehicle[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, updates: Partial<Vehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: number): Promise<void>;
  
  // Modifications methods
  getModification(id: number): Promise<Modification | undefined>;
  getModificationsByVehicleId(vehicleId: number): Promise<Modification[]>;
  createModification(modification: InsertModification): Promise<Modification>;
  updateModification(id: number, updates: Partial<Modification>): Promise<Modification | undefined>;
  deleteModification(id: number): Promise<void>;
  
  // Maintenance Record methods
  getMaintenanceRecord(id: number): Promise<MaintenanceRecord | undefined>;
  getMaintenanceRecordsByVehicleId(vehicleId: number): Promise<MaintenanceRecord[]>;
  createMaintenanceRecord(record: InsertMaintenanceRecord): Promise<MaintenanceRecord>;
  updateMaintenanceRecord(id: number, updates: Partial<MaintenanceRecord>): Promise<MaintenanceRecord | undefined>;
  deleteMaintenanceRecord(id: number): Promise<void>;
  
  // Tire Setups methods
  getTireSetup(id: number): Promise<TireSetup | undefined>;
  getTireSetupsByVehicleId(vehicleId: number): Promise<TireSetup[]>;
  createTireSetup(tireSetup: InsertTireSetup): Promise<TireSetup>;
  updateTireSetup(id: number, updates: Partial<TireSetup>): Promise<TireSetup | undefined>;
  deleteTireSetup(id: number): Promise<void>;
  
  // Detailing Sessions methods
  getDetailingSession(id: number): Promise<DetailingSession | undefined>;
  getDetailingSessionsByVehicleId(vehicleId: number): Promise<DetailingSession[]>;
  createDetailingSession(session: InsertDetailingSession): Promise<DetailingSession>;
  updateDetailingSession(id: number, updates: Partial<DetailingSession>): Promise<DetailingSession | undefined>;
  deleteDetailingSession(id: number): Promise<void>;
  
  // Detailing Products methods
  getDetailingProduct(id: number): Promise<DetailingProduct | undefined>;
  getDetailingProductsByUserId(userId: number): Promise<DetailingProduct[]>;
  createDetailingProduct(product: InsertDetailingProduct): Promise<DetailingProduct>;
  updateDetailingProduct(id: number, updates: Partial<DetailingProduct>): Promise<DetailingProduct | undefined>;
  deleteDetailingProduct(id: number): Promise<void>;
  
  // Drive Journal Entries methods
  getDriveJournalEntry(id: number): Promise<DriveJournalEntry | undefined>;
  getDriveJournalEntriesByVehicleId(vehicleId: number): Promise<DriveJournalEntry[]>;
  getDriveJournalEntriesByUserId(userId: number): Promise<DriveJournalEntry[]>;
  createDriveJournalEntry(entry: InsertDriveJournalEntry): Promise<DriveJournalEntry>;
  updateDriveJournalEntry(id: number, updates: Partial<DriveJournalEntry>): Promise<DriveJournalEntry | undefined>;
  deleteDriveJournalEntry(id: number): Promise<void>;
  
  // Vehicle Documents methods
  getVehicleDocument(id: number): Promise<VehicleDocument | undefined>;
  getDocumentsByVehicleId(vehicleId: number): Promise<VehicleDocument[]>;
  createVehicleDocument(document: InsertVehicleDocument): Promise<VehicleDocument>;
  updateVehicleDocument(id: number, updates: Partial<VehicleDocument>): Promise<VehicleDocument | undefined>;
  deleteVehicleDocument(id: number): Promise<void>;
  
  // Goals methods
  getGoal(id: number): Promise<Goal | undefined>;
  getGoalsByUserId(userId: number): Promise<Goal[]>;
  getGoalsByVehicleId(vehicleId: number): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, updates: Partial<Goal>): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<void>;
  
  // Goal Milestones methods
  getGoalMilestone(id: number): Promise<GoalMilestone | undefined>;
  getMilestonesByGoalId(goalId: number): Promise<GoalMilestone[]>;
  createGoalMilestone(milestone: InsertGoalMilestone): Promise<GoalMilestone>;
  updateGoalMilestone(id: number, updates: Partial<GoalMilestone>): Promise<GoalMilestone | undefined>;
  deleteGoalMilestone(id: number): Promise<void>;
  
  // Points Transactions methods
  getPointsTransaction(id: number): Promise<PointsTransaction | undefined>;
  getPointsTransactionsByUserId(userId: number): Promise<PointsTransaction[]>;
  getPointsTransactionsByVehicleId(vehicleId: number): Promise<PointsTransaction[]>;
  addPointsTransaction(transaction: InsertPointsTransaction): Promise<PointsTransaction>;
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  // Vehicle methods
  async getVehicle(id: number, userId?: number): Promise<Vehicle | undefined> {
    let query = db.select().from(vehicles).where(eq(vehicles.id, id));
    
    if (userId) {
      query = query.where(eq(vehicles.userId, userId));
    }
    
    const [vehicle] = await query;
    return vehicle;
  }
  
  async getAllVehicles(userId?: number): Promise<Vehicle[]> {
    if (userId) {
      return await db.select().from(vehicles).where(eq(vehicles.userId, userId));
    }
    return await db.select().from(vehicles);
  }
  
  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const [newVehicle] = await db.insert(vehicles).values(vehicle).returning();
    return newVehicle;
  }
  
  async updateVehicle(id: number, updates: Partial<Vehicle>): Promise<Vehicle | undefined> {
    const [updatedVehicle] = await db
      .update(vehicles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(vehicles.id, id))
      .returning();
    return updatedVehicle;
  }
  
  async deleteVehicle(id: number): Promise<void> {
    await db.delete(vehicles).where(eq(vehicles.id, id));
  }
  
  // Modifications methods
  async getModification(id: number): Promise<Modification | undefined> {
    const [modification] = await db.select().from(modifications).where(eq(modifications.id, id));
    return modification;
  }
  
  async getModificationsByVehicleId(vehicleId: number): Promise<Modification[]> {
    return await db.select().from(modifications).where(eq(modifications.vehicleId, vehicleId));
  }
  
  async createModification(modification: InsertModification): Promise<Modification> {
    const [newModification] = await db.insert(modifications).values(modification).returning();
    return newModification;
  }
  
  async updateModification(id: number, updates: Partial<Modification>): Promise<Modification | undefined> {
    const [updatedModification] = await db
      .update(modifications)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(modifications.id, id))
      .returning();
    return updatedModification;
  }
  
  async deleteModification(id: number): Promise<void> {
    await db.delete(modifications).where(eq(modifications.id, id));
  }
  
  // Maintenance Record methods
  async getMaintenanceRecord(id: number): Promise<MaintenanceRecord | undefined> {
    const [record] = await db.select().from(maintenanceRecords).where(eq(maintenanceRecords.id, id));
    return record;
  }
  
  async getMaintenanceRecordsByVehicleId(vehicleId: number): Promise<MaintenanceRecord[]> {
    return await db.select().from(maintenanceRecords).where(eq(maintenanceRecords.vehicleId, vehicleId));
  }
  
  async createMaintenanceRecord(record: InsertMaintenanceRecord): Promise<MaintenanceRecord> {
    const [newRecord] = await db.insert(maintenanceRecords).values(record).returning();
    return newRecord;
  }
  
  async updateMaintenanceRecord(id: number, updates: Partial<MaintenanceRecord>): Promise<MaintenanceRecord | undefined> {
    const [updatedRecord] = await db
      .update(maintenanceRecords)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(maintenanceRecords.id, id))
      .returning();
    return updatedRecord;
  }
  
  async deleteMaintenanceRecord(id: number): Promise<void> {
    await db.delete(maintenanceRecords).where(eq(maintenanceRecords.id, id));
  }
  
  // Tire Setups methods
  async getTireSetup(id: number): Promise<TireSetup | undefined> {
    const [tireSetup] = await db.select().from(tireSetups).where(eq(tireSetups.id, id));
    return tireSetup;
  }
  
  async getTireSetupsByVehicleId(vehicleId: number): Promise<TireSetup[]> {
    return await db.select().from(tireSetups).where(eq(tireSetups.vehicleId, vehicleId));
  }
  
  async createTireSetup(tireSetup: InsertTireSetup): Promise<TireSetup> {
    const [newTireSetup] = await db.insert(tireSetups).values(tireSetup).returning();
    return newTireSetup;
  }
  
  async updateTireSetup(id: number, updates: Partial<TireSetup>): Promise<TireSetup | undefined> {
    const [updatedTireSetup] = await db
      .update(tireSetups)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tireSetups.id, id))
      .returning();
    return updatedTireSetup;
  }
  
  async deleteTireSetup(id: number): Promise<void> {
    await db.delete(tireSetups).where(eq(tireSetups.id, id));
  }
  
  // Detailing Sessions methods
  async getDetailingSession(id: number): Promise<DetailingSession | undefined> {
    const [session] = await db.select().from(detailingSessions).where(eq(detailingSessions.id, id));
    return session;
  }
  
  async getDetailingSessionsByVehicleId(vehicleId: number): Promise<DetailingSession[]> {
    return await db.select().from(detailingSessions).where(eq(detailingSessions.vehicleId, vehicleId));
  }
  
  async createDetailingSession(session: InsertDetailingSession): Promise<DetailingSession> {
    const [newSession] = await db.insert(detailingSessions).values(session).returning();
    return newSession;
  }
  
  async updateDetailingSession(id: number, updates: Partial<DetailingSession>): Promise<DetailingSession | undefined> {
    const [updatedSession] = await db
      .update(detailingSessions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(detailingSessions.id, id))
      .returning();
    return updatedSession;
  }
  
  async deleteDetailingSession(id: number): Promise<void> {
    await db.delete(detailingSessions).where(eq(detailingSessions.id, id));
  }
  
  // Detailing Products methods
  async getDetailingProduct(id: number): Promise<DetailingProduct | undefined> {
    const [product] = await db.select().from(detailingProducts).where(eq(detailingProducts.id, id));
    return product;
  }
  
  async getDetailingProductsByUserId(userId: number): Promise<DetailingProduct[]> {
    return await db.select().from(detailingProducts).where(eq(detailingProducts.userId, userId));
  }
  
  async createDetailingProduct(product: InsertDetailingProduct): Promise<DetailingProduct> {
    const [newProduct] = await db.insert(detailingProducts).values(product).returning();
    return newProduct;
  }
  
  async updateDetailingProduct(id: number, updates: Partial<DetailingProduct>): Promise<DetailingProduct | undefined> {
    const [updatedProduct] = await db
      .update(detailingProducts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(detailingProducts.id, id))
      .returning();
    return updatedProduct;
  }
  
  async deleteDetailingProduct(id: number): Promise<void> {
    await db.delete(detailingProducts).where(eq(detailingProducts.id, id));
  }
  
  // Drive Journal Entries methods
  async getDriveJournalEntry(id: number): Promise<DriveJournalEntry | undefined> {
    const [entry] = await db.select().from(driveJournalEntries).where(eq(driveJournalEntries.id, id));
    return entry;
  }
  
  async getDriveJournalEntriesByVehicleId(vehicleId: number): Promise<DriveJournalEntry[]> {
    return await db.select().from(driveJournalEntries).where(eq(driveJournalEntries.vehicleId, vehicleId));
  }
  
  async getDriveJournalEntriesByUserId(userId: number): Promise<DriveJournalEntry[]> {
    return await db.select().from(driveJournalEntries).where(eq(driveJournalEntries.userId, userId));
  }
  
  async createDriveJournalEntry(entry: InsertDriveJournalEntry): Promise<DriveJournalEntry> {
    const [newEntry] = await db.insert(driveJournalEntries).values(entry).returning();
    return newEntry;
  }
  
  async updateDriveJournalEntry(id: number, updates: Partial<DriveJournalEntry>): Promise<DriveJournalEntry | undefined> {
    const [updatedEntry] = await db
      .update(driveJournalEntries)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(driveJournalEntries.id, id))
      .returning();
    return updatedEntry;
  }
  
  async deleteDriveJournalEntry(id: number): Promise<void> {
    await db.delete(driveJournalEntries).where(eq(driveJournalEntries.id, id));
  }
  
  // Vehicle Documents methods
  async getVehicleDocument(id: number): Promise<VehicleDocument | undefined> {
    const [document] = await db.select().from(vehicleDocuments).where(eq(vehicleDocuments.id, id));
    return document;
  }
  
  async getDocumentsByVehicleId(vehicleId: number): Promise<VehicleDocument[]> {
    return await db.select().from(vehicleDocuments).where(eq(vehicleDocuments.vehicleId, vehicleId));
  }
  
  async createVehicleDocument(document: InsertVehicleDocument): Promise<VehicleDocument> {
    const [newDocument] = await db.insert(vehicleDocuments).values(document).returning();
    return newDocument;
  }
  
  async updateVehicleDocument(id: number, updates: Partial<VehicleDocument>): Promise<VehicleDocument | undefined> {
    const [updatedDocument] = await db
      .update(vehicleDocuments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(vehicleDocuments.id, id))
      .returning();
    return updatedDocument;
  }
  
  async deleteVehicleDocument(id: number): Promise<void> {
    await db.delete(vehicleDocuments).where(eq(vehicleDocuments.id, id));
  }
  
  // Goals methods
  async getGoal(id: number): Promise<Goal | undefined> {
    const [goal] = await db.select().from(goals).where(eq(goals.id, id));
    return goal;
  }
  
  async getGoalsByUserId(userId: number): Promise<Goal[]> {
    return await db.select().from(goals).where(eq(goals.userId, userId));
  }
  
  async getGoalsByVehicleId(vehicleId: number): Promise<Goal[]> {
    return await db.select().from(goals).where(eq(goals.vehicleId, vehicleId));
  }
  
  async createGoal(goal: InsertGoal): Promise<Goal> {
    const [newGoal] = await db.insert(goals).values(goal).returning();
    return newGoal;
  }
  
  async updateGoal(id: number, updates: Partial<Goal>): Promise<Goal | undefined> {
    const [updatedGoal] = await db
      .update(goals)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(goals.id, id))
      .returning();
    return updatedGoal;
  }
  
  async deleteGoal(id: number): Promise<void> {
    await db.delete(goals).where(eq(goals.id, id));
  }
  
  // Goal Milestones methods
  async getGoalMilestone(id: number): Promise<GoalMilestone | undefined> {
    const [milestone] = await db.select().from(goalMilestones).where(eq(goalMilestones.id, id));
    return milestone;
  }
  
  async getMilestonesByGoalId(goalId: number): Promise<GoalMilestone[]> {
    return await db.select().from(goalMilestones).where(eq(goalMilestones.goalId, goalId));
  }
  
  async createGoalMilestone(milestone: InsertGoalMilestone): Promise<GoalMilestone> {
    const [newMilestone] = await db.insert(goalMilestones).values(milestone).returning();
    return newMilestone;
  }
  
  async updateGoalMilestone(id: number, updates: Partial<GoalMilestone>): Promise<GoalMilestone | undefined> {
    const [updatedMilestone] = await db
      .update(goalMilestones)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(goalMilestones.id, id))
      .returning();
    return updatedMilestone;
  }
  
  async deleteGoalMilestone(id: number): Promise<void> {
    await db.delete(goalMilestones).where(eq(goalMilestones.id, id));
  }
  
  // Points Transactions methods
  async getPointsTransaction(id: number): Promise<PointsTransaction | undefined> {
    const [transaction] = await db.select().from(pointsTransactions).where(eq(pointsTransactions.id, id));
    return transaction;
  }
  
  async getPointsTransactionsByUserId(userId: number): Promise<PointsTransaction[]> {
    return await db.select().from(pointsTransactions).where(eq(pointsTransactions.userId, userId));
  }
  
  async getPointsTransactionsByVehicleId(vehicleId: number): Promise<PointsTransaction[]> {
    return await db.select().from(pointsTransactions).where(eq(pointsTransactions.vehicle_id, vehicleId));
  }
  
  async addPointsTransaction(transaction: InsertPointsTransaction): Promise<PointsTransaction> {
    // Add the transaction
    const [newTransaction] = await db.insert(pointsTransactions).values(transaction).returning();
    
    // Update user's point balance
    await db.transaction(async (tx) => {
      const [user] = await tx
        .select()
        .from(users)
        .where(eq(users.id, transaction.userId));
      
      if (!user) {
        throw new Error(`User ${transaction.userId} not found`);
      }
      
      let newBalance = user.pointsBalance || 0;
      
      if (transaction.type === 'earned' || transaction.type === 'bonus') {
        newBalance += transaction.amount;
      } else if (transaction.type === 'spent' || transaction.type === 'expired') {
        newBalance -= transaction.amount;
      }
      
      await tx
        .update(users)
        .set({ pointsBalance: newBalance })
        .where(eq(users.id, transaction.userId));
    });
    
    return newTransaction;
  }
}

export const storage = new DatabaseStorage();
