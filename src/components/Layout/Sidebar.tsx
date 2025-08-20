import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Clock,
  Users,
  MapPin,
  AlertTriangle,
  FileText,
  Settings,
  UserCog
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: number;
}

const Sidebar: React.FC = () => {
  const location = useLocation();

  const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Timesheets', href: '/time-entries', icon: Clock, badge: 12 },
    { name: 'Crews', href: '/crews', icon: Users },
    { name: 'GPS Tracking', href: '/gps-tracking', icon: MapPin },
    { name: 'Exceptions', href: '/exceptions', icon: AlertTriangle, badge: 2 },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'User Management', href: '/users', icon: UserCog },
    { name: 'Settings', href: '/settings', icon: Settings }
  ];

  return (
    <div className="w-64 bg-gray-900 min-h-screen">
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;