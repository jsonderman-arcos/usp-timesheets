import React from 'react';
import { Activity, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { TimeEntry, Crew } from '../../types';

interface RecentActivityProps {
  timeEntries: TimeEntry[];
  crews: Crew[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ timeEntries, crews }) => {
  // Get recent time entries (last 10)
  const recentEntries = timeEntries
    .sort((a, b) => new Date(b.submittedAt || b.date).getTime() - new Date(a.submittedAt || a.date).getTime())
    .slice(0, 8);

  const getCrewName = (crewId: string) => {
    const crew = crews.find(c => c.id === crewId);
    return crew?.crewName || 'Unknown Crew';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'submitted':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-700 bg-green-50';
      case 'rejected':
        return 'text-red-700 bg-red-50';
      case 'submitted':
        return 'text-blue-700 bg-blue-50';
      default:
        return 'text-gray-700 bg-gray-50';
    }
  };

  const formatTime = (date: string, time?: string) => {
    const entryDate = new Date(date);
    const now = new Date();
    const diffHours = (now.getTime() - entryDate.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`;
    } else if (diffHours < 48) {
      return 'Yesterday';
    } else {
      return entryDate.toLocaleDateString();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <p className="text-sm text-gray-600">Latest time entry submissions</p>
        </div>
        <Activity className="w-6 h-6 text-gray-400" />
      </div>

      <div className="space-y-4">
        {recentEntries.map((entry) => (
          <div key={entry.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex-shrink-0">
              {getStatusIcon(entry.status)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {getCrewName(entry.crewId)}
                </p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                  {entry.status}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {entry.hoursRegular + entry.hoursOvertime}h total
                {entry.hoursOvertime > 0 && ` (${entry.hoursOvertime}h OT)`}
              </p>
              <p className="text-xs text-gray-500">{formatTime(entry.date)}</p>
            </div>
          </div>
        ))}
        
        {recentEntries.length === 0 && (
          <div className="text-center py-8">
            <Clock className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;