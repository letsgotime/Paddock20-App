import React, { useState } from "react";
import { 
  Route, 
  Switch, 
  useLocation,
  Link,
  useRoute 
} from "wouter";
import { 
  Car, 
  Target, 
  BarChart3, 
  Wrench, 
  Calendar, 
  ShoppingBag,
  User,
  Settings,
  FileText,
  ArrowRight,
  Home,
  Menu,
  X,
  Clock,
  Gauge,
  LineChart,
  History,
  Brain,
  Lightbulb,
  Compass,
  Rocket,
  Zap,
  Command,
  Sparkles,
  ScrollText,
  Bell,
  LogOut,
  Tag,
  Minus,
  ArrowDown
} from "lucide-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";

// Main App Pages
import CompleteManifestationStation from "@/pages/CompleteManifestationStation";

// Sub Pages - Import when modules are created
/* 
import GarageVault from "@/pages/GarageVault";
import MarketplacePage from "@/pages/MarketplacePage";
import EventsCalendarPage from "@/pages/EventsCalendarPage";
import RoutePlannerPage from "@/pages/RoutePlannerPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFoundPage from "@/pages/NotFoundPage";
// Goal System
import GoalsPage from "@/pages/GoalsPage";
import GoalDetailsPage from "@/pages/GoalDetailsPage";
import CreateGoalPage from "@/pages/CreateGoalPage";
// Vehicle System
import VehicleDetailsPage from "@/pages/VehicleDetailsPage";
import AddVehiclePage from "@/pages/AddVehiclePage";
// Project System
import ProjectsPage from "@/pages/ProjectsPage";
import ProjectDetailsPage from "@/pages/ProjectDetailsPage";
import CreateProjectPage from "@/pages/CreateProjectPage";
// Journal System
import JournalPage from "@/pages/JournalPage";
import JournalEntryPage from "@/pages/JournalEntryPage";
import CreateJournalPage from "@/pages/CreateJournalPage";
// Analytics System
import AnalyticsPage from "@/pages/AnalyticsPage";
import PerformanceAnalyticsPage from "@/pages/PerformanceAnalyticsPage";
import MoodAnalyticsPage from "@/pages/MoodAnalyticsPage";
// User Profile
import ProfilePage from "@/pages/ProfilePage";
import AccountSettingsPage from "@/pages/AccountSettingsPage";
*/

// Context Providers
import { VehicleProvider } from "@/context/VehicleContext";
// Import additional providers as needed 
/*
import { GoalProvider } from "@/context/GoalContext";
import { ProjectProvider } from "@/context/ProjectContext";
import { UserProvider } from "@/context/UserContext";
import { ThemeProvider } from "@/context/ThemeContext";
*/

// App-wide components
const Sidebar = ({ 
  isSidebarOpen, 
  toggleSidebar, 
  userProgress = 65 
}: { 
  isSidebarOpen: boolean; 
  toggleSidebar: () => void;
  userProgress?: number;
}) => {
  const [isActive] = useRoute("/:page*");
  const [location] = useLocation();
  
  // Create active state to get current route
  const currentRoute = location.split('/')[1] || 'manifestation-station';
  
  // Main menu items
  const mainMenuItems = [
    { 
      name: "Manifestation Station", 
      path: "/manifestation-station",
      icon: <Command className="h-5 w-5" /> 
    },
    { 
      name: "Garage Vault", 
      path: "/garage-vault",
      icon: <Car className="h-5 w-5" /> 
    },
    { 
      name: "Goals", 
      path: "/goals",
      icon: <Target className="h-5 w-5" /> 
    },
    { 
      name: "Projects", 
      path: "/projects",
      icon: <Wrench className="h-5 w-5" /> 
    },
    { 
      name: "Calendar", 
      path: "/calendar",
      icon: <Calendar className="h-5 w-5" /> 
    },
    { 
      name: "Analytics", 
      path: "/analytics",
      icon: <LineChart className="h-5 w-5" /> 
    },
    { 
      name: "Journal", 
      path: "/journal",
      icon: <ScrollText className="h-5 w-5" /> 
    },
    { 
      name: "Marketplace", 
      path: "/marketplace",
      icon: <ShoppingBag className="h-5 w-5" /> 
    }
  ];
  
  // Manifestation System Menu Items (sub-menu)
  const manifestationSystemItems = [
    { 
      name: "The 7 Elements", 
      path: "/manifestation-station/elements",
      icon: <Zap className="h-5 w-5" /> 
    },
    { 
      name: "Goal Mapping", 
      path: "/manifestation-station/goal-mapping",
      icon: <Target className="h-5 w-5" /> 
    },
    { 
      name: "Visualizer", 
      path: "/manifestation-station/visualizer",
      icon: <Sparkles className="h-5 w-5" /> 
    },
    { 
      name: "Dream Board", 
      path: "/manifestation-station/dream-board",
      icon: <Lightbulb className="h-5 w-5" /> 
    },
    { 
      name: "Daily Tracker", 
      path: "/manifestation-station/daily-tracker",
      icon: <Clock className="h-5 w-5" /> 
    },
    { 
      name: "Energy Center", 
      path: "/manifestation-station/energy-center",
      icon: <Brain className="h-5 w-5" /> 
    },
    { 
      name: "Progress Journal", 
      path: "/manifestation-station/progress-journal",
      icon: <FileText className="h-5 w-5" /> 
    }
  ];
  
  // Calculate if the current route is in the manifestation system
  const isInManifestationSystem = currentRoute === 'manifestation-station';
  
  // Calculate if the current route is in a specific sub-system
  const getIsInSubSystem = (basePath: string) => {
    return currentRoute === basePath || location.startsWith(`/${basePath}/`);
  };
  
  return (
    <div 
      className={cn(
        "fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-zinc-950 border-r border-zinc-800 transition-all duration-300 ease-in-out",
        isSidebarOpen ? "w-64" : "w-16"
      )}
    >
      {/* Sidebar Header */}
      <div className="p-4 flex items-center justify-between border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 h-8 w-8 bg-[#7FC844] rounded-full flex items-center justify-center text-black font-bold">
            P20
          </div>
          <h1 className={cn("font-bold bg-gradient-to-r from-[#7FC844] to-blue-500 bg-clip-text text-transparent transition-opacity", 
            isSidebarOpen ? "opacity-100" : "opacity-0 w-0 h-0 overflow-hidden"
          )}>
            PADDOCK20
          </h1>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar} 
          className="text-gray-400 hover:text-white"
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      
      {/* Progress Bar */}
      <div className={cn("px-4 py-3 border-b border-zinc-800", 
        isSidebarOpen ? "" : "flex justify-center"
      )}>
        <div className={cn("flex items-center gap-2 mb-2", 
          !isSidebarOpen && "hidden"
        )}>
          <Gauge className="h-4 w-4 text-[#7FC844]" />
          <span className="text-sm text-gray-400">Manifestation Progress</span>
        </div>
        <div className="relative pt-1">
          <div className="flex items-center justify-between mb-1">
            <div className={cn("text-xs font-semibold inline-block text-[#7FC844]",
              !isSidebarOpen && "hidden"
            )}>
              {userProgress}%
            </div>
          </div>
          <div className={cn("overflow-hidden h-2 mb-1 flex rounded bg-zinc-800", 
            isSidebarOpen ? "w-full" : "w-8"
          )}>
            <div 
              style={{ width: `${userProgress}%` }} 
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-[#7FC844] to-blue-500"
            ></div>
          </div>
          <div className={cn("flex justify-between text-xs text-gray-600", 
            !isSidebarOpen && "hidden"
          )}>
            <span>Goal: 100%</span>
            <span>{userProgress > 0 ? `+${userProgress}` : 0} pts</span>
          </div>
        </div>
      </div>
      
      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {mainMenuItems.map((item) => {
            const isCurrentPath = getIsInSubSystem(item.path.substring(1));
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center gap-3 px-2 py-2 rounded-md transition-all",
                  isCurrentPath 
                    ? "bg-[#7FC844]/10 text-[#7FC844]" 
                    : "text-gray-400 hover:bg-zinc-800/70 hover:text-white"
                )}
              >
                <div className="flex-shrink-0">{item.icon}</div>
                <span className={cn(
                  "transition-opacity",
                  isSidebarOpen ? "opacity-100" : "opacity-0 w-0 h-0 overflow-hidden"
                )}>
                  {item.name}
                </span>
                {!isSidebarOpen && isCurrentPath && (
                  <div className="absolute left-0 w-1 h-8 bg-[#7FC844] rounded-r-full"></div>
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* Manifestation System Sub Menu - only show when in Manifestation System */}
        {isInManifestationSystem && isSidebarOpen && (
          <div className="mt-6">
            <div className="px-4 mb-2">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                The 7 Elements System
              </h2>
              <Separator className="my-2 bg-zinc-800" />
            </div>
            <nav className="space-y-1 px-2">
              {manifestationSystemItems.map((item) => {
                const isCurrentSubPath = location === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={cn(
                      "flex items-center gap-3 px-2 py-2 text-sm rounded-md transition-all",
                      isCurrentSubPath 
                        ? "bg-[#7FC844]/10 text-[#7FC844]" 
                        : "text-gray-400 hover:bg-zinc-800/70 hover:text-white"
                    )}
                  >
                    <div className="flex-shrink-0">{item.icon}</div>
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
      
      {/* User Profile Section */}
      <div className="p-4 border-t border-zinc-800">
        <div className={cn(
          "flex items-center gap-3",
          isSidebarOpen ? "" : "justify-center"
        )}>
          <div className="flex-shrink-0 h-8 w-8 bg-zinc-800 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-gray-400" />
          </div>
          <div className={cn(
            "transition-opacity",
            isSidebarOpen ? "opacity-100" : "opacity-0 w-0 h-0 overflow-hidden"
          )}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="link" className="p-0 h-auto text-left">
                  <div>
                    <div className="font-medium text-sm">John Driver</div>
                    <div className="text-xs text-gray-400">PADDOCK20 Member</div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-zinc-900 border-zinc-800">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem className="hover:bg-zinc-800/70">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-zinc-800/70">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem className="hover:bg-zinc-800/70">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

// Top Navigation Bar
const TopNavbar = ({ 
  isSidebarOpen,
  toggleSidebar 
}: { 
  isSidebarOpen: boolean; 
  toggleSidebar: () => void; 
}) => {
  const [location] = useLocation();
  
  // Get current page title based on location
  const getPageTitle = () => {
    const path = location.split('/')[1] || '';
    
    switch(path) {
      case '':
      case 'manifestation-station':
        return 'Manifestation Station';
      case 'garage-vault':
        return 'Garage Vault';
      case 'goals':
        return 'Goal System';
      case 'projects':
        return 'Project Manager';
      case 'calendar':
        return 'Events Calendar';
      case 'analytics':
        return 'Performance Analytics';
      case 'journal':
        return 'Driver Journal';
      case 'marketplace':
        return 'Marketplace';
      default:
        return 'Paddock20';
    }
  };
  
  // Get page description based on location
  const getPageDescription = () => {
    const path = location.split('/')[1] || '';
    
    switch(path) {
      case '':
      case 'manifestation-station':
        return 'Your central command for goal attainment & vehicle manifestation';
      case 'garage-vault':
        return 'Central command for your fleet management & vehicle customization';
      case 'goals':
        return 'Track and manifest your automotive aspirations';
      case 'projects':
        return 'Manage your in-progress builds and modifications';
      case 'calendar':
        return 'Organize your automotive events and schedule';
      case 'analytics':
        return 'Data-driven insights for your vehicles and progress';
      case 'journal':
        return 'Document your journey and experiences';
      case 'marketplace':
        return 'Discover products and services for your vehicles';
      default:
        return 'High performance automotive lifestyle platform';
    }
  };
  
  return (
    <header className={cn(
      "fixed top-0 right-0 z-30 border-b border-zinc-800 bg-zinc-950 transition-all duration-300 flex items-center h-16",
      isSidebarOpen ? "left-64" : "left-16"
    )}>
      <div className="flex items-center justify-between w-full px-4">
        <div>
          <h1 className="text-xl font-bold">{getPageTitle()}</h1>
          <p className="text-sm text-gray-400">{getPageDescription()}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-3">
            <Button variant="outline" size="sm" className="border-zinc-700">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Service
            </Button>
            <Button className="bg-[#7FC844] text-black hover:bg-[#7FC844]/90" size="sm">
              <Target className="h-4 w-4 mr-2" />
              New Goal
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="text-gray-400">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="hidden md:block border-l border-zinc-800 h-8 mx-2"></div>
          
          <div className="hidden md:block">
            <div className="text-sm font-medium">John Driver</div>
            <div className="text-xs text-gray-400">PADDOCK20 Member</div>
          </div>
          
          <div className="h-8 w-8 bg-zinc-800 rounded-full"></div>
        </div>
      </div>
    </header>
  );
};

// Mobile Bottom Navigation - for responsive design
const MobileBottomNav = () => {
  const [location] = useLocation();
  const currentRoute = location.split('/')[1] || 'manifestation-station';
  
  const navItems = [
    { 
      name: "Dashboard", 
      path: "/manifestation-station",
      icon: <Command className="h-5 w-5" /> 
    },
    { 
      name: "Garage", 
      path: "/garage-vault",
      icon: <Car className="h-5 w-5" /> 
    },
    { 
      name: "Goals", 
      path: "/goals",
      icon: <Target className="h-5 w-5" /> 
    },
    { 
      name: "Projects", 
      path: "/projects",
      icon: <Wrench className="h-5 w-5" /> 
    },
    { 
      name: "Menu", 
      path: "/menu",
      icon: <Menu className="h-5 w-5" /> 
    }
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-zinc-950 border-t border-zinc-800">
      <div className="grid grid-cols-5">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={cn(
              "flex flex-col items-center justify-center py-2",
              currentRoute === item.path.substring(1) 
                ? "text-[#7FC844]" 
                : "text-gray-400"
            )}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Main Layout Component
const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  return (
    <div className="bg-black text-white min-h-screen">
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
      />
      <TopNavbar 
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      <main className={cn(
        "pt-16 pb-4 transition-all duration-300",
        isSidebarOpen ? "md:pl-64" : "md:pl-16",
        "md:pb-4 pb-16" // Add padding bottom for mobile navigation
      )}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>
      <MobileBottomNav />
      <Toaster />
    </div>
  );
};

// Main App Component
function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="paddock20-theme">
      <QueryClientProvider client={queryClient}>
        <VehicleProvider>
          <Layout>
            <Switch>
              <Route path="/" component={() => <Link href="/manifestation-station"><Home /></Link>} />
              <Route path="/manifestation-station" component={CompleteManifestationStation} />
              <Route path="/manifestation-station/:subpage*" component={CompleteManifestationStation} />
              
              {/* Main module routes */}
              <Route path="/garage-vault" component={() => <div>Garage Vault (Coming Soon)</div>} />
              <Route path="/goals" component={() => <div>Goals System (Coming Soon)</div>} />
              <Route path="/projects" component={() => <div>Projects (Coming Soon)</div>} />
              <Route path="/calendar" component={() => <div>Calendar (Coming Soon)</div>} />
              <Route path="/analytics" component={() => <div>Analytics (Coming Soon)</div>} />
              <Route path="/journal" component={() => <div>Journal (Coming Soon)</div>} />
              <Route path="/marketplace" component={() => <div>Marketplace (Coming Soon)</div>} />
              
              {/* Detail routes */}
              <Route path="/goals/:id" component={() => <div>Goal Details (Coming Soon)</div>} />
              <Route path="/projects/:id" component={() => <div>Project Details (Coming Soon)</div>} />
              <Route path="/vehicles/:id" component={() => <div>Vehicle Details (Coming Soon)</div>} />
              
              {/* Creation routes */}
              <Route path="/goals/create" component={() => <div>Create Goal (Coming Soon)</div>} />
              <Route path="/projects/create" component={() => <div>Create Project (Coming Soon)</div>} />
              <Route path="/vehicles/create" component={() => <div>Add Vehicle (Coming Soon)</div>} />
              <Route path="/journal/create" component={() => <div>New Journal Entry (Coming Soon)</div>} />
              
              {/* User routes */}
              <Route path="/profile" component={() => <div>Profile (Coming Soon)</div>} />
              <Route path="/settings" component={() => <div>Settings (Coming Soon)</div>} />
              
              {/* Fallback - 404 */}
              <Route component={() => <div>Page Not Found</div>} />
            </Switch>
          </Layout>
        </VehicleProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;