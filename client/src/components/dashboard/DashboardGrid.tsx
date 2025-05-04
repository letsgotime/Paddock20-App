import React, { useState } from 'react';
import { useDashboardStore, DashboardWidget as WidgetType } from '@/store/dashboardStore';
import DashboardWidget from './DashboardWidget';
import { PlusCircle, RefreshCw, Settings } from 'lucide-react';

// Widget Content Components
import WeatherWidget from './widgets/WeatherWidget';
import VehiclesWidget from './widgets/VehiclesWidget';
import MaintenanceWidget from './widgets/MaintenanceWidget';
import GlossTrackerWidget from './widgets/GlossTrackerWidget';
import QuickActionsWidget from './widgets/QuickActionsWidget';
import F1TelemetryWidget from './widgets/F1TelemetryWidget';
import DefaultWidget from './widgets/DefaultWidget';

// Tooltips/explanations for each widget type
const widgetExplanations: Record<string, string> = {
  weather: "Weather Paddock provides real-time weather data for your current location or any saved location. This helps plan your drives and detailing work based on weather conditions.",
  vehicles: "My Vehicles displays your vehicle collection and their current status. Clicking a vehicle makes it your active vehicle for all Paddock20 features.",
  maintenance: "Maintenance Alerts notifies you of upcoming service needs based on your vehicle's mileage and maintenance schedule.",
  'gloss-tracker': "Gloss Tracker helps you maintain a comprehensive history of your vehicle's paint condition and detailing sessions.",
  'quick-actions': "Quick Actions provides shortcuts to frequently used features across the Paddock20 platform.",
  'f1-telemetry': "F1 Telemetry displays motorsport-inspired telemetry data for your vehicle and driving habits with race-inspired visualizations.",
  'drive-journal': "Drive Journal records your drives with route maps, conditions, and notes to build a complete history of your driving experiences.",
  'recent-drives': "Recent Drives shows your latest recorded drives with statistics and highlights.",
  'motorsport-calendar': "Motorsport Calendar keeps track of upcoming racing events across your favorite motorsport series.",
  'product-inventory': "Product Inventory tracks your detailing supplies with usage tracking and reorder reminders.",
  'goals': "Goals lets you set and track personal achievements related to your automotive journey.",
  'detailing-alerts': "Detailing Alerts recommends optimal times for detailing work based on weather and your schedule.",
  'juicebox-recommendations': "Juice Box Recommendations suggests detailing products specifically for your vehicle's needs.",
  'recent-photos': "Recent Photos displays your latest automotive photography uploads."
};

// Widget rendering map
const renderWidget = (widget: WidgetType) => {
  const explanation = widgetExplanations[widget.type] || '';
  
  switch (widget.type) {
    case 'weather':
      return (
        <DashboardWidget 
          key={widget.id} 
          widget={widget}
          explanationContent={explanation}
        >
          <WeatherWidget />
        </DashboardWidget>
      );
    case 'vehicles':
      return (
        <DashboardWidget 
          key={widget.id} 
          widget={widget}
          explanationContent={explanation}
        >
          <VehiclesWidget />
        </DashboardWidget>
      );
    case 'maintenance':
      return (
        <DashboardWidget 
          key={widget.id} 
          widget={widget}
          explanationContent={explanation}
        >
          <MaintenanceWidget />
        </DashboardWidget>
      );
    case 'gloss-tracker':
      return (
        <DashboardWidget 
          key={widget.id} 
          widget={widget}
          explanationContent={explanation}
        >
          <GlossTrackerWidget />
        </DashboardWidget>
      );
    case 'quick-actions':
      return (
        <DashboardWidget 
          key={widget.id} 
          widget={widget}
          explanationContent={explanation}
        >
          <QuickActionsWidget />
        </DashboardWidget>
      );
    case 'f1-telemetry':
      return (
        <DashboardWidget 
          key={widget.id} 
          widget={widget}
          explanationContent={explanation}
        >
          <F1TelemetryWidget />
        </DashboardWidget>
      );
    default:
      return (
        <DashboardWidget 
          key={widget.id} 
          widget={widget}
          explanationContent={explanation}
        >
          <DefaultWidget widgetType={widget.type} />
        </DashboardWidget>
      );
  }
};

const DashboardGrid: React.FC = () => {
  const widgets = useDashboardStore(state => state.widgets);
  const resetDashboard = useDashboardStore(state => state.resetDashboard);
  const [isCustomizing, setIsCustomizing] = useState(false);
  
  // Sort widgets by position
  const sortedWidgets = [...widgets]
    .sort((a, b) => a.position - b.position)
    .filter(widget => widget.visible);
  
  return (
    <div className="p-4">
      {/* Dashboard Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-300">Personalized Dashboard</h1>
          <p className="text-gray-400">Customize this dashboard to show what matters most to you</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCustomizing(!isCustomizing)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-900/50 hover:bg-blue-800/60 text-blue-300 rounded-md border border-blue-700/30"
          >
            <Settings className="h-4 w-4" />
            <span>Customize</span>
          </button>
          
          <button
            onClick={resetDashboard}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/60 text-gray-300 rounded-md border border-gray-700/30"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>
      
      {/* Dashboard Grid */}
      <div className="grid grid-cols-12 gap-4">
        {sortedWidgets.map(widget => renderWidget(widget))}
        
        {/* Add Widget Button */}
        <div className="col-span-12 md:col-span-4 row-span-1 p-0">
          <button
            onClick={() => setIsCustomizing(true)}
            className="w-full h-full min-h-[150px] flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-blue-900/40 hover:border-blue-700/60 bg-blue-950/30 hover:bg-blue-900/20 transition-all"
          >
            <PlusCircle className="h-10 w-10 text-blue-700/60" />
            <span className="text-blue-400">Add Widget</span>
          </button>
        </div>
      </div>
      
      {/* Customization Modal - we'll implement this later */}
      {isCustomizing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-blue-900 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-blue-300 mb-4">Customize Your Dashboard</h2>
            <p className="text-gray-400 mb-6">
              Select widgets to show on your dashboard and arrange them as you prefer
            </p>
            
            {/* Widget selection will be implemented here */}
            <div className="mt-6 flex justify-end gap-2">
              <button 
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md"
                onClick={() => setIsCustomizing(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                onClick={() => setIsCustomizing(false)}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardGrid;