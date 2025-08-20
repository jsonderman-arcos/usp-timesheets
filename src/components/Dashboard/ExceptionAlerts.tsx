import React from 'react';
import { AlertTriangle, Clock, MapPin, DollarSign } from 'lucide-react';
import { Exception } from '../../types';

interface ExceptionAlertsProps {
  exceptions: Exception[];
}

const ExceptionAlerts: React.FC<ExceptionAlertsProps> = ({ exceptions }) => {
  const pendingExceptions = exceptions.filter(exc => 
    exc.status === 'submitted' || exc.status === 'under_review'
  );

  const getExceptionIcon = (reason: string) => {
    switch (reason.toLowerCase()) {
      case 'excessive overtime':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'gps location variance':
        return <MapPin className="w-4 h-4 text-red-500" />;
      case 'rate discrepancy':
        return <DollarSign className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getPriorityColor = (reason: string) => {
    switch (reason.toLowerCase()) {
      case 'excessive overtime':
        return 'border-l-orange-500 bg-orange-50';
      case 'gps location variance':
        return 'border-l-red-500 bg-red-50';
      case 'rate discrepancy':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-yellow-500 bg-yellow-50';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffHours = (now.getTime() - time.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`;
    } else {
      return `${Math.floor(diffHours / 24)}d ago`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Exception Alerts</h3>
          <p className="text-sm text-gray-600">
            {pendingExceptions.length} requiring attention
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-6 h-6 text-orange-500" />
          {pendingExceptions.length > 0 && (
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
              {pendingExceptions.length}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {pendingExceptions.slice(0, 6).map((exception) => (
          <div 
            key={exception.id} 
            className={`border-l-4 p-4 rounded-r-lg ${getPriorityColor(exception.reason)}`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getExceptionIcon(exception.reason)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {exception.reason}
                  </p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    exception.status === 'under_review' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {exception.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {exception.description}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Flagged {formatTimeAgo(exception.createdAt)} by {exception.flaggedBy}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {pendingExceptions.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm text-gray-500">No pending exceptions</p>
            <p className="text-xs text-gray-400">All time entries are validated</p>
          </div>
        )}
        
        {pendingExceptions.length > 6 && (
          <div className="text-center pt-3 border-t border-gray-200">
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View all {pendingExceptions.length} exceptions →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Import CheckCircle that was referenced but not imported
import { CheckCircle } from 'lucide-react';

export default ExceptionAlerts;