/*
  # Seed OneSource Sample Data

  1. Data Insertion
    - Insert sample users for OneSource
    - Insert sample utility contracts
    - Insert sample crews and members
    - Insert sample time entries
    - Insert sample exceptions

  2. Notes
    - All data is scoped to OneSource company
    - Uses realistic sample data from the application
*/

-- Get OneSource company ID
DO $$
DECLARE
  onesource_id uuid;
  contract1_id uuid;
  contract2_id uuid;
  contract3_id uuid;
  crew1_id uuid;
  crew2_id uuid;
  crew3_id uuid;
  member1_id uuid;
  member2_id uuid;
  member3_id uuid;
  entry1_id uuid;
BEGIN
  -- Get OneSource company ID
  SELECT id INTO onesource_id FROM companies WHERE slug = 'onesource';
  
  -- Insert sample utility contracts
  INSERT INTO utility_contracts (id, company_id, utility_name, storm_event, region, contract_number, active, start_date, end_date)
  VALUES 
    (gen_random_uuid(), onesource_id, 'Eversource Energy', 'Hurricane', 'New England', 'EVER-HURR-2024-001', true, '2024-10-01', '2024-12-31'),
    (gen_random_uuid(), onesource_id, 'First Energy', 'Hurricane', 'Ohio Valley', 'FE-HURR-2024-002', true, '2024-11-15', null),
    (gen_random_uuid(), onesource_id, 'Dominion Energy', 'Flood', 'Virginia', 'DOM-FLOOD-2024-003', true, '2024-09-01', '2025-02-28')
  RETURNING id INTO contract1_id;
  
  -- Get contract IDs
  SELECT id INTO contract1_id FROM utility_contracts WHERE contract_number = 'EVER-HURR-2024-001';
  SELECT id INTO contract2_id FROM utility_contracts WHERE contract_number = 'FE-HURR-2024-002';
  SELECT id INTO contract3_id FROM utility_contracts WHERE contract_number = 'DOM-FLOOD-2024-003';
  
  -- Insert sample crews
  INSERT INTO crews (id, company_id, utility_contract_id, crew_name, active, equipment_assigned)
  VALUES 
    (gen_random_uuid(), onesource_id, contract1_id, 'Storm Response Alpha', true, '["Bucket Truck #101", "Digger Derrick #201", "Material Truck #301"]'::jsonb),
    (gen_random_uuid(), onesource_id, contract1_id, 'Storm Response Beta', true, '["Bucket Truck #102", "Pole Trailer #202"]'::jsonb),
    (gen_random_uuid(), onesource_id, contract2_id, 'Winter Recovery Crew 1', true, '["Bucket Truck #103", "Chipper Truck #303"]'::jsonb),
    (gen_random_uuid(), onesource_id, contract3_id, 'Maintenance Team North', true, '["Service Truck #401"]'::jsonb),
    (gen_random_uuid(), onesource_id, contract3_id, 'Maintenance Team South', true, '["Service Truck #402", "Material Truck #302"]'::jsonb),
    (gen_random_uuid(), onesource_id, contract1_id, 'Emergency Response Echo', false, '["Bucket Truck #104"]'::jsonb),
    (gen_random_uuid(), onesource_id, contract2_id, 'Line Construction Delta', true, '["Digger Derrick #203", "Conductor Puller #501"]'::jsonb),
    (gen_random_uuid(), onesource_id, contract3_id, 'Vegetation Management', true, '["Chipper Truck #304", "Bucket Truck #105"]'::jsonb);
  
  -- Get crew IDs for adding members
  SELECT id INTO crew1_id FROM crews WHERE crew_name = 'Storm Response Alpha';
  SELECT id INTO crew2_id FROM crews WHERE crew_name = 'Storm Response Beta';
  SELECT id INTO crew3_id FROM crews WHERE crew_name = 'Winter Recovery Crew 1';
  
  -- Insert sample crew members
  INSERT INTO crew_members (id, crew_id, name, role, hourly_rate, active)
  VALUES 
    -- Storm Response Alpha
    (gen_random_uuid(), crew1_id, 'Robert Johnson', 'Foreman', 45.00, true),
    (gen_random_uuid(), crew1_id, 'Michael Smith', 'Lineman', 38.00, true),
    (gen_random_uuid(), crew1_id, 'David Brown', 'Groundman', 28.00, true),
    (gen_random_uuid(), crew1_id, 'James Wilson', 'Equipment Operator', 35.00, true),
    -- Storm Response Beta
    (gen_random_uuid(), crew2_id, 'William Davis', 'Foreman', 45.00, true),
    (gen_random_uuid(), crew2_id, 'Christopher Miller', 'Lineman', 38.00, true),
    (gen_random_uuid(), crew2_id, 'Matthew Garcia', 'Groundman', 28.00, true),
    (gen_random_uuid(), crew2_id, 'Anthony Rodriguez', 'Safety Officer', 42.00, true),
    -- Winter Recovery Crew 1
    (gen_random_uuid(), crew3_id, 'Donald Martinez', 'Foreman', 45.00, true),
    (gen_random_uuid(), crew3_id, 'Steven Anderson', 'Lineman', 38.00, true),
    (gen_random_uuid(), crew3_id, 'Paul Taylor', 'Groundman', 28.00, true),
    (gen_random_uuid(), crew3_id, 'Andrew Thomas', 'Equipment Operator', 35.00, true);
  
  -- Get member IDs for time entries
  SELECT id INTO member1_id FROM crew_members WHERE name = 'Robert Johnson';
  SELECT id INTO member2_id FROM crew_members WHERE name = 'Michael Smith';
  SELECT id INTO member3_id FROM crew_members WHERE name = 'William Davis';
  
  -- Insert sample time entries
  INSERT INTO time_entries (id, crew_id, member_id, date, start_time, end_time, hours_regular, hours_overtime, status, comments, gps_locations, location, work_description)
  VALUES 
    (gen_random_uuid(), crew1_id, member1_id, '2024-12-15', '07:00', '17:30', 8.0, 2.5, 'submitted', 'Restored power to 47 customers after pole replacement', '[{"latitude": 28.5383, "longitude": -81.3792, "timestamp": "2024-12-15T15:00:00Z", "accuracy": 5}]'::jsonb, 'Orlando, FL - Sector 7', 'Emergency pole replacement and power restoration'),
    (gen_random_uuid(), crew1_id, member2_id, '2024-12-15', '07:00', '17:30', 8.0, 2.5, 'submitted', null, '[{"latitude": 28.5383, "longitude": -81.3792, "timestamp": "2024-12-15T15:00:00Z", "accuracy": 5}]'::jsonb, 'Orlando, FL - Sector 7', 'Emergency pole replacement and power restoration'),
    (gen_random_uuid(), crew2_id, member3_id, '2024-12-15', '06:30', '16:00', 8.0, 1.5, 'approved', 'Completed distribution line repairs', '[{"latitude": 28.4158, "longitude": -81.2989, "timestamp": "2024-12-15T14:00:00Z", "accuracy": 7}]'::jsonb, 'Kissimmee, FL - Industrial District', 'Distribution line repair and testing');
  
  -- Get time entry ID for exceptions
  SELECT id INTO entry1_id FROM time_entries WHERE comments = 'Restored power to 47 customers after pole replacement';
  
  -- Insert sample exceptions
  INSERT INTO exceptions (time_entry_id, flagged_by, reason, description, status, created_at)
  VALUES 
    (entry1_id, 'system', 'Excessive Overtime', 'Time entry shows 2.5 hours of overtime which exceeds daily threshold', 'under_review', '2024-12-15T17:40:00Z');
    
END $$;