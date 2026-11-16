import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { formatDate } from '../../utils/formatters';

export const MyProfilePage: React.FC = () => {
  const { currentUser, updateProfile } = useApp();
  if (!currentUser) return null;

  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [city, setCity] = useState(currentUser.city);
  const [error, setError] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }
    if (!city.trim()) {
      setError('City is required.');
      return;
    }
    updateProfile({
      name: name.trim(),
      phone: phone.replace(/\D/g, ''),
      city: city.trim(),
    });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#17191D] font-display">My Profile</h1>
        <p className="text-sm text-[#5A5F6B] mt-1">
          Keep your city and contact information up to date for accurate group matching and
          dealership verification.
        </p>
      </div>

      <div className="bg-white border border-[#E4E4E0] rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[#ECECE8]">
          <div>
            <p className="text-base font-bold text-[#17191D]">{currentUser.name}</p>
            <p className="text-xs text-[#5A5F6B]">{currentUser.email}</p>
          </div>
          <span className="text-xs text-[#6F7480] tabular-nums">
            Member since {formatDate(currentUser.createdAt)}
          </span>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <div>
            <label htmlFor="prof-name" className="block text-xs font-semibold text-[#17191D] mb-1.5">
              Full Name
            </label>
            <input
              id="prof-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="prof-phone" className="block text-xs font-semibold text-[#17191D] mb-1.5">
                Mobile Number
              </label>
              <input
                id="prof-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
              />
            </div>

            <div>
              <label htmlFor="prof-city" className="block text-xs font-semibold text-[#17191D] mb-1.5">
                City
              </label>
              <input
                id="prof-city"
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
              />
            </div>
          </div>

          <div>
            <label htmlFor="prof-email" className="block text-xs font-semibold text-[#17191D] mb-1.5">
              Email Address (Read-only)
            </label>
            <input
              id="prof-email"
              type="email"
              disabled
              value={currentUser.email}
              className="w-full px-3.5 py-2.5 text-sm bg-[#EFECE6] border border-[#D8D8D2] rounded-lg text-[#6F7480]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#176B50] rounded-lg hover:bg-[#125640]"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
