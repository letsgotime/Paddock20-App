import React from 'react';
import { Link } from 'wouter';

const PrivacyPolicy: React.FC = () => {
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
        
        <h1 className="text-3xl font-orbitron text-blue-500 mb-8">Privacy Policy</h1>
        <p className="text-gray-400 mb-6">Last Updated: May {new Date().getDate()}, {currentYear}</p>
        
        <section className="mb-10">
          <h2 className="text-xl text-blue-400 mb-4 font-orbitron">1. Introduction</h2>
          <p className="mb-4 text-gray-300">
            Welcome to Paddock20 ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data.
            This privacy policy will inform you about how we look after your personal data when you visit our website or use our application
            and tell you about your privacy rights and how the law protects you.
          </p>
          <p className="mb-4 text-gray-300">
            This policy applies to information we collect when you use our website, mobile application, and services (collectively, the "Services"), 
            or when you otherwise interact with us. Please read this policy carefully to understand our policies and practices regarding your information.
          </p>
        </section>
        
        <section className="mb-10">
          <h2 className="text-xl text-blue-400 mb-4 font-orbitron">2. Information We Collect</h2>
          <p className="mb-4 text-gray-300">
            We collect information that you provide directly to us, information we obtain automatically when you use our Services, 
            and information from third-party sources. The types of data we may collect include:
          </p>
          <ul className="list-disc pl-8 mb-4 text-gray-300 space-y-2">
            <li>Personal identifiers (such as name, email address, phone number)</li>
            <li>Authentication information (password and security questions)</li>
            <li>Automotive information (vehicle details, maintenance records, performance data)</li>
            <li>Location information (with your permission)</li>
            <li>Usage data (interactions with our Services, feature usage patterns)</li>
            <li>Device information (IP address, browser type, operating system)</li>
          </ul>
        </section>
        
        <section className="mb-10">
          <h2 className="text-xl text-blue-400 mb-4 font-orbitron">3. How We Use Your Information</h2>
          <p className="mb-4 text-gray-300">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-8 mb-4 text-gray-300 space-y-2">
            <li>Provide, maintain, and improve our Services</li>
            <li>Process transactions and send related information</li>
            <li>Send you technical notices, updates, security alerts, and support messages</li>
            <li>Respond to your comments, questions, and customer service requests</li>
            <li>Personalize your experience and deliver content relevant to your interests</li>
            <li>Monitor and analyze trends, usage, and activities in connection with our Services</li>
            <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>
        
        <section className="mb-10">
          <h2 className="text-xl text-blue-400 mb-4 font-orbitron">4. Sharing of Information</h2>
          <p className="mb-4 text-gray-300">
            We may share the information we collect in various ways, including:
          </p>
          <ul className="list-disc pl-8 mb-4 text-gray-300 space-y-2">
            <li>With vendors, service providers, and consultants that perform services for us</li>
            <li>With business partners if you interact with their services through our platform</li>
            <li>In response to a request for information if we believe disclosure is in accordance with any applicable law, regulation, or legal process</li>
            <li>If we believe your actions are inconsistent with our user agreements or policies, or to protect the rights, property, and safety of us or others</li>
            <li>In connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business by another company</li>
            <li>With your consent or at your direction</li>
          </ul>
        </section>
        
        <section className="mb-10">
          <h2 className="text-xl text-blue-400 mb-4 font-orbitron">5. Your Rights and Choices</h2>
          <p className="mb-4 text-gray-300">
            Depending on your location, you may have certain rights regarding your personal information, such as:
          </p>
          <ul className="list-disc pl-8 mb-4 text-gray-300 space-y-2">
            <li>Accessing and updating your information</li>
            <li>Requesting deletion of your information</li>
            <li>Objecting to certain processing of your information</li>
            <li>Data portability</li>
            <li>Withdrawing consent</li>
          </ul>
          <p className="text-gray-300">
            To exercise these rights, please contact us as described in the "Contact Us" section below.
          </p>
        </section>
        
        <section className="mb-10">
          <h2 className="text-xl text-blue-400 mb-4 font-orbitron">6. Data Security</h2>
          <p className="mb-4 text-gray-300">
            We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorized access, disclosure, 
            alteration, and destruction. However, no security system is impenetrable, and we cannot guarantee the security of our systems 100%.
          </p>
        </section>
        
        <section className="mb-10">
          <h2 className="text-xl text-blue-400 mb-4 font-orbitron">7. Changes to This Privacy Policy</h2>
          <p className="mb-4 text-gray-300">
            We may change this privacy policy from time to time. If we make changes, we will notify you by revising the date at the top of the policy and, 
            in some cases, we may provide additional notice (such as adding a statement to our website or sending you a notification).
          </p>
        </section>
        
        <section className="mb-10">
          <h2 className="text-xl text-blue-400 mb-4 font-orbitron">8. Contact Us</h2>
          <p className="text-gray-300">
            If you have any questions about this privacy policy or our privacy practices, please contact us at:
          </p>
          <div className="mt-4 text-blue-400">
            <p>GoTime Motorsports</p>
            <p>Email: privacy@gotimemotorsports.com</p>
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

export default PrivacyPolicy;