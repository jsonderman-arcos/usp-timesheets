import { supabase, Tables } from '../lib/supabase';
import { User, UtilityContract, Crew, CrewMember, TimeEntry, Exception } from '../types';

// Company service
export const companyService = {
  async getCompanyBySlug(slug: string) {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getCurrentUserCompany() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('users')
      .select('company_id, companies(*)')
      .eq('id', user.id)
      .single();
    
    if (error) throw error;
    return data.companies;
  }
};

// User service
export const userService = {
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      username: data.username,
      email: data.email,
      role: data.role,
      active: data.active,
      fullName: data.full_name,
      createdAt: data.created_at,
      lastLogin: data.last_login
    };
  },

  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('full_name');
    
    if (error) throw error;
    
    return data.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      active: user.active,
      fullName: user.full_name,
      createdAt: user.created_at,
      lastLogin: user.last_login
    }));
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    // Update last login
    if (data.user) {
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id);
    }
    
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
};

// Utility contracts service
export const contractService = {
  async getContracts(): Promise<UtilityContract[]> {
    const { data, error } = await supabase
      .from('utility_contracts')
      .select('*')
      .order('utility_name');
    
    if (error) throw error;
    
    return data.map(contract => ({
      id: contract.id,
      utilityName: contract.utility_name,
      stormEvent: contract.storm_event,
      region: contract.region,
      contractNumber: contract.contract_number,
      active: contract.active,
      startDate: contract.start_date,
      endDate: contract.end_date
    }));
  }
};

// Crew service
export const crewService = {
  async getCrews(): Promise<Crew[]> {
    const { data, error } = await supabase
      .from('crews')
      .select(`
        *,
        crew_members(*)
      `)
      .order('crew_name');
    
    if (error) throw error;
    
    return data.map(crew => ({
      id: crew.id,
      crewName: crew.crew_name,
      utilityContractId: crew.utility_contract_id,
      supervisorId: crew.supervisor_id || '',
      active: crew.active,
      equipmentAssigned: crew.equipment_assigned || [],
      members: crew.crew_members.map((member: any) => ({
        id: member.id,
        name: member.name,
        role: member.role,
        hourlyRate: member.hourly_rate,
        active: member.active
      }))
    }));
  },

  async getCrewsByContract(contractId: string): Promise<Crew[]> {
    const { data, error } = await supabase
      .from('crews')
      .select(`
        *,
        crew_members(*)
      `)
      .eq('utility_contract_id', contractId)
      .order('crew_name');
    
    if (error) throw error;
    
    return data.map(crew => ({
      id: crew.id,
      crewName: crew.crew_name,
      utilityContractId: crew.utility_contract_id,
      supervisorId: crew.supervisor_id || '',
      active: crew.active,
      equipmentAssigned: crew.equipment_assigned || [],
      members: crew.crew_members.map((member: any) => ({
        id: member.id,
        name: member.name,
        role: member.role,
        hourlyRate: member.hourly_rate,
        active: member.active
      }))
    }));
  }
};

// Time entries service
export const timeEntryService = {
  async getTimeEntries(): Promise<TimeEntry[]> {
    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    return data.map(entry => ({
      id: entry.id,
      crewId: entry.crew_id,
      memberId: entry.member_id,
      date: entry.date,
      startTime: entry.start_time,
      endTime: entry.end_time,
      workPackageId: entry.work_package_id,
      hoursRegular: entry.hours_regular,
      hoursOvertime: entry.hours_overtime,
      status: entry.status,
      comments: entry.comments,
      gpsLocations: entry.gps_locations || [],
      submittedBy: entry.submitted_by || '',
      submittedAt: entry.submitted_at,
      location: entry.location,
      workDescription: entry.work_description
    }));
  },

  async getTimeEntriesByCrew(crewId: string): Promise<TimeEntry[]> {
    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('crew_id', crewId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    return data.map(entry => ({
      id: entry.id,
      crewId: entry.crew_id,
      memberId: entry.member_id,
      date: entry.date,
      startTime: entry.start_time,
      endTime: entry.end_time,
      workPackageId: entry.work_package_id,
      hoursRegular: entry.hours_regular,
      hoursOvertime: entry.hours_overtime,
      status: entry.status,
      comments: entry.comments,
      gpsLocations: entry.gps_locations || [],
      submittedBy: entry.submitted_by || '',
      submittedAt: entry.submitted_at,
      location: entry.location,
      workDescription: entry.work_description
    }));
  }
};

// Exceptions service
export const exceptionService = {
  async getExceptions(): Promise<Exception[]> {
    const { data, error } = await supabase
      .from('exceptions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(exception => ({
      id: exception.id,
      timeEntryId: exception.time_entry_id,
      flaggedBy: exception.flagged_by,
      reason: exception.reason,
      description: exception.description,
      status: exception.status,
      adminNotes: exception.admin_notes,
      resolvedBy: exception.resolved_by,
      resolvedAt: exception.resolved_at,
      createdAt: exception.created_at
    }));
  }
};