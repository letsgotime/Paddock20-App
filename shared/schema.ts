import { pgTable, serial, varchar, integer, boolean, timestamp, text, real, pgEnum, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  password: varchar('password', { length: 100 }).notNull(),
  firstName: varchar('first_name', { length: 50 }),
  lastName: varchar('last_name', { length: 50 }),
  profilePic: varchar('profile_pic', { length: 255 }),
  isPaddock20Member: boolean('is_paddock20_member').default(false),
  membershipLevel: varchar('membership_level', { length: 20 }),
  pointsBalance: integer('points_balance').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
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
  purchase_price: real('purchase_price'),
  current_value: real('current_value'),
  insurance_renewal: timestamp('insurance_renewal'),
  registration_renewal: timestamp('registration_renewal'),
  imageUrl: varchar('image_url', { length: 255 }),
  deliveryPhotoUrl: varchar('delivery_photo_url', { length: 255 }),
  notes: text('notes'),
  horsepower: integer('horsepower'),
  torque: integer('torque'),
  weight: integer('weight'),
  acceleration: real('acceleration'), // 0-60 time
  topSpeed: integer('top_speed'),
  fuelEfficiency: real('fuel_efficiency'),
  drivetrain: varchar('drivetrain', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Vehicle Modifications table
export const modifications = pgTable('modifications', {
  id: serial('id').primaryKey(),
  vehicleId: integer('vehicle_id').references(() => vehicles.id).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(), // e.g., "Performance", "Cosmetic", "Functional"
  subcategory: varchar('subcategory', { length: 50 }),
  description: text('description'),
  brand: varchar('brand', { length: 50 }),
  model: varchar('model', { length: 50 }),
  partNumber: varchar('part_number', { length: 50 }),
  installDate: timestamp('install_date'),
  installLocation: varchar('install_location', { length: 100 }),
  installedBy: varchar('installed_by', { length: 100 }),
  cost: real('cost'),
  warrantyExpires: timestamp('warranty_expires'),
  status: varchar('status', { length: 20 }).default('Installed'), // 'Planned', 'In Progress', 'Installed', 'Removed'
  affectedSystems: text('affected_systems').array(),
  imageUrl: varchar('image_url', { length: 255 }),
  beforePhotos: text('before_photos').array(),
  afterPhotos: text('after_photos').array(),
  receiptUrl: varchar('receipt_url', { length: 255 }),
  linkUrl: varchar('link_url', { length: 255 }),
  linkLabel: varchar('link_label', { length: 50 }),
  impact: jsonb('impact').default({}), // horsepower, torque, weight, handling, aesthetics, acceleration changes
  notes: text('notes'),
  pointsEarned: integer('points_earned').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Maintenance Records table
export const maintenanceRecords = pgTable('maintenance_records', {
  id: serial('id').primaryKey(),
  vehicleId: integer('vehicle_id').references(() => vehicles.id).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // e.g., "Oil Change", "Tire Rotation", "Brake Service"
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description'),
  performedBy: varchar('performed_by', { length: 100 }),
  date: timestamp('date').notNull(),
  mileage: integer('mileage').notNull(),
  cost: real('cost'),
  parts: text('parts').array(),
  status: varchar('status', { length: 20 }).default('Completed'), // 'Scheduled', 'Completed', 'Postponed'
  imageUrl: varchar('image_url', { length: 255 }),
  beforePhotos: text('before_photos').array(),
  afterPhotos: text('after_photos').array(),
  receiptUrl: varchar('receipt_url', { length: 255 }),
  nextDueDate: timestamp('next_due_date'),
  nextDueMileage: integer('next_due_mileage'),
  notes: text('notes'),
  torqueSettings: jsonb('torque_settings').default({}),
  oilType: varchar('oil_type', { length: 50 }),
  oilViscosity: varchar('oil_viscosity', { length: 20 }),
  filterType: varchar('filter_type', { length: 50 }),
  pointsEarned: integer('points_earned').default(0),
  isRecurring: boolean('is_recurring').default(false),
  recurringIntervalMonths: integer('recurring_interval_months'),
  recurringIntervalMiles: integer('recurring_interval_miles'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tire Setups table
export const tireSetups = pgTable('tire_setups', {
  id: serial('id').primaryKey(),
  vehicleId: integer('vehicle_id').references(() => vehicles.id).notNull(),
  brand: varchar('brand', { length: 50 }).notNull(),
  model: varchar('model', { length: 50 }).notNull(),
  type: varchar('type', { length: 30 }).notNull(), // e.g., "Summer", "All-Season", "Performance"
  frontSize: varchar('front_size', { length: 30 }).notNull(),
  rearSize: varchar('rear_size', { length: 30 }),
  recommendedPressureFront: real('recommended_pressure_front'),
  recommendedPressureRear: real('recommended_pressure_rear'),
  currentPressureFront: real('current_pressure_front'),
  currentPressureRear: real('current_pressure_rear'),
  treadDepthFront: real('tread_depth_front'),
  treadDepthRear: real('tread_depth_rear'),
  installDate: timestamp('install_date'),
  installMileage: integer('install_mileage'),
  rotationMileage: integer('rotation_mileage'),
  cost: real('cost'),
  purchaseLocation: varchar('purchase_location', { length: 100 }),
  imageUrl: varchar('image_url', { length: 255 }),
  notes: text('notes'),
  isActive: boolean('is_active').default(true),
  dotCode: varchar('dot_code', { length: 20 }),
  warrantyMiles: integer('warranty_miles'),
  speedRating: varchar('speed_rating', { length: 5 }),
  loadRating: varchar('load_rating', { length: 5 }),
  pointsEarned: integer('points_earned').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Detailing Sessions table
export const detailingSessions = pgTable('detailing_sessions', {
  id: serial('id').primaryKey(),
  vehicleId: integer('vehicle_id').references(() => vehicles.id).notNull(),
  date: timestamp('date').notNull(),
  type: varchar('type', { length: 30 }).notNull(), // 'wash', 'wax', 'polish', 'ceramic', 'interior', 'full_detail', etc.
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description'),
  
  // Environmental conditions
  outdoorTemp: real('outdoor_temp'),
  indoorTemp: real('indoor_temp'),
  surfaceTemp: real('surface_temp'),
  humidity: real('humidity'),
  weatherCondition: varchar('weather_condition', { length: 20 }),
  uvIndex: real('uv_index'),
  
  // Process details
  durationMinutes: integer('duration_minutes'),
  usedPressureWasher: boolean('used_pressure_washer').default(false),
  usedFoamCannon: boolean('used_foam_cannon').default(false),
  usedBuckets: integer('used_buckets'),
  waterUsedGallons: real('water_used_gallons'),
  
  // Results tracking
  beforePhotos: text('before_photos').array(),
  afterPhotos: text('after_photos').array(),
  satisfactionRating: integer('satisfaction_rating'), // 1-5
  glossMeterReading: real('gloss_meter_reading'),
  paintThicknessReadings: jsonb('paint_thickness_readings').default([]),
  
  // Notes and documentation
  notes: text('notes'),
  issuesFound: text('issues_found').array(),
  followUpNeeded: text('follow_up_needed'),
  nextScheduledDate: timestamp('next_scheduled_date'),
  
  // Products and tools tracking
  productsUsed: jsonb('products_used').default([]),
  
  // Metadata
  tags: text('tags').array(),
  pointsEarned: integer('points_earned').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Detailing Products table
export const detailingProducts = pgTable('detailing_products', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  brand: varchar('brand', { length: 50 }).notNull(),
  category: varchar('category', { length: 30 }).notNull(), // 'wash', 'wax', 'sealant', 'ceramic', etc.
  size: real('size'),
  sizeUnit: varchar('size_unit', { length: 10 }), // 'oz', 'ml', 'g', 'lb'
  dilutionRatio: varchar('dilution_ratio', { length: 20 }),
  applicationMethod: varchar('application_method', { length: 50 }),
  notes: text('notes'),
  purchaseDate: timestamp('purchase_date'),
  expirationDate: timestamp('expiration_date'),
  inJuiceBox: boolean('in_juice_box').default(false),
  favorite: boolean('favorite').default(false),
  imageUrl: varchar('image_url', { length: 255 }),
  linkUrl: varchar('link_url', { length: 255 }),
  cost: real('cost'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Drive Journal Entries table
export const driveJournalEntries = pgTable('drive_journal_entries', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  vehicleId: integer('vehicle_id').references(() => vehicles.id).notNull(),
  date: timestamp('date').notNull(),
  startLocation: varchar('start_location', { length: 100 }),
  endLocation: varchar('end_location', { length: 100 }),
  startOdometer: integer('start_odometer'),
  endOdometer: integer('end_odometer'),
  distanceMiles: real('distance_miles'),
  durationMinutes: integer('duration_minutes'),
  
  // Driving data
  avgSpeed: real('avg_speed'),
  maxSpeed: real('max_speed'),
  avgRpm: real('avg_rpm'),
  maxRpm: real('max_rpm'),
  fuelUsed: real('fuel_used'),
  avgMpg: real('avg_mpg'),
  
  // Experience data
  title: varchar('title', { length: 100 }),
  description: text('description'),
  route: text('route'),
  moodRating: integer('mood_rating'), // 1-5
  energyLevel: integer('energy_level'), // 1-5
  roadConditions: varchar('road_conditions', { length: 30 }),
  trafficConditions: varchar('traffic_conditions', { length: 30 }),
  weatherConditions: varchar('weather_conditions', { length: 30 }),
  notes: text('notes'),
  
  // Media
  photos: text('photos').array(),
  videos: text('videos').array(),
  audioNotes: text('audio_notes').array(),
  gpxFile: varchar('gpx_file', { length: 255 }),
  
  // Vehicle performance
  vehiclePerformance: integer('vehicle_performance'), // 1-5
  handlingFeedback: text('handling_feedback'),
  brakesFeedback: text('brakes_feedback'),
  accelerationFeedback: text('acceleration_feedback'),
  comfortFeedback: text('comfort_feedback'),
  
  // Points and metadata
  pointsEarned: integer('points_earned').default(0),
  tags: text('tags').array(),
  isPublic: boolean('is_public').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Vehicle Documents table
export const vehicleDocuments = pgTable('vehicle_documents', {
  id: serial('id').primaryKey(),
  vehicleId: integer('vehicle_id').references(() => vehicles.id).notNull(),
  title: varchar('title', { length: 100 }).notNull(),
  type: varchar('type', { length: 30 }).notNull(), // 'manual', 'receipt', 'insurance', 'registration', etc.
  fileUrl: varchar('file_url', { length: 255 }).notNull(),
  thumbnailUrl: varchar('thumbnail_url', { length: 255 }),
  description: text('description'),
  dateAdded: timestamp('date_added').defaultNow(),
  expirationDate: timestamp('expiration_date'),
  tags: text('tags').array(),
  issuedBy: varchar('issued_by', { length: 100 }),
  documentNumber: varchar('document_number', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Goals table (for Manifestation Station)
export const goals = pgTable('goals', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  vehicleId: integer('vehicle_id').references(() => vehicles.id),
  title: varchar('title', { length: 100 }).notNull(),
  category: varchar('category', { length: 30 }).notNull(), // 'acquisition', 'modification', 'achievement', etc.
  description: text('description'),
  targetDate: timestamp('target_date'),
  targetAmount: real('target_amount'), // For financial goals
  targetValue: varchar('target_value', { length: 50 }), // For measurable goals
  currentAmount: real('current_amount'),
  currentValue: varchar('current_value', { length: 50 }),
  progress: integer('progress').default(0), // 0-100
  status: varchar('status', { length: 20 }).default('not_started'), // 'not_started', 'in_progress', 'on_hold', 'completed', 'abandoned'
  priority: varchar('priority', { length: 10 }).default('medium'), // 'low', 'medium', 'high'
  visualizationImage: varchar('visualization_image', { length: 255 }),
  notes: text('notes'),
  tags: text('tags').array(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Goal Milestones table
export const goalMilestones = pgTable('goal_milestones', {
  id: serial('id').primaryKey(),
  goalId: integer('goal_id').references(() => goals.id).notNull(),
  title: varchar('title', { length: 100 }).notNull(),
  completed: boolean('completed').default(false),
  dueDate: timestamp('due_date'),
  completedDate: timestamp('completed_date'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Points Transactions table
export const pointsTransactions = pgTable('points_transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  amount: integer('amount').notNull(),
  type: varchar('type', { length: 30 }).notNull(), // 'earned', 'spent', 'expired', 'bonus'
  source: varchar('source', { length: 50 }).notNull(), // 'detailing', 'maintenance', 'modification', 'drive_journal', etc.
  sourceId: integer('source_id'), // ID from the source table
  description: text('description'),
  date: timestamp('date').defaultNow(),
  vehicle_id: integer('vehicle_id').references(() => vehicles.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// Schemas for inserting data
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVehicleSchema = createInsertSchema(vehicles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertModificationSchema = createInsertSchema(modifications).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMaintenanceRecordSchema = createInsertSchema(maintenanceRecords).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTireSetupSchema = createInsertSchema(tireSetups).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDetailingSessionSchema = createInsertSchema(detailingSessions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDetailingProductSchema = createInsertSchema(detailingProducts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDriveJournalEntrySchema = createInsertSchema(driveJournalEntries).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVehicleDocumentSchema = createInsertSchema(vehicleDocuments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertGoalSchema = createInsertSchema(goals).omit({ id: true, createdAt: true, updatedAt: true });
export const insertGoalMilestoneSchema = createInsertSchema(goalMilestones).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPointsTransactionSchema = createInsertSchema(pointsTransactions).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;

export type Modification = typeof modifications.$inferSelect;
export type InsertModification = z.infer<typeof insertModificationSchema>;

export type MaintenanceRecord = typeof maintenanceRecords.$inferSelect;
export type InsertMaintenanceRecord = z.infer<typeof insertMaintenanceRecordSchema>;

export type TireSetup = typeof tireSetups.$inferSelect;
export type InsertTireSetup = z.infer<typeof insertTireSetupSchema>;

export type DetailingSession = typeof detailingSessions.$inferSelect;
export type InsertDetailingSession = z.infer<typeof insertDetailingSessionSchema>;

export type DetailingProduct = typeof detailingProducts.$inferSelect;
export type InsertDetailingProduct = z.infer<typeof insertDetailingProductSchema>;

export type DriveJournalEntry = typeof driveJournalEntries.$inferSelect;
export type InsertDriveJournalEntry = z.infer<typeof insertDriveJournalEntrySchema>;

export type VehicleDocument = typeof vehicleDocuments.$inferSelect;
export type InsertVehicleDocument = z.infer<typeof insertVehicleDocumentSchema>;

export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;

export type GoalMilestone = typeof goalMilestones.$inferSelect;
export type InsertGoalMilestone = z.infer<typeof insertGoalMilestoneSchema>;

export type PointsTransaction = typeof pointsTransactions.$inferSelect;
export type InsertPointsTransaction = z.infer<typeof insertPointsTransactionSchema>;