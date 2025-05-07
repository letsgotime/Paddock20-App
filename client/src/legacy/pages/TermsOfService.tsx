import React from 'react';
import { Link } from 'wouter';

const TermsOfService: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="bg-black min-h-screen text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link href="/">
          <a className="inline-flex items-center text-blue-400 hover:text-blue-500 mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </a>
        </Link>
        
        <h1 className="text-3xl font-orbitron text-blue-500 mb-8">Terms of Service</h1>
        <p className="text-gray-400 mb-6">Last Updated: May {new Date().getDate()}, {currentYear}</p>
        
        <section className="mb-10">
          <h2 className="text-xl text-blue-400 mb-4 font-orbitron">1. Introduction</h2>
          <p className="mb-4 text-gray-300">
            Welcome to Paddock20. These Terms of Service ("Terms") govern your access to and use of our website, mobile application, 
            and any other online services (collectively, the "Services") provided by GoTime Motorsports ("we," "our," or "us").
          </p>
          <p className="mb-4 text-gray-300">
            By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, 
            you may not access or use the Services.
          </p>
        </section>
        
        <section className="mb-10">
          <h2 className="text-xl text-blue-400 mb-4 font-orbitron">2. Beta Testing Agreement</h2>
          <p className="mb-4 text-gray-300">
            You understand and acknowledge that the Services are currently in beta testing, which means they are still under development, 
            may contain bugs, errors, or other issues, and may not function as intended. By accessing or using the Services during the beta testing period, you agree to the following:
          </p>
          <ul className="list-disc pl-8 mb-4 text-gray-300 space-y-2">
            <li>The Services are provided "as is" and "as available" without warranties of any kind</li>
            <li>You will use the Services at your own risk</li>
            <li>You will provide feedback on the Services when requested</li>
            <li>You will report any bugs, errors, or other issues that you encounter while using the Services</li>
            <li>The availability, functionality, or features of the Services may change at any time without notice</li>
            <li>We may terminate your access to the beta Services at any time for any reason</li>
          </ul>
        </section>
        
        <section className="mb-10">
          <h2 className="text-xl text-blue-400 mb-4 font-orbitron">3. User Accounts</h2>
          <p className="mb-4 text-gray-300">
            To access certain features of the Services, you may need to create an account. When you create an account, you agree to:
          </p>
          <ul className="list-disc pl-8 mb-4 text-gray-300 space-y-2">
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain and promptly update your account information</li>
            <li>Maintain the security of your account and password</li>
            <li>Accept responsibility for all activities that occur under your account</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
          </ul>
        </section>
        
        <section className="mb-10">
          <h2 className="text-xl text-blue-400 mb-4 font-orbitron">4. User Conduct</h2>
          <p className="mb-4 text-gray-300">
            You agree not to use the Services to:
          </p>
          <ul className="list-disc pl-8 mb-4 text-gray-300 space-y-2">
            <li>Violate any applicable law, contract, intellectual property right, or other third-party right</li>
            <li>Engage in any harassing, threatening, intimidating, predatory, or stalking conduct</li>
            <li>Upload or transmit viruses, malware, or other types of malicious software</li>
            <li>Use our Services in any manner that could disable, overburden, damage, or impair the Services</li>
            <li>Attempt to gain unauthorized access to, interfere with, damage, or disrupt any parts of the Services</li>
            <li>Attempt to circumvent any content-filtering techniques we employ</li>
          </ul>
        </section>
        
        <section className="mb-10">
          <h2 className="text-xl text-blue-400 mb-4 font-orbitron">5. Intellectual Property Rights</h2>
          <p className="mb-4 text-gray-300">
            The Services and their entire contents, features, and functionality (including but not limited to all information, software, text, 
            displays, images, video, and audio, and the design, selection, and arrangement thereof) are owned by GoTime Motorsports, its licensors, 
            or other providers of such material and are protected by copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
          </p>
          <p className="mb-4 text-gray-300">
            These Terms do not grant you any rights to use our trademarks, logos, domain names, or other brand features. 
            You may not copy, modify, create derivative works of, publicly display, publicly perform, republish, or transmit any of the material 
            on our Services without our prior written consent.
          </p>
        </section>
        
        <section className="mb-10">
          <h2 className="text-xl text-blue-400 mb-4 font-orbitron">6. Disclaimer of Warranties</h2>
          <p className="mb-4 text-gray-300">
            THE SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
            WE DISCLAIM ALL WARRANTIES, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, 
            AND NON-INFRINGEMENT.
          </p>
          <p className="mb-4 text-gray-300">
            WE DO NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED OR ERROR-FREE, THAT DEFECTS WILL BE CORRECTED, 
            OR THAT THE SERVICES OR THE SERVERS THAT MAKE THEM AVAILABLE ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
          </p>
        </section>
        
        <section className="mb-10">
          <h2 className="text-xl text-blue-400 mb-4 font-orbitron">7. Limitation of Liability</h2>
          <p className="mb-4 text-gray-300">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, 
            OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, 
            USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
          </p>
          <ul className="list-disc pl-8 mb-4 text-gray-300 space-y-2">
            <li>YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICES</li>
            <li>ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICES</li>
            <li>ANY CONTENT OBTAINED FROM THE SERVICES</li>
            <li>UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT</li>
          </ul>
        </section>
        
        <section className="mb-10">
          <h2 className="text-xl text-blue-400 mb-4 font-orbitron">8. Indemnification</h2>
          <p className="mb-4 text-gray-300">
            You agree to defend, indemnify, and hold harmless GoTime Motorsports, its affiliates, licensors, and service providers, 
            and its and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns 
            from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable 
            attorneys' fees) arising out of or relating to your violation of these Terms or your use of the Services.
          </p>
        </section>
        
        <section className="mb-10">
          <h2 className="text-xl text-blue-400 mb-4 font-orbitron">9. Governing Law and Jurisdiction</h2>
          <p className="mb-4 text-gray-300">
            These Terms and your use of the Services shall be governed by and construed in accordance with the laws of the United States, 
            without giving effect to any choice or conflict of law provision or rule.
          </p>
        </section>
        
        <section className="mb-10">
          <h2 className="text-xl text-blue-400 mb-4 font-orbitron">10. Changes to the Terms</h2>
          <p className="mb-4 text-gray-300">
            We may revise and update these Terms from time to time in our sole discretion. All changes are effective immediately when 
            we post them and apply to all access to and use of the Services thereafter. Your continued use of the Services following 
            the posting of revised Terms means that you accept and agree to the changes.
          </p>
        </section>
        
        <section className="mb-10">
          <h2 className="text-xl text-blue-400 mb-4 font-orbitron">11. Contact Information</h2>
          <p className="text-gray-300">
            Questions or comments about the Services or these Terms may be directed to:
          </p>
          <div className="mt-4 text-blue-400">
            <p>GoTime Motorsports</p>
            <p>Email: legal@gotimemotorsports.com</p>
          </div>
        </section>
        
        <div className="border-t border-gray-800 mt-8 pt-8">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} GoTime Motorsports. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;