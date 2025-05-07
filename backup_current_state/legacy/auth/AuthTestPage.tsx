import React from 'react';
import { useAuth } from '@/hooks/useAuth';

const AuthTestPage = () => {
  const auth = useAuth();

  return (
    <div className="container mx-auto p-8">
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-carolina-blue">Authentication Test Page</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-900 rounded">
            <h2 className="text-xl mb-2 text-gotime-green">Authentication State</h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-gray-400">Loading:</div>
              <div>{auth.loading ? 'Yes' : 'No'}</div>
              
              <div className="text-gray-400">Authenticated:</div>
              <div>{auth.isAuthenticated ? 'Yes' : 'No'}</div>
            </div>
          </div>
          
          {auth.user && (
            <div className="p-4 bg-gray-900 rounded">
              <h2 className="text-xl mb-2 text-gotime-green">User Information</h2>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-gray-400">User ID:</div>
                <div>{auth.user.id}</div>
                
                <div className="text-gray-400">Email:</div>
                <div>{auth.user.email}</div>
              </div>
            </div>
          )}
          
          <div className="mt-6 flex space-x-4">
            {!auth.isAuthenticated && (
              <button 
                onClick={() => {
                  if (auth && auth.login) {
                    auth.login('test@example.com', 'password');
                  }
                }}
                className="px-4 py-2 bg-carolina-blue text-white rounded hover:bg-opacity-90"
              >
                Test Login
              </button>
            )}
            
            {auth.isAuthenticated && (
              <button 
                onClick={() => {
                  if (auth && auth.logout) {
                    auth.logout();
                  }
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-opacity-90"
              >
                Test Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthTestPage;