import React from 'react';
import { useApp } from '../../contexts/AppContext';
import StatsCards from './StatsCards';
import HoursChart from './HoursChart';
import CrewStatus from './CrewStatus';
import RecentActivity from './RecentActivity';
import ExceptionAlerts from './ExceptionAlerts';

const Dashboard: React.FC = () => {
  const { selectedContract, crews, timeEntries, exceptions, getCrewsByContract } = useApp();

  // Filter data based on selected contract
  const contractCrews = selectedContract ? getCrewsByContract(selectedContract.id) : crews;
  const contractTimeEntries = timeEntries.filter(entry => 
    contractCrews.some(crew => crew.id === entry.crewId)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        {selectedContract && (
          <p className="text-gray-600">
            {selectedContract.utilityName} • {selectedContract.stormEvent}
          </p>
        )}
      </div>

      {/* Stats Cards */}
      <StatsCards 
        crews={contractCrews}
        timeEntries={contractTimeEntries}
        exceptions={exceptions}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Hours Chart - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <HoursChart timeEntries={contractTimeEntries} />
        </div>
        
        {/* Exception Alerts */}
        <div>
          <ExceptionAlerts exceptions={exceptions} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <CrewStatus crews={contractCrews} />
        <RecentActivity timeEntries={contractTimeEntries} crews={contractCrews} />
      </div>
    </div>
  );
};

export default Dashboard;