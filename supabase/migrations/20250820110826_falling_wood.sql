/*
  # Create Crews and Members Tables

  1. New Tables
    - `crews`
      - `id` (uuid, primary key)
      - `company_id` (uuid, foreign key to companies)
      - `utility_contract_id` (uuid, foreign key to utility_contracts)
      - `crew_name` (text)
      - `supervisor_id` (uuid, foreign key to users)
      - `active` (boolean)
      - `equipment_assigned` (jsonb array)
      - `created_at` (timestamp)
    - `crew_members`
      - `id` (uuid, primary key)
      - `crew_id` (uuid, foreign key to crews)
      - `name` (text)
      - `role` (text)
      - `hourly_rate` (decimal)
      - `active` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for company-based data isolation
*/

-- Create crews table
CREATE TABLE IF NOT EXISTS crews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  utility_contract_id uuid NOT NULL REFERENCES utility_contracts(id) ON DELETE CASCADE,
  crew_name text NOT NULL,
  supervisor_id uuid REFERENCES users(id),
  active boolean DEFAULT true,
  equipment_assigned jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create crew_members table
CREATE TABLE IF NOT EXISTS crew_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id uuid NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL,
  hourly_rate decimal(10,2) DEFAULT 30.00,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE crews ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_members ENABLE ROW LEVEL SECURITY;

-- Crews policies
CREATE POLICY "Users can read crews from same company"
  ON crews
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users 
      WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage crews in same company"
  ON crews
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('SuperAdmin', 'Admin')
    )
  );

-- Crew members policies
CREATE POLICY "Users can read crew members from same company"
  ON crew_members
  FOR SELECT
  TO authenticated
  USING (
    crew_id IN (
      SELECT crews.id FROM crews
      JOIN users ON users.company_id = crews.company_id
      WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage crew members in same company"
  ON crew_members
  FOR ALL
  TO authenticated
  USING (
    crew_id IN (
      SELECT crews.id FROM crews
      JOIN users ON users.company_id = crews.company_id
      WHERE users.id = auth.uid() 
      AND users.role IN ('SuperAdmin', 'Admin')
    )
  );