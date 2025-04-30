import React from 'react';
import AuthForm from '../components/AuthForm';

function AuthPage() {
  return (
    <div className="p-10 bg-black min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="apex-header text-3xl mb-6 text-center">Bespoke Technology Syndicate™</h1>
        <p className="text-gray-400 text-center mb-8">
          Your automotive enthusiast command center.
        </p>
        <AuthForm />
      </div>
    </div>
  );
}

export default AuthPage;