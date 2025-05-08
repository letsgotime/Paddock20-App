import React from 'react';
import { WidgetType } from '@/store/dashboardStore';
import { Clock, Construction, AlertCircle } from 'lucide-react';

interface DefaultWidgetProps {
  widgetType: WidgetType;
}

const DefaultWidget: React.FC<DefaultWidgetProps> = ({ widgetType }) => {
  // Widget display names for better UX
  const widgetDisplayNames: Record<WidgetType, string> = {
    weather: 'Weather Paddock',
    vehicles: 'My Vehicles',
    maintenance: 'Maintenance Alerts',
    'gloss-tracker': 'Gloss Tracker',
    'drive-journal': 'Drive Journal',
    'recent-drives': 'Recent Drives',
    'motorsport-calendar': 'Motorsport Calendar',
    'product-inventory': 'Product Inventory',
    'quick-actions': 'Quick Actions',
    'goals': 'Goals',
    'detailing-alerts': 'Detailing Alerts',
    'f1-telemetry': 'F1 Telemetry',
    'juicebox-recommendations': 'Juice Box Recommendations',
    'recent-photos': 'Recent Photos'
  };

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-center">
      <div className="bg-blue-900/30 rounded-full p-3 mb-3">
        <Construction className="h-8 w-8 text-blue-400" />
      </div>
      <h3 className="text-lg font-semibold text-blue-300 mb-1">
        {widgetDisplayNames[widgetType] || 'Widget'}
      </h3>
      <p className="text-gray-400 text-sm">
        This widget is coming soon to your dashboard
      </p>
      <div className="flex items-center mt-4 text-yellow-600 text-xs">
        <AlertCircle className="h-3 w-3 mr-1" />
        <span>PADDOCK20 BETA</span>
      </div>
    </div>
  );
};

export default DefaultWidget;