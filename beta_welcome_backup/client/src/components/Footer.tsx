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
                <Link href="/">
                  <a className="text-gray-400 hover:text-blue-500 transition-colors flex items-center">
                    <HomeIcon size={14} className="mr-2" /> Home
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/weather">
                  <a className="text-gray-400 hover:text-blue-500 transition-colors flex items-center">
                    <GaugeCircle size={14} className="mr-2" /> Weather Center
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/garage">
                  <a className="text-gray-400 hover:text-blue-500 transition-colors flex items-center">
                    <Car size={14} className="mr-2" /> Garage Vault
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/events">
                  <a className="text-gray-400 hover:text-blue-500 transition-colors flex items-center">
                    <Calendar size={14} className="mr-2" /> Events
                  </a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-white">Features</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/juicebox">
                  <a className="text-gray-400 hover:text-blue-500 transition-colors flex items-center">
                    <ShoppingBag size={14} className="mr-2" /> Juice Box™
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/chat">
                  <a className="text-gray-400 hover:text-blue-500 transition-colors flex items-center">
                    <MessageSquare size={14} className="mr-2" /> Chat Feed
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/redline">
                  <a className="text-gray-400 hover:text-blue-500 transition-colors flex items-center">
                    <GaugeCircle size={14} className="mr-2" /> Redline Report
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/settings">
                  <a className="text-gray-400 hover:text-blue-500 transition-colors flex items-center">
                    <Settings size={14} className="mr-2" /> Settings
                  </a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-white">Account</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/profile">
                  <a className="text-gray-400 hover:text-blue-500 transition-colors flex items-center">
                    <User size={14} className="mr-2" /> My Profile
                  </a>
                </Link>
              </li>
              <li>
                <a 
                  href="#support" 
                  className="text-gray-400 hover:text-blue-500 transition-colors"
                >
                  Support
                </a>
              </li>
              <li>
                <a 
                  href="#privacy" 
                  className="text-gray-400 hover:text-blue-500 transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a 
                  href="#terms" 
                  className="text-gray-400 hover:text-blue-500 transition-colors"
                >
                  Terms of Service
                </a>
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