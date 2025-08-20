import { User, UtilityContract, Crew, TimeEntry, Exception, CrewMember } from '../types';

// Sample Users
export const sampleUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@uspcontractor.com',
    role: 'SuperAdmin',
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-12-15T08:30:00Z',
    fullName: 'John Administrator'
  },
  {
    id: '2',
    username: 'field_manager',
    email: 'field@uspcontractor.com',
    role: 'Admin',
    active: true,
    createdAt: '2024-01-02T00:00:00Z',
    lastLogin: '2024-12-15T07:15:00Z',
    fullName: 'Sarah Field Manager'
  },
  {
    id: '3',
    username: 'viewer',
    email: 'viewer@uspcontractor.com',
    role: 'Viewer',
    active: true,
    createdAt: '2024-01-03T00:00:00Z',
    lastLogin: '2024-12-14T16:45:00Z',
    fullName: 'Mike Observer'
  }
];

// Sample Utility Contracts
export const sampleUtilityContracts: UtilityContract[] = [
  {
    id: '1',
    utilityName: 'Eversource Energy',
    stormEvent: 'Hurricane',
    region: 'New England',
    active: true,
    startDate: '2024-10-01',
    endDate: '2024-12-31',
    contractNumber: 'EVER-HURR-2024-001'
  },
  {
    id: '2',
    utilityName: 'First Energy',
    stormEvent: 'Hurricane',
    region: 'Ohio Valley',
    active: true,
    startDate: '2024-11-15',
    contractNumber: 'FE-HURR-2024-002'
  },
  {
    id: '3',
    utilityName: 'Dominion Energy',
    stormEvent: 'Flood',
    region: 'Virginia',
    active: true,
    startDate: '2024-09-01',
    endDate: '2025-02-28',
    contractNumber: 'DOM-FLOOD-2024-003'
  }
];

// Sample Crew Members
const crewMembers: CrewMember[] = [
  { id: '1', name: 'Robert Johnson', role: 'Foreman', hourlyRate: 45, active: true },
  { id: '2', name: 'Michael Smith', role: 'Lineman', hourlyRate: 38, active: true },
  { id: '3', name: 'David Brown', role: 'Groundman', hourlyRate: 28, active: true },
  { id: '4', name: 'James Wilson', role: 'Equipment Operator', hourlyRate: 35, active: true },
  { id: '5', name: 'William Davis', role: 'Foreman', hourlyRate: 45, active: true },
  { id: '6', name: 'Christopher Miller', role: 'Lineman', hourlyRate: 38, active: true },
  { id: '7', name: 'Matthew Garcia', role: 'Groundman', hourlyRate: 28, active: true },
  { id: '8', name: 'Anthony Rodriguez', role: 'Safety Officer', hourlyRate: 42, active: true },
  { id: '9', name: 'Donald Martinez', role: 'Foreman', hourlyRate: 45, active: true },
  { id: '10', name: 'Steven Anderson', role: 'Lineman', hourlyRate: 38, active: true },
  { id: '11', name: 'Paul Taylor', role: 'Groundman', hourlyRate: 28, active: true },
  { id: '12', name: 'Andrew Thomas', role: 'Equipment Operator', hourlyRate: 35, active: true }
];

// Sample Crews
export const sampleCrews: Crew[] = [
  {
    id: '1',
    crewName: 'Storm Response Alpha',
    utilityContractId: '1',
    members: crewMembers.slice(0, 4),
    active: true,
    supervisorId: '1',
    equipmentAssigned: ['Bucket Truck #101', 'Digger Derrick #201', 'Material Truck #301']
  },
  {
    id: '2',
    crewName: 'Storm Response Beta',
    utilityContractId: '1',
    members: crewMembers.slice(4, 8),
    active: true,
    supervisorId: '5',
    equipmentAssigned: ['Bucket Truck #102', 'Pole Trailer #202']
  },
  {
    id: '3',
    crewName: 'Winter Recovery Crew 1',
    utilityContractId: '2',
    members: crewMembers.slice(8, 12),
    active: true,
    supervisorId: '9',
    equipmentAssigned: ['Bucket Truck #103', 'Chipper Truck #303']
  },
  {
    id: '4',
    crewName: 'Maintenance Team North',
    utilityContractId: '3',
    members: crewMembers.slice(0, 3),
    active: true,
    supervisorId: '1',
    equipmentAssigned: ['Service Truck #401']
  },
  {
    id: '5',
    crewName: 'Maintenance Team South',
    utilityContractId: '3',
    members: crewMembers.slice(3, 6),
    active: true,
    supervisorId: '4',
    equipmentAssigned: ['Service Truck #402', 'Material Truck #302']
  },
  {
    id: '6',
    crewName: 'Emergency Response Echo',
    utilityContractId: '1',
    members: crewMembers.slice(6, 9),
    active: false,
    supervisorId: '8',
    equipmentAssigned: ['Bucket Truck #104']
  },
  {
    id: '7',
    crewName: 'Line Construction Delta',
    utilityContractId: '2',
    members: crewMembers.slice(9, 12),
    active: true,
    supervisorId: '10',
    equipmentAssigned: ['Digger Derrick #203', 'Conductor Puller #501']
  },
  {
    id: '8',
    crewName: 'Vegetation Management',
    utilityContractId: '3',
    members: crewMembers.slice(2, 5),
    active: true,
    supervisorId: '3',
    equipmentAssigned: ['Chipper Truck #304', 'Bucket Truck #105']
  }
];

// Generate sample GPS coordinates for different regions
const generateGPSPoints = (baseLat: number, baseLng: number, count: number = 5) => {
  return Array.from({ length: count }, (_, i) => ({
    latitude: baseLat + (Math.random() - 0.5) * 0.01,
    longitude: baseLng + (Math.random() - 0.5) * 0.01,
    timestamp: new Date(Date.now() - (count - i) * 3600000).toISOString(),
    accuracy: Math.floor(Math.random() * 10) + 5
  }));
};

// Sample Time Entries with GPS data
export const sampleTimeEntries: TimeEntry[] = [
  {
    id: '1',
    crewId: '1',
    memberId: '1',
    date: '2024-12-15',
    startTime: '07:00',
    endTime: '17:30',
    hoursRegular: 8,
    hoursOvertime: 2.5,
    status: 'submitted',
    comments: 'Restored power to 47 customers after pole replacement',
    gpsLocations: generateGPSPoints(28.5383, -81.3792),
    submittedBy: '1',
    submittedAt: '2024-12-15T17:35:00Z',
    location: 'Orlando, FL - Sector 7',
    workDescription: 'Emergency pole replacement and power restoration'
  },
  {
    id: '2',
    crewId: '1',
    memberId: '2',
    date: '2024-12-15',
    startTime: '07:00',
    endTime: '17:30',
    hoursRegular: 8,
    hoursOvertime: 2.5,
    status: 'submitted',
    gpsLocations: generateGPSPoints(28.5383, -81.3792),
    submittedBy: '1',
    submittedAt: '2024-12-15T17:35:00Z',
    location: 'Orlando, FL - Sector 7',
    workDescription: 'Emergency pole replacement and power restoration'
  },
  {
    id: '3',
    crewId: '2',
    memberId: '5',
    date: '2024-12-15',
    startTime: '06:30',
    endTime: '16:00',
    hoursRegular: 8,
    hoursOvertime: 1.5,
    status: 'approved',
    comments: 'Completed distribution line repairs',
    gpsLocations: generateGPSPoints(28.4158, -81.2989),
    submittedBy: '5',
    submittedAt: '2024-12-15T16:15:00Z',
    location: 'Kissimmee, FL - Industrial District',
    workDescription: 'Distribution line repair and testing'
  },
  {
    id: '4',
    crewId: '3',
    memberId: '9',
    date: '2024-12-14',
    startTime: '08:00',
    endTime: '18:00',
    hoursRegular: 8,
    hoursOvertime: 2,
    status: 'submitted',
    comments: 'Ice storm damage assessment and initial repairs',
    gpsLocations: generateGPSPoints(35.7796, -78.6382),
    submittedBy: '9',
    submittedAt: '2024-12-14T18:15:00Z',
    location: 'Raleigh, NC - Northern Suburbs',
    workDescription: 'Storm damage assessment and emergency repairs'
  }
];

// Sample Exceptions
export const sampleExceptions: Exception[] = [
  {
    id: '1',
    timeEntryId: '1',
    flaggedBy: 'system',
    reason: 'Excessive Overtime',
    description: 'Time entry shows 2.5 hours of overtime which exceeds daily threshold',
    status: 'under_review',
    createdAt: '2024-12-15T17:40:00Z'
  },
  {
    id: '2',
    timeEntryId: '4',
    flaggedBy: '2',
    reason: 'GPS Location Variance',
    description: 'GPS breadcrumb shows crew was outside designated work area for 30+ minutes',
    status: 'submitted',
    createdAt: '2024-12-14T19:00:00Z'
  }
];