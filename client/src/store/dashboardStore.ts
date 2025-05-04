import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

// Widget types available in the dashboard
export type WidgetType = 
  | 'weather'
  | 'vehicles'
  | 'maintenance'
  | 'gloss-tracker'
  | 'drive-journal'
  | 'recent-drives'
  | 'motorsport-calendar'
  | 'product-inventory'
  | 'quick-actions'
  | 'goals'
  | 'detailing-alerts'
  | 'f1-telemetry'
  | 'juicebox-recommendations'
  | 'recent-photos';

// Widget size options
export type WidgetSize = 'small' | 'medium' | 'large';

// Widget structure
export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  size: WidgetSize;
  position: number; // Order in the dashboard
  visible: boolean;
  config?: Record<string, any>; // Widget-specific configuration
}

// Dashboard theme settings
interface DashboardTheme {
  mainColor: string;
  accentColor: string;
  backgroundStyle: 'carbon-fiber' | 'race-track' | 'minimal' | 'f1-telemetry';
  darkMode: boolean;
}

// Dashboard state
interface DashboardState {
  // User's selected widgets
  widgets: DashboardWidget[];
  
  // Dashboard theme settings
  theme: DashboardTheme;
  
  // Completed onboarding
  hasCompletedOnboarding: boolean;
  
  // Functions to manage dashboard
  addWidget: (widget: Omit<DashboardWidget, 'id' | 'position'>) => void;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, updates: Partial<DashboardWidget>) => void;
  reorderWidgets: (orderedIds: string[]) => void;
  setTheme: (theme: Partial<DashboardTheme>) => void;
  resetDashboard: () => void;
  setOnboardingComplete: (completed: boolean) => void;
}

// Default theme settings
const defaultTheme: DashboardTheme = {
  mainColor: '#1e3a8a', // Carolina blue
  accentColor: '#08c519', // GoTime green
  backgroundStyle: 'carbon-fiber',
  darkMode: true,
};

// Default widgets
const defaultWidgets: DashboardWidget[] = [
  {
    id: uuidv4(),
    type: 'weather',
    title: 'Weather Paddock',
    size: 'medium',
    position: 0,
    visible: true,
  },
  {
    id: uuidv4(),
    type: 'vehicles',
    title: 'My Vehicles',
    size: 'medium',
    position: 1,
    visible: true,
  },
  {
    id: uuidv4(),
    type: 'maintenance',
    title: 'Maintenance Alerts',
    size: 'small',
    position: 2,
    visible: true,
  },
  {
    id: uuidv4(),
    type: 'gloss-tracker',
    title: 'Gloss Tracker',
    size: 'small',
    position: 3,
    visible: true,
  },
  {
    id: uuidv4(),
    type: 'quick-actions',
    title: 'Quick Actions',
    size: 'small',
    position: 4,
    visible: true,
  },
  {
    id: uuidv4(),
    type: 'f1-telemetry',
    title: 'F1 Telemetry',
    size: 'large',
    position: 5, 
    visible: true,
  }
];

// Create dashboard store with Zustand
export const useDashboardStore = create<DashboardState>()((set, get) => ({
  widgets: [...defaultWidgets],
  theme: { ...defaultTheme },
  hasCompletedOnboarding: false,
  
  // Add a new widget to the dashboard
  addWidget: (widget) => {
    set((state) => {
      const newWidget: DashboardWidget = {
        ...widget,
        id: uuidv4(),
        position: state.widgets.length,
      };
      return { widgets: [...state.widgets, newWidget] };
    });
  },
  
  // Remove a widget by ID
  removeWidget: (id) => {
    set((state) => {
      const filteredWidgets = state.widgets.filter(widget => widget.id !== id);
      // Reposition remaining widgets to maintain sequential order
      const repositionedWidgets = filteredWidgets.map((widget, index) => ({
        ...widget,
        position: index,
      }));
      return { widgets: repositionedWidgets };
    });
  },
  
  // Update widget properties
  updateWidget: (id, updates) => {
    set((state) => ({
      widgets: state.widgets.map(widget =>
        widget.id === id ? { ...widget, ...updates } : widget
      ),
    }));
  },
  
  // Reorder widgets based on an array of IDs in the new order
  reorderWidgets: (orderedIds) => {
    set((state) => {
      // Create a temporary map for efficient lookups
      const widgetMap = new Map(
        state.widgets.map(widget => [widget.id, widget])
      );
      
      // Create new array with updated positions
      const reorderedWidgets = orderedIds.map((id, index) => {
        const widget = widgetMap.get(id);
        if (!widget) return null; // Skip if widget not found
        return { ...widget, position: index };
      }).filter(Boolean) as DashboardWidget[]; // Filter out null values
      
      // Add any widgets not in the ordered list at the end
      const includedIds = new Set(orderedIds);
      const remainingWidgets = state.widgets
        .filter(widget => !includedIds.has(widget.id))
        .map((widget, index) => ({
          ...widget,
          position: reorderedWidgets.length + index,
        }));
      
      return { widgets: [...reorderedWidgets, ...remainingWidgets] };
    });
  },
  
  // Update theme settings
  setTheme: (themeUpdates) => {
    set((state) => ({
      theme: { ...state.theme, ...themeUpdates },
    }));
  },
  
  // Reset dashboard to default settings
  resetDashboard: () => {
    set({
      widgets: [...defaultWidgets],
      theme: { ...defaultTheme },
    });
  },
  
  // Mark dashboard onboarding as complete
  setOnboardingComplete: (completed) => {
    set({ hasCompletedOnboarding: completed });
  },
}));

export default useDashboardStore;