import React from 'react';
import { 
  Compass, Target, Award, Star, TrendingUp, 
  Lightbulb, Calendar, Clock, CheckCircle, PlusCircle,
  FileText, ArrowRight, Sparkles
} from 'lucide-react';

const ManifestationStationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center">
            <Compass className="h-8 w-8 text-blue-500 mr-3" />
            <h1 className="text-3xl font-bold text-white">Manifestation Station</h1>
          </div>
          <p className="text-gray-400 mt-2 ml-11">
            Transform your automotive and life aspirations into actionable goals
          </p>
        </div>
        
        {/* 7 Elements System Overview */}
        <div className="bg-gray-900/40 rounded-xl p-6 border border-gray-800 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Sparkles className="h-5 w-5 text-blue-400 mr-2" />
            The 7 Elements System
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div className="bg-gray-900/70 p-4 rounded-lg border border-gray-800 hover:border-blue-800/50 transition-colors">
              <div className="flex items-center mb-2">
                <div className="p-2 bg-blue-900/30 rounded-full mr-3">
                  <Target className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-md font-medium text-white">Vision & Goals</h3>
              </div>
              <p className="text-sm text-gray-400">
                Define your automotive aspirations and life goals with clarity and purpose
              </p>
            </div>
            
            <div className="bg-gray-900/70 p-4 rounded-lg border border-gray-800 hover:border-blue-800/50 transition-colors">
              <div className="flex items-center mb-2">
                <div className="p-2 bg-blue-900/30 rounded-full mr-3">
                  <Calendar className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-md font-medium text-white">Planning & Strategy</h3>
              </div>
              <p className="text-sm text-gray-400">
                Create detailed roadmaps to achieve your automotive and personal goals
              </p>
            </div>
            
            <div className="bg-gray-900/70 p-4 rounded-lg border border-gray-800 hover:border-blue-800/50 transition-colors">
              <div className="flex items-center mb-2">
                <div className="p-2 bg-blue-900/30 rounded-full mr-3">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-md font-medium text-white">Performance Metrics</h3>
              </div>
              <p className="text-sm text-gray-400">
                Track your progress with meaningful measurements and KPIs
              </p>
            </div>
            
            <div className="bg-gray-900/70 p-4 rounded-lg border border-gray-800 hover:border-blue-800/50 transition-colors">
              <div className="flex items-center mb-2">
                <div className="p-2 bg-blue-900/30 rounded-full mr-3">
                  <Lightbulb className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-md font-medium text-white">Knowledge & Skills</h3>
              </div>
              <p className="text-sm text-gray-400">
                Develop expertise and capabilities needed to achieve your goals
              </p>
            </div>
            
            <div className="bg-gray-900/70 p-4 rounded-lg border border-gray-800 hover:border-blue-800/50 transition-colors">
              <div className="flex items-center mb-2">
                <div className="p-2 bg-blue-900/30 rounded-full mr-3">
                  <Star className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-md font-medium text-white">Mindset & Focus</h3>
              </div>
              <p className="text-sm text-gray-400">
                Cultivate the mental discipline and positive outlook for success
              </p>
            </div>
            
            <div className="bg-gray-900/70 p-4 rounded-lg border border-gray-800 hover:border-blue-800/50 transition-colors">
              <div className="flex items-center mb-2">
                <div className="p-2 bg-blue-900/30 rounded-full mr-3">
                  <Clock className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-md font-medium text-white">Consistency & Habits</h3>
              </div>
              <p className="text-sm text-gray-400">
                Build daily routines and behaviors that drive continuous progress
              </p>
            </div>
            
            <div className="bg-gray-900/70 p-4 rounded-lg border border-gray-800 hover:border-blue-800/50 transition-colors">
              <div className="flex items-center mb-2">
                <div className="p-2 bg-blue-900/30 rounded-full mr-3">
                  <Award className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-md font-medium text-white">Legacy & Impact</h3>
              </div>
              <p className="text-sm text-gray-400">
                Define the lasting influence you want to create in the automotive world
              </p>
            </div>
          </div>
        </div>
        
        {/* Your Goals Section */}
        <div className="bg-gray-900/40 rounded-xl p-6 border border-gray-800 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Target className="h-5 w-5 text-blue-400 mr-2" />
              Your Goals
            </h2>
            
            <button className="px-3 py-1.5 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700">
              <PlusCircle className="h-4 w-4 mr-1.5" />
              Create New Goal
            </button>
          </div>
          
          <div className="text-center py-12">
            <div className="bg-blue-900/10 p-5 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Target className="h-10 w-10 text-blue-400" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">Start Your Manifestation Journey</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              Create your first goal and leverage the 7 Elements System to turn your automotive dreams into reality
            </p>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700 mx-auto">
              <PlusCircle className="h-5 w-5 mr-2" />
              Create Your First Goal
            </button>
          </div>
        </div>
        
        {/* Resources Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900/40 rounded-xl p-5 border border-gray-800">
            <h3 className="text-lg font-medium text-white mb-3 flex items-center">
              <FileText className="h-5 w-5 text-blue-400 mr-2" />
              Manifestation Guides
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Expert resources to help you define and achieve your automotive goals
            </p>
            <a href="#" className="text-blue-400 hover:text-blue-300 flex items-center text-sm">
              Browse Guides
              <ArrowRight className="h-4 w-4 ml-1" />
            </a>
          </div>
          
          <div className="bg-gray-900/40 rounded-xl p-5 border border-gray-800">
            <h3 className="text-lg font-medium text-white mb-3 flex items-center">
              <CheckCircle className="h-5 w-5 text-blue-400 mr-2" />
              Goal Templates
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Pre-built frameworks for common automotive and life aspirations
            </p>
            <a href="#" className="text-blue-400 hover:text-blue-300 flex items-center text-sm">
              Explore Templates
              <ArrowRight className="h-4 w-4 ml-1" />
            </a>
          </div>
          
          <div className="bg-gray-900/40 rounded-xl p-5 border border-gray-800">
            <h3 className="text-lg font-medium text-white mb-3 flex items-center">
              <Star className="h-5 w-5 text-blue-400 mr-2" />
              Success Stories
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Real examples of automotive enthusiasts who achieved their dreams
            </p>
            <a href="#" className="text-blue-400 hover:text-blue-300 flex items-center text-sm">
              Read Stories
              <ArrowRight className="h-4 w-4 ml-1" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManifestationStationPage;