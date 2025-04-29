import { pgTable, serial, text, timestamp, varchar, integer, boolean, pgEnum, real, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  email: varchar('email', { length: 100 }),
  firstName: varchar('first_name', { length: 50 }),
  lastName: varchar('last_name', { length: 50 }),
  preferredUnit: varchar('preferred_unit', { length: 10 }).default('metric'), // metric or imperial
  createdAt: timestamp('created_at').defaultNow(),
});

// Saved Locations table
export const savedLocations = pgTable('saved_locations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }),
  country: varchar('country', { length: 100 }).notNull(),
  lat: real('lat').notNull(),
  lon: real('lon').notNull(),
  isPrimary: boolean('is_primary').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  lastAccessed: timestamp('last_accessed'),
  notes: text('notes'),
  customName: varchar('custom_name', { length: 100 }),
});

// Vehicles table
export const vehicles = pgTable('vehicles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  make: varchar('make', { length: 50 }).notNull(),
  model: varchar('model', { length: 50 }).notNull(),
  year: integer('year').notNull(),
  trim: varchar('trim', { length: 50 }),
  color: varchar('color', { length: 30 }),
  vin: varchar('vin', { length: 17 }),
  vinLast6: varchar('vin_last_6', { length: 6 }),
  nickname: varchar('nickname', { length: 50 }),
  engine: varchar('engine', { length: 50 }),
  transmission: varchar('transmission', { length: 50 }),
  mileage: integer('mileage'),
  status: varchar('status', { length: 30 }).default('Ready'),
  glossIndex: integer('gloss_index').default(85),
  license_plate: varchar('license_plate', { length: 20 }),
  purchase_date: timestamp('purchase_date'),
  insurance_renewal: timestamp('insurance_renewal'),
  registration_renewal: timestamp('registration_renewal'),
  imageUrl: varchar('image_url', { length: 255 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tire tracking table
export const tires = pgTable('tires', {
  id: serial('id').primaryKey(),
  vehicleId: integer('vehicle_id').references(() => vehicles.id).notNull(),
  brand: varchar('brand', { length: 50 }),
  model: varchar('model', { length: 50 }),
  type: varchar('type', { length: 30 }), // summer, all-season, winter, sport, etc.
  frontSize: varchar('front_size', { length: 20 }),
  rearSize: varchar('rear_size', { length: 20 }),
  installDate: timestamp('install_date'),
  recommendedPressureFront: real('recommended_pressure_front'),
  recommendedPressureRear: real('recommended_pressure_rear'),
  currentPressureFront: real('current_pressure_front'),
  currentPressureRear: real('current_pressure_rear'),
  pressureUnit: varchar('pressure_unit', { length: 5 }).default('psi'),
  mileage: integer('mileage'),
  notes: text('notes'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Maintenance Records table
export const maintenanceRecords = pgTable('maintenance_records', {
  id: serial('id').primaryKey(),
  vehicleId: integer('vehicle_id').references(() => vehicles.id).notNull(),
  serviceType: varchar('service_type', { length: 100 }).notNull(),
  serviceDate: timestamp('service_date').notNull(),
  mileage: integer('mileage'),
  serviceCost: real('service_cost'),
  serviceProvider: varchar('service_provider', { length: 100 }),
  notes: text('notes'),
  receipts: jsonb('receipts').default([]),
  createdAt: timestamp('created_at').defaultNow(),
});

// Maintenance Flags table
export const maintenanceFlags = pgTable('maintenance_flags', {
  id: serial('id').primaryKey(),
  vehicleId: integer('vehicle_id').references(() => vehicles.id).notNull(),
  flagType: varchar('flag_type', { length: 50 }).notNull(), // oil, tires, brakes, etc.
  dueDate: timestamp('due_date'),
  dueMileage: integer('due_mileage'),
  isDue: boolean('is_due').default(false),
  isUrgent: boolean('is_urgent').default(false),
  notes: text('notes'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Gloss Tracking table
export const glossTracking = pgTable('gloss_tracking', {
  id: serial('id').primaryKey(),
  vehicleId: integer('vehicle_id').references(() => vehicles.id).notNull(),
  currentProduct: varchar('current_product', { length: 100 }),
  appliedDate: timestamp('applied_date'),
  nextWaxDate: timestamp('next_wax_date'),
  protectionLevel: integer('protection_level'), // 1-10
  glossLevel: integer('gloss_level'), // 1-10
  beadingRating: integer('beading_rating'), // 1-10
  notes: text('notes'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Gloss Logs table
export const glossLogs = pgTable('gloss_logs', {
  id: serial('id').primaryKey(),
  glossTrackingId: integer('gloss_tracking_id').references(() => glossTracking.id).notNull(),
  logDate: timestamp('log_date').defaultNow().notNull(),
  productUsed: varchar('product_used', { length: 100 }),
  processType: varchar('process_type', { length: 50 }), // wash, decontamination, polish, seal, etc.
  beforeImages: jsonb('before_images').default([]),
  afterImages: jsonb('after_images').default([]),
  notes: text('notes'),
});

// Vehicle Modifications table
export const modifications = pgTable('modifications', {
  id: serial('id').primaryKey(),
  vehicleId: integer('vehicle_id').references(() => vehicles.id).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // Performance, Aesthetic, Wheels & Suspension, etc.
  description: text('description'),
  brand: varchar('brand', { length: 100 }),
  model: varchar('model', { length: 100 }),
  part_number: varchar('part_number', { length: 50 }),
  installation_date: timestamp('installation_date'),
  installation_location: varchar('installation_location', { length: 100 }),
  cost: real('cost'),
  installer: varchar('installer', { length: 100 }),
  warranty_expires: timestamp('warranty_expires'),
  status: varchar('status', { length: 30 }).default('Installed'), // Installed, Planned, In Progress, Removed
  affected_systems: jsonb('affected_systems').default([]),
  image_url: varchar('image_url', { length: 255 }),
  link_url: varchar('link_url', { length: 255 }),
  link_label: varchar('link_label', { length: 100 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Insert Types
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertSavedLocationSchema = createInsertSchema(savedLocations).omit({ id: true, createdAt: true, lastAccessed: true });
export const insertVehicleSchema = createInsertSchema(vehicles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTireSchema = createInsertSchema(tires).omit({ id: true, updatedAt: true });
export const insertMaintenanceRecordSchema = createInsertSchema(maintenanceRecords).omit({ id: true, createdAt: true });
export const insertMaintenanceFlagSchema = createInsertSchema(maintenanceFlags).omit({ id: true, updatedAt: true });
export const insertGlossTrackingSchema = createInsertSchema(glossTracking).omit({ id: true, updatedAt: true });
export const insertGlossLogSchema = createInsertSchema(glossLogs).omit({ id: true });
export const insertModificationSchema = createInsertSchema(modifications).omit({ id: true, createdAt: true, updatedAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type SavedLocation = typeof savedLocations.$inferSelect;
export type InsertSavedLocation = z.infer<typeof insertSavedLocationSchema>;

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;

export type Tire = typeof tires.$inferSelect;
export type InsertTire = z.infer<typeof insertTireSchema>;

export type MaintenanceRecord = typeof maintenanceRecords.$inferSelect;
export type InsertMaintenanceRecord = z.infer<typeof insertMaintenanceRecordSchema>;

export type MaintenanceFlag = typeof maintenanceFlags.$inferSelect;
export type InsertMaintenanceFlag = z.infer<typeof insertMaintenanceFlagSchema>;

export type GlossTracking = typeof glossTracking.$inferSelect;
export type InsertGlossTracking = z.infer<typeof insertGlossTrackingSchema>;

export type GlossLog = typeof glossLogs.$inferSelect;
export type InsertGlossLog = z.infer<typeof insertGlossLogSchema>;