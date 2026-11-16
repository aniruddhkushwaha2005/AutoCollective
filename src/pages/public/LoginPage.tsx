import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';

export const LoginPage: React.FC = () => {
  const { login } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = (location.state as { from?: string } | null)?.from;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter both email address and password.');
      return;
    }
    const res = login(email, password);
    if (!res.ok || !res.data) {
      setError(res.error || 'Authentication failed.');
      return;
    }
    if (fromPath) {
      navigate(fromPath);
    } else if (res.data.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const fillDemo = (role: 'user' | 'admin') => {
    setError('');
    if (role === 'admin') {
      setEmail('admin@autocollective.in');
      setPassword('Admin@123');
    } else {
      setEmail('arjun.verma@example.com');
      setPassword('Buyer@123');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16">
      <div className="bg-white border border-[#E4E4E0] rounded-xl p-6 sm:p-8">
        <h1 className="text-2xl font-extrabold text-[#17191D] font-display">
          Sign in to AutoCollective
        </h1>
        <p className="text-sm text-[#5A5F6B] mt-1.5">
          Access your car requests, buying groups, and dealer quotations.
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-xs font-semibold text-[#17191D] mb-1.5">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg focus:outline-none focus:border-[#176B50]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="text-xs font-semibold text-[#17191D]">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-[#176B50] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg focus:outline-none focus:border-[#176B50]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 text-sm font-semibold text-white bg-[#176B50] rounded-lg hover:bg-[#125640] transition-colors"
          >
            Sign In
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div className="mt-6 pt-5 border-t border-[#ECECE8]">
          <p className="text-xs font-bold text-[#17191D] mb-2">Demo Accounts (Presentation Mode)</p>
          <div className="space-y-2 text-xs text-[#5A5F6B] bg-[#F8F8F6] border border-[#E4E4E0] rounded-lg p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-[#17191D]">Buyer Account</p>
                <p className="font-mono">arjun.verma@example.com / Buyer@123</p>
              </div>
              <button
                type="button"
                onClick={() => fillDemo('user')}
                className="px-2.5 py-1.5 text-xs font-semibold text-[#176B50] bg-white border border-[#D8D8D2] rounded-md hover:bg-[#EBF3F0]"
              >
                Fill Buyer
              </button>
            </div>
            <div className="pt-2 border-t border-[#E4E4E0] flex items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-[#17191D]">Admin Account</p>
                <p className="font-mono">admin@autocollective.in / Admin@123</p>
              </div>
              <button
                type="button"
                onClick={() => fillDemo('admin')}
                className="px-2.5 py-1.5 text-xs font-semibold text-[#17191D] bg-white border border-[#D8D8D2] rounded-md hover:bg-[#EFECE6]"
              >
                Fill Admin
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs text-center text-[#5A5F6B] mt-6">
          New to AutoCollective?{' '}
          <Link to="/register" className="font-semibold text-[#176B50] hover:underline">
            Create buyer account
          </Link>
        </p>
      </div>
    </div>
  );
};
