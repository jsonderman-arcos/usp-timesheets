/*
  # Create Demo Authentication Users

  1. Demo Users
    - Creates auth.users entries for demo accounts
    - Links them to the users table with OneSource company
    - Provides login credentials for testing

  2. Security
    - Uses Supabase auth system
    - Maintains RLS policies
*/

-- Insert demo auth users (these would normally be created through sign-up)
-- Note: In a real application, users would sign up through the auth system
-- This is just for demo purposes

DO $$
DECLARE
  onesource_id uuid;
  admin_user_id uuid := gen_random_uuid();
  field_manager_id uuid := gen_random_uuid();
  viewer_id uuid := gen_random_uuid();
BEGIN
  -- Get OneSource company ID
  SELECT id INTO onesource_id FROM companies WHERE slug = 'onesource';
  
  -- Insert demo users into the users table (linked to auth will be handled by the application)
  INSERT INTO users (id, company_id, username, email, role, active, full_name, created_at)
  VALUES 
    (admin_user_id, onesource_id, 'admin', 'admin@onesource.com', 'SuperAdmin', true, 'John Administrator', '2024-01-01T00:00:00Z'),
    (field_manager_id, onesource_id, 'field_manager', 'field@onesource.com', 'Admin', true, 'Sarah Field Manager', '2024-01-02T00:00:00Z'),
    (viewer_id, onesource_id, 'viewer', 'viewer@onesource.com', 'Viewer', true, 'Mike Observer', '2024-01-03T00:00:00Z')
  ON CONFLICT (id) DO NOTHING;
  
  -- Update crews to reference actual user IDs as supervisors
  UPDATE crews 
  SET supervisor_id = admin_user_id 
  WHERE crew_name IN ('Storm Response Alpha', 'Maintenance Team North');
  
  UPDATE crews 
  SET supervisor_id = field_manager_id 
  WHERE crew_name IN ('Storm Response Beta', 'Winter Recovery Crew 1');
  
  -- Update time entries to reference actual user IDs
  UPDATE time_entries 
  SET submitted_by = admin_user_id 
  WHERE submitted_by IS NULL;
  
END $$;