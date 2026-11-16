import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { formatDateTime } from '../../utils/formatters';
import { ConfirmDialog } from '../../components/ConfirmDialog';

export const AdminSettingsPage: React.FC = () => {
  const { db, updateSettings, resetDemoDatabase } = useApp();

  const [defaultGroupTarget, setDefaultGroupTarget] = useState(
    db.settings.defaultGroupTarget
  );
  const [defaultGroupExpiryDays, setDefaultGroupExpiryDays] = useState(
    db.settings.defaultGroupExpiryDays
  );
  const [allowAutoGroupCreation, setAllowAutoGroupCreation] = useState(
    db.settings.allowAutoGroupCreation
  );
  const [supportEmail, setSupportEmail] = useState(db.settings.supportEmail);
  const [supportPhone, setSupportPhone] = useState(db.settings.supportPhone);
  const [maintenanceNotice, setMaintenanceNotice] = useState(db.settings.maintenanceNotice);
  const [resetOpen, setResetOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      defaultGroupTarget: Math.max(2, Number(defaultGroupTarget)),
      defaultGroupExpiryDays: Math.max(7, Number(defaultGroupExpiryDays)),
      allowAutoGroupCreation,
      supportEmail: supportEmail.trim(),
      supportPhone: supportPhone.trim(),
      maintenanceNotice: maintenanceNotice.trim(),
    });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-[#17191D] font-display">Admin Settings</h1>
        <p className="text-sm text-[#5A5F6B] mt-1">
          Configure matching engine defaults, platform announcements, and inspect contact inquiries.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white border border-[#E4E4E0] rounded-xl p-6 space-y-4"
      >
        <h2 className="text-base font-bold text-[#17191D] font-display">
          Matching & Operations Defaults
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#17191D] mb-1">
              Default Group Buyer Target
            </label>
            <input
              type="number"
              min={2}
              max={20}
              value={defaultGroupTarget}
              onChange={(e) => setDefaultGroupTarget(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg tabular-nums"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#17191D] mb-1">
              Default Group Validity Window (Days)
            </label>
            <input
              type="number"
              min={7}
              max={90}
              value={defaultGroupExpiryDays}
              onChange={(e) => setDefaultGroupExpiryDays(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg tabular-nums"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#17191D] mb-1">
              Support Email
            </label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#17191D] mb-1">
              Support Phone
            </label>
            <input
              type="text"
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#17191D] mb-1">
            Public Top Announcement Banner (Optional)
          </label>
          <input
            type="text"
            value={maintenanceNotice}
            onChange={(e) => setMaintenanceNotice(e.target.value)}
            placeholder="Leave blank to hide banner"
            className="w-full px-3.5 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
          />
        </div>

        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={allowAutoGroupCreation}
            onChange={(e) => setAllowAutoGroupCreation(e.target.checked)}
            className="rounded border-[#D8D8D2] text-[#176B50]"
          />
          <span>Automatically create a new buying group when no compatible open cohort exists</span>
        </label>

        <div className="pt-2">
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold text-white bg-[#176B50] rounded-lg hover:bg-[#125640]"
          >
            Save Platform Settings
          </button>
        </div>
      </form>

      {/* Contact Submissions */}
      <section className="bg-white border border-[#E4E4E0] rounded-xl p-6 space-y-4">
        <h2 className="text-base font-bold text-[#17191D] font-display">
          Contact Us Inquiries ({db.contacts.length})
        </h2>
        {db.contacts.length === 0 ? (
          <p className="text-xs text-[#5A5F6B]">No contact inquiries yet.</p>
        ) : (
          <div className="divide-y divide-[#ECECE8]">
            {db.contacts.map((c) => (
              <div key={c.id} className="py-3 text-xs space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-[#17191D]">
                    {c.subject} — {c.name} ({c.city})
                  </p>
                  <span className="text-[#6F7480] tabular-nums">
                    {formatDateTime(c.createdAt)}
                  </span>
                </div>
                <p className="text-[#5A5F6B]">
                  {c.email} · {c.phone}
                </p>
                <p className="text-[#17191D] leading-relaxed">{c.message}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Reset Demo */}
      <section className="bg-white border border-[#E4E4E0] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-[#17191D]">Reset Demonstration Database</h2>
          <p className="text-xs text-[#5A5F6B] mt-0.5">
            Restore initial sample users, groups, dealers, quotations, and purchase records.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setResetOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-red-700 border border-red-200 rounded-lg hover:bg-red-50 shrink-0"
        >
          Reset Demo Data
        </button>
      </section>

      <ConfirmDialog
        open={resetOpen}
        title="Reset All Demonstration Data?"
        description="This reverts all localStorage changes back to the initial demonstration seed."
        confirmLabel="Reset Database"
        destructive
        onConfirm={() => {
          setResetOpen(false);
          resetDemoDatabase();
        }}
        onCancel={() => setResetOpen(false)}
      />
    </div>
  );
};
