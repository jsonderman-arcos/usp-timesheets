export interface CrewTimesheetData {
  id: string;
  crewName: string;
  utilityCompany: string;
  members: CrewMemberTimesheetData[];
}

export interface CrewMemberTimesheetData {
  id: string;
  memberName: string;
  role: string;
  weeklyData: {
    [date: string]: {
      hasEntry: boolean;
      status: 'submitted' | 'approved' | 'pending' | 'missing';
      hours?: number;
    }
  };
}

export interface TimesheetState {
  currentWeek: Date;
  selectedUtilities: string[];
  viewMode: 'all' | 'pending' | 'missing';
  crews: CrewTimesheetData[];
}

export const SAMPLE_CREW_MEMBERS = [
  // AquaTech Water - Current Unit
  { crewId: 'aq001', memberName: 'Robert Johnson', role: 'Foreman' },
  { crewId: 'aq001', memberName: 'Michael Smith', role: 'Lineman' },
  { crewId: 'aq001', memberName: 'David Brown', role: 'Lineman' },
  { crewId: 'aq001', memberName: 'James Wilson', role: 'Lineman' },
  
  // AquaTech Water - Flow Team
  { crewId: 'aq002', memberName: 'William Davis', role: 'Foreman' },
  { crewId: 'aq002', memberName: 'Christopher Miller', role: 'Lineman' },
  { crewId: 'aq002', memberName: 'Matthew Garcia', role: 'Lineman' },
    { crewId: 'aq002', memberName: 'Brian Martin', role: 'Lineman' },
  { crewId: 'aq002', memberName: 'George Thompson', role: 'Lineman' },
  { crewId: 'aq002', memberName: 'Edward Garcia', role: 'Lineman' },
  
  // AquaTech Water - Rapids Crew
  { crewId: 'aq003', memberName: 'Anthony Rodriguez', role: 'Foreman' },
  { crewId: 'aq003', memberName: 'Donald Martinez', role: 'Lineman' },
  { crewId: 'aq003', memberName: 'Steven Anderson', role: 'Lineman' },
  { crewId: 'aq003', memberName: 'Paul Taylor', role: 'Lineman' },
  { crewId: 'aq003', memberName: 'Joshua Jackson', role: 'Lineman' },
  { crewId: 'aq003', memberName: 'Kenneth White', role: 'Lineman' },
  
];

export const SAMPLE_CREWS = [
  // AquaTech Water
  { id: 'aq001', crewName: 'Hurrciane Line Crew Alpha', utilityCompany: 'Hurrican Line Crew' },
  { id: 'aq002', crewName: 'Hurrciane Line Crew Bravo', utilityCompany: 'Hurricane Line Crew' },
  { id: 'aq003', crewName: 'Hurrciane Line Crew Charlie', utilityCompany: 'Hurrican LIne Crew' },
  
 
];