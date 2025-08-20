import React from 'react';
import { Search, Filter, Download, ToggleLeft, ToggleRight } from 'lucide-react';

interface TimesheetFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedUtilities: string[];
  onUtilityChange: (utilities: string[]) => void;
  viewMode: 'all' | 'pending' | 'missing';
  onViewModeChange: (mode: 'all' | 'pending' | 'missing') => void;
  showWeekends: boolean;
  onShowWeekendsChange: (show: boolean) => void;
  availableUtilities: string[];
  onExport: () => void;
}

const TimesheetFilters: React.FC<TimesheetFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedUtilities,
  onUtilityChange,
  viewMode,
  onViewModeChange,
  showWeekends,
  onShowWeekendsChange,
  availableUtilities,
  onExport
}) => {
  const handleUtilityToggle = (utility: string) => {
    if (selectedUtilities.includes(utility)) {
      matchesViewMode = crew.members.some(member => 
        Object.values(member.weeklyData).some(day => day.status === 'pending')
      );
    } else {
      matchesViewMode = crew.members.some(member => 
        Object.values(member.weeklyData).some(day => day.status === 'missing')
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search crews..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* View Mode Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={viewMode}
              onChange={(e) => onViewModeChange(e.target.value as 'all' | 'pending' | 'missing')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Crews</option>
              <option value="pending">Pending Review</option>
              <option value="missing">Missing Timesheets</option>
            </select>
          </div>

          {/* Utility Company Filter */}
          <div className="flex flex-wrap gap-2">
            {availableUtilities.map(utility => (
              <button
                key={utility}
                onClick={() => handleUtilityToggle(utility)}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  selectedUtilities.includes(utility)
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                }`}
              >
                {utility}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          {/* Show Weekends Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Weekends</span>
            <button
              onClick={() => onShowWeekendsChange(!showWeekends)}
              className="flex items-center"
            >
              {showWeekends ? (
                <ToggleRight className="w-6 h-6 text-blue-600" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-gray-400" />
              )}
            </button>
          </div>

          {/* Export Button */}
          <button
            onClick={onExport}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimesheetFilters;