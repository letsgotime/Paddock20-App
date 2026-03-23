import React from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

const TermsOfServicePage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <Link href="/auth" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6">
          <ArrowLeft size={20} className="mr-2" />
          Back to Registration
        </Link>
        
        <h1 className="text-3xl font-bold mb-8 text-[#1982FC] font-orbitron">Terms of Service</h1>
        
        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-xl text-white font-semibold mb-3">1. Introduction</h2>
            <p>
              Welcome to Paddock20 ("we," "our," or "us"). These Terms of Service ("Terms") govern your access to and 
              use of the Paddock20 application and related services (collectively, the "Service"). By accessing or using 
              the Service, you agree to be bound by these Terms.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl text-white font-semibold mb-3">2. Beta Program Terms</h2>
            <p>
              Please note that Paddock20 is currently in beta testing. By using the Service during this beta period, 
              you acknowledge that:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>The Service may contain bugs, errors, or other issues that could affect its functionality</li>
              <li>The Service may change significantly before its official release</li>
              <li>We may collect additional data about your usage for improvement purposes</li>
              <li>Features may be added, modified, or removed without notice</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl text-white font-semibold mb-3">3. Account Registration and User Data</h2>
            <p>
              To access certain features of the Service, you must register for an account. You agree to provide accurate, 
              current, and complete information during the registration process and to update such information to keep it 
              accurate, current, and complete.
            </p>
            <p className="mt-2">
              You are responsible for safeguarding your password and for all activities that occur under your account. 
              You agree to notify us immediately of any unauthorized use of your account.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl text-white font-semibold mb-3">4. Vehicle and Driving Data</h2>
            <p>
              Our Service collects and processes data about your vehicles and driving activity. This may include:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Vehicle identification and specification information</li>
              <li>Location data for weather and drive planning features</li>
              <li>Driving behavior and vehicle performance metrics</li>
              <li>Maintenance and service records</li>
            </ul>
            <p className="mt-2">
              You retain ownership of your data, but grant us a license to use it to provide and improve the Service.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl text-white font-semibold mb-3">5. User Conduct</h2>
            <p>
              You agree not to:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Use the Service in any way that violates applicable laws or regulations</li>
              <li>Impersonate any person or entity or falsely state or misrepresent your affiliation</li>
              <li>Interfere with or disrupt the Service or servers or networks connected to the Service</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Use the Service for any illegal or unauthorized purpose</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl text-white font-semibold mb-3">6. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are owned by Paddock20 and are protected 
              by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary 
              rights laws.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl text-white font-semibold mb-3">7. Limitation of Liability</h2>
            <p>
              In no event shall Paddock20, its directors, employees, partners, agents, suppliers, or affiliates be liable 
              for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss 
              of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or 
              inability to access or use the Service.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl text-white font-semibold mb-3">8. Changes to Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide 
              at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be 
              determined at our sole discretion.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl text-white font-semibold mb-3">9. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="mt-2 text-[#1982FC]">support@gotimedigital.com</p>
          </section>
        </div>
        
        <div className="mt-10 pt-6 border-t border-gray-800">
          <p className="text-gray-400 text-sm">
            Last updated: May 5, 2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;