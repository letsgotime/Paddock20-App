/**
 * OptimizedOnboardingPage.tsx
 * 
 * A dedicated page for the enhanced onboarding experience that follows the 30% feature
 * introduction approach with status indicators for incomplete setup.
 * 
 * Design by: Replit AI & GoTime Motorsports Engineering Team
 * Last updated: May 2025
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  ChevronRight, 
  Info, 
  Settings, 
  CheckCircle2, 
  Gauge,
  Flag,
  Car,
  Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import PageTitle from '@/components/PageTitle';
import OptimizedOnboardingJourney from '@/components/OptimizedOnboardingJourney';
import UserProfileCard from '@/components/UserProfileCard';
import { useAuth } from '@/auth/useAuth';

// Styled content section component
const ContentSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div className="mb-6">
    <div className="flex items-center gap-2 mb-3">
      <div className="bg-[#1982FC]/10 p-2 rounded-full text-[#1982FC]">
        {icon}
      </div>
      <h2 className="text-lg font-bold text-white">{title}</h2>
    </div>
    <div className="pl-10">
      {children}
    </div>
  </div>
);

interface OptimizedOnboardingPageProps {
  showAllFeatures?: boolean;
}

const OptimizedOnboardingPage: React.FC<OptimizedOnboardingPageProps> = ({ showAllFeatures: propShowAll = false }) => {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('essential');
  
  // Determine if URL indicates "all features" view or if passed as prop
  const showAllFeatures = propShowAll || window.location.pathname.includes('/all');
  
  return (
    <div className="container py-8 px-4 max-w-7xl mx-auto">
      <PageTitle title="Paddock Setup" />
      
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-400 mb-6">
        <Link href="/dashboard">
          <span className="hover:text-[#1982FC] cursor-pointer">Home</span>
        </Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="text-white">Paddock Setup</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Main content area */}
        <div className="md:col-span-8 lg:col-span-9 space-y-6">
          {/* Introduction */}
          <div className="bg-gradient-to-br from-[#121212] to-[#0a0a0a] rounded-xl p-6 border border-[#222] shadow-md">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 font-orbitron">
              Welcome to Your <span className="text-[#1982FC]">PADDOCK</span>
              <span className="text-[#08c519]">20</span> Setup
            </h1>
            <p className="text-gray-300 mb-4 max-w-3xl">
              Complete your essential setup to access the core features of PADDOCK20. Additional features 
              will become available as you progress through your onboarding journey. Follow the steps below 
              to personalize your automotive lifestyle experience.
            </p>
            
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => setActiveTab('essential')}
                variant={activeTab === 'essential' ? 'default' : 'outline'}
                className={activeTab === 'essential' 
                  ? 'bg-[#1982FC] hover:bg-[#1982FC]/90' 
                  : 'border-[#1982FC]/30 text-[#1982FC] hover:text-[#1982FC]/80'
                }
              >
                Essential Setup
              </Button>
              <Button
                onClick={() => setActiveTab('advanced')}
                variant={activeTab === 'advanced' ? 'default' : 'outline'}
                className={activeTab === 'advanced' 
                  ? 'bg-yellow-500 hover:bg-yellow-500/90' 
                  : 'border-yellow-500/30 text-yellow-500 hover:text-yellow-500/80'
                }
              >
                Advanced Features
              </Button>
              <Button
                onClick={() => setActiveTab('premium')}
                variant={activeTab === 'premium' ? 'default' : 'outline'}
                className={activeTab === 'premium' 
                  ? 'bg-purple-500 hover:bg-purple-500/90' 
                  : 'border-purple-500/30 text-purple-500 hover:text-purple-500/80'
                }
              >
                Premium Experience
              </Button>
              
              <Button
                onClick={() => navigate('/paddock')}
                variant="ghost"
                className="ml-auto text-white"
              >
                Skip to Paddock <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Onboarding journey */}
          <OptimizedOnboardingJourney showAllSteps={showAllFeatures} />
          
          {/* Tabs for different categories */}
          <Tabs defaultValue="essential" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full bg-[#0a0a0a] border border-[#222]">
              <TabsTrigger 
                value="essential" 
                className="data-[state=active]:bg-[#1982FC] data-[state=active]:text-white"
              >
                Essential Setup
              </TabsTrigger>
              <TabsTrigger 
                value="advanced"
                className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white"
              >
                Advanced Features
              </TabsTrigger>
              <TabsTrigger 
                value="premium"
                className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
              >
                Premium Experience
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="essential" className="pt-4">
              <ContentSection title="Driver Profile" icon={<Settings />}>
                <p className="text-gray-300 mb-4">
                  Set up your personal driver profile to personalize your PADDOCK20 experience.
                  This information helps us tailor content and recommendations to your preferences.
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle2 className="h-4 w-4 text-[#08c519]" />
                    <span>Basic driver information</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle2 className="h-4 w-4 text-[#08c519]" />
                    <span>Automotive interests</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle2 className="h-4 w-4 text-[#08c519]" />
                    <span>Driving experience level</span>
                  </li>
                </ul>
                <Link href="/profile">
                  <Button className="bg-[#1982FC] hover:bg-[#1982FC]/90">
                    Complete Driver Profile
                  </Button>
                </Link>
              </ContentSection>
              
              <Separator className="my-6 bg-[#222]" />
              
              <ContentSection title="Vehicle Setup" icon={<Car />}>
                <p className="text-gray-300 mb-4">
                  Add your primary vehicle to unlock personalized maintenance schedules,
                  driving recommendations, and vehicle-specific features.
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle2 className="h-4 w-4 text-[#08c519]" />
                    <span>Basic vehicle information</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle2 className="h-4 w-4 text-[#08c519]" />
                    <span>Performance specifications</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle2 className="h-4 w-4 text-[#08c519]" />
                    <span>Vehicle image (optional)</span>
                  </li>
                </ul>
                <Link href="/garage/add">
                  <Button className="bg-[#1982FC] hover:bg-[#1982FC]/90">
                    Add Vehicle
                  </Button>
                </Link>
              </ContentSection>
              
              <Separator className="my-6 bg-[#222]" />
              
              <ContentSection title="Weather & Location" icon={<Flag />}>
                <p className="text-gray-300 mb-4">
                  Set your primary location and weather preferences to receive
                  driving condition alerts and route recommendations.
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle2 className="h-4 w-4 text-[#08c519]" />
                    <span>Home location</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle2 className="h-4 w-4 text-[#08c519]" />
                    <span>Weather alert preferences</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle2 className="h-4 w-4 text-[#08c519]" />
                    <span>Units (Imperial/Metric)</span>
                  </li>
                </ul>
                <div className="flex gap-3">
                  <Link href="/settings/location">
                    <Button className="bg-[#1982FC] hover:bg-[#1982FC]/90">
                      Set Location
                    </Button>
                  </Link>
                  <Link href="/weather/setup">
                    <Button variant="outline" className="border-[#1982FC]/30 text-[#1982FC]">
                      Weather Preferences
                    </Button>
                  </Link>
                </div>
              </ContentSection>
            </TabsContent>
            
            <TabsContent value="advanced" className="pt-4">
              <ContentSection title="Driving Goals" icon={<Flag />}>
                <p className="text-gray-300 mb-4">
                  Set automotive goals to track your progress and get personalized recommendations
                  for achieving your automotive dreams.
                </p>
                <Link href="/goals">
                  <Button className="bg-yellow-500 hover:bg-yellow-500/90">
                    Set Driving Goals
                  </Button>
                </Link>
              </ContentSection>
              
              <Separator className="my-6 bg-[#222]" />
              
              <ContentSection title="Maintenance Records" icon={<Gauge />}>
                <p className="text-gray-300 mb-4">
                  Track service history, set maintenance reminders, and receive personalized
                  service recommendations for your vehicles.
                </p>
                <Link href="/garage/service">
                  <Button className="bg-yellow-500 hover:bg-yellow-500/90">
                    Setup Maintenance Tracking
                  </Button>
                </Link>
              </ContentSection>
            </TabsContent>
            
            <TabsContent value="premium" className="pt-4">
              <div className="bg-gradient-to-br from-purple-950/30 to-[#0a0a0a] rounded-xl p-6 border border-purple-900/30 mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Premium Features</h3>
                <p className="text-gray-300 mb-4">
                  Unlock the full potential of your automotive lifestyle with PADDOCK20 premium features.
                  Upgrade your experience for exclusive tools, enhanced tracking, and priority support.
                </p>
                <Button className="bg-purple-500 hover:bg-purple-500/90">
                  Explore Premium Features
                </Button>
              </div>
              
              <ContentSection title="Detailing Plans" icon={<Info />}>
                <p className="text-gray-300 mb-4">
                  Create personalized detailing schedules, track products, and maintain
                  your vehicle's appearance with comprehensive care plans.
                </p>
                <Link href="/juicebox">
                  <Button className="bg-purple-500 hover:bg-purple-500/90">
                    Setup Detailing
                  </Button>
                </Link>
              </ContentSection>
              
              <Separator className="my-6 bg-[#222]" />
              
              <ContentSection title="Driver Achievements" icon={<Trophy />}>
                <p className="text-gray-300 mb-4">
                  Track your automotive milestones, earn badges, and showcase your
                  accomplishments with the PADDOCK20 achievement system.
                </p>
                <Link href="/achievements">
                  <Button className="bg-purple-500 hover:bg-purple-500/90">
                    View Achievements
                  </Button>
                </Link>
              </ContentSection>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div className="md:col-span-4 lg:col-span-3 space-y-6">
          {/* User profile card */}
          <UserProfileCard />
          
          {/* Quick help card */}
          <div className="bg-[#0a0a0a] rounded-xl p-4 border border-[#222] shadow-md">
            <h3 className="font-bold text-white mb-3 flex items-center gap-2">
              <Info className="h-4 w-4 text-[#1982FC]" />
              Setup Tips
            </h3>
            <div className="space-y-3 text-sm">
              <p className="text-gray-300">
                Complete the essential setup first to unlock the core PADDOCK20 experience.
              </p>
              <p className="text-gray-300">
                You can always access this setup page later from your profile settings.
              </p>
              <p className="text-gray-300">
                Missing something? Visit the <Link href="/help"><span className="text-[#1982FC] hover:underline">Help Center</span></Link> for assistance.
              </p>
            </div>
          </div>
          
          {/* Progress summary */}
          <div className="bg-[#0a0a0a] rounded-xl p-4 border border-[#222] shadow-md">
            <h3 className="font-bold text-white mb-3">Your Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#1982FC]">Essential</span>
                  <span className="text-gray-400">3/4 completed</span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#1982FC]" style={{ width: '75%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-yellow-500">Advanced</span>
                  <span className="text-gray-400">1/3 completed</span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500" style={{ width: '33%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-purple-500">Premium</span>
                  <span className="text-gray-400">0/3 completed</span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="bg-[#0a0a0a] rounded-xl p-4 border border-[#222] shadow-md">
            <Link href="/paddock">
              <Button className="w-full bg-[#1982FC] hover:bg-[#1982FC]/90 mb-3">
                Enter Your Paddock
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="outline" className="w-full border-[#222] text-gray-300 hover:bg-[#161616]">
                Account Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizedOnboardingPage;