import React from 'react';
import { Link } from 'react-router-dom';

export function RegisterPage() {
  return (
    <div className="text-center py-8">
      <h3 className="text-lg font-medium text-slate-900 mb-2">Registration Disabled</h3>
      <p className="text-sm text-slate-500 mb-6">
        In simulation mode, new user registration is disabled. Please use one of the provided demo accounts to access the platform.
      </p>
      <Link 
        to="/login"
        className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700"
      >
        Return to Login
      </Link>
    </div>
  );
}
