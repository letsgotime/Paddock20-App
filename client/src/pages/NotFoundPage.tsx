import React from 'react';
import { Link } from 'wouter';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-red-900/20 p-3 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-3">Page Not Found</h1>
        
        <p className="text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/">
            <a className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center">
              <Home className="h-5 w-5 mr-2" />
              Back to Home
            </a>
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="px-6 py-2.5 bg-gray-800 text-white rounded-md hover:bg-gray-700 flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;