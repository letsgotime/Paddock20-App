import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';

const BetaAgreement: React.FC = () => {
  const [, setLocation] = useLocation();
  const [agreed, setAgreed] = useState(false);
  const currentYear = new Date().getFullYear();

  const handleAgree = () => {
    // Store acceptance in localStorage or use an API call to record this
    localStorage.setItem('betaAgreementAccepted', 'true');
    localStorage.setItem('betaAgreementDate', new Date().toISOString());
    setLocation('/');
  };
  
  return (
    <div className="bg-black min-h-screen text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-orbitron text-blue-500 mb-8">Beta Testing Agreement</h1>
        <p className="text-gray-400 mb-6">Last Updated: May {new Date().getDate()}, {currentYear}</p>
        
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
          <p className="text-yellow-400 mb-4 font-semibold">IMPORTANT: Please read this Beta Testing Agreement carefully before using the Paddock20 application.</p>
          
          <section className="mb-6">
            <h2 className="text-xl text-blue-400 mb-4 font-orbitron">Beta Test Participation</h2>
            <p className="mb-4 text-gray-300">
              By participating in this beta test program for Paddock20 ("Application"), you ("Beta Tester") agree to be bound by the 
              terms and conditions of this Beta Testing Agreement ("Agreement"). If you do not agree to the terms of this Agreement, 
              do not install or use the Application.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-xl text-blue-400 mb-4 font-orbitron">Confidentiality</h2>
            <p className="mb-4 text-gray-300">
              During your participation in the beta test program, you may have access to confidential information, including but not limited to 
              unreleased features, functionality, design, and performance information. You agree to:
            </p>
            <ul className="list-disc pl-8 mb-4 text-gray-300 space-y-2">
              <li>Keep all information about the Application confidential</li>
              <li>Not disclose any information about the Application to any third party without our prior written consent</li>
              <li>Not share access to the Application with anyone not authorized to participate in the beta test</li>
              <li>Not post screenshots, videos, or descriptions of the Application on social media or other public forums without permission</li>
            </ul>
          </section>
          
          <section className="mb-6">
            <h2 className="text-xl text-blue-400 mb-4 font-orbitron">Feedback and Reporting</h2>
            <p className="mb-4 text-gray-300">
              As a Beta Tester, you agree to provide feedback on the Application when requested. This feedback may include:
            </p>
            <ul className="list-disc pl-8 mb-4 text-gray-300 space-y-2">
              <li>Reporting all bugs, errors, or other issues encountered during use</li>
              <li>Completing surveys about your experience with the Application</li>
              <li>Participating in feedback sessions if invited</li>
              <li>Suggesting improvements to features and functionality</li>
            </ul>
            <p className="mb-4 text-gray-300">
              You grant us a worldwide, perpetual, irrevocable, royalty-free, fully-paid, sublicensable, and transferable license 
              to use, reproduce, modify, create derivative works based on, distribute, publicly display, and publicly perform any 
              feedback you provide.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-xl text-blue-400 mb-4 font-orbitron">Beta Software Nature</h2>
            <p className="mb-4 text-gray-300">
              You acknowledge and understand that:
            </p>
            <ul className="list-disc pl-8 mb-4 text-gray-300 space-y-2">
              <li>The Application is in beta testing, which means it is still under development</li>
              <li>The Application may contain bugs, errors, or other issues that could cause system failure, data loss, or other problems</li>
              <li>The features and functionality of the Application may change significantly before public release</li>
              <li>The Application may not perform as expected and may be incomplete</li>
              <li>We do not guarantee the Application will be released as a final product</li>
              <li>We may terminate the beta test program at any time without notice</li>
            </ul>
          </section>
          
          <section className="mb-6">
            <h2 className="text-xl text-blue-400 mb-4 font-orbitron">Disclaimer of Warranties</h2>
            <p className="mb-4 text-gray-300">
              THE APPLICATION IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND. WE DISCLAIM ALL WARRANTIES, 
              WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF MERCHANTABILITY, 
              FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-xl text-blue-400 mb-4 font-orbitron">Limitation of Liability</h2>
            <p className="mb-4 text-gray-300">
              IN NO EVENT SHALL WE BE LIABLE FOR ANY SPECIAL, INCIDENTAL, INDIRECT, OR CONSEQUENTIAL DAMAGES WHATSOEVER 
              (INCLUDING, WITHOUT LIMITATION, DAMAGES FOR LOSS OF PROFITS, LOSS OF DATA, BUSINESS INTERRUPTION, OR ANY OTHER LOSS) 
              ARISING OUT OF OR RELATED TO YOUR USE OR INABILITY TO USE THE APPLICATION.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-xl text-blue-400 mb-4 font-orbitron">Term and Termination</h2>
            <p className="mb-4 text-gray-300">
              This Agreement will remain in effect until terminated. We may terminate your participation in the beta test program 
              at any time for any reason without notice. Upon termination, you must cease all use of the Application and delete 
              all copies in your possession.
            </p>
          </section>
        </div>
        
        <div className="flex items-center mb-8">
          <input 
            type="checkbox" 
            id="agree" 
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="h-5 w-5 rounded border-gray-700 text-blue-500 focus:ring-blue-500 bg-gray-800"
          />
          <label htmlFor="agree" className="ml-3 text-gray-300">
            I have read and agree to the Beta Testing Agreement
          </label>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={handleAgree}
            disabled={!agreed}
            className={`px-6 py-3 rounded-md font-medium ${
              agreed ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            } transition-colors`}
          >
            Accept and Continue
          </button>
          
          <Link href="/">
            <a className="px-6 py-3 rounded-md font-medium border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors">
              Decline
            </a>
          </Link>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} GoTime Motorsports. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BetaAgreement;