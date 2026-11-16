import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { ConfirmDialog } from '../../components/ConfirmDialog';

export const AccountSettingsPage: React.FC = () => {
  const { currentUser, updateProfile, changePassword, resetDemoDatabase } = useApp();
  if (!currentUser) return null;

  const [emailNotifs, setEmailNotifs] = useState(currentUser.emailNotifications);
  const [smsNotifs, setSmsNotifs] = useState(currentUser.smsNotifications);

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState('');
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const handleSavePrefs = () => {
    updateProfile({
      emailNotifications: emailNotifs,
      smsNotifications: smsNotifs,
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    if (newPass.length < 6) {
      setPassError('New password must be at least 6 characters.');
      return;
    }
    if (newPass !== confirmPass) {
      setPassError('New passwords do not match.');
      return;
    }
    const res = changePassword(currentPass, newPass);
    if (!res.ok) {
      setPassError(res.error || 'Could not update password.');
      return;
    }
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#17191D] font-display">Account Settings</h1>
        <p className="text-sm text-[#5A5F6B] mt-1">
          Configure alert preferences, security credentials, and demonstration data controls.
        </p>
      </div>

      {/* Notification Preferences */}
      <section className="bg-white border border-[#E4E4E0] rounded-xl p-6 space-y-4">
        <h2 className="text-base font-bold text-[#17191D] font-display">
          Notification Channels
        </h2>

        <label className="flex items-start justify-between gap-4 py-2 cursor-pointer">
          <div>
            <p className="text-sm font-semibold text-[#17191D]">Email Alerts</p>
            <p className="text-xs text-[#5A5F6B]">
              Receive notifications when group targets are met or dealer offers are published.
            </p>
          </div>
          <input
            type="checkbox"
            checked={emailNotifs}
            onChange={(e) => setEmailNotifs(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-[#D8D8D2] text-[#176B50]"
          />
        </label>

        <label className="flex items-start justify-between gap-4 py-2 border-t border-[#ECECE8] cursor-pointer">
          <div>
            <p className="text-sm font-semibold text-[#17191D]">SMS Updates</p>
            <p className="text-xs text-[#5A5F6B]">
              Receive milestone reminders for booking confirmation and vehicle allocation.
            </p>
          </div>
          <input
            type="checkbox"
            checked={smsNotifs}
            onChange={(e) => setSmsNotifs(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-[#D8D8D2] text-[#176B50]"
          />
        </label>

        <button
          type="button"
          onClick={handleSavePrefs}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#176B50] rounded-lg hover:bg-[#125640]"
        >
          Save Preferences
        </button>
      </section>

      {/* Change Password */}
      <section className="bg-white border border-[#E4E4E0] rounded-xl p-6">
        <h2 className="text-base font-bold text-[#17191D] font-display mb-4">Change Password</h2>

        {passError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {passError}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label htmlFor="cur-pw" className="block text-xs font-semibold text-[#17191D] mb-1.5">
              Current Password
            </label>
            <input
              id="cur-pw"
              type="password"
              required
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="new-pw" className="block text-xs font-semibold text-[#17191D] mb-1.5">
                New Password
              </label>
              <input
                id="new-pw"
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
              />
            </div>
            <div>
              <label htmlFor="cnf-pw" className="block text-xs font-semibold text-[#17191D] mb-1.5">
                Confirm New Password
              </label>
              <input
                id="cnf-pw"
                type="password"
                required
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-[#176B50] rounded-lg hover:bg-[#125640]"
          >
            Update Password
          </button>
        </form>
      </section>

      {/* Demo Reset */}
      <section className="bg-white border border-[#E4E4E0] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-[#17191D]">Reset Demonstration Data</h2>
          <p className="text-xs text-[#5A5F6B] mt-0.5">
            Restore all sample users, cars, groups, dealer quotations, and purchases to factory
            state.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setResetConfirmOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-red-700 border border-red-200 rounded-lg hover:bg-red-50 shrink-0"
        >
          Reset Demo Data
        </button>
      </section>

      <ConfirmDialog
        open={resetConfirmOpen}
        title="Reset Demonstration Database?"
        description="This clears local changes and restores the original demonstration data, signing you out."
        confirmLabel="Reset Data"
        destructive
        onConfirm={() => {
          setResetConfirmOpen(false);
          resetDemoDatabase();
        }}
        onCancel={() => setResetConfirmOpen(false)}
      />
    </div>
  );
};
