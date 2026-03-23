import React from 'react';
import { Link } from 'wouter';
import { 
  HomeIcon, 
  GaugeCircle, 
  Car, 
  Calendar, 
  ShoppingBag, 
  MessageSquare, 
  Settings, 
  User, 
  Github
} from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-black border-t border-gray-800 py-8 mt-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-orbitron text-blue-500 mb-4">Paddock20</h3>
            <p className="text-gray-400 text-sm mb-4">
              The premier automotive portal for enthusiasts and resellers, 
              providing market intelligence and performance tracking.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-500 transition-colors"
                aria-label="GitHub"
              >
                <Github size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-white">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/">
                  <div className="text-gray-400 hover:text-blue-500 transition-colors flex items-center cursor-pointer">
                    <HomeIcon size={14} className="mr-2" /> Home
                  </div>
                </Link>
              </li>
              <li>
                <Link to="/weather">
                  <div className="text-gray-400 hover:text-blue-500 transition-colors flex items-center cursor-pointer">
                    <GaugeCircle size={14} className="mr-2" /> Weather Center
                  </div>
                </Link>
              </li>
              <li>
                <Link to="/garage">
                  <div className="text-gray-400 hover:text-blue-500 transition-colors flex items-center cursor-pointer">
                    <Car size={14} className="mr-2" /> Garage Vault
                  </div>
                </Link>
              </li>
              <li>
                <Link to="/events">
                  <div className="text-gray-400 hover:text-blue-500 transition-colors flex items-center cursor-pointer">
                    <Calendar size={14} className="mr-2" /> Events
                  </div>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-white">Features</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/juicebox">
                  <div className="text-gray-400 hover:text-blue-500 transition-colors flex items-center cursor-pointer">
                    <ShoppingBag size={14} className="mr-2" /> Juice Box™
                  </div>
                </Link>
              </li>
              <li>
                <Link to="/chat-feed">
                  <div className="text-gray-400 hover:text-blue-500 transition-colors flex items-center cursor-pointer">
                    <MessageSquare size={14} className="mr-2" /> Chat Feed
                  </div>
                </Link>
              </li>
              <li>
                <Link to="/redline-report">
                  <div className="text-gray-400 hover:text-blue-500 transition-colors flex items-center cursor-pointer">
                    <GaugeCircle size={14} className="mr-2" /> Redline Report
                  </div>
                </Link>
              </li>
              <li>
                <Link to="/settings">
                  <div className="text-gray-400 hover:text-blue-500 transition-colors flex items-center cursor-pointer">
                    <Settings size={14} className="mr-2" /> Settings
                  </div>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-white">Account</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/profile">
                  <div className="text-gray-400 hover:text-blue-500 transition-colors flex items-center cursor-pointer">
                    <User size={14} className="mr-2" /> My Profile
                  </div>
                </Link>
              </li>
              <li>
                <Link to="/contact">
                  <div className="text-gray-400 hover:text-blue-500 transition-colors cursor-pointer">
                    Support
                  </div>
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy">
                  <div className="text-gray-400 hover:text-blue-500 transition-colors cursor-pointer">
                    Privacy Policy
                  </div>
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service">
                  <div className="text-gray-400 hover:text-blue-500 transition-colors cursor-pointer">
                    Terms of Service
                  </div>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} Paddock20 Portal. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm mt-2 md:mt-0">
            Designed for high-performance automotive enthusiasts
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;