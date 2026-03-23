/**
 * PaddockPage.tsx
 * 
 * The main dashboard page that combines driver information, dashboard widgets,
 * and personalized job dashboard components into a unified experience.
 * 
 * Design by: Replit AI & GoTime Motorsports Engineering Team
 * Last updated: May 2025
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Settings, 
  Gauge, 
  Calendar, 
  Cloud, 
  Car, 
  User, 
  PaintBucket,
  Trophy,
  Clock,
  Bell,
  Plus,
  Layers,
  ChevronRight,
  ChevronDown,
  Users,
  Map,
  BarChart
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import PageTitle from '@/components/PageTitle';
import UserProfileCard from '@/components/UserProfileCard';
import OptimizedOnboardingJourney from '@/components/OptimizedOnboardingJourney';
import { useAuth } from '@/auth/useAuth';
import { usePermissions } from '@/auth/usePermissions';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

// Styled dashboard widget component
const DashboardWidget: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  actionLink?: string;
  actionText?: string;
  accent?: string;
}> = ({ 
  title, 
  icon, 
  children, 
  actionLink, 
  actionText = "View",
  accent = "#1982FC" 
}) => (
  <div className="bg-[#0a0a0a] rounded-xl border border-[#222] shadow-md overflow-hidden">
    <div 
      className="flex justify-between items-center p-4 border-b border-[#222]"
      style={{ borderBottomColor: `${accent}20` }}
    >
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-full" style={{ backgroundColor: `${accent}15`, color: accent }}>
          {icon}
        </div>
        <h3 className="font-bold text-white">{title}</h3>
      </div>
      
      {actionLink && (
        <Link href={actionLink}>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-3 text-xs"
            style={{ color: accent }}
          >
            {actionText}
            <ChevronRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      )}
    </div>
    <div className="p-4">
      {children}
    </div>
  </div>
);

// Styled dashboard section component
const DashboardSection: React.FC<{
  title: string;
  children: React.ReactNode;
  rightContent?: React.ReactNode;
}> = ({ title, children, rightContent }) => (
  <div className="mb-8">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold text-white font-orbitron">{title}</h2>
      {rightContent}
    </div>
    {children}
  </div>
);

// Placeholder components for various dashboard widgets
const WeatherSummaryWidget = () => (
  <div className="flex items-center justify-between">
    <div>
      <div className="text-2xl font-bold text-white mb-1">68°F</div>
      <div className="text-sm text-gray-400">Partly Cloudy</div>
      <div className="text-xs text-[#1982FC] mt-2">Perfect driving conditions</div>
    </div>
    <div className="text-5xl text-gray-300">☁️</div>
  </div>
);

const VehicleStatusWidget = () => (
  <div>
    <div className="flex items-center gap-3 mb-3">
      <div className="bg-[#111] rounded-md p-2 h-16 w-16 flex items-center justify-center">
        <Car className="h-8 w-8 text-gray-400" />
      </div>
      <div>
        <div className="text-white font-medium">2023 Toyota GR86</div>
        <div className="text-sm text-gray-400">12,450 miles</div>
      </div>
    </div>
    <div className="space-y-2">
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-400">Oil Life</span>
          <span className="text-white">65%</span>
        </div>
        <div className="w-full h-1.5 bg-[#222] rounded-full overflow-hidden">
          <div className="h-full bg-[#1982FC]" style={{ width: '65%' }}></div>
        </div>
      </div>
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-400">Tire Pressure</span>
          <span className="text-white">Good</span>
        </div>
        <div className="w-full h-1.5 bg-[#222] rounded-full overflow-hidden">
          <div className="h-full bg-[#08c519]" style={{ width: '95%' }}></div>
        </div>
      </div>
    </div>
  </div>
);

const UpcomingDriveWidget = () => (
  <div>
    <div className="flex items-center gap-3 mb-3">
      <div className="bg-[#08c519]/10 text-[#08c519] rounded-full p-2">
        <Calendar className="h-5 w-5" />
      </div>
      <div>
        <div className="font-medium text-white">Mountain Drive</div>
        <div className="text-sm text-gray-400">Tomorrow, 9:00 AM</div>
      </div>
    </div>
    <div className="bg-[#111] rounded-lg p-3 text-sm">
      <div className="flex items-center gap-2 text-white mb-1">
        <Map className="h-4 w-4 text-[#1982FC]" />
        <span>Blue Ridge Parkway</span>
      </div>
      <div className="flex items-center gap-2 text-gray-400">
        <Clock className="h-4 w-4" />
        <span>3 hours, 120 miles</span>
      </div>
    </div>
  </div>
);

const DetailingReminderWidget = () => (
  <div>
    <div className="flex items-center gap-3 mb-3">
      <div className="bg-purple-500/10 text-purple-500 rounded-full p-2">
        <PaintBucket className="h-5 w-5" />
      </div>
      <div>
        <div className="font-medium text-white">Weekly Detail</div>
        <div className="text-sm text-gray-400">Due in 2 days</div>
      </div>
    </div>
    <ul className="space-y-2 text-sm">
      <li className="flex items-start gap-2">
        <div className="w-4 h-4 rounded-full border border-purple-500/50 flex-shrink-0 mt-0.5"></div>
        <span className="text-gray-300">Exterior wash</span>
      </li>
      <li className="flex items-start gap-2">
        <div className="w-4 h-4 rounded-full border border-purple-500/50 flex-shrink-0 mt-0.5"></div>
        <span className="text-gray-300">Tire cleaning & dressing</span>
      </li>
      <li className="flex items-start gap-2">
        <div className="w-4 h-4 rounded-full border border-purple-500/50 flex-shrink-0 mt-0.5"></div>
        <span className="text-gray-300">Quick interior wipedown</span>
      </li>
    </ul>
  </div>
);

const AutoGoalsWidget = () => (
  <div>
    <div className="flex items-center gap-3 mb-3">
      <div className="bg-yellow-500/10 text-yellow-500 rounded-full p-2">
        <Trophy className="h-5 w-5" />
      </div>
      <div>
        <div className="font-medium text-white">Active Goals</div>
        <div className="text-sm text-gray-400">2 in progress</div>
      </div>
    </div>
    <div className="space-y-3">
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-white">Track Day Preparation</span>
          <span className="text-gray-400">40%</span>
        </div>
        <div className="w-full h-1.5 bg-[#222] rounded-full overflow-hidden">
          <div className="h-full bg-yellow-500" style={{ width: '40%' }}></div>
        </div>
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-white">Performance Upgrades</span>
          <span className="text-gray-400">15%</span>
        </div>
        <div className="w-full h-1.5 bg-[#222] rounded-full overflow-hidden">
          <div className="h-full bg-yellow-500" style={{ width: '15%' }}></div>
        </div>
      </div>
    </div>
  </div>
);

const CarCommunitySummaryWidget = () => (
  <div>
    <div className="flex items-center gap-3 mb-3">
      <div className="bg-[#1982FC]/10 text-[#1982FC] rounded-full p-2">
        <Users className="h-5 w-5" />
      </div>
      <div>
        <div className="font-medium text-white">Community</div>
        <div className="text-sm text-gray-400">3 new activities</div>
      </div>
    </div>
    <div className="space-y-3 text-sm">
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 bg-[#222] rounded-full flex-shrink-0"></div>
        <div>
          <span className="text-[#1982FC]">CarDriver86</span>
          <span className="text-gray-300"> commented on your mod post</span>
          <div className="text-xs text-gray-400 mt-0.5">15 minutes ago</div>
        </div>
      </div>
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 bg-[#222] rounded-full flex-shrink-0"></div>
        <div>
          <span className="text-[#1982FC]">MountainRunners</span>
          <span className="text-gray-300"> added a new group drive</span>
          <div className="text-xs text-gray-400 mt-0.5">2 hours ago</div>
        </div>
      </div>
    </div>
  </div>
);

const DrivingStatsWidget = () => (
  <div>
    <div className="flex items-center gap-3 mb-3">
      <div className="bg-green-500/10 text-green-500 rounded-full p-2">
        <BarChart className="h-5 w-5" />
      </div>
      <div>
        <div className="font-medium text-white">Driving Stats</div>
        <div className="text-sm text-gray-400">This month</div>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-2">
      <div className="bg-[#111] p-2 rounded-lg text-center">
        <div className="text-lg font-bold text-white">328</div>
        <div className="text-xs text-gray-400">miles</div>
      </div>
      <div className="bg-[#111] p-2 rounded-lg text-center">
        <div className="text-lg font-bold text-white">6</div>
        <div className="text-xs text-gray-400">drives</div>
      </div>
      <div className="bg-[#111] p-2 rounded-lg text-center">
        <div className="text-lg font-bold text-[#08c519]">A+</div>
        <div className="text-xs text-gray-400">rating</div>
      </div>
    </div>
    <div className="mt-3 pt-3 border-t border-[#222] text-center">
      <div className="text-xs text-gray-400">Best drive: Blue Ridge Run (May 2)</div>
    </div>
  </div>
);

const PaddockPage: React.FC = () => {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  
  // Feature flag checks
  const canAccessJuiceBox = useFeatureFlag('juicebox');
  const canAccessCommunity = useFeatureFlag('community');
  const canAccessPremiumDashboards = useFeatureFlag('premium_dashboards');
  
  // Dashboard layout state (for saving preferences)
  const [activeTab, setActiveTab] = useState('dashboard');
  const [layout, setLayout] = useState('default');
  
  // Check if onboarding is complete
  const isOnboardingComplete = user?.profile?.onboardingComplete;
  const hasVehicle = user?.vehicles?.length > 0;
  
  return (
    <div className="container pt-6 pb-12 px-4 max-w-7xl mx-auto">
      <PageTitle title="Your Paddock" />
      
      {/* Main header with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-orbitron">
            Welcome to Your <span className="text-[#1982FC]">PADDOCK</span>
            <span className="text-[#08c519]">20</span>
          </h1>
          <p className="text-gray-300">Your personalized automotive command center</p>
        </div>
        
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-[#222] text-gray-300 hover:bg-[#161616]">
                <Plus className="mr-2 h-4 w-4" />
                Add New
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#161616] border-[#222]">
              <DropdownMenuItem className="hover:bg-[#222] focus:bg-[#222] cursor-pointer">
                <Link href="/garage/add" className="flex items-center gap-2 w-full">
                  <Car className="h-4 w-4" />
                  <span>Add Vehicle</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-[#222] focus:bg-[#222] cursor-pointer">
                <Link href="/routes/add" className="flex items-center gap-2 w-full">
                  <Map className="h-4 w-4" />
                  <span>Add Route</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-[#222] focus:bg-[#222] cursor-pointer">
                <Link href="/goals/add" className="flex items-center gap-2 w-full">
                  <Trophy className="h-4 w-4" />
                  <span>Add Goal</span>
                </Link>
              </DropdownMenuItem>
              {canAccessJuiceBox && (
                <DropdownMenuItem className="hover:bg-[#222] focus:bg-[#222] cursor-pointer">
                  <Link href="/juicebox/schedule" className="flex items-center gap-2 w-full">
                    <PaintBucket className="h-4 w-4" />
                    <span>Add Detail Plan</span>
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Link href="/settings">
            <Button variant="ghost" size="icon" className="text-gray-300 hover:bg-[#161616]">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
          
          <Link href="/notifications">
            <Button variant="ghost" size="icon" className="text-gray-300 hover:bg-[#161616] relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#1982FC] rounded-full"></span>
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Onboarding component (if not complete) */}
      {!isOnboardingComplete && (
        <div className="mb-8">
          <OptimizedOnboardingJourney compact />
        </div>
      )}
      
      {/* Main dashboard tabs */}
      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
        <TabsList className="bg-[#0a0a0a] border border-[#222]">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-[#1982FC]">
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="driver" className="data-[state=active]:bg-[#1982FC]">
            Driver Profile
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="data-[state=active]:bg-[#1982FC]">
            Maintenance
          </TabsTrigger>
          {canAccessPremiumDashboards && (
            <TabsTrigger value="detailed" className="data-[state=active]:bg-[#08c519]">
              Pro Dashboard
            </TabsTrigger>
          )}
        </TabsList>
      </Tabs>
      
      {/* Main Content */}
      <TabsContent value="dashboard" className="mt-0">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main dashboard area */}
          <div className="md:col-span-8 lg:col-span-9 space-y-6">
            
            {/* Layout selection */}
            <div className="flex justify-end mb-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-8 text-xs border-[#222] text-gray-300 hover:bg-[#161616]"
                  >
                    <Layers className="mr-2 h-3 w-3" />
                    Layout: {layout}
                    <ChevronDown className="ml-2 h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#161616] border-[#222]">
                  <DropdownMenuItem 
                    onClick={() => setLayout('default')}
                    className="hover:bg-[#222] focus:bg-[#222] cursor-pointer"
                  >
                    Default
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setLayout('driver_focused')}
                    className="hover:bg-[#222] focus:bg-[#222] cursor-pointer"
                  >
                    Driver Focused
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setLayout('vehicle_focused')}
                    className="hover:bg-[#222] focus:bg-[#222] cursor-pointer"
                  >
                    Vehicle Focused
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Dashboard Sections */}
            <DashboardSection 
              title="At a Glance" 
              rightContent={
                <Link href="/weather">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-xs border-[#222] text-[#1982FC] hover:bg-[#161616]"
                  >
                    View Details
                  </Button>
                </Link>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <DashboardWidget 
                  title="Weather" 
                  icon={<Cloud className="h-4 w-4" />}
                  actionLink="/weather"
                >
                  <WeatherSummaryWidget />
                </DashboardWidget>
                
                <DashboardWidget 
                  title="Vehicle Status" 
                  icon={<Car className="h-4 w-4" />}
                  actionLink="/garage"
                >
                  <VehicleStatusWidget />
                </DashboardWidget>
                
                <DashboardWidget 
                  title="Upcoming Drive" 
                  icon={<Calendar className="h-4 w-4" />}
                  actionLink="/calendar"
                  accent="#08c519"
                >
                  <UpcomingDriveWidget />
                </DashboardWidget>
              </div>
            </DashboardSection>
            
            <DashboardSection 
              title="Your Progress"
              rightContent={
                <Link href="/goals">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-xs border-[#222] text-yellow-500 hover:bg-[#161616]"
                  >
                    Manage Goals
                  </Button>
                </Link>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <DashboardWidget 
                  title="Automotive Goals" 
                  icon={<Trophy className="h-4 w-4" />}
                  actionLink="/goals"
                  accent="#EAB308"
                >
                  <AutoGoalsWidget />
                </DashboardWidget>
                
                <DashboardWidget 
                  title="Driving Stats" 
                  icon={<Gauge className="h-4 w-4" />}
                  actionLink="/stats"
                  accent="#08c519"
                >
                  <DrivingStatsWidget />
                </DashboardWidget>
                
                {canAccessCommunity ? (
                  <DashboardWidget 
                    title="Community" 
                    icon={<Users className="h-4 w-4" />}
                    actionLink="/community"
                  >
                    <CarCommunitySummaryWidget />
                  </DashboardWidget>
                ) : (
                  <DashboardWidget 
                    title="Detailing Schedule" 
                    icon={<PaintBucket className="h-4 w-4" />}
                    actionLink="/juicebox"
                    accent="#A855F7"
                    actionText={canAccessJuiceBox ? "View" : "Upgrade"}
                  >
                    <DetailingReminderWidget />
                  </DashboardWidget>
                )}
              </div>
            </DashboardSection>
            
            {/* Show more sections based on layout selection */}
            {layout === 'driver_focused' && (
              <DashboardSection title="Driver Focus">
                {/* Additional driver-focused widgets would go here */}
                <div className="p-8 border border-dashed border-[#222] rounded-xl text-center">
                  <p className="text-gray-400">Additional driver-focused widgets</p>
                </div>
              </DashboardSection>
            )}
            
            {layout === 'vehicle_focused' && (
              <DashboardSection title="Vehicle Focus">
                {/* Additional vehicle-focused widgets would go here */}
                <div className="p-8 border border-dashed border-[#222] rounded-xl text-center">
                  <p className="text-gray-400">Additional vehicle-focused widgets</p>
                </div>
              </DashboardSection>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="md:col-span-4 lg:col-span-3 space-y-6">
            {/* User profile card */}
            <UserProfileCard />
            
            {/* Quick actions */}
            <div className="bg-[#0a0a0a] rounded-xl p-4 border border-[#222] shadow-md">
              <h3 className="font-bold text-white mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/weather">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-[#222] text-gray-300 hover:bg-[#161616]"
                  >
                    <Cloud className="mr-2 h-4 w-4 text-[#1982FC]" />
                    Check Weather
                  </Button>
                </Link>
                
                <Link href="/garage">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-[#222] text-gray-300 hover:bg-[#161616]"
                  >
                    <Car className="mr-2 h-4 w-4 text-[#1982FC]" />
                    Manage Vehicles
                  </Button>
                </Link>
                
                <Link href="/routes">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-[#222] text-gray-300 hover:bg-[#161616]"
                  >
                    <Map className="mr-2 h-4 w-4 text-[#1982FC]" />
                    Plan a Drive
                  </Button>
                </Link>
                
                <Link href="/journal/add">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-[#222] text-gray-300 hover:bg-[#161616]"
                  >
                    <Plus className="mr-2 h-4 w-4 text-[#08c519]" />
                    Add Drive Journal
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Upcoming maintenance */}
            <div className="bg-[#0a0a0a] rounded-xl p-4 border border-[#222] shadow-md">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-white">Upcoming Maintenance</h3>
                <Link href="/garage/service">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 text-xs text-[#1982FC]"
                  >
                    View All
                  </Button>
                </Link>
              </div>
              
              {hasVehicle ? (
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2 pb-2 border-b border-[#222]">
                    <div className="p-1 rounded-full bg-yellow-500/10 text-yellow-500">
                      <Gauge className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium text-white">Oil Change</div>
                      <div className="text-xs text-gray-400">Due in 2,500 miles</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <div className="p-1 rounded-full bg-[#1982FC]/10 text-[#1982FC]">
                      <Gauge className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium text-white">Tire Rotation</div>
                      <div className="text-xs text-gray-400">Due in 4,000 miles</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400 text-sm">
                  <Car className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>Add a vehicle to see maintenance reminders</p>
                  <Link href="/garage/add">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 border-[#222] text-[#1982FC] hover:bg-[#161616]"
                    >
                      Add Vehicle
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="driver" className="mt-0">
        <div className="text-center py-12">
          <h2 className="text-xl font-bold mb-3 text-white">Driver Profile Tab</h2>
          <p className="text-gray-400 mb-6">This tab would show the full driver profile content.</p>
          <p className="text-gray-500">Content will be implemented in the next phase.</p>
        </div>
      </TabsContent>
      
      <TabsContent value="maintenance" className="mt-0">
        <div className="text-center py-12">
          <h2 className="text-xl font-bold mb-3 text-white">Maintenance Tab</h2>
          <p className="text-gray-400 mb-6">This tab would show detailed maintenance information.</p>
          <p className="text-gray-500">Content will be implemented in the next phase.</p>
        </div>
      </TabsContent>
      
      <TabsContent value="detailed" className="mt-0">
        <div className="text-center py-12">
          <h2 className="text-xl font-bold mb-3 text-[#08c519]">Pro Dashboard</h2>
          <p className="text-gray-400 mb-6">This premium dashboard provides enhanced insights and controls.</p>
          <p className="text-gray-500">Premium content will be implemented in the next phase.</p>
        </div>
      </TabsContent>
    </div>
  );
};

export default PaddockPage;