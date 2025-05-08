import { pgTable, serial, text, timestamp, varchar, integer, boolean, pgEnum, real, jsonb, index } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { relations } from 'drizzle-orm';

// Authentication roles enum
export const userRoleEnum = pgEnum('user_role', ['user', 'admin', 'premium']);

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  firstName: varchar('first_name', { length: 50 }),
  lastName: varchar('last_name', { length: 50 }),
  fullName: varchar('full_name', { length: 100 }),
  preferredUnit: varchar('preferred_unit', { length: 10 }).default('imperial'), // metric or imperial
  profileImage: varchar('profile_image', { length: 255 }),
  drivingExperience: varchar('driving_experience', { length: 50 }),
  interests: jsonb('interests').default([]),
  bio: text('bio'),
  role: userRoleEnum('role').default('user'),
  isActive: boolean('is_active').default(true),
  lastLogin: timestamp('last_login'),
  resetToken: varchar('reset_token', { length: 255 }),
  resetTokenExpires: timestamp('reset_token_expires'),
  verificationToken: varchar('verification_token', { length: 255 }),
  isEmailVerified: boolean('is_email_verified').default(false),
  twoFactorSecret: varchar('two_factor_secret', { length: 255 }),
  twoFactorEnabled: boolean('two_factor_enabled').default(false),
  twoFactorBackupCodes: jsonb('two_factor_backup_codes').default([]),
  securityQuestions: jsonb('security_questions').default([]),
  securityAnswers: jsonb('security_answers').default([]),
  lastPasswordChange: timestamp('last_password_change'),
  accountLocked: boolean('account_locked').default(false),
  lockedUntil: timestamp('locked_until'),
  failedLoginAttempts: integer('failed_login_attempts').default(0),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  metadata: jsonb('metadata'), // For storing arbitrary data like Smartcar tokens
  onboardingStatus: jsonb('onboarding_status'),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define user relations for better type safety and querying
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  savedLocations: many(savedLocations),
  vehicles: many(vehicles),
}));

// Sessions table for persistent authentication
export const sessions = pgTable('sessions', {
  id: varchar('id', { length: 255 }).primaryKey(), // Session ID will be a UUID
  userId: integer('user_id').notNull().references(() => users.id),
  expiresAt: timestamp('expires_at').notNull(),
  userAgent: varchar('user_agent', { length: 255 }),
  ipAddress: varchar('ip_address', { length: 45 }),
  lastActive: timestamp('last_active').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    userIdIdx: index('session_user_id_idx').on(table.userId),
    expiresAtIdx: index('session_expires_at_idx').on(table.expiresAt),
  };
});

// Define session relations
export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// Audit logs for authentication events
export const authLogs = pgTable('auth_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  action: varchar('action', { length: 50 }).notNull(), // 'login', 'logout', 'register', 'password_reset', etc.
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: varchar('user_agent', { length: 255 }),
  status: varchar('status', { length: 50 }).notNull(), // 'success', 'failed', etc.
  details: jsonb('details').default({}),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    userIdIdx: index('auth_logs_user_id_idx').on(table.userId),
    actionIdx: index('auth_logs_action_idx').on(table.action),
    createdAtIdx: index('auth_logs_created_at_idx').on(table.createdAt),
  };
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
  smartcar_vehicle_id: varchar('smartcar_vehicle_id', { length: 100 }),
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
  // The following fields reflect the actual database structure
  missedWeekly: boolean('missed_weekly').default(false),
  missedMonthly: boolean('missed_monthly').default(false),
  missedQuarterly: boolean('missed_quarterly').default(false),
  missedSeasonal: boolean('missed_seasonal').default(false),
  createdAt: timestamp('created_at').defaultNow(),
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
export const insertUserSchema = createInsertSchema(users)
  .omit({ 
    id: true, 
    createdAt: true, 
    updatedAt: true, 
    lastLogin: true,
    resetToken: true, 
    resetTokenExpires: true,
    verificationToken: true,
    role: true,
    stripeCustomerId: true,
    stripeSubscriptionId: true,
    twoFactorSecret: true,
    twoFactorEnabled: true,
    twoFactorBackupCodes: true,
    securityQuestions: true,
    securityAnswers: true,
    lastPasswordChange: true,
    accountLocked: true,
    lockedUntil: true,
    failedLoginAttempts: true
  })
  .extend({
    email: z.string().email("Please enter a valid email address"),
    password: z.string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    interests: z.array(z.string()).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const insertSessionSchema = createInsertSchema(sessions)
  .omit({ 
    createdAt: true, 
    lastActive: true 
  });

export const insertAuthLogSchema = createInsertSchema(authLogs)
  .omit({ 
    id: true, 
    createdAt: true 
  });

export const insertSavedLocationSchema = createInsertSchema(savedLocations).omit({ id: true, createdAt: true, lastAccessed: true });
export const insertVehicleSchema = createInsertSchema(vehicles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTireSchema = createInsertSchema(tires).omit({ id: true, updatedAt: true });
export const insertMaintenanceRecordSchema = createInsertSchema(maintenanceRecords).omit({ id: true, createdAt: true });
export const insertMaintenanceFlagSchema = createInsertSchema(maintenanceFlags).omit({ id: true, updatedAt: true });
export const insertGlossTrackingSchema = createInsertSchema(glossTracking).omit({ id: true, updatedAt: true });
export const insertGlossLogSchema = createInsertSchema(glossLogs).omit({ id: true });
export const insertModificationSchema = createInsertSchema(modifications).omit({ id: true, createdAt: true, updatedAt: true });

// Types
// Define the structure of onboardingStatus for better type checking
export type OnboardingStatus = {
  hasAcceptedBeta?: boolean;
  hasCompletedOnboarding?: boolean;
  currentStep?: string;
  nextStep?: string;
  
  betaWelcomeCompleted?: boolean;
  legalAgreementsCompleted?: boolean;
  profileSetupCompleted?: boolean;
  vehicleAdditionCompleted?: boolean;
  
  onboardingStartedAt?: string | null;
  onboardingCompletedAt?: string | null;
  
  beta?: {
    role?: string;
    entryDate?: string;
  };
};

export type User = typeof users.$inferSelect & {
  onboardingStatus?: string | OnboardingStatus;
};
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

export type AuthLog = typeof authLogs.$inferSelect;
export type InsertAuthLog = z.infer<typeof insertAuthLogSchema>;

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