/*
  # Create Companies and Core Tables

  1. New Tables
    - `companies`
      - `id` (uuid, primary key)
      - `name` (text, company name)
      - `slug` (text, unique identifier)
      - `active` (boolean, company status)
      - `created_at` (timestamp)
    - `users`
      - `id` (uuid, primary key, references auth.users)
      - `company_id` (uuid, foreign key to companies)
      - `username` (text, unique within company)
      - `email` (text, unique)
      - `role` (text, SuperAdmin/Admin/Viewer)
      - `active` (boolean)
      - `full_name` (text)
      - `last_login` (timestamp)
      - `created_at` (timestamp)
    - `utility_contracts`
      - `id` (uuid, primary key)
      - `company_id` (uuid, foreign key to companies)
      - `utility_name` (text)
      - `storm_event` (text)
      - `region` (text)
      - `contract_number` (text)
      - `active` (boolean)
      - `start_date` (date)
      - `end_date` (date, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for company-based data isolation
    - Users can only access data from their company
*/

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  username text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('SuperAdmin', 'Admin', 'Viewer')),
  active boolean DEFAULT true,
  full_name text NOT NULL,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(company_id, username)
);

-- Create utility_contracts table
CREATE TABLE IF NOT EXISTS utility_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  utility_name text NOT NULL,
  storm_event text NOT NULL,
  region text NOT NULL,
  contract_number text NOT NULL,
  active boolean DEFAULT true,
  start_date date NOT NULL,
  end_date date,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE utility_contracts ENABLE ROW LEVEL SECURITY;

-- Companies policies (SuperAdmins can manage companies)
CREATE POLICY "SuperAdmins can manage companies"
  ON companies
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'SuperAdmin'
    )
  );

-- Users can read their own company
CREATE POLICY "Users can read own company"
  ON companies
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT company_id FROM users 
      WHERE users.id = auth.uid()
    )
  );

-- Users policies
CREATE POLICY "Users can read users from same company"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users 
      WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "SuperAdmins can manage users in same company"
  ON users
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'SuperAdmin'
    )
  );

-- Utility contracts policies
CREATE POLICY "Users can read contracts from same company"
  ON utility_contracts
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users 
      WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage contracts in same company"
  ON utility_contracts
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('SuperAdmin', 'Admin')
    )
  );

-- Insert OneSource company
INSERT INTO companies (name, slug, active) 
VALUES ('OneSource', 'onesource', true)
ON CONFLICT (slug) DO NOTHING;