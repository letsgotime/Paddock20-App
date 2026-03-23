import React from 'react';
import { Link } from 'wouter';
import { MAIN_CONTENT_ID } from '../lib/accessibility';
import { useAuth } from '../hooks/useAuth';
import HeroSection from '../components/HeroSection';
import FeatureHighlights from '../components/FeatureHighlights';
import FeaturedVehicles from '../components/FeaturedVehicles';
import WeatherPreview from '../components/WeatherPreview';
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { 
  Calendar, 
  Gauge, 
  Cloud, 
  Droplets, 
  MapPin, 
  BarChart3, 
  Car, 
  Wrench, 
  ShoppingBag, 
  Award, 
  Music2, 
  Crown
} from 'lucide-react';

/**
 * HomePage Component
 * 
 * The main landing page of the Paddock20 application
 */
const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div id={MAIN_CONTENT_ID} className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Feature Highlights */}
      <section className="py-16 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-2 bg-carolina-blue/10 text-carolina-blue border-carolina-blue/30">
              THE COMPLETE AUTOMOTIVE LIFESTYLE
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Experience Your <span className="text-carolina-blue">Vehicle</span> Like Never Before
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Paddock20 combines practical automotive management with premium lifestyle 
              features for the ultimate automotive enthusiast experience.
            </p>
          </div>
          
          <FeatureHighlights />
          
          <div className="flex justify-center mt-12">
            <Button asChild className="bg-carolina-blue hover:bg-carolina-blue/90">
              <Link href={isAuthenticated ? "/dashboard" : "/auth"}>
                {isAuthenticated ? "Go to Dashboard" : "Get Started"}
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Featured Vehicles Section */}
      <FeaturedVehicles />
      
      {/* Weather Preview */}
      <section className="py-16 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-2 bg-gotime-green/10 text-gotime-green border-gotime-green/30">
              DRIVING CONDITIONS
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Weather <span className="text-gotime-green">Paddock</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Get automotive-specific weather insights for driving conditions, maintenance recommendations,
              and optimal driving times.
            </p>
          </div>
          
          <WeatherPreview />
          
          <div className="flex justify-center mt-8">
            <Button asChild variant="outline" className="border-gotime-green text-gotime-green hover:bg-gotime-green/10">
              <Link href="/weather">
                Explore Weather Paddock
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Quick Access Feature Grid */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-2 bg-carolina-blue/10 text-carolina-blue border-carolina-blue/30">
              QUICK NAVIGATION
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Explore <span className="text-carolina-blue">Key Features</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Jump directly to the features that matter most to you
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {quickAccessFeatures.map((feature, index) => (
              <Link key={index} href={feature.path}>
                <div className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-carolina-blue/50 transition-all duration-300 overflow-hidden hover:shadow-[0_0_15px_rgba(25,130,252,0.3)]">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-carolina-blue/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-carolina-blue/20 transition-all duration-300"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-lg bg-carolina-blue/10 flex items-center justify-center mb-4 group-hover:bg-carolina-blue/20 transition-all duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-400">{feature.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* Membership CTA */}
      {!isAuthenticated && (
        <section className="py-20 bg-gradient-to-r from-gray-900 to-black relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="outline" className="mb-2 bg-carolina-blue/10 text-carolina-blue border-carolina-blue/30">
                JOIN THE GRID
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Ready to <span className="text-carolina-blue">Elevate</span> Your Automotive Experience?
              </h2>
              <p className="text-gray-300 mb-8">
                Join thousands of automotive enthusiasts who use Paddock20 to manage, track, and enhance their vehicle lifestyle.
              </p>
              <Button asChild size="lg" className="bg-carolina-blue hover:bg-carolina-blue/90">
                <Link href="/auth">
                  Create Your Account
                </Link>
              </Button>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-gray-900/50 to-transparent"></div>
        </section>
      )}
    </div>
  );
};

// Quick access feature data for the homepage grid
const quickAccessFeatures = [
  {
    title: "Garage Vault",
    description: "Manage your vehicles and maintenance records",
    icon: <Car className="h-6 w-6 text-carolina-blue" />,
    path: "/garage"
  },
  {
    title: "Weather Paddock",
    description: "Automotive-specific weather insights",
    icon: <Cloud className="h-6 w-6 text-carolina-blue" />,
    path: "/weather"
  },
  {
    title: "Drive Journal",
    description: "Log and track your drives and experiences",
    icon: <Calendar className="h-6 w-6 text-carolina-blue" />,
    path: "/drive-journal"
  },
  {
    title: "Route Planner",
    description: "Plan perfect drives with weather integration",
    icon: <MapPin className="h-6 w-6 text-carolina-blue" />,
    path: "/route-planner"
  },
  {
    title: "Performance",
    description: "Track vehicle performance metrics",
    icon: <Gauge className="h-6 w-6 text-carolina-blue" />,
    path: "/performance"
  },
  {
    title: "Maintenance",
    description: "Schedule and track vehicle maintenance",
    icon: <Wrench className="h-6 w-6 text-carolina-blue" />,
    path: "/maintenance"
  },
  {
    title: "Juice Box",
    description: "Detailing resources and tutorials",
    icon: <Droplets className="h-6 w-6 text-carolina-blue" />,
    path: "/juicebox"
  },
  {
    title: "Tires & Timepieces",
    description: "Shop premium automotive products",
    icon: <ShoppingBag className="h-6 w-6 text-carolina-blue" />,
    path: "/tires-timepieces"
  },
  {
    title: "Podium Pursuit",
    description: "Set and track automotive goals",
    icon: <Award className="h-6 w-6 text-carolina-blue" />,
    path: "/podium-pursuit"
  },
  {
    title: "Dashboard",
    description: "Your personalized automotive hub",
    icon: <BarChart3 className="h-6 w-6 text-carolina-blue" />,
    path: "/dashboard"
  },
  {
    title: "Track Day",
    description: "Prepare for and log track experiences",
    icon: <Crown className="h-6 w-6 text-carolina-blue" />,
    path: "/track-day"
  },
  {
    title: "Drive Soundtrack",
    description: "Spotify integration for perfect drives",
    icon: <Music2 className="h-6 w-6 text-carolina-blue" />,
    path: "/drive-soundtrack"
  }
];

export default HomePage;