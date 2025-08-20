/*
  # Create Time Entries and Exceptions Tables

  1. New Tables
    - `time_entries`
      - `id` (uuid, primary key)
      - `crew_id` (uuid, foreign key to crews)
      - `member_id` (uuid, foreign key to crew_members)
      - `date` (date)
      - `start_time` (time)
      - `end_time` (time)
      - `work_package_id` (text, nullable)
      - `hours_regular` (decimal)
      - `hours_overtime` (decimal)
      - `status` (text, enum)
      - `comments` (text, nullable)
      - `gps_locations` (jsonb array)
      - `submitted_by` (uuid, foreign key to users)
      - `submitted_at` (timestamp, nullable)
      - `location` (text)
      - `work_description` (text)
      - `created_at` (timestamp)
    - `exceptions`
      - `id` (uuid, primary key)
      - `time_entry_id` (uuid, foreign key to time_entries)
      - `flagged_by` (text)
      - `reason` (text)
      - `description` (text)
      - `status` (text, enum)
      - `admin_notes` (text, nullable)
      - `resolved_by` (uuid, foreign key to users, nullable)
      - `resolved_at` (timestamp, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for company-based data isolation
*/

-- Create time_entries table
CREATE TABLE IF NOT EXISTS time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id uuid NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES crew_members(id) ON DELETE CASCADE,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  work_package_id text,
  hours_regular decimal(5,2) DEFAULT 0,
  hours_overtime decimal(5,2) DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  comments text,
  gps_locations jsonb DEFAULT '[]'::jsonb,
  submitted_by uuid REFERENCES users(id),
  submitted_at timestamptz,
  location text NOT NULL DEFAULT '',
  work_description text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create exceptions table
CREATE TABLE IF NOT EXISTS exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  time_entry_id uuid NOT NULL REFERENCES time_entries(id) ON DELETE CASCADE,
  flagged_by text NOT NULL,
  reason text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'accepted', 'rejected')),
  admin_notes text,
  resolved_by uuid REFERENCES users(id),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE exceptions ENABLE ROW LEVEL SECURITY;

-- Time entries policies
CREATE POLICY "Users can read time entries from same company"
  ON time_entries
  FOR SELECT
  TO authenticated
  USING (
    crew_id IN (
      SELECT crews.id FROM crews
      JOIN users ON users.company_id = crews.company_id
      WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own time entries"
  ON time_entries
  FOR ALL
  TO authenticated
  USING (
    submitted_by = auth.uid()
    OR crew_id IN (
      SELECT crews.id FROM crews
      JOIN users ON users.company_id = crews.company_id
      WHERE users.id = auth.uid() 
      AND users.role IN ('SuperAdmin', 'Admin')
    )
  );

-- Exceptions policies
CREATE POLICY "Users can read exceptions from same company"
  ON exceptions
  FOR SELECT
  TO authenticated
  USING (
    time_entry_id IN (
      SELECT time_entries.id FROM time_entries
      JOIN crews ON crews.id = time_entries.crew_id
      JOIN users ON users.company_id = crews.company_id
      WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage exceptions in same company"
  ON exceptions
  FOR ALL
  TO authenticated
  USING (
    time_entry_id IN (
      SELECT time_entries.id FROM time_entries
      JOIN crews ON crews.id = time_entries.crew_id
      JOIN users ON users.company_id = crews.company_id
      WHERE users.id = auth.uid() 
      AND users.role IN ('SuperAdmin', 'Admin')
    )
  );