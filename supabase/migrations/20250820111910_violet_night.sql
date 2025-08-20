/*
  # Complete Database Setup for USP Admin Application
  
  This script creates all necessary tables and data for the USP Admin application
  with multi-tenant support for OneSource and other companies.
  
  ## Tables Created:
  1. companies - Parent table for multi-tenancy
  2. users - User management with company association  
  3. utility_contracts - Storm events and utility contracts
  4. crews - Work crews with equipment
  5. crew_members - Individual crew member details
  6. time_entries - Daily time tracking
  7. exceptions - Flagged time entries for review
  
  ## Security:
  - Row Level Security enabled on all tables
  - Company-based data isolation
  - Role-based access control
  
  ## Sample Data:
  - OneSource company with sample contracts, crews, and time entries
*/

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies are viewable by authenticated users"
  ON companies
  FOR SELECT
  TO authenticated
  USING (true);

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  role text CHECK (role IN ('SuperAdmin', 'Admin', 'Viewer')) DEFAULT 'Viewer',
  active boolean DEFAULT true,
  full_name text NOT NULL,
  last_login timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own company data"
  ON users
  FOR SELECT
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

-- Create utility_contracts table
CREATE TABLE IF NOT EXISTS utility_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  utility_name text NOT NULL,
  storm_event text NOT NULL,
  region text NOT NULL,
  contract_number text NOT NULL,
  active boolean DEFAULT true,
  start_date date NOT NULL,
  end_date date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE utility_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utility contracts are viewable by company users"
  ON utility_contracts
  FOR SELECT
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

-- Create crews table
CREATE TABLE IF NOT EXISTS crews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  utility_contract_id uuid REFERENCES utility_contracts(id) ON DELETE CASCADE,
  crew_name text NOT NULL,
  supervisor_id uuid REFERENCES users(id),
  active boolean DEFAULT true,
  equipment_assigned text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE crews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Crews are viewable by company users"
  ON crews
  FOR SELECT
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

-- Create crew_members table
CREATE TABLE IF NOT EXISTS crew_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id uuid REFERENCES crews(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL,
  hourly_rate decimal(10,2) DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE crew_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Crew members are viewable by company users"
  ON crew_members
  FOR SELECT
  TO authenticated
  USING (crew_id IN (
    SELECT c.id FROM crews c
    JOIN users u ON c.company_id = u.company_id
    WHERE u.id = auth.uid()
  ));

-- Create time_entries table
CREATE TABLE IF NOT EXISTS time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id uuid REFERENCES crews(id) ON DELETE CASCADE,
  member_id uuid REFERENCES crew_members(id) ON DELETE CASCADE,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  work_package_id uuid,
  hours_regular decimal(4,2) DEFAULT 0,
  hours_overtime decimal(4,2) DEFAULT 0,
  status text CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')) DEFAULT 'draft',
  comments text,
  gps_locations jsonb DEFAULT '[]',
  submitted_by uuid REFERENCES users(id),
  submitted_at timestamptz,
  location text DEFAULT '',
  work_description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Time entries are viewable by company users"
  ON time_entries
  FOR SELECT
  TO authenticated
  USING (crew_id IN (
    SELECT c.id FROM crews c
    JOIN users u ON c.company_id = u.company_id
    WHERE u.id = auth.uid()
  ));

-- Create exceptions table
CREATE TABLE IF NOT EXISTS exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  time_entry_id uuid REFERENCES time_entries(id) ON DELETE CASCADE,
  flagged_by uuid REFERENCES users(id),
  reason text NOT NULL,
  description text NOT NULL,
  status text CHECK (status IN ('submitted', 'under_review', 'accepted', 'rejected')) DEFAULT 'submitted',
  admin_notes text,
  resolved_by uuid REFERENCES users(id),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exceptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Exceptions are viewable by company users"
  ON exceptions
  FOR SELECT
  TO authenticated
  USING (time_entry_id IN (
    SELECT te.id FROM time_entries te
    JOIN crews c ON te.crew_id = c.id
    JOIN users u ON c.company_id = u.company_id
    WHERE u.id = auth.uid()
  ));

-- Insert sample data for OneSource company
INSERT INTO companies (id, name, slug, active) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'OneSource', 'onesource', true)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample utility contracts
INSERT INTO utility_contracts (id, company_id, utility_name, storm_event, region, contract_number, start_date, end_date) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Florida Power & Light', 'Hurricane Milton', 'Central Florida', 'FPL-2024-001', '2024-10-01', '2024-12-31'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Duke Energy', 'Storm Recovery', 'North Carolina', 'DUKE-2024-002', '2024-09-15', '2024-11-30'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Georgia Power', 'Ice Storm Response', 'North Georgia', 'GP-2024-003', '2024-01-10', '2024-03-15')
ON CONFLICT (id) DO NOTHING;

-- Insert sample crews
INSERT INTO crews (id, company_id, utility_contract_id, crew_name, equipment_assigned) VALUES
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'Alpha Crew', ARRAY['Bucket Truck', 'Digger Derrick', 'Material Truck']),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'Bravo Crew', ARRAY['Bucket Truck', 'Chipper', 'Pickup Truck']),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'Charlie Crew', ARRAY['Digger Derrick', 'Material Truck', 'Generator']),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'Delta Crew', ARRAY['Bucket Truck', 'Crane', 'Support Vehicle'])
ON CONFLICT (id) DO NOTHING;

-- Insert sample crew members
INSERT INTO crew_members (id, crew_id, name, role, hourly_rate) VALUES
-- Alpha Crew
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440010', 'John Smith', 'Foreman', 45.00),
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440010', 'Mike Johnson', 'Lineman', 38.50),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440010', 'Dave Wilson', 'Groundman', 28.75),
('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440010', 'Tom Brown', 'Equipment Operator', 32.00),
-- Bravo Crew
('550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440011', 'Sarah Davis', 'Foreman', 44.00),
('550e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440011', 'Chris Miller', 'Lineman', 37.25),
('550e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440011', 'Alex Garcia', 'Groundman', 29.50),
-- Charlie Crew
('550e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440012', 'Robert Taylor', 'Foreman', 46.50),
('550e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440012', 'Lisa Anderson', 'Lineman', 39.00),
('550e8400-e29b-41d4-a716-446655440029', '550e8400-e29b-41d4-a716-446655440012', 'Kevin White', 'Groundman', 27.75),
-- Delta Crew
('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440013', 'Jennifer Lee', 'Foreman', 45.75),
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440013', 'Mark Thompson', 'Lineman', 38.00),
('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440013', 'Ryan Martinez', 'Equipment Operator', 33.25)
ON CONFLICT (id) DO NOTHING;

-- Insert sample time entries
INSERT INTO time_entries (id, crew_id, member_id, date, start_time, end_time, hours_regular, hours_overtime, status, location, work_description) VALUES
-- Recent entries for Alpha Crew
('550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440020', '2024-01-15', '07:00', '17:00', 8.0, 2.0, 'approved', 'Orlando, FL', 'Power line restoration after storm damage'),
('550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440021', '2024-01-15', '07:00', '17:00', 8.0, 2.0, 'approved', 'Orlando, FL', 'Power line restoration after storm damage'),
('550e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440022', '2024-01-15', '07:00', '16:30', 8.0, 1.5, 'approved', 'Orlando, FL', 'Ground support and material handling'),
-- Recent entries for Bravo Crew
('550e8400-e29b-41d4-a716-446655440043', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440024', '2024-01-15', '06:30', '16:30', 8.0, 2.0, 'submitted', 'Tampa, FL', 'Tree removal and line clearance'),
('550e8400-e29b-41d4-a716-446655440044', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440025', '2024-01-15', '06:30', '16:30', 8.0, 2.0, 'submitted', 'Tampa, FL', 'Tree removal and line clearance'),
-- Recent entries for Charlie Crew
('550e8400-e29b-41d4-a716-446655440045', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440027', '2024-01-14', '08:00', '18:00', 8.0, 2.0, 'approved', 'Charlotte, NC', 'Pole replacement and wire installation'),
('550e8400-e29b-41d4-a716-446655440046', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440028', '2024-01-14', '08:00', '18:00', 8.0, 2.0, 'approved', 'Charlotte, NC', 'Pole replacement and wire installation')
ON CONFLICT (id) DO NOTHING;

-- Insert sample exceptions
INSERT INTO exceptions (id, time_entry_id, flagged_by, reason, description, status) VALUES
('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440043', '550e8400-e29b-41d4-a716-446655440024', 'Overtime Threshold', 'Crew worked over 10 hours due to emergency restoration requirements', 'under_review'),
('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440044', '550e8400-e29b-41d4-a716-446655440024', 'Location Discrepancy', 'GPS location shows crew was 5 miles from reported work site', 'submitted')
ON CONFLICT (id) DO NOTHING;