import React from 'react';
import { X, Clock, MapPin, User, Calendar, FileText } from 'lucide-react';
import { CrewTimesheetData, CrewMemberTimesheetData } from '../../types/timesheet';

interface TimesheetDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  crew: CrewTimesheetData | null;
  member: CrewMemberTimesheetData | null;
  date: string;
}

const TimesheetDetailModal: React.FC<TimesheetDetailModalProps> = ({
  isOpen,
  onClose,
  crew,
  member,
  date
}) => {
  if (!isOpen || !crew || !member) return null;

  const dayData = member.weeklyData[date];
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'submitted':
        return 'bg-green-100 text-green-800';
      case 'missing':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Mock detailed timesheet data
  const mockDetailedData = {
    startTime: '07:00',
    endTime: '17:30',
    breakTime: '1.0',
    location: 'Sector 7 - Main Distribution Line',
    workDescription: 'Emergency pole replacement and power restoration after storm damage',
    supervisor: 'John Smith',
    submittedBy: 'Robert Johnson',
    submittedAt: '2024-08-13T17:35:00Z',
    comments: 'Completed ahead of schedule. All safety protocols followed.',
    gpsPoints: 47,
    materials: ['Utility Pole (35ft)', 'Crossarm Assembly', 'Guy Wire (150ft)', 'Insulators (6)'],
    equipment: ['Bucket Truck #101', 'Digger Derrick #201', 'Material Truck #301']
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {member.memberName} - Timesheet Details
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {crew.crewName} • {member.role} • {formattedDate}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!dayData?.hasEntry ? (
            <div className="text-center py-12">
              <X className="w-16 h-16 text-red-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Timesheet Entry</h4>
              <p className="text-gray-500 mb-6">
                {member.memberName} has not submitted a timesheet for {formattedDate}.
              </p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Create Entry
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status and Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-gray-900">Status</span>
                  </div>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(dayData.status)}`}>
                    {dayData.status.charAt(0).toUpperCase() + dayData.status.slice(1)}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-gray-900">Total Hours</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{dayData.hours || 0}h</span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-gray-900">Supervisor</span>
                  </div>
                  <span className="text-gray-900">{mockDetailedData.supervisor}</span>
                </div>
              </div>

              {/* Time Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Time Details</span>
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Time:</span>
                      <span className="font-medium">{mockDetailedData.startTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">End Time:</span>
                      <span className="font-medium">{mockDetailedData.endTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Break Time:</span>
                      <span className="font-medium">{mockDetailedData.breakTime}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Regular Hours:</span>
                      <span className="font-medium">{Math.min(dayData.hours || 0, 8)}h</span>
                    </div>
                    {(dayData.hours || 0) > 8 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Overtime Hours:</span>
                        <span className="font-medium text-orange-600">{(dayData.hours || 0) - 8}h</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span>Location & Work</span>
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600 block">Location:</span>
                      <span className="font-medium">{mockDetailedData.location}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 block">Work Description:</span>
                      <span className="font-medium">{mockDetailedData.workDescription}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 block">GPS Points:</span>
                      <span className="font-medium">{mockDetailedData.gpsPoints} recorded</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Materials and Equipment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Materials Used</h4>
                  <div className="space-y-2">
                    {mockDetailedData.materials.map((material, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-700">{material}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Equipment Used</h4>
                  <div className="space-y-2">
                    {mockDetailedData.equipment.map((equipment, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">{equipment}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Comments */}
              {mockDetailedData.comments && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Comments</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{mockDetailedData.comments}</p>
                  </div>
                </div>
              )}

              {/* Submission Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Submission Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Submitted by:</span>
                    <span className="font-medium ml-2">{member.memberName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Submitted at:</span>
                    <span className="font-medium ml-2">
                      {new Date(mockDetailedData.submittedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          {dayData?.hasEntry && (
            <>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Edit Entry
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Approve
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimesheetDetailModal;