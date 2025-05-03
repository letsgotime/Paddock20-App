CREATE TYPE "public"."user_role" AS ENUM('user', 'admin', 'premium');--> statement-breakpoint
CREATE TABLE "auth_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"action" varchar(50) NOT NULL,
	"ip_address" varchar(45),
	"user_agent" varchar(255),
	"status" varchar(50) NOT NULL,
	"details" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gloss_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"gloss_tracking_id" integer NOT NULL,
	"log_date" timestamp DEFAULT now() NOT NULL,
	"product_used" varchar(100),
	"process_type" varchar(50),
	"before_images" jsonb DEFAULT '[]'::jsonb,
	"after_images" jsonb DEFAULT '[]'::jsonb,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "gloss_tracking" (
	"id" serial PRIMARY KEY NOT NULL,
	"vehicle_id" integer NOT NULL,
	"current_product" varchar(100),
	"applied_date" timestamp,
	"next_wax_date" timestamp,
	"protection_level" integer,
	"gloss_level" integer,
	"beading_rating" integer,
	"notes" text,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "maintenance_flags" (
	"id" serial PRIMARY KEY NOT NULL,
	"vehicle_id" integer NOT NULL,
	"flag_type" varchar(50) NOT NULL,
	"due_date" timestamp,
	"due_mileage" integer,
	"is_due" boolean DEFAULT false,
	"is_urgent" boolean DEFAULT false,
	"notes" text,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "maintenance_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"vehicle_id" integer NOT NULL,
	"service_type" varchar(100) NOT NULL,
	"service_date" timestamp NOT NULL,
	"mileage" integer,
	"service_cost" real,
	"service_provider" varchar(100),
	"notes" text,
	"receipts" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "modifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"vehicle_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" varchar(50) NOT NULL,
	"description" text,
	"brand" varchar(100),
	"model" varchar(100),
	"part_number" varchar(50),
	"installation_date" timestamp,
	"installation_location" varchar(100),
	"cost" real,
	"installer" varchar(100),
	"warranty_expires" timestamp,
	"status" varchar(30) DEFAULT 'Installed',
	"affected_systems" jsonb DEFAULT '[]'::jsonb,
	"image_url" varchar(255),
	"link_url" varchar(255),
	"link_label" varchar(100),
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "saved_locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"state" varchar(100),
	"country" varchar(100) NOT NULL,
	"lat" real NOT NULL,
	"lon" real NOT NULL,
	"is_primary" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"last_accessed" timestamp,
	"notes" text,
	"custom_name" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp NOT NULL,
	"user_agent" varchar(255),
	"ip_address" varchar(45),
	"last_active" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tires" (
	"id" serial PRIMARY KEY NOT NULL,
	"vehicle_id" integer NOT NULL,
	"brand" varchar(50),
	"model" varchar(50),
	"type" varchar(30),
	"front_size" varchar(20),
	"rear_size" varchar(20),
	"install_date" timestamp,
	"recommended_pressure_front" real,
	"recommended_pressure_rear" real,
	"current_pressure_front" real,
	"current_pressure_rear" real,
	"pressure_unit" varchar(5) DEFAULT 'psi',
	"mileage" integer,
	"notes" text,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"password" varchar(255) NOT NULL,
	"email" varchar(100) NOT NULL,
	"first_name" varchar(50),
	"last_name" varchar(50),
	"full_name" varchar(100),
	"preferred_unit" varchar(10) DEFAULT 'imperial',
	"profile_image" varchar(255),
	"driving_experience" varchar(50),
	"interests" jsonb DEFAULT '[]'::jsonb,
	"bio" text,
	"role" "user_role" DEFAULT 'user',
	"is_active" boolean DEFAULT true,
	"last_login" timestamp,
	"reset_token" varchar(255),
	"reset_token_expires" timestamp,
	"verification_token" varchar(255),
	"is_email_verified" boolean DEFAULT false,
	"stripe_customer_id" varchar(255),
	"stripe_subscription_id" varchar(255),
	"onboarding_completed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"make" varchar(50) NOT NULL,
	"model" varchar(50) NOT NULL,
	"year" integer NOT NULL,
	"trim" varchar(50),
	"color" varchar(30),
	"vin" varchar(17),
	"vin_last_6" varchar(6),
	"nickname" varchar(50),
	"engine" varchar(50),
	"transmission" varchar(50),
	"mileage" integer,
	"status" varchar(30) DEFAULT 'Ready',
	"gloss_index" integer DEFAULT 85,
	"license_plate" varchar(20),
	"purchase_date" timestamp,
	"insurance_renewal" timestamp,
	"registration_renewal" timestamp,
	"image_url" varchar(255),
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "auth_logs" ADD CONSTRAINT "auth_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gloss_logs" ADD CONSTRAINT "gloss_logs_gloss_tracking_id_gloss_tracking_id_fk" FOREIGN KEY ("gloss_tracking_id") REFERENCES "public"."gloss_tracking"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gloss_tracking" ADD CONSTRAINT "gloss_tracking_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_flags" ADD CONSTRAINT "maintenance_flags_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_records" ADD CONSTRAINT "maintenance_records_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modifications" ADD CONSTRAINT "modifications_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_locations" ADD CONSTRAINT "saved_locations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tires" ADD CONSTRAINT "tires_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "auth_logs_user_id_idx" ON "auth_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "auth_logs_action_idx" ON "auth_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "auth_logs_created_at_idx" ON "auth_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_expires_at_idx" ON "sessions" USING btree ("expires_at");