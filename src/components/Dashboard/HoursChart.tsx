import React from 'react';
import { BarChart3 } from 'lucide-react';
import { TimeEntry } from '../../types';

interface HoursChartProps {
  timeEntries: TimeEntry[];
}

const HoursChart: React.FC<HoursChartProps> = ({ timeEntries }) => {
  // Generate last 7 days data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const chartData = last7Days.map(date => {
    const dateStr = date.toISOString().split('T')[0];
    const dayEntries = timeEntries.filter(entry => entry.date === dateStr);
    
    const regularHours = dayEntries.reduce((sum, entry) => sum + entry.hoursRegular, 0);
    const overtimeHours = dayEntries.reduce((sum, entry) => sum + entry.hoursOvertime, 0);
    
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      regularHours,
      overtimeHours,
      total: regularHours + overtimeHours
    };
  });

  const maxHours = Math.max(...chartData.map(d => d.total), 1);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Daily Hours Overview</h3>
          <p className="text-sm text-gray-600">Regular vs Overtime hours by day</p>
        </div>
        <BarChart3 className="w-6 h-6 text-gray-400" />
      </div>

      <div className="space-y-4">
        {chartData.map((day, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-900">{day.date}</span>
              <span className="text-gray-600">{day.total.toFixed(1)}h total</span>
            </div>
            
            <div className="flex w-full h-6 bg-gray-100 rounded-full overflow-hidden">
              {day.regularHours > 0 && (
                <div
                  className="bg-blue-500 h-full flex items-center justify-center"
                  style={{ width: `${(day.regularHours / maxHours) * 100}%` }}
                >
                  {day.regularHours > 2 && (
                    <span className="text-xs text-white font-medium">{day.regularHours}h</span>
                  )}
                </div>
              )}
              {day.overtimeHours > 0 && (
                <div
                  className="bg-orange-500 h-full flex items-center justify-center"
                  style={{ width: `${(day.overtimeHours / maxHours) * 100}%` }}
                >
                  {day.overtimeHours > 1 && (
                    <span className="text-xs text-white font-medium">{day.overtimeHours}h OT</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center space-x-6 mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Regular Hours</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Overtime Hours</span>
        </div>
      </div>
    </div>
  );
};

export default HoursChart;