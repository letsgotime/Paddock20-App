/**
 * ⚠️ BETA FILE PROTECTION ⚠️
 * 
 * WARNING: This file is part of the Beta Program core implementation.
 * DO NOT MODIFY this file without proper authorization.
 * Any unauthorized changes may break the beta enrollment process.
 * 
 * Last verified: May 07, 2025
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import OnboardingModal from '../components/OnboardingModal';
import PageTitle from '../components/PageTitle';

const OnboardingTestPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [betaRole, setBetaRole] = useState<'user' | 'tester'>('user');

  const openModal = (role: 'user' | 'tester') => {
    setBetaRole(role);
    setIsModalOpen(true);
  };

  return (
    <div className="container py-8">
      <PageTitle title="Onboarding Test" />
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-carolina-blue mb-6">Onboarding Modal Test</h1>
        
        <div className="p-6 bg-gray-900/70 border border-gray-800 rounded-lg mb-8">
          <h2 className="text-xl font-medium text-white mb-4">Test the Onboarding Flow</h2>
          <p className="text-gray-300 mb-6">
            This page allows you to test the onboarding modal experience in different roles.
            Choose which role you want to simulate and click the corresponding button.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-800/80 rounded-lg border border-gray-700">
              <h3 className="text-lg font-medium text-carolina-blue mb-2">Standard Beta User</h3>
              <p className="text-gray-300 mb-4">
                Test the regular user onboarding experience with standard beta features.
              </p>
              <Button 
                onClick={() => openModal('user')} 
                className="w-full bg-[#1982FC] hover:bg-[#1982FC]/80"
              >
                Open User Onboarding
              </Button>
            </div>
            
            <div className="p-4 bg-gray-800/80 rounded-lg border border-gray-700">
              <h3 className="text-lg font-medium text-carolina-blue mb-2">Beta Tester</h3>
              <p className="text-gray-300 mb-4">
                Test the beta tester onboarding experience with early access features.
              </p>
              <Button 
                onClick={() => openModal('tester')} 
                className="w-full bg-[#08c519] hover:bg-[#08c519]/80"
              >
                Open Tester Onboarding
              </Button>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-gray-900/70 border border-gray-800 rounded-lg">
          <h2 className="text-xl font-medium text-white mb-4">About the Onboarding Process</h2>
          <div className="space-y-4 text-gray-300">
            <p>
              The onboarding modal collects essential information to personalize the Paddock20 experience:
            </p>
            
            <div className="ml-4 space-y-2">
              <div className="flex items-start">
                <span className="text-carolina-blue mr-2">•</span>
                <span><strong className="text-white">Driver Info:</strong> Basic information, automotive interests, and preferences</span>
              </div>
              
              <div className="flex items-start">
                <span className="text-carolina-blue mr-2">•</span>
                <span><strong className="text-white">Vehicle Details:</strong> Make, model, year, and specs through VIN lookup or manual entry</span>
              </div>
              
              <div className="flex items-start">
                <span className="text-carolina-blue mr-2">•</span>
                <span><strong className="text-white">Preferences:</strong> Drive preferences, favorite playlists, and automotive dreams</span>
              </div>
            </div>
            
            <p>
              All collected data can be edited later in the profile settings.
            </p>
          </div>
        </div>
      </div>
      
      {/* The OnboardingModal component */}
      {isModalOpen && (
        <OnboardingModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          betaRole={betaRole}
        />
      )}
    </div>
  );
};

export default OnboardingTestPage;