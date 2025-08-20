import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { CrewTimesheetData, CrewMemberTimesheetData } from '../../types/timesheet';
import { generateTimesheetData, getWeekStart } from '../../utils/timesheetData';
import WeekNavigation from './WeekNavigation';
import TimesheetFilters from './TimesheetFilters';
import TimesheetGrid from './TimesheetGrid';
import TimesheetDetailModal from './TimesheetDetailModal';

const TimesheetDataView: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(() => {
    // Start with the week of Aug 13, 2025
    return getWeekStart(new Date('2025-08-13'));
  });
  
  const [crews, setCrews] = useState<CrewTimesheetData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUtilities, setSelectedUtilities] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'all' | 'pending' | 'missing'>('all');
  const [showWeekends, setShowWeekends] = useState(true);
  const [selectedCrew, setSelectedCrew] = useState<CrewTimesheetData | null>(null);
  const [selectedMember, setSelectedMember] = useState<CrewMemberTimesheetData | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Generate timesheet data when week changes
  useEffect(() => {
    const data = generateTimesheetData(currentWeek);
    setCrews(data);
  }, [currentWeek]);

  // Get available utility companies
  const availableUtilities = Array.from(new Set(crews.map(crew => crew.utilityCompany)));

  // Filter crews based on search and filters
  const filteredCrews = crews.filter(crew => {
    const matchesSearch = crew.crewName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         crew.utilityCompany.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUtility = selectedUtilities.length === 0 || 
                          selectedUtilities.includes(crew.utilityCompany);
    
    let matchesViewMode = true;
    if (viewMode === 'pending') {
      matchesViewMode = crew.members.some(member => 
        Object.values(member.weeklyData).some(day => day.status === 'pending')
      );
    } else if (viewMode === 'missing') {
      matchesViewMode = crew.members.some(member => 
        Object.values(member.weeklyData).some(day => day.status === 'missing')
      );
    }
    
    return matchesSearch && matchesUtility && matchesViewMode;
  });

  const handleWeekChange = (date: Date) => {
    setCurrentWeek(getWeekStart(date));
  };

  const handleTodayClick = () => {
    setCurrentWeek(getWeekStart(new Date()));
  };

  const handleCellClick = (crewId: string, memberId: string, date: string) => {
    const crew = crews.find(c => c.id === crewId);
    const member = crew?.members.find(m => m.id === memberId);
    if (crew && member) {
      setSelectedCrew(crew);
      setSelectedMember(member);
      setSelectedDate(date);
      setShowDetailModal(true);
    }
  };

  const handleCrewClick = (crewId: string) => {
    console.log('Navigate to crew details:', crewId);
    // This would navigate to crew management page with the specific crew selected
  };

  const handleExport = () => {
    console.log('Export timesheet data for week:', currentWeek);
    // This would trigger XLSX export functionality
    alert('Export functionality would be implemented here');
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedCrew(null);
    setSelectedMember(null);
    setSelectedDate('');
  };

  // Calculate stats for the current view
  const totalCrews = filteredCrews.length;
  const pendingReviews = filteredCrews.reduce((count, crew) => {
    return count + crew.members.reduce((memberCount, member) => {
      return memberCount + Object.values(member.weeklyData).filter(day => day.status === 'pending').length;
    }, 0);
  }, 0);
  const missingEntries = filteredCrews.reduce((count, crew) => {
    return count + crew.members.reduce((memberCount, member) => {
      return memberCount + Object.values(member.weeklyData).filter(day => day.status === 'missing').length;
    }, 0);
  }, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timesheet Data View</h1>
          <p className="text-gray-600">Weekly crew timesheet overview and management</p>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="bg-blue-50 px-3 py-2 rounded-lg">
            <span className="text-blue-600 font-medium">{totalCrews}</span>
            <span className="text-gray-600 ml-1">crews</span>
          </div>
          {pendingReviews > 0 && (
            <div className="bg-yellow-50 px-3 py-2 rounded-lg">
              <span className="text-yellow-600 font-medium">{pendingReviews}</span>
              <span className="text-gray-600 ml-1">pending</span>
            </div>
          )}
          {missingEntries > 0 && (
            <div className="bg-red-50 px-3 py-2 rounded-lg">
              <span className="text-red-600 font-medium">{missingEntries}</span>
              <span className="text-gray-600 ml-1">missing</span>
            </div>
          )}
        </div>
      </div>

      {/* Week Navigation */}
      <WeekNavigation
        currentWeek={currentWeek}
        onWeekChange={handleWeekChange}
        onTodayClick={handleTodayClick}
      />

      {/* Filters */}
      <TimesheetFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedUtilities={selectedUtilities}
        onUtilityChange={setSelectedUtilities}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showWeekends={showWeekends}
        onShowWeekendsChange={setShowWeekends}
        availableUtilities={availableUtilities}
        onExport={handleExport}
      />

      {/* Timesheet Grid */}
      <TimesheetGrid
        crews={filteredCrews}
        weekStart={currentWeek}
        showWeekends={showWeekends}
        onCellClick={handleCellClick}
        onCrewClick={handleCrewClick}
      />

      {/* Detail Modal */}
      <TimesheetDetailModal
        isOpen={showDetailModal}
        onClose={closeDetailModal}
        crew={selectedCrew}
        member={selectedMember}
        date={selectedDate}
      />

      {/* Empty State */}
      {filteredCrews.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No crews found</h3>
          <p className="text-gray-500">
            {searchTerm || selectedUtilities.length > 0 || viewMode !== 'all'
              ? 'Try adjusting your search or filters'
              : 'No timesheet data available for this week'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default TimesheetDataView;