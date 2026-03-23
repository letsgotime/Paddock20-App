import { pgTable, text, varchar, integer, timestamp, jsonb, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: integer("id").primaryKey().notNull(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Vehicles table
export const vehicles = pgTable("vehicles", {
  id: integer("id").primaryKey().notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  make: varchar("make", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: integer("year").notNull(),
  color: varchar("color", { length: 50 }),
  specs: jsonb("specs"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Drive entries table
export const driveEntries = pgTable("drive_entries", {
  id: integer("id").primaryKey().notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
  date: timestamp("date").defaultNow().notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  startLocation: varchar("start_location", { length: 255 }).notNull(),
  endLocation: varchar("end_location", { length: 255 }).notNull(),
  waypoints: text("waypoints").array(),
  distanceMiles: real("distance_miles").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  weatherConditions: jsonb("weather_conditions"),
  routeCustomizations: jsonb("route_customizations"),
  performanceSettings: jsonb("performance_settings").notNull(),
  pointsOfInterest: jsonb("points_of_interest"),
  notes: text("notes"),
  photos: text("photos").array(),
  rating: integer("rating"),
  isFromRoutePlanner: boolean("is_from_route_planner").default(false),
  moodEnergy: jsonb("mood_energy"),
  altitudeData: jsonb("altitude_data"),
  routeCharacteristics: jsonb("route_characteristics"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Types inferred from tables
export type User = typeof users.$inferSelect;
export type Vehicle = typeof vehicles.$inferSelect;
export type DriveEntry = typeof driveEntries.$inferSelect;

// Insert schema types
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVehicleSchema = createInsertSchema(vehicles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDriveEntrySchema = createInsertSchema(driveEntries).omit({ id: true, createdAt: true, updatedAt: true });

// Inferred insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type InsertDriveEntry = z.infer<typeof insertDriveEntrySchema>;