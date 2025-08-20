import { CrewTimesheetData, CrewMemberTimesheetData, SAMPLE_CREWS, SAMPLE_CREW_MEMBERS } from '../types/timesheet';

// Generate sample timesheet data for the week of Aug 13-19, 2025
export const generateTimesheetData = (weekStart: Date): CrewTimesheetData[] => {
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0];
  });

  return SAMPLE_CREWS.map(crew => {
    // Get crew members for this crew
    const crewMembers = SAMPLE_CREW_MEMBERS.filter(member => member.crewId === crew.id);
    
    const members: CrewMemberTimesheetData[] = crewMembers.map(member => {
      const weeklyData: { [date: string]: any } = {};
      
      weekDates.forEach((date, index) => {
        const dayOfWeek = index; // 0 = Wednesday (start of our week)
        const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Saturday or Sunday
        
        // Generate realistic data distribution
        const random = Math.random();
        let status: 'submitted' | 'approved' | 'pending' | 'missing';
        let hasEntry = true;
        let hours: number | undefined;

        if (isWeekend) {
          // Less activity on weekends
          if (random < 0.3) {
            status = 'missing';
            hasEntry = false;
          } else if (random < 0.7) {
            status = 'approved';
            hours = 16; // Full day is 16 hours
          } else if (random < 0.85) {
            status = 'submitted';
            hours = 16;
          } else {
            status = 'pending';
            hours = 16;
          }
        } else {
          // More activity on weekdays
          if (random < 0.1) {
            status = 'missing';
            hasEntry = false;
          } else if (random < 0.8) {
            status = 'approved';
            hours = 16; // Full day is 16 hours
          } else if (random < 0.95) {
            status = 'submitted';
            hours = 16;
          } else {
            status = 'pending';
            hours = 16;
          }
        }

        weeklyData[date] = {
          hasEntry,
          status,
          hours
        };
      });

      return {
        id: member.crewId + '_' + member.memberName.replace(/\s+/g, '_').toLowerCase(),
        memberName: member.memberName,
        role: member.role,
        weeklyData
      };
    });

    return {
      id: crew.id,
      crewName: crew.crewName,
      utilityCompany: crew.utilityCompany,
      members
    };
  });
};

export const getWeekStart = (date: Date): Date => {
  // For this example, we'll start the week on Wednesday (Aug 13, 2025)
  const targetDate = new Date(date);
  const dayOfWeek = targetDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const daysToWednesday = (dayOfWeek + 4) % 7; // Calculate days to previous Wednesday
  targetDate.setDate(targetDate.getDate() - daysToWednesday);
  return targetDate;
};

export const formatWeekRange = (weekStart: Date): string => {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  
  const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
  const startDay = weekStart.getDate();
  const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
  const endDay = weekEnd.getDate();
  const year = weekStart.getFullYear();
  
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}, ${year}`;
  } else {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  }
};