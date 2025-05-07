import {
  pgTable, 
  serial, 
  text, 
  varchar, 
  timestamp, 
  integer, 
  boolean,
  json,
  jsonb,
  index,
  primaryKey,
  uuid,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Authentication Tables
 */

// User table - core user information
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: text("password").notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  fullName: varchar("full_name", { length: 200 }),
  phone: varchar("phone", { length: 20 }),
  profileImage: text("profile_image"),
  bio: text("bio"),
  role: varchar("role", { length: 20 }).notNull().default("user"),
  isEmailVerified: boolean("is_email_verified").default(false),
  emailVerificationToken: text("verification_token"),
  resetToken: text("reset_token"),
  resetTokenExpires: timestamp("reset_token_expires"),
  lastLogin: timestamp("last_login"),
  lastPasswordChange: timestamp("last_password_change"),
  isTwoFactorEnabled: boolean("is_two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),
  twoFactorBackupCodes: json("two_factor_backup_codes").$type<string[]>(),
  securityQuestions: json("security_questions").$type<Record<string, string>>(),
  securityAnswers: json("security_answers").$type<Record<string, string>>(),
  preferences: json("preferences").$type<Record<string, any>>(),
  metadata: json("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Sessions table - for session management
export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// Auth logs table - for tracking auth events
export const authLogs = pgTable("auth_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  action: varchar("action", { length: 50 }).notNull(), // login, logout, register, password_reset, etc.
  status: varchar("status", { length: 20 }).notNull(), // success, failed, etc.
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
  device: text("device"),
  location: text("location"),
  details: json("details").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User relations
export const usersRelations = relations(users, ({ many }) => ({
  authLogs: many(authLogs),
  vehicles: many(vehicles),
  savedLocations: many(savedLocations),
}));

// Auth logs relations
export const authLogsRelations = relations(authLogs, ({ one }) => ({
  user: one(users, {
    fields: [authLogs.userId],
    references: [users.id],
  }),
}));

/**
 * Application Tables
 */

// Vehicles table
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  make: varchar("make", { length: 50 }).notNull(),
  model: varchar("model", { length: 50 }).notNull(),
  year: integer("year").notNull(),
  color: varchar("color", { length: 30 }),
  vin: varchar("vin", { length: 17 }),
  licensePlate: varchar("license_plate", { length: 20 }),
  image: text("image"),
  isPrimary: boolean("is_primary").default(false),
  notes: text("notes"),
  metadata: json("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Vehicle relations
export const vehiclesRelations = relations(vehicles, ({ one }) => ({
  user: one(users, {
    fields: [vehicles.userId],
    references: [users.id],
  }),
}));

// Saved locations table
export const savedLocations = pgTable("saved_locations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  address: text("address").notNull(),
  latitude: varchar("latitude", { length: 20 }).notNull(),
  longitude: varchar("longitude", { length: 20 }).notNull(),
  category: varchar("category", { length: 50 }),
  isFavorite: boolean("is_favorite").default(false),
  notes: text("notes"),
  metadata: json("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Saved locations relations
export const savedLocationsRelations = relations(savedLocations, ({ one }) => ({
  user: one(users, {
    fields: [savedLocations.userId],
    references: [users.id],
  }),
}));

/**
 * Types and Schemas
 */

// Types for database records
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type AuthLog = typeof authLogs.$inferSelect;
export type InsertAuthLog = typeof authLogs.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;
export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = typeof vehicles.$inferInsert;
export type SavedLocation = typeof savedLocations.$inferSelect;
export type InsertSavedLocation = typeof savedLocations.$inferInsert;

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertVehicleSchema = createInsertSchema(vehicles, {
  name: z.string().min(1, "Name is required"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertSavedLocationSchema = createInsertSchema(savedLocations, {
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  latitude: z.string().min(1, "Latitude is required"),
  longitude: z.string().min(1, "Longitude is required"),
}).omit({ id: true, createdAt: true, updatedAt: true });

// Export Zod schemas
export const schemas = {
  insertUser: insertUserSchema,
  insertVehicle: insertVehicleSchema,
  insertSavedLocation: insertSavedLocationSchema,
};