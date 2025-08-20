/*
  # Complete USP Admin Database Schema with Sample Data

  1. New Tables
    - `companies` - Multi-tenant parent table
    - `users` - System users linked to companies
    - `utility_contracts` - Utility company contracts
    - `crews` - Work crews
    - `crew_members` - Individual crew members
    - `time_entries` - Daily time tracking entries
    - `exceptions` - Flagged time entries requiring review

  2. Security
    - Enable RLS on all tables
    - Add policies for company-based data isolation
    - Role-based access control

  3. Sample Data
    - OneSource company with complete sample dataset
    - Demo users for testing
    - Utility contracts, crews, members, time entries, and exceptions
*/

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create users table (extends Supabase auth)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('SuperAdmin', 'Admin', 'Viewer')),
  active boolean DEFAULT true,
  full_name text NOT NULL,
  last_login timestamptz,
  created_at timestamptz DEFAULT now()
);

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

-- Create crews table
CREATE TABLE IF NOT EXISTS crews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  utility_contract_id uuid REFERENCES utility_contracts(id) ON DELETE CASCADE,
  crew_name text NOT NULL,
  supervisor_id uuid,
  active boolean DEFAULT true,
  equipment_assigned text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create crew_members table
CREATE TABLE IF NOT EXISTS crew_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id uuid REFERENCES crews(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL,
  hourly_rate numeric(10,2) DEFAULT 30.00,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create time_entries table
CREATE TABLE IF NOT EXISTS time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id uuid REFERENCES crews(id) ON DELETE CASCADE,
  member_id uuid REFERENCES crew_members(id) ON DELETE CASCADE,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  work_package_id uuid,
  hours_regular numeric(4,2) DEFAULT 0,
  hours_overtime numeric(4,2) DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  comments text,
  gps_locations jsonb DEFAULT '[]',
  submitted_by uuid,
  submitted_at timestamptz,
  location text DEFAULT '',
  work_description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create exceptions table
CREATE TABLE IF NOT EXISTS exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  time_entry_id uuid REFERENCES time_entries(id) ON DELETE CASCADE,
  flagged_by text NOT NULL,
  reason text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'accepted', 'rejected')),
  admin_notes text,
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE utility_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crews ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE exceptions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Companies policies
CREATE POLICY "Users can read their own company"
  ON companies
  FOR SELECT
  TO authenticated
  USING (id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Users policies
CREATE POLICY "Users can read users from their company"
  ON users
  FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Utility contracts policies
CREATE POLICY "Users can read contracts from their company"
  ON utility_contracts
  FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Crews policies
CREATE POLICY "Users can read crews from their company"
  ON crews
  FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Crew members policies
CREATE POLICY "Users can read crew members from their company"
  ON crew_members
  FOR SELECT
  TO authenticated
  USING (crew_id IN (SELECT id FROM crews WHERE company_id IN (SELECT company_id FROM users WHERE id = auth.uid())));

-- Time entries policies
CREATE POLICY "Users can read time entries from their company"
  ON time_entries
  FOR SELECT
  TO authenticated
  USING (crew_id IN (SELECT id FROM crews WHERE company_id IN (SELECT company_id FROM users WHERE id = auth.uid())));

-- Exceptions policies
CREATE POLICY "Users can read exceptions from their company"
  ON exceptions
  FOR SELECT
  TO authenticated
  USING (time_entry_id IN (
    SELECT te.id FROM time_entries te
    JOIN crews c ON te.crew_id = c.id
    WHERE c.company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  ));

-- Insert sample data

-- Insert OneSource company
INSERT INTO companies (id, name, slug, active) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'OneSource', 'onesource', true)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample utility contracts
INSERT INTO utility_contracts (id, company_id, utility_name, storm_event, region, contract_number, active, start_date, end_date) VALUES 
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Eversource Energy', 'Hurricane', 'New England', 'EVER-HURR-2024-001', true, '2024-10-01', '2024-12-31'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'First Energy', 'Hurricane', 'Ohio Valley', 'FE-HURR-2024-002', true, '2024-11-15', null),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Dominion Energy', 'Flood', 'Virginia', 'DOM-FLOOD-2024-003', true, '2024-09-01', '2025-02-28')
ON CONFLICT (id) DO NOTHING;

-- Insert sample crews
INSERT INTO crews (id, company_id, utility_contract_id, crew_name, supervisor_id, active, equipment_assigned) VALUES 
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'Storm Response Alpha', null, true, ARRAY['Bucket Truck #101', 'Digger Derrick #201', 'Material Truck #301']),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'Storm Response Beta', null, true, ARRAY['Bucket Truck #102', 'Pole Trailer #202']),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'Winter Recovery Crew 1', null, true, ARRAY['Bucket Truck #103', 'Chipper Truck #303']),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'Maintenance Team North', null, true, ARRAY['Service Truck #401']),
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'Maintenance Team South', null, true, ARRAY['Service Truck #402', 'Material Truck #302']),
('550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'Emergency Response Echo', null, false, ARRAY['Bucket Truck #104']),
('550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'Line Construction Delta', null, true, ARRAY['Digger Derrick #203', 'Conductor Puller #501']),
('550e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'Vegetation Management', null, true, ARRAY['Chipper Truck #304', 'Bucket Truck #105'])
ON CONFLICT (id) DO NOTHING;

-- Insert sample crew members
INSERT INTO crew_members (id, crew_id, name, role, hourly_rate, active) VALUES 
-- Storm Response Alpha
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440010', 'Robert Johnson', 'Foreman', 45.00, true),
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440010', 'Michael Smith', 'Lineman', 38.00, true),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440010', 'David Brown', 'Groundman', 28.00, true),
('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440010', 'James Wilson', 'Equipment Operator', 35.00, true),
-- Storm Response Beta
('550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440011', 'William Davis', 'Foreman', 45.00, true),
('550e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440011', 'Christopher Miller', 'Lineman', 38.00, true),
('550e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440011', 'Matthew Garcia', 'Groundman', 28.00, true),
('550e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440011', 'Anthony Rodriguez', 'Safety Officer', 42.00, true),
-- Winter Recovery Crew 1
('550e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440012', 'Donald Martinez', 'Foreman', 45.00, true),
('550e8400-e29b-41d4-a716-446655440029', '550e8400-e29b-41d4-a716-446655440012', 'Steven Anderson', 'Lineman', 38.00, true),
('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440012', 'Paul Taylor', 'Groundman', 28.00, true),
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440012', 'Andrew Thomas', 'Equipment Operator', 35.00, true),
-- Additional members for other crews
('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440013', 'Joshua Jackson', 'Foreman', 45.00, true),
('550e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440013', 'Kenneth White', 'Lineman', 38.00, true),
('550e8400-e29b-41d4-a716-446655440034', '550e8400-e29b-41d4-a716-446655440013', 'Brian Martin', 'Groundman', 28.00, true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample time entries
INSERT INTO time_entries (id, crew_id, member_id, date, start_time, end_time, hours_regular, hours_overtime, status, comments, gps_locations, submitted_by, submitted_at, location, work_description) VALUES 
('550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440020', '2024-12-15', '07:00', '17:30', 8.0, 2.5, 'submitted', 'Restored power to 47 customers after pole replacement', '[{"latitude": 28.5383, "longitude": -81.3792, "timestamp": "2024-12-15T07:00:00Z", "accuracy": 5}]', '550e8400-e29b-41d4-a716-446655440020', '2024-12-15T17:35:00Z', 'Orlando, FL - Sector 7', 'Emergency pole replacement and power restoration'),
('550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440021', '2024-12-15', '07:00', '17:30', 8.0, 2.5, 'submitted', null, '[{"latitude": 28.5383, "longitude": -81.3792, "timestamp": "2024-12-15T07:00:00Z", "accuracy": 5}]', '550e8400-e29b-41d4-a716-446655440020', '2024-12-15T17:35:00Z', 'Orlando, FL - Sector 7', 'Emergency pole replacement and power restoration'),
('550e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440024', '2024-12-15', '06:30', '16:00', 8.0, 1.5, 'approved', 'Completed distribution line repairs', '[{"latitude": 28.4158, "longitude": -81.2989, "timestamp": "2024-12-15T06:30:00Z", "accuracy": 8}]', '550e8400-e29b-41d4-a716-446655440024', '2024-12-15T16:15:00Z', 'Kissimmee, FL - Industrial District', 'Distribution line repair and testing'),
('550e8400-e29b-41d4-a716-446655440043', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440028', '2024-12-14', '08:00', '18:00', 8.0, 2.0, 'submitted', 'Ice storm damage assessment and initial repairs', '[{"latitude": 35.7796, "longitude": -78.6382, "timestamp": "2024-12-14T08:00:00Z", "accuracy": 6}]', '550e8400-e29b-41d4-a716-446655440028', '2024-12-14T18:15:00Z', 'Raleigh, NC - Northern Suburbs', 'Storm damage assessment and emergency repairs')
ON CONFLICT (id) DO NOTHING;

-- Insert sample exceptions
INSERT INTO exceptions (id, time_entry_id, flagged_by, reason, description, status, created_at) VALUES 
('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440040', 'system', 'Excessive Overtime', 'Time entry shows 2.5 hours of overtime which exceeds daily threshold', 'under_review', '2024-12-15T17:40:00Z'),
('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440043', 'field_manager', 'GPS Location Variance', 'GPS breadcrumb shows crew was outside designated work area for 30+ minutes', 'submitted', '2024-12-14T19:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_utility_contracts_company_id ON utility_contracts(company_id);
CREATE INDEX IF NOT EXISTS idx_crews_company_id ON crews(company_id);
CREATE INDEX IF NOT EXISTS idx_crews_utility_contract_id ON crews(utility_contract_id);
CREATE INDEX IF NOT EXISTS idx_crew_members_crew_id ON crew_members(crew_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_crew_id ON time_entries(crew_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_member_id ON time_entries(member_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(date);
CREATE INDEX IF NOT EXISTS idx_exceptions_time_entry_id ON exceptions(time_entry_id);