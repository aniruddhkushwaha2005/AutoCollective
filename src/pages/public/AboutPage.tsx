import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Building2, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold text-[#176B50]">About AutoCollective</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#17191D] font-display mt-2">
          Built to Make Vehicle Purchasing Transparent Through Collective Demand.
        </h1>
        <p className="text-base text-[#5A5F6B] mt-4 leading-relaxed">
          Buying a new car in India often involves opaque dealership margins, bundled insurance
          markups, and fragmented showroom visits. AutoCollective organizes individual buyers in
          the same city into verified cohorts so authorized dealerships can submit clear,
          itemized quotations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#E4E4E0] rounded-xl p-6">
          <Users className="w-6 h-6 text-[#176B50]" />
          <h2 className="text-lg font-bold text-[#17191D] font-display mt-3">
            Buyer-First Matching
          </h2>
          <p className="text-sm text-[#5A5F6B] mt-2 leading-relaxed">
            Every group aligns exact manufacturer, model, variant, fuel type, transmission, city,
            and buying timeline—ensuring dealers quote on uniform inventory.
          </p>
        </div>

        <div className="bg-white border border-[#E4E4E0] rounded-xl p-6">
          <Building2 className="w-6 h-6 text-[#176B50]" />
          <h2 className="text-lg font-bold text-[#17191D] font-display mt-3">
            Authorized Dealerships Only
          </h2>
          <p className="text-sm text-[#5A5F6B] mt-2 leading-relaxed">
            We coordinate solely with OEM-authorized regional showrooms. Vehicle billing, warranty,
            and delivery always remain directly between buyer and dealership.
          </p>
        </div>

        <div className="bg-white border border-[#E4E4E0] rounded-xl p-6">
          <Shield className="w-6 h-6 text-[#176B50]" />
          <h2 className="text-lg font-bold text-[#17191D] font-display mt-3">
            Privacy & Zero Obligation
          </h2>
          <p className="text-sm text-[#5A5F6B] mt-2 leading-relaxed">
            Personal phone numbers and emails are never broadcast to group members. You review
            published quotations freely and confirm only if the offer fits your expectations.
          </p>
        </div>
      </div>

      <section className="bg-white border border-[#E4E4E0] rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold text-[#17191D] font-display">
            Ready to join a city buying cohort?
          </h2>
          <p className="text-sm text-[#5A5F6B] mt-1">
            Browse live groups or submit your preferred configuration in under two minutes.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <Link
            to="/groups"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#176B50] rounded-lg hover:bg-[#125640]"
          >
            <span>Browse Groups</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/contact"
            className="px-4 py-2.5 text-sm font-semibold text-[#17191D] border border-[#D8D8D2] rounded-lg hover:bg-[#F4F4F0]"
          >
            Contact Team
          </Link>
        </div>
      </section>
    </div>
  );
};
