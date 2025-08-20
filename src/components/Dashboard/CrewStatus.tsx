import React from 'react';
import { Users, MapPin } from 'lucide-react';
import { Crew } from '../../types';

interface CrewStatusProps {
  crews: Crew[];
}

const CrewStatus: React.FC<CrewStatusProps> = ({ crews }) => {
  const activeCrews = crews.filter(crew => crew.active);
  const inactiveCrews = crews.filter(crew => !crew.active);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Crew Status</h3>
          <p className="text-sm text-gray-600">{activeCrews.length} active crews on site</p>
        </div>
        <Users className="w-6 h-6 text-gray-400" />
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">Active Crews</h4>
            <span className="text-sm text-gray-600">{activeCrews.length}</span>
          </div>
          <div className="space-y-2">
            {activeCrews.slice(0, 5).map((crew) => (
              <div key={crew.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{crew.crewName}</p>
                    <p className="text-xs text-gray-600">{crew.members.length} members</p>
                  </div>
                </div>
                <MapPin className="w-4 h-4 text-gray-400" />
              </div>
            ))}
            {activeCrews.length > 5 && (
              <p className="text-xs text-gray-500 text-center py-2">
                +{activeCrews.length - 5} more active crews
              </p>
            )}
          </div>
        </div>

        {inactiveCrews.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">Inactive Crews</h4>
              <span className="text-sm text-gray-600">{inactiveCrews.length}</span>
            </div>
            <div className="space-y-2">
              {inactiveCrews.slice(0, 3).map((crew) => (
                <div key={crew.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">{crew.crewName}</p>
                      <p className="text-xs text-gray-500">{crew.members.length} members</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrewStatus;