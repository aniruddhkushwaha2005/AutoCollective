import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white border border-[#E4E4E0] rounded-xl p-6 sm:p-10 space-y-6">
        <div>
          <p className="text-xs font-semibold text-[#176B50]">Legal</p>
          <h1 className="text-3xl font-extrabold text-[#17191D] font-display mt-1">
            Terms & Conditions
          </h1>
          <p className="text-xs text-[#6F7480] mt-1">Last updated: November 2026</p>
        </div>

        <div className="space-y-5 text-sm text-[#5A5F6B] leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-[#17191D] mb-1.5">1. Platform Role</h2>
            <p>
              AutoCollective acts exclusively as a buyer-coordination intermediary connecting
              individual vehicle buyers with authorized dealerships. AutoCollective does not
              manufacture, stock, invoice, or directly sell motor vehicles.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#17191D] mb-1.5">2. No Guaranteed Discounts</h2>
            <p>
              Joining a group or submitting a car request does not guarantee a discount, priority
              allotment, or fixed delivery timeline. All sample quotations displayed on the
              platform are illustrative until confirmed directly with the issuing dealership.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#17191D] mb-1.5">
              3. Group Membership & Expiry
            </h2>
            <p>
              Each buying group specifies a target buyer count (default 5) and an expiry date.
              Duplicate active requests for identical vehicle configurations and cities are not
              permitted. Members may leave a group at any time prior to confirming purchase
              intention.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#17191D] mb-1.5">
              4. Direct Dealership Contracting
            </h2>
            <p>
              Booking amounts, vehicle invoicing, RTO registration, insurance policies, and OEM
              warranties are executed directly between the buyer and the authorized dealership.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
