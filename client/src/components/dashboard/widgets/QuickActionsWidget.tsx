import React from 'react';
import {
  Car,
  CloudRain,
  CalendarCheck,
  Route,
  Camera,
  FileSpreadsheet,
  SprayCan,
  Map,
  Gauge,
  BookOpenCheck
} from 'lucide-react';
import { useLocation, Link } from 'wouter';

// Define quick action item structure
interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  url: string;
  color: string;
  badge?: string;
}

const QuickActionsWidget: React.FC = () => {
  // Quick action items
  const quickActions: QuickAction[] = [
    {
      id: 'garage',
      label: 'Garage Vault',
      icon: <Car className="h-4 w-4" />,
      url: '/garage-vault',
      color: 'from-blue-600/30 to-blue-800/40',
    },
    {
      id: 'weather',
      label: 'Weather',
      icon: <CloudRain className="h-4 w-4" />,
      url: '/weather-paddock',
      color: 'from-cyan-600/30 to-blue-700/40',
    },
    {
      id: 'events',
      label: 'Events',
      icon: <CalendarCheck className="h-4 w-4" />,
      url: '/events',
      color: 'from-purple-600/30 to-indigo-700/40',
      badge: 'New',
    },
    {
      id: 'drive-route',
      label: 'Plan Drive',
      icon: <Route className="h-4 w-4" />,
      url: '/route-planner',
      color: 'from-green-600/30 to-emerald-700/40',
    },
    {
      id: 'gallery',
      label: 'Gallery',
      icon: <Camera className="h-4 w-4" />,
      url: '/gallery',
      color: 'from-amber-600/30 to-orange-700/40',
    },
    {
      id: 'drive-log',
      label: 'Drive Log',
      icon: <FileSpreadsheet className="h-4 w-4" />,
      url: '/drive-journal',
      color: 'from-blue-600/30 to-indigo-800/40',
    },
    {
      id: 'detailing',
      label: 'Detailing',
      icon: <SprayCan className="h-4 w-4" />,
      url: '/juicebox',
      color: 'from-red-600/30 to-rose-700/40',
    },
    {
      id: 'motorsports',
      label: 'Motorsports',
      icon: <Map className="h-4 w-4" />,
      url: '/motorsports',
      color: 'from-sky-600/30 to-blue-800/40',
    },
    {
      id: 'diagnostics',
      label: 'Diagnostics',
      icon: <Gauge className="h-4 w-4" />,
      url: '/diagnostics',
      color: 'from-green-500/30 to-emerald-700/40',
      badge: 'Beta',
    },
    {
      id: 'manifest',
      label: 'Manifest',
      icon: <BookOpenCheck className="h-4 w-4" />,
      url: '/manifestation-station',
      color: 'from-violet-600/30 to-purple-800/40',
    },
  ];

  return (
    <div className="h-full">
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {quickActions.map((action) => (
          <Link
            key={action.id}
            to={action.url}
            className="relative flex flex-col items-center justify-center p-3 text-center rounded-lg bg-gradient-to-br border border-blue-900/30 hover:border-blue-700/50 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-900/10"
            style={{ gridColumn: 'span 1', minHeight: '80px' }}
          >
            <div className={`p-1.5 rounded-full mb-1.5 bg-gradient-to-br ${action.color}`}>
              {action.icon}
            </div>
            <span className="text-xs text-gray-300">{action.label}</span>
            
            {action.badge && (
              <span className="absolute top-1 right-1 text-[10px] px-1 py-0.5 bg-blue-700 text-white rounded-sm">
                {action.badge}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsWidget;