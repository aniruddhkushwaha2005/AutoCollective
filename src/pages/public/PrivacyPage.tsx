import React from 'react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white border border-[#E4E4E0] rounded-xl p-6 sm:p-10 space-y-6">
        <div>
          <p className="text-xs font-semibold text-[#176B50]">Data Protection</p>
          <h1 className="text-3xl font-extrabold text-[#17191D] font-display mt-1">
            Privacy Policy
          </h1>
          <p className="text-xs text-[#6F7480] mt-1">Last updated: November 2026</p>
        </div>

        <div className="space-y-5 text-sm text-[#5A5F6B] leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-[#17191D] mb-1.5">1. Data We Collect</h2>
            <p>
              When you register or submit a car request on AutoCollective, we collect your name,
              email address, phone number, city, vehicle preferences, and buying timeline to match
              you into compatible cohorts.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#17191D] mb-1.5">
              2. Group Roster Masking
            </h2>
            <p>
              Your phone number, email address, and full name are never exposed to other buyers in
              your group. Public and member-facing group rosters display only masked initials,
              city, and colour preference.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#17191D] mb-1.5">
              3. Dealership Sharing Consent
            </h2>
            <p>
              Your contact details are shared with an authorized dealership only after you
              explicitly confirm purchase intention on a published quotation.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#17191D] mb-1.5">
              4. Demonstration Data Persistence
            </h2>
            <p>
              In this lightweight demonstration environment, application data is stored locally in
              your browser via localStorage so your workflows persist across page refreshes. You
              may reset demonstration data anytime from Account or Admin Settings.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
