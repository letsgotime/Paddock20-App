-- Supabase Row-Level Security Policies for Auth0 Integration
-- -------------------------------------------------------------
-- This file contains SQL statements to set up Row-Level Security policies
-- for Supabase tables to work with Auth0 user IDs.
--
-- How to use:
-- 1. Run these statements in the Supabase SQL Editor
-- 2. Ensure the Auth0 user ID (sub claim) is used as the user_id in all tables
-- 3. Test access using the Auth0UserBadge component
--
-- Note: These policies assume each table has a user_id column that matches 
-- the Auth0 user.sub value provided by the JWT

-- Enable Row Level Security on all tables
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tire_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE detail_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE drive_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_snapshots ENABLE ROW LEVEL SECURITY;

-- Create policies for the vehicles table
CREATE POLICY "Users can view their own vehicles"
  ON vehicles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vehicles"
  ON vehicles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vehicles"
  ON vehicles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vehicles"
  ON vehicles
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for the maintenance_logs table
CREATE POLICY "Users can view their own maintenance logs"
  ON maintenance_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own maintenance logs"
  ON maintenance_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own maintenance logs"
  ON maintenance_logs
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own maintenance logs"
  ON maintenance_logs
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for the modifications table
CREATE POLICY "Users can view their own modifications"
  ON modifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own modifications"
  ON modifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own modifications"
  ON modifications
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own modifications"
  ON modifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for the tire_tracking table
CREATE POLICY "Users can view their own tire tracking"
  ON tire_tracking
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tire tracking"
  ON tire_tracking
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tire tracking"
  ON tire_tracking
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tire tracking"
  ON tire_tracking
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for the detail_sessions table
CREATE POLICY "Users can view their own detail sessions"
  ON detail_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own detail sessions"
  ON detail_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own detail sessions"
  ON detail_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own detail sessions"
  ON detail_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for the projects table
CREATE POLICY "Users can view their own projects"
  ON projects
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects"
  ON projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for the drive_journal table
CREATE POLICY "Users can view their own drive journal entries"
  ON drive_journal
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own drive journal entries"
  ON drive_journal
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own drive journal entries"
  ON drive_journal
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own drive journal entries"
  ON drive_journal
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for the weather_snapshots table
CREATE POLICY "Users can view their own weather snapshots"
  ON weather_snapshots
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weather snapshots"
  ON weather_snapshots
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weather snapshots"
  ON weather_snapshots
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weather snapshots"
  ON weather_snapshots
  FOR DELETE
  USING (auth.uid() = user_id);

-- Additional Helper Functions for Auth0 JWT Management
-- -------------------------------------------------------------

-- Function to get the authenticated user's ID from the JWT
CREATE OR REPLACE FUNCTION get_auth0_user_id()
RETURNS TEXT AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a row belongs to the authenticated user
CREATE OR REPLACE FUNCTION belongs_to_authenticated_user(user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;