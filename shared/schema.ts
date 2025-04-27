import { pgTable, text, serial, integer, boolean, numeric, timestamp, json, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Location table for storing saved locations
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  lat: numeric("lat").notNull(),
  lon: numeric("lon").notNull(),
  userId: integer("user_id").notNull(),
});

export const insertLocationSchema = createInsertSchema(locations).pick({
  name: true,
  lat: true,
  lon: true,
  userId: true,
});

export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = {
  id: string;
  name: string;
  lat: number;
  lon: number;
};

// User table from existing schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Weather data types
export interface WeatherData {
  coord: {
    lon: number;
    lat: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  rain?: {
    '1h'?: number;
    '3h'?: number;
  };
  snow?: {
    '1h'?: number;
    '3h'?: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    type?: number;
    id?: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export interface ForecastData {
  cod: string;
  message: number;
  cnt: number;
  list: Array<{
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      sea_level: number;
      grnd_level: number;
      humidity: number;
      temp_kf: number;
    };
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    clouds: {
      all: number;
    };
    wind: {
      speed: number;
      deg: number;
      gust: number;
    };
    visibility: number;
    pop: number;
    rain?: {
      '3h': number;
    };
    snow?: {
      '3h': number;
    };
    sys: {
      pod: string;
    };
    dt_txt: string;
  }>;
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

// Vehicle Management Database Schema

// Vehicles table
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: text("year").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  user: one(users, {
    fields: [vehicles.userId],
    references: [users.id],
  }),
  tires: many(tires),
  maintenance: one(maintenanceRecords),
  maintenanceFlags: one(maintenanceFlags),
  glossTracking: one(glossTrackings),
}));

// Tires table
export const tires = pgTable("tires", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  mileageLifeTarget: integer("mileage_life_target").notNull(),
  currentMileage: integer("current_mileage").notNull(),
  purchaseDate: timestamp("purchase_date").notNull(),
  lastTreadDepthCheck: timestamp("last_tread_depth_check").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tiresRelations = relations(tires, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [tires.vehicleId],
    references: [vehicles.id],
  }),
}));

// Maintenance Records table
export const maintenanceRecords = pgTable("maintenance_records", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull(),
  lastOilChange: timestamp("last_oil_change"),
  lastAirFilterChange: timestamp("last_air_filter_change"),
  lastCabinFilterChange: timestamp("last_cabin_filter_change"),
  lastCoolantFlush: timestamp("last_coolant_flush"),
  lastBrakeFluidChange: timestamp("last_brake_fluid_change"),
  lastTransmissionService: timestamp("last_transmission_service"),
  lastQuarterlyReset: timestamp("last_quarterly_reset"),
  lastMonthlyMaintenance: timestamp("last_monthly_maintenance"),
  lastWeeklyQuickCheck: timestamp("last_weekly_quick_check"),
  lastPreDriveCheck: timestamp("last_pre_drive_check"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const maintenanceRecordsRelations = relations(maintenanceRecords, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [maintenanceRecords.vehicleId],
    references: [vehicles.id],
  }),
}));

// Maintenance Flags table
export const maintenanceFlags = pgTable("maintenance_flags", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull(),
  missedWeekly: boolean("missed_weekly").default(false).notNull(),
  missedMonthly: boolean("missed_monthly").default(false).notNull(),
  missedQuarterly: boolean("missed_quarterly").default(false).notNull(),
  missedSeasonal: boolean("missed_seasonal").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const maintenanceFlagsRelations = relations(maintenanceFlags, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [maintenanceFlags.vehicleId],
    references: [vehicles.id],
  }),
}));

// Gloss Tracking table
export const glossTrackings = pgTable("gloss_trackings", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull(),
  lastGlossBoost: timestamp("last_gloss_boost"),
  lastFullDecon: timestamp("last_full_decon"),
  lastSealantRefresh: timestamp("last_sealant_refresh"),
  lastPaintCorrection: timestamp("last_paint_correction"),
  lastCeramicTopCoat: timestamp("last_ceramic_top_coat"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const glossTrackingsRelations = relations(glossTrackings, ({ one, many }) => ({
  vehicle: one(vehicles, {
    fields: [glossTrackings.vehicleId],
    references: [vehicles.id],
  }),
  glossLogs: many(glossLogs),
}));

// Gloss Logs table for tracking individual gloss treatments
export const glossLogs = pgTable("gloss_logs", {
  id: serial("id").primaryKey(),
  glossTrackingId: integer("gloss_tracking_id").notNull(),
  date: timestamp("date").notNull(),
  action: text("action").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const glossLogsRelations = relations(glossLogs, ({ one }) => ({
  glossTracking: one(glossTrackings, {
    fields: [glossLogs.glossTrackingId],
    references: [glossTrackings.id],
  }),
}));

// Insert Schemas
export const insertVehicleSchema = createInsertSchema(vehicles).pick({
  userId: true,
  make: true,
  model: true,
  year: true,
});

export const insertTireSchema = createInsertSchema(tires).pick({
  vehicleId: true,
  brand: true,
  model: true,
  mileageLifeTarget: true,
  currentMileage: true,
  purchaseDate: true,
  lastTreadDepthCheck: true,
});

export const insertMaintenanceRecordSchema = createInsertSchema(maintenanceRecords).pick({
  vehicleId: true,
  lastOilChange: true,
  lastAirFilterChange: true,
  lastCabinFilterChange: true,
  lastCoolantFlush: true,
  lastBrakeFluidChange: true,
  lastTransmissionService: true,
  lastQuarterlyReset: true,
  lastMonthlyMaintenance: true,
  lastWeeklyQuickCheck: true,
  lastPreDriveCheck: true,
});

export const insertMaintenanceFlagSchema = createInsertSchema(maintenanceFlags).pick({
  vehicleId: true,
  missedWeekly: true,
  missedMonthly: true,
  missedQuarterly: true,
  missedSeasonal: true,
});

export const insertGlossTrackingSchema = createInsertSchema(glossTrackings).pick({
  vehicleId: true,
  lastGlossBoost: true,
  lastFullDecon: true,
  lastSealantRefresh: true,
  lastPaintCorrection: true,
  lastCeramicTopCoat: true,
});

export const insertGlossLogSchema = createInsertSchema(glossLogs).pick({
  glossTrackingId: true,
  date: true,
  action: true,
  notes: true,
});

// Types for insert operations
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type InsertTire = z.infer<typeof insertTireSchema>;
export type InsertMaintenanceRecord = z.infer<typeof insertMaintenanceRecordSchema>;
export type InsertMaintenanceFlag = z.infer<typeof insertMaintenanceFlagSchema>;
export type InsertGlossTracking = z.infer<typeof insertGlossTrackingSchema>;
export type InsertGlossLog = z.infer<typeof insertGlossLogSchema>;

// Types for select operations
export type Vehicle = typeof vehicles.$inferSelect;
export type Tire = typeof tires.$inferSelect;
export type MaintenanceRecord = typeof maintenanceRecords.$inferSelect;
export type MaintenanceFlag = typeof maintenanceFlags.$inferSelect;
export type GlossTracking = typeof glossTrackings.$inferSelect;
export type GlossLog = typeof glossLogs.$inferSelect;
