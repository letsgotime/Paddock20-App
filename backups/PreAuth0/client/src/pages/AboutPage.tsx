import React from "react";
import { motion } from "framer-motion";
import { CalendarRange, Map, Car, Star, Heart, Users, Clock, Hexagon, Wrench, Gauge, Shield, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#050505] to-[#111] pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="font-orbitron text-5xl font-bold tracking-tight text-blue-400 mb-6">
              Tires & Timepieces
            </h1>
            <p className="text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              The premier platform for automotive enthusiasts who understand that excellence transcends boundaries, 
              whether in vehicles, timepieces, or life pursuits.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <div className="bg-gradient-to-b from-[#0a0a0a] to-[#080808] p-8 rounded-xl border border-gray-800 text-center">
              <div className="mb-4 inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-900/30 text-blue-400">
                <Car className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-blue-400 mb-3">For Drivers</h3>
              <p className="text-gray-400">
                Advanced route planning, comprehensive drive journals, detailed vehicle management, and maintenance tracking designed for those who truly appreciate the driving experience.
              </p>
            </div>
            
            <div className="bg-gradient-to-b from-[#0a0a0a] to-[#080808] p-8 rounded-xl border border-gray-800 text-center">
              <div className="mb-4 inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-900/30 text-blue-400">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-blue-400 mb-3">For Collectors</h3>
              <p className="text-gray-400">
                A sophisticated platform for tracking your timepiece collection, discovering new pieces, connecting with fellow enthusiasts, and managing the legacy of your investments.
              </p>
            </div>
            
            <div className="bg-gradient-to-b from-[#0a0a0a] to-[#080808] p-8 rounded-xl border border-gray-800 text-center">
              <div className="mb-4 inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-900/30 text-blue-400">
                <Star className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-blue-400 mb-3">For Dreamers</h3>
              <p className="text-gray-400">
                The revolutionary Manifestation Station helps you transform goals into achievements through structured planning, discipline tracking, and our proprietary 7 Elements System.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0a0a0a] border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="manifesto" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="bg-[#111] border border-gray-800">
                <TabsTrigger value="manifesto" className="data-[state=active]:bg-blue-900 data-[state=active]:text-white">
                  Our Manifesto
                </TabsTrigger>
                <TabsTrigger value="philosophy" className="data-[state=active]:bg-blue-900 data-[state=active]:text-white">
                  Core Philosophy
                </TabsTrigger>
                <TabsTrigger value="community" className="data-[state=active]:bg-blue-900 data-[state=active]:text-white">
                  Community Values
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="manifesto" className="mt-0">
              <div className="bg-gradient-to-b from-[#0a0a0a] to-[#080808] p-8 rounded-xl border border-gray-800">
                <h2 className="text-3xl font-bold text-blue-400 mb-6 text-center">Built for Drivers, Engineered for Dreamers, Designed for Legacy</h2>
                <div className="prose prose-invert max-w-4xl mx-auto">
                  <p className="text-gray-300 leading-relaxed mb-6">
                    We live in a world where the passion for automotive excellence and precision timepieces transcends mere ownership. It represents a lifestyle philosophy that celebrates craftsmanship, performance, and the relentless pursuit of perfection.
                  </p>
                  <p className="text-gray-300 leading-relaxed mb-6">
                    Our platform isn't just another app—it's a comprehensive ecosystem where enthusiasts can track, plan, maintain, and ultimately manifest their automotive and horological aspirations. We believe that those who appreciate the mechanical symphony of a finely tuned engine often share an appreciation for the intricate dance of gears in a mechanical timepiece.
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    Whether you're planning the perfect drive through winding mountain roads, tracking maintenance on your prized vehicle, or cataloging your watch collection, our platform seamlessly integrates these passions with powerful tools for goal setting and achievement. Because true enthusiasts understand that excellence in one area often fuels excellence in all aspects of life.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="philosophy" className="mt-0">
              <div className="bg-gradient-to-b from-[#0a0a0a] to-[#080808] p-8 rounded-xl border border-gray-800">
                <h2 className="text-3xl font-bold text-blue-400 mb-6 text-center">Excellence Through Precision and Passion</h2>
                <div className="prose prose-invert max-w-4xl mx-auto">
                  <p className="text-gray-300 leading-relaxed mb-6">
                    Our core philosophy revolves around the belief that precision leads to perfection, whether in the curve of a road, the timing of a lap, or the mechanical intricacies of a timepiece. We recognize the profound connection between automotive excellence and horological mastery – both worlds demand attention to detail, appreciate technical innovation, and reward patient dedication.
                  </p>
                  <p className="text-gray-300 leading-relaxed mb-6">
                    This platform was born from the understanding that true enthusiasts don't simply consume – they create, maintain, and cultivate. Our tools empower users to approach their passions with the same meticulous care that went into engineering their favorite vehicles and timepieces.
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    Through our revolutionary 7 Elements System, we've distilled the principles of achievement into actionable frameworks that apply whether you're restoring a classic car, curating a watch collection, or pursuing personal excellence. Every feature has been designed to enhance your experience while respecting the traditions that make automotive and horological pursuits timeless.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="community" className="mt-0">
              <div className="bg-gradient-to-b from-[#0a0a0a] to-[#080808] p-8 rounded-xl border border-gray-800">
                <h2 className="text-3xl font-bold text-blue-400 mb-6 text-center">A Community of Excellence and Support</h2>
                <div className="prose prose-invert max-w-4xl mx-auto">
                  <p className="text-gray-300 leading-relaxed mb-6">
                    At the heart of our platform lies a vibrant community united by shared passions and values. We believe that excellence thrives in environments where knowledge is freely shared, achievements are celebrated, and challenges are met with support.
                  </p>
                  <p className="text-gray-300 leading-relaxed mb-6">
                    Our members understand that true luxury isn't found in exclusivity, but in the quality of experiences, relationships, and achievements. From novice enthusiasts to seasoned collectors, everyone brings valuable perspective to our community discussions, events, and charitable initiatives.
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    We're committed to fostering connections that extend beyond digital interactions into meaningful real-world relationships. Through local meetups, driving events, and exclusive experiences, our platform becomes a gateway to a lifestyle where passion meets purpose, and individual pursuits contribute to collective elevation.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-blue-400 mb-4">Comprehensive Ecosystem</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Our platform integrates multiple specialized modules into a seamless experience for automotive and timepiece enthusiasts.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Map className="h-6 w-6" />}
              title="Route Planner"
              description="Plan the perfect drives with weather forecasts, road conditions, and points of interest. Save and share your favorite routes."
            />
            <FeatureCard 
              icon={<CalendarRange className="h-6 w-6" />}
              title="Drive Journal"
              description="Document your driving experiences with rich media, performance metrics, and emotional insights. Never forget a memorable drive."
            />
            <FeatureCard 
              icon={<Car className="h-6 w-6" />}
              title="Garage Vault"
              description="Manage your vehicle collection with comprehensive maintenance tracking, modification logs, and value appreciation tools."
            />
            <FeatureCard 
              icon={<Star className="h-6 w-6" />}
              title="Manifestation Station"
              description="Transform goals into achievements with our proprietary 7 Elements System. Track progress and celebrate milestones."
            />
            <FeatureCard 
              icon={<Clock className="h-6 w-6" />}
              title="Timepiece Tracker"
              description="Catalog your watch collection with detailed specifications, service history, and market valuation. Set notifications for service intervals."
            />
            <FeatureCard 
              icon={<Gauge className="h-6 w-6" />}
              title="Performance Telemetry"
              description="Capture and analyze driving data with F1-inspired metrics. Compare performance across different routes and conditions."
            />
            <FeatureCard 
              icon={<Shield className="h-6 w-6" />}
              title="Maintenance Alerts"
              description="Never miss critical maintenance with intelligent reminders based on time, mileage, and seasonal conditions."
            />
            <FeatureCard 
              icon={<Users className="h-6 w-6" />}
              title="Community Forum"
              description="Connect with fellow enthusiasts in specialized chat rooms for vehicles, watches, events, and achievements."
            />
            <FeatureCard 
              icon={<Award className="h-6 w-6" />}
              title="Achievement System"
              description="Earn recognition through our comprehensive badge and points system that rewards engagement across all platform features."
            />
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-blue-400 mb-4">Meet the Team</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Our platform is built by a passionate team of automotive enthusiasts, horologists, and technology experts.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TeamMember 
              name="Gavin Seim"
              role="Founder & Vision Director"
              bio="Automotive enthusiast and entrepreneur with a passion for excellence in mechanical engineering and timepieces."
              imageUrl="https://randomuser.me/api/portraits/men/1.jpg"
            />
            <TeamMember 
              name="Ara Isaacs"
              role="Chief Technology Officer"
              bio="Software architect specializing in high-performance applications with telemetry data processing and visualization."
              imageUrl="https://randomuser.me/api/portraits/men/2.jpg"
            />
            <TeamMember 
              name="Elise Chen"
              role="User Experience Director"
              bio="Award-winning UX designer with extensive experience creating interfaces for luxury brands and automotive applications."
              imageUrl="https://randomuser.me/api/portraits/women/3.jpg"
            />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#050505] to-[#111] border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-blue-400 mb-6">Ready to Elevate Your Experience?</h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Join our community of passionate enthusiasts and begin your journey toward automotive and horological excellence.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-6 text-lg">
                Join Paddock20
              </Button>
              <Button variant="outline" className="border-blue-600 text-blue-400 hover:bg-blue-900/20 px-8 py-6 text-lg">
                Explore Features
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
}) => {
  return (
    <motion.div 
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-gradient-to-b from-[#0a0a0a] to-[#080808] p-6 rounded-xl border border-gray-800 flex flex-col"
    >
      <div className="mb-4 inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-900/30 text-blue-400">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-blue-400 mb-2">{title}</h3>
      <p className="text-gray-400 flex-1">{description}</p>
    </motion.div>
  );
};

const TeamMember = ({ name, role, bio, imageUrl }: { 
  name: string; 
  role: string; 
  bio: string; 
  imageUrl: string; 
}) => {
  return (
    <motion.div 
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-gradient-to-b from-[#0a0a0a] to-[#080808] rounded-xl border border-gray-800 overflow-hidden"
    >
      <div className="h-64 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-blue-400 mb-1">{name}</h3>
        <p className="text-green-400 font-medium mb-3">{role}</p>
        <p className="text-gray-400">{bio}</p>
      </div>
    </motion.div>
  );
};

export default AboutPage;