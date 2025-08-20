import React from 'react';
import { Clock, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import { Crew, TimeEntry, Exception } from '../../types';

interface StatsCardsProps {
  crews: Crew[];
  timeEntries: TimeEntry[];
  exceptions: Exception[];
}

const StatsCards: React.FC<StatsCardsProps> = ({ crews, timeEntries, exceptions }) => {
  // Calculate stats
  const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hoursRegular + entry.hoursOvertime, 0);
  const regularHours = timeEntries.reduce((sum, entry) => sum + entry.hoursRegular, 0);
  const overtimeHours = timeEntries.reduce((sum, entry) => sum + entry.hoursOvertime, 0);
  const activeCrews = crews.filter(crew => crew.active).length;
  const pendingExceptions = exceptions.filter(exc => exc.status === 'submitted' || exc.status === 'under_review').length;

  // Calculate this week's hours (simplified - last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thisWeekEntries = timeEntries.filter(entry => new Date(entry.date) >= sevenDaysAgo);
  const hoursThisWeek = thisWeekEntries.reduce((sum, entry) => sum + entry.hoursRegular + entry.hoursOvertime, 0);

  const stats = [
    {
      name: 'Total Hours Today',
      value: totalHours.toFixed(1),
      change: '+12%',
      changeType: 'increase' as const,
      icon: Clock,
      color: 'bg-blue-500'
    },
    {
      name: 'Active Crews',
      value: activeCrews.toString(),
      change: `${crews.length - activeCrews} inactive`,
      changeType: 'neutral' as const,
      icon: Users,
      color: 'bg-green-500'
    },
    {
      name: 'Hours This Week',
      value: hoursThisWeek.toFixed(1),
      change: '+8%',
      changeType: 'increase' as const,
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
    {
      name: 'Pending Exceptions',
      value: pendingExceptions.toString(),
      change: exceptions.length > pendingExceptions ? 'Some resolved' : 'New alerts',
      changeType: pendingExceptions > 0 ? 'decrease' as const : 'neutral' as const,
      icon: AlertTriangle,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} rounded-full p-3`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`text-sm font-medium ${
                stat.changeType === 'increase' 
                  ? 'text-green-600' 
                  : stat.changeType === 'decrease' 
                    ? 'text-red-600' 
                    : 'text-gray-500'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-2">from yesterday</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;