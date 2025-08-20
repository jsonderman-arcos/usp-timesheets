import React, { useState } from 'react';
import { Check, X, Clock, FileText, MapPin, Edit, MessageSquare } from 'lucide-react';
import { CrewTimesheetData, CrewMemberTimesheetData } from '../../types/timesheet';

interface TimesheetGridProps {
  crews: CrewTimesheetData[];
  weekStart: Date;
  showWeekends: boolean;
  onCellClick: (crewId: string, memberId: string, date: string) => void;
  onCrewClick: (crewId: string) => void;
}

const TimesheetGrid: React.FC<TimesheetGridProps> = ({
  crews,
  weekStart,
  showWeekends,
  onCellClick,
  onCrewClick
}) => {
  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    x: number;
    y: number;
    crewId: string;
    memberId: string;
    date: string;
  }>({ show: false, x: 0, y: 0, crewId: '', memberId: '', date: '' });

  // Generate week dates
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    return date;
  });

  // Filter dates based on showWeekends
  const displayDates = showWeekends ? weekDates : weekDates.filter((_, i) => i < 5);

  // Flatten crews and members for display
  const flattenedData = crews.reduce((acc, crew) => {
    if (!acc[crew.utilityCompany]) {
      acc[crew.utilityCompany] = [];
    }
    acc[crew.utilityCompany].push({
      crew,
      members: crew.members
    });
    return acc;
  }, {} as { [key: string]: { crew: CrewTimesheetData; members: CrewMemberTimesheetData[] }[] });

  const getStatusIcon = (status: string, hours?: number) => {
    switch (status) {
      case 'approved':
      case 'submitted':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'missing':
        return <X className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <FileText className="w-4 h-4 text-blue-600" />;
    }
  };

  const getCellBackground = (status: string) => {
    switch (status) {
      case 'approved':
      case 'submitted':
        return 'bg-green-50 hover:bg-green-100 border-green-200';
      case 'missing':
        return 'bg-red-50 hover:bg-red-100 border-red-200';
      case 'pending':
        return 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200';
      default:
        return 'bg-blue-50 hover:bg-blue-100 border-blue-200';
    }
  };

  const getUtilityColor = (utility: string) => {
    const colors = {
      'AquaTech Water': 'bg-blue-600',
      'ElectriCo Electric': 'bg-yellow-600',
      'GasWorks Gas': 'bg-orange-600',
      'PowerCorp Electric': 'bg-purple-600',
      'UtilityMax Multi': 'bg-green-600'
    };
    return colors[utility as keyof typeof colors] || 'bg-gray-600';
  };

  const handleRightClick = (e: React.MouseEvent, crewId: string, memberId: string, date: string) => {
    e.preventDefault();
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      crewId,
      memberId,
      date
    });
  };

  const handleContextMenuAction = (action: string) => {
    console.log(`Context menu action: ${action} for crew ${contextMenu.crewId}, member ${contextMenu.memberId} on ${contextMenu.date}`);
    setContextMenu({ show: false, x: 0, y: 0, crewId: '', memberId: '', date: '' });
  };

  // Close context menu when clicking elsewhere
  React.useEffect(() => {
    const handleClick = () => setContextMenu(prev => ({ ...prev, show: false }));
    if (contextMenu.show) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu.show]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 min-w-[250px]">
                Crew / Member Name
              </th>
              {displayDates.map((date) => (
                <th key={date.toISOString()} className="px-4 py-4 text-center text-sm font-semibold text-gray-900 min-w-[120px]">
                  <div>
                    <div className="text-xs text-gray-500">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div>
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {Object.entries(flattenedData).map(([utilityCompany, utilityData]) => (
              <React.Fragment key={utilityCompany}>
                
                {/* Crew and Member Rows */}
                {utilityData.map(({ crew, members }, crewIndex) => (
                  <React.Fragment key={crew.id}>
                    {/* Crew Header Row */}
                    <tr className="bg-gray-100">
                      <td className="px-6 py-3" colSpan={displayDates.length + 1}>
                        <button
                          onClick={() => onCrewClick(crew.id)}
                          className="text-left hover:text-blue-600 transition-colors"
                        >
                          <div className="font-semibold text-gray-900 text-lg">{crew.crewName}</div>
                          <div className="text-sm text-gray-600">{members.length} members</div>
                        </button>
                      </td>
                    </tr>
                    
                    {/* Member Rows */}
                    {members.map((member, memberIndex) => (
                      <tr key={member.id} className={memberIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 pl-12">
                          <div>
                            <div className="font-medium text-gray-900">{member.memberName}</div>
                            <div className="text-sm text-gray-500">{member.role}</div>
                          </div>
                        </td>
                        {displayDates.map((date) => {
                          const dateStr = date.toISOString().split('T')[0];
                          const dayData = member.weeklyData[dateStr];
                          
                          return (
                            <td key={dateStr} className="px-4 py-4 text-center">
                              <div
                                className={`relative inline-flex items-center justify-center w-10 h-10 rounded-lg border-2 cursor-pointer transition-all ${getCellBackground(dayData?.status || 'missing')}`}
                                onClick={() => onCellClick(crew.id, member.id, dateStr)}
                                onContextMenu={(e) => handleRightClick(e, crew.id, member.id, dateStr)}
                                title={`${member.memberName} (${crew.crewName}) - ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}\nStatus: ${dayData?.status || 'missing'}\nHours: ${dayData?.hours || 0}`}
                              >
                                {getStatusIcon(dayData?.status || 'missing', dayData?.hours)}
                                {dayData?.hours && (
                                  <span className="absolute -bottom-1 -right-1 bg-gray-800 text-white text-xs px-1 rounded">
                                    {dayData.hours}h
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Context Menu */}
      {contextMenu.show && (
        <div
          className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => handleContextMenuAction('view-details')}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>View Details</span>
          </button>
          <button
            onClick={() => handleContextMenuAction('edit-entry')}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Entry</span>
          </button>
          <button
            onClick={() => handleContextMenuAction('add-comment')}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Add Comment</span>
          </button>
          <button
            onClick={() => handleContextMenuAction('view-gps')}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
          >
            <MapPin className="w-4 h-4" />
            <span>View GPS Track</span>
          </button>
        </div>
      )}

      {/* Legend */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-wrap items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-green-600" />
            <span className="text-gray-600">Submitted/Approved</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-yellow-600" />
            <span className="text-gray-600">Pending Review</span>
          </div>
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="text-gray-600">Draft</span>
          </div>
          <div className="flex items-center space-x-2">
            <X className="w-4 h-4 text-red-600" />
            <span className="text-gray-600">Missing</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimesheetGrid;