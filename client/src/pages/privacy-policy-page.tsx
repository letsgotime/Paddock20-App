import React from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <Link href="/auth" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6">
          <ArrowLeft size={20} className="mr-2" />
          Back to Registration
        </Link>
        
        <h1 className="text-3xl font-bold mb-8 text-[#1982FC] font-orbitron">Privacy Policy</h1>
        
        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-xl text-white font-semibold mb-3">1. Introduction</h2>
            <p>
              At Paddock20 ("we," "our," or "us"), we respect your privacy and are committed to protecting your personal data. 
              This Privacy Policy explains how we collect, use, and safeguard your information when you use our automotive 
              intelligence platform (the "Service").
            </p>
          </section>
          
          <section>
            <h2 className="text-xl text-white font-semibold mb-3">2. Information We Collect</h2>
            <div className="space-y-3">
              <h3 className="text-lg text-gray-100 font-medium">2.1 Personal Information</h3>
              <p>
                When you register for an account, we collect:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your name and contact information (email address, phone number)</li>
                <li>Account credentials (username, password)</li>
                <li>Profile information (driving experience, automotive interests)</li>
                <li>Profile pictures and other content you choose to upload</li>
              </ul>
              
              <h3 className="text-lg text-gray-100 font-medium mt-4">2.2 Vehicle Information</h3>
              <p>
                We collect information about your vehicles, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Vehicle identification number (VIN)</li>
                <li>Make, model, year, and specifications</li>
                <li>Maintenance records and service history</li>
                <li>Performance and condition data</li>
              </ul>
              
              <h3 className="text-lg text-gray-100 font-medium mt-4">2.3 Usage Data</h3>
              <p>
                We automatically collect certain information when you use the Service:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>IP address and device information</li>
                <li>Browser type and operating system</li>
                <li>Usage patterns and feature preferences</li>
                <li>Location data (when you enable location services)</li>
              </ul>
            </div>
          </section>
          
          <section>
            <h2 className="text-xl text-white font-semibold mb-3">3. How We Use Your Information</h2>
            <p>
              We use your information for the following purposes:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>To provide and maintain our Service</li>
              <li>To personalize your experience with features like the Weather Paddock and Drive Planner</li>
              <li>To improve our Service based on user feedback and usage patterns</li>
              <li>To communicate with you about updates, features, or support issues</li>
              <li>To monitor and analyze usage trends and improve the user experience</li>
              <li>To detect, prevent, and address technical issues or fraudulent activities</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl text-white font-semibold mb-3">4. Beta Program Data Collection</h2>
            <p>
              During the beta testing phase, we may collect additional data to help us improve the Service:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Detailed usage patterns and feature engagement</li>
              <li>Performance metrics and error reports</li>
              <li>User feedback and problem reports</li>
            </ul>
            <p className="mt-2">
              This beta-specific data collection will be reduced or modified for the public release version.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl text-white font-semibold mb-3">5. Data Storage and Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information against unauthorized access, 
              alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic 
              storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl text-white font-semibold mb-3">6. Data Sharing and Third Parties</h2>
            <p>
              We may share your information with:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Service providers who perform services on our behalf (hosting, analytics, etc.)</li>
              <li>Partners who provide complementary services (weather data, mapping services)</li>
              <li>Legal authorities when required by law or to protect our rights</li>
            </ul>
            <p className="mt-2">
              We do not sell your personal information to third parties.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl text-white font-semibold mb-3">7. Your Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Access and review the information we hold about you</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Delete your information under certain circumstances</li>
              <li>Restrict or object to certain processing activities</li>
              <li>Data portability (receiving your data in a structured format)</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl text-white font-semibold mb-3">8. Updates to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new 
              Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl text-white font-semibold mb-3">9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <p className="mt-2 text-[#1982FC]">privacy@gotimedigital.com</p>
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

export default PrivacyPolicyPage;