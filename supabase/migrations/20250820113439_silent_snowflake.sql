/*
  # Add Utility Contracts Table

  1. New Tables
    - `utility_contracts`
      - `id` (uuid, primary key)
      - `company_id` (uuid, foreign key to companies)
      - `utility_name` (text) - Name of the utility company
      - `contract_number` (text, unique) - Contract identifier
      - `storm_event` (text) - Type of event (Hurricane, Flood, etc.)
      - `region` (text) - Geographic region
      - `start_date` (date) - Contract start date
      - `end_date` (date, nullable) - Contract end date
      - `active` (boolean) - Whether contract is currently active
      - `created_at` (timestamp) - When record was created

  2. Security
    - Enable RLS on `utility_contracts` table
    - Add policy for users to read contracts from their company
    - Add policy for admins to manage contracts

  3. Sample Data
    - Insert sample utility contracts for OneSource company
*/

-- Create utility_contracts table
CREATE TABLE IF NOT EXISTS utility_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  utility_name text NOT NULL,
  contract_number text UNIQUE NOT NULL,
  storm_event text NOT NULL,
  region text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE utility_contracts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read contracts from their company"
  ON utility_contracts
  FOR SELECT
  TO authenticated
  USING (company_id IN (
    SELECT users.company_id 
    FROM users 
    WHERE users.id = auth.uid()
  ));

CREATE POLICY "Admins can manage contracts from their company"
  ON utility_contracts
  FOR ALL
  TO authenticated
  USING (company_id IN (
    SELECT users.company_id 
    FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('SuperAdmin', 'Admin')
  ))
  WITH CHECK (company_id IN (
    SELECT users.company_id 
    FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('SuperAdmin', 'Admin')
  ));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_utility_contracts_company_id ON utility_contracts(company_id);
CREATE INDEX IF NOT EXISTS idx_utility_contracts_active ON utility_contracts(active);
CREATE INDEX IF NOT EXISTS idx_utility_contracts_dates ON utility_contracts(start_date, end_date);

-- Insert sample utility contracts for OneSource company
DO $$
DECLARE
  onesource_company_id uuid;
BEGIN
  -- Get OneSource company ID
  SELECT id INTO onesource_company_id 
  FROM companies 
  WHERE slug = 'onesource' 
  LIMIT 1;

  -- Insert sample contracts if company exists
  IF onesource_company_id IS NOT NULL THEN
    INSERT INTO utility_contracts (
      id,
      company_id,
      utility_name,
      contract_number,
      storm_event,
      region,
      start_date,
      end_date,
      active
    ) VALUES
    (
      'uc001',
      onesource_company_id,
      'Eversource Energy',
      'EVER-HURR-2024-001',
      'Hurricane',
      'New England',
      '2024-10-01',
      '2024-12-31',
      true
    ),
    (
      'uc002',
      onesource_company_id,
      'First Energy',
      'FE-HURR-2024-002',
      'Hurricane',
      'Ohio Valley',
      '2024-11-15',
      NULL,
      true
    ),
    (
      'uc003',
      onesource_company_id,
      'Dominion Energy',
      'DOM-FLOOD-2024-003',
      'Flood',
      'Virginia',
      '2024-09-01',
      '2025-02-28',
      true
    ),
    (
      'uc004',
      onesource_company_id,
      'Duke Energy',
      'DUKE-STORM-2024-004',
      'Winter Storm',
      'Carolinas',
      '2024-12-01',
      '2025-03-31',
      true
    ),
    (
      'uc005',
      onesource_company_id,
      'Southern Company',
      'SO-HURR-2024-005',
      'Hurricane',
      'Southeast',
      '2024-08-15',
      '2024-11-30',
      false
    )
    ON CONFLICT (contract_number) DO NOTHING;
  END IF;
END $$;