import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Specify Your Exact Vehicle & City',
      summary:
        'Tell us the manufacturer, model, variant, fuel type, transmission, preferred colour, and buying timeline.',
      detail:
        'Unlike generic lead aggregators, AutoCollective locks matching to exact compatible specifications. A buyer seeking a Hyundai Creta S(O) IVT in Bareilly is never mixed with a buyer seeking a Diesel Manual in Delhi.',
    },
    {
      num: '02',
      title: 'Automatic Group Matching',
      summary:
        'Your request joins an active compatible group or launches a new cohort with a 5-buyer target.',
      detail:
        'Each group has a 30-day window and dynamic progress bar. Your identity remains masked to fellow buyers—only your city, colour preference, and join date appear on the cohort roster.',
    },
    {
      num: '03',
      title: 'Verified Dealership Outreach',
      summary:
        'When the group reaches 5 buyers, AutoCollective approaches regional authorized dealers.',
      detail:
        'Dealers quote on a batch of verified, ready-to-book customers rather than cold inquiries. Quotations include complete itemized pricing: Ex-showroom, RTO, Insurance, Accessories, Handling, and Collective Discount.',
    },
    {
      num: '04',
      title: 'Compare Quotations & Confirm Intention',
      summary:
        'Review published quotations side-by-side and choose whether to proceed with a dealership.',
      detail:
        'Once you confirm purchase intention on a quotation, you receive a reference code and track every milestone—from dealer assignment and booking receipt to vehicle allocation and delivery.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold text-[#176B50]">Process & Transparency</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#17191D] font-display mt-2">
          How AutoCollective Works
        </h1>
        <p className="text-base text-[#5A5F6B] mt-3 leading-relaxed">
          Collective buying brings structure to car purchasing. Instead of negotiating alone at
          multiple showrooms, verified buyers combine their demand into a transparent cohort.
        </p>
      </div>

      <div className="space-y-5">
        {steps.map((step) => (
          <div
            key={step.num}
            className="bg-white border border-[#E4E4E0] rounded-xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6"
          >
            <div className="md:col-span-4">
              <span className="text-sm font-mono font-bold text-[#176B50]">Step {step.num}</span>
              <h2 className="text-xl font-bold text-[#17191D] font-display mt-1">{step.title}</h2>
            </div>
            <div className="md:col-span-8 space-y-2">
              <p className="text-sm font-semibold text-[#17191D]">{step.summary}</p>
              <p className="text-sm text-[#5A5F6B] leading-relaxed">{step.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="bg-white border border-[#E4E4E0] rounded-xl p-6 sm:p-8">
        <h2 className="text-xl font-bold text-[#17191D] font-display">
          Important Platform Principles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-sm text-[#5A5F6B]">
          {[
            'AutoCollective connects buyers and authorized dealerships—we do not sell vehicles directly.',
            'No guaranteed discounts: final pricing depends on participating dealers and variant stock.',
            'Zero payment collection on the platform: booking deposits are paid directly at the dealership.',
            'You can leave a group anytime before confirming purchase intention.',
          ].map((point) => (
            <div key={point} className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#176B50] shrink-0 mt-0.5" />
              <span>{point}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-5 border-t border-[#ECECE8] flex flex-wrap gap-3">
          <Link
            to="/groups"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#176B50] rounded-lg hover:bg-[#125640]"
          >
            <span>Browse Active Groups</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/dashboard/requests/new"
            className="px-5 py-2.5 text-sm font-semibold text-[#17191D] border border-[#D8D8D2] rounded-lg hover:bg-[#F4F4F0]"
          >
            Submit Car Request
          </Link>
        </div>
      </section>
    </div>
  );
};
