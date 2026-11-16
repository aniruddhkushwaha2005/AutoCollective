import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';

export const RegisterPage: React.FC = () => {
  const { register } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Bareilly');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (name.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!acceptedTerms) {
      setError('Please accept the Terms & Conditions to register.');
      return;
    }

    const res = register({
      name,
      email,
      password,
      phone: phone.replace(/\D/g, ''),
      city,
    });

    if (!res.ok) {
      setError(res.error || 'Could not register account.');
      return;
    }

    navigate('/dashboard');
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12 sm:py-16">
      <div className="bg-white border border-[#E4E4E0] rounded-xl p-6 sm:p-8">
        <h1 className="text-2xl font-extrabold text-[#17191D] font-display">
          Create Buyer Account
        </h1>
        <p className="text-sm text-[#5A5F6B] mt-1.5">
          Register once to submit vehicle requests, join city groups, and compare dealer quotes.
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="reg-name" className="block text-xs font-semibold text-[#17191D] mb-1.5">
              Full Name
            </label>
            <input
              id="reg-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Siddharth Patel"
              className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg focus:outline-none focus:border-[#176B50]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="reg-email" className="block text-xs font-semibold text-[#17191D] mb-1.5">
                Email Address
              </label>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg focus:outline-none focus:border-[#176B50]"
              />
            </div>

            <div>
              <label htmlFor="reg-phone" className="block text-xs font-semibold text-[#17191D] mb-1.5">
                Mobile Number (10 digits)
              </label>
              <input
                id="reg-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9837012345"
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg focus:outline-none focus:border-[#176B50]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-city" className="block text-xs font-semibold text-[#17191D] mb-1.5">
              City
            </label>
            <input
              id="reg-city"
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Bareilly, Lucknow, Delhi NCR, Jaipur..."
              className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg focus:outline-none focus:border-[#176B50]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="reg-pass" className="block text-xs font-semibold text-[#17191D] mb-1.5">
                Password
              </label>
              <input
                id="reg-pass"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg focus:outline-none focus:border-[#176B50]"
              />
            </div>

            <div>
              <label htmlFor="reg-confirm" className="block text-xs font-semibold text-[#17191D] mb-1.5">
                Confirm Password
              </label>
              <input
                id="reg-confirm"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg focus:outline-none focus:border-[#176B50]"
              />
            </div>
          </div>

          <label className="flex items-start gap-2.5 text-xs text-[#5A5F6B] cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 rounded border-[#D8D8D2] text-[#176B50]"
            />
            <span>
              I agree to the{' '}
              <Link to="/terms" className="text-[#176B50] underline">
                Terms & Conditions
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-[#176B50] underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          <button
            type="submit"
            className="w-full py-2.5 text-sm font-semibold text-white bg-[#176B50] rounded-lg hover:bg-[#125640] transition-colors"
          >
            Create Account
          </button>
        </form>

        <p className="text-xs text-center text-[#5A5F6B] mt-6">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-[#176B50] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
