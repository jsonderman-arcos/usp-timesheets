import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { formatWeekRange } from '../../utils/timesheetData';

interface WeekNavigationProps {
  currentWeek: Date;
  onWeekChange: (date: Date) => void;
  onTodayClick: () => void;
}

const WeekNavigation: React.FC<WeekNavigationProps> = ({
  currentWeek,
  onWeekChange,
  onTodayClick
}) => {
  const handlePreviousWeek = () => {
    const prevWeek = new Date(currentWeek);
    prevWeek.setDate(prevWeek.getDate() - 7);
    onWeekChange(prevWeek);
  };

  const handleNextWeek = () => {
    const nextWeek = new Date(currentWeek);
    nextWeek.setDate(nextWeek.getDate() + 7);
    onWeekChange(nextWeek);
  };

  return (
    <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={handlePreviousWeek}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title="Previous Week"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            {formatWeekRange(currentWeek)}
          </h2>
        </div>
        
        <button
          onClick={handleNextWeek}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title="Next Week"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <button
        onClick={onTodayClick}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        Today
      </button>
    </div>
  );
};

export default WeekNavigation;