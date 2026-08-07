import React from 'react';
import { Link } from 'react-router-dom';

export function ForgotPasswordPage() {
  return (
    <div className="text-center py-8">
      <h3 className="text-lg font-medium text-slate-900 mb-2">Password Reset</h3>
      <p className="text-sm text-slate-500 mb-6">
        Password reset is not available for demo accounts in simulation mode.
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
