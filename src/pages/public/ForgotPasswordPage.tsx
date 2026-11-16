import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';

export const ForgotPasswordPage: React.FC = () => {
  const { db, resetPasswordDemo } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [demoCode, setDemoCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  const handleRequestCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanEmail = email.trim().toLowerCase();
    const userExists = db.users.some((u) => u.email.toLowerCase() === cleanEmail);
    if (!userExists) {
      setError('No registered account was found for that email address.');
      return;
    }
    const generated = String(Math.floor(100000 + Math.random() * 899999));
    setDemoCode(generated);
    setStep('reset');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (enteredCode.trim() !== demoCode) {
      setError('The verification code does not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    const res = resetPasswordDemo(email, newPassword);
    if (!res.ok) {
      setError(res.error || 'Could not reset password.');
      return;
    }
    navigate('/login');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16">
      <div className="bg-white border border-[#E4E4E0] rounded-xl p-6 sm:p-8">
        <h1 className="text-2xl font-extrabold text-[#17191D] font-display">
          Reset Your Password
        </h1>
        <p className="text-sm text-[#5A5F6B] mt-1.5">
          Recover access to your AutoCollective account.
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleRequestCode} className="mt-6 space-y-4">
            <div>
              <label htmlFor="fp-email" className="block text-xs font-semibold text-[#17191D] mb-1.5">
                Registered Email Address
              </label>
              <input
                id="fp-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="arjun.verma@example.com"
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg focus:outline-none focus:border-[#176B50]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-sm font-semibold text-white bg-[#176B50] rounded-lg hover:bg-[#125640] transition-colors"
            >
              Generate Verification Code
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
            <div className="p-3 rounded-lg bg-[#EBF3F0] border border-[#BFE0D4] text-xs text-[#176B50]">
              Demo Verification Code for <strong>{email}</strong>:{' '}
              <span className="font-mono font-bold">{demoCode}</span>
            </div>

            <div>
              <label htmlFor="fp-code" className="block text-xs font-semibold text-[#17191D] mb-1.5">
                Verification Code
              </label>
              <input
                id="fp-code"
                type="text"
                required
                value={enteredCode}
                onChange={(e) => setEnteredCode(e.target.value)}
                placeholder="Enter 6-digit code"
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg focus:outline-none focus:border-[#176B50]"
              />
            </div>

            <div>
              <label htmlFor="fp-newpass" className="block text-xs font-semibold text-[#17191D] mb-1.5">
                New Password
              </label>
              <input
                id="fp-newpass"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg focus:outline-none focus:border-[#176B50]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-sm font-semibold text-white bg-[#176B50] rounded-lg hover:bg-[#125640] transition-colors"
            >
              Update Password
            </button>
          </form>
        )}

        <p className="text-xs text-center text-[#5A5F6B] mt-6">
          Remembered your password?{' '}
          <Link to="/login" className="font-semibold text-[#176B50] hover:underline">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
