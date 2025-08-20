// Core type definitions for the USP Admin application
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'SuperAdmin' | 'Admin' | 'Viewer';
  active: boolean;
  createdAt: string;
  lastLogin?: string;
  fullName: string;
}

export interface UtilityContract {
  id: string;
  utilityName: string;
  stormEvent: string;
  region: string;
  active: boolean;
  startDate: string;
  endDate?: string;
  contractNumber: string;
}

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  hourlyRate?: number;
  active: boolean;
}

export interface Crew {
  id: string;
  crewName: string;
  utilityContractId: string;
  members: CrewMember[];
  active: boolean;
  supervisorId: string;
  equipmentAssigned: string[];
}

export interface GPSPoint {
  latitude: number;
  longitude: number;
  timestamp: string;
  accuracy?: number;
}

export interface TimeEntry {
  id: string;
  crewId: string;
  memberId: string;
  date: string;
  startTime: string;
  endTime: string;
  workPackageId?: string;
  hoursRegular: number;
  hoursOvertime: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  comments?: string;
  gpsLocations: GPSPoint[];
  submittedBy: string;
  submittedAt?: string;
  location: string;
  workDescription: string;
}

export interface Exception {
  id: string;
  timeEntryId: string;
  flaggedBy: string;
  reason: string;
  description: string;
  status: 'submitted' | 'under_review' | 'accepted' | 'rejected';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  adminNotes?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  timestamp: string;
  details: string;
  ipAddress?: string;
}

export interface DashboardStats {
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  activeCrews: number;
  pendingExceptions: number;
  hoursThisWeek: number;
  crewsOnSite: number;
}