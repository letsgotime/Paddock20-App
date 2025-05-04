import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define widget types
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

export type WidgetSize = 'small' | 'medium' | 'large';

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  size: WidgetSize;
  position: number; // Order in the dashboard
  visible: boolean;
  config?: Record<string, any>; // Widget-specific configuration
}

interface DashboardTheme {
  mainColor: string;
  accentColor: string;
  backgroundStyle: 'carbon-fiber' | 'race-track' | 'minimal' | 'f1-telemetry';
  darkMode: boolean;
}

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

// Define default widgets that all users start with
const defaultWidgets: Omit<DashboardWidget, 'id'>[] = [
  {
    type: 'weather',
    title: 'Weather Paddock',
    size: 'medium',
    position: 0,
    visible: true,
  },
  {
    type: 'vehicles',
    title: 'My Vehicles',
    size: 'medium',
    position: 1,
    visible: true,
  },
  {
    type: 'maintenance',
    title: 'Maintenance Alerts',
    size: 'small',
    position: 2,
    visible: true,
  },
  {
    type: 'gloss-tracker',
    title: 'Gloss Tracker',
    size: 'small',
    position: 3,
    visible: true,
  },
  {
    type: 'quick-actions',
    title: 'Quick Actions',
    size: 'small',
    position: 4,
    visible: true,
  },
  {
    type: 'f1-telemetry',
    title: 'F1 Telemetry',
    size: 'large',
    position: 5,
    visible: true,
  }
];

// Default dashboard theme
const defaultTheme: DashboardTheme = {
  mainColor: '#1e293b', // Slate-800
  accentColor: '#08c519', // GoTime green
  backgroundStyle: 'carbon-fiber',
  darkMode: true,
};

// Create the store with persistence
export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      widgets: defaultWidgets.map((widget, index) => ({
        ...widget,
        id: `widget-${widget.type}-${index}`,
      })),
      theme: defaultTheme,
      hasCompletedOnboarding: false,

      addWidget: (widget) => {
        const { widgets } = get();
        const newWidget: DashboardWidget = {
          ...widget,
          id: `widget-${widget.type}-${Date.now()}`,
          position: widgets.length,
        };
        set({ widgets: [...widgets, newWidget] });
      },

      removeWidget: (id) => {
        const { widgets } = get();
        const filteredWidgets = widgets.filter(widget => widget.id !== id);
        // Reposition remaining widgets to prevent gaps
        const repositionedWidgets = filteredWidgets.map((widget, index) => ({
          ...widget,
          position: index,
        }));
        set({ widgets: repositionedWidgets });
      },

      updateWidget: (id, updates) => {
        const { widgets } = get();
        const updatedWidgets = widgets.map(widget => 
          widget.id === id ? { ...widget, ...updates } : widget
        );
        set({ widgets: updatedWidgets });
      },

      reorderWidgets: (orderedIds) => {
        const { widgets } = get();
        const reorderedWidgets = [...widgets];

        orderedIds.forEach((id, index) => {
          const widgetIndex = reorderedWidgets.findIndex(w => w.id === id);
          if (widgetIndex !== -1) {
            reorderedWidgets[widgetIndex] = {
              ...reorderedWidgets[widgetIndex],
              position: index,
            };
          }
        });

        // Sort by the new positions
        reorderedWidgets.sort((a, b) => a.position - b.position);
        set({ widgets: reorderedWidgets });
      },

      setTheme: (themeUpdates) => {
        const { theme } = get();
        set({ theme: { ...theme, ...themeUpdates } });
      },

      resetDashboard: () => {
        set({
          widgets: defaultWidgets.map((widget, index) => ({
            ...widget,
            id: `widget-${widget.type}-${index}`,
          })),
          theme: defaultTheme,
        });
      },

      setOnboardingComplete: (completed) => {
        set({ hasCompletedOnboarding: completed });
      },
    }),
    {
      name: 'paddock20-dashboard-storage',
    }
  )
);