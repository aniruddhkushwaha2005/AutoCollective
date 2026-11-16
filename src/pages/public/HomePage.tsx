import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, ShieldCheck, Users, Scale, Building2 } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { HERO_IMAGE } from '../../utils/carImages';
import { formatINRLakhs } from '../../utils/formatters';
import { CarImageFrame } from '../../components/CarImageFrame';
import { GroupCard } from '../../components/GroupCard';
import { SavingsCalculator } from '../../components/SavingsCalculator';

const HOME_FAQS = [
  {
    q: 'Does AutoCollective sell cars directly or guarantee discounts?',
    a: 'No. AutoCollective is a buyer-coordination platform that matches verified buyers interested in the same model and city. Authorized dealerships submit quotations, and any savings depend on dealer participation and inventory.',
  },
  {
    q: 'How does automatic group matching work?',
    a: 'When you submit a car request, our matching engine checks for open groups sharing your exact model, variant, city, fuel type, transmission, and buying timeline. If none exists, a new group is created automatically.',
  },
  {
    q: 'Is my phone number or identity shared with other buyers?',
    a: 'No. Other group members only see masked initials, city, and colour preference. Contact details are only shared with the dealership you select after confirming purchase intention.',
  },
  {
    q: 'What happens when a group reaches 5 buyers?',
    a: 'The group transitions to "Ready for Negotiation". AutoCollective approaches verified dealerships in your city for itemized on-road quotations including ex-showroom, RTO, insurance, accessories, and group discounts.',
  },
];

export const HomePage: React.FC = () => {
  const { db } = useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const featuredGroups = db.groups
    .filter((g) => g.status !== 'Expired')
    .slice(0, 3);

  const popularModels = db.models.filter((m) => m.isFeatured).slice(0, 5);

  const activeGroupsCount = db.groups.filter((g) => g.status !== 'Expired').length;
  const publishedOffersCount = db.offers.filter((o) => o.status === 'Published').length;
  const verifiedDealersCount = db.dealers.filter((d) => d.isVerified).length;

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-white border-b border-[#E4E4E0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-xs font-semibold text-[#176B50] tracking-wide mb-3">
                Buy Together. Save Together.
              </p>
              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#17191D] font-display leading-[1.12] tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                Better Deals Happen When We Buy Together.
              </h1>
              <p className="text-base text-[#5A5F6B] mt-5 leading-relaxed max-w-xl">
                Looking for a Hyundai Creta, Tata Nexon, or Kia Seltos in your city? Join buyers
                with the exact same car requirement, reach a collective group target, and compare
                itemized quotations from authorized dealerships—with zero obligation.
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-7">
                <Link
                  to="/groups"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#176B50] rounded-lg hover:bg-[#125640] transition-colors whitespace-nowrap"
                >
                  <span>Explore Deals</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/dashboard/requests/new"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#17191D] bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg hover:bg-[#EFECE6] transition-colors whitespace-nowrap"
                >
                  <span>Start Your Request</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-xl overflow-hidden border border-[#E4E4E0] h-full min-h-[280px] bg-[#EFECE6]">
                <img
                  src={HERO_IMAGE}
                  alt="Hyundai Creta and Tata Nexon SUVs parked in a sunlit dealership courtyard"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* 4-column Platform Proof Strip below hero split */}
          <div className="mt-10 pt-8 border-t border-[#ECECE8] grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-2xl font-extrabold text-[#17191D] font-display tabular-nums">
                {activeGroupsCount}
              </p>
              <p className="text-xs text-[#5A5F6B] mt-0.5">Active City Buying Groups</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#17191D] font-display tabular-nums">
                {db.models.length} Models
              </p>
              <p className="text-xs text-[#5A5F6B] mt-0.5">Verified Indian SUV Lineup</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#17191D] font-display tabular-nums">
                {verifiedDealersCount} Dealers
              </p>
              <p className="text-xs text-[#5A5F6B] mt-0.5">Authorized Regional Showrooms</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#17191D] font-display tabular-nums">
                {publishedOffersCount} Quotes
              </p>
              <p className="text-xs text-[#5A5F6B] mt-0.5">Published Sample Quotations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Group Deals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17191D] font-display">
              Featured Group Deals
            </h2>
            <p className="text-sm text-[#5A5F6B] mt-1">
              Active city cohorts collecting verified buyers or reviewing published quotations.
            </p>
          </div>
          <Link
            to="/groups"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#176B50] hover:text-[#125640] whitespace-nowrap"
          >
            <span>Browse all groups</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredGroups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      </section>

      {/* Popular Car Models */}
      <section className="bg-white border-y border-[#E4E4E0] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17191D] font-display">
                Popular Car Models
              </h2>
              <p className="text-sm text-[#5A5F6B] mt-1">
                Explore variants, powertrains, and ex-showroom pricing to start or join a group.
              </p>
            </div>
            <Link
              to="/cars"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#176B50] hover:text-[#125640] whitespace-nowrap"
            >
              <span>Explore full catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {popularModels.map((model) => {
              const brand = db.brands.find((b) => b.id === model.brandId);
              const startingPrice = Math.min(...model.variants.map((v) => v.exShowroomPrice));
              return (
                <Link
                  key={model.id}
                  to={`/cars?model=${model.id}`}
                  className="bg-[#F8F8F6] border border-[#E4E4E0] rounded-xl overflow-hidden flex flex-col hover:border-[#176B50]/50 transition-all"
                >
                  <CarImageFrame
                    imageKey={model.imageKey}
                    alt={model.name}
                    className="w-full h-36"
                  />
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[11px] font-semibold text-[#6F7480]">
                        {brand?.name} · {model.bodyType}
                      </p>
                      <h3 className="text-sm font-bold text-[#17191D] font-display mt-1">
                        {model.name}
                      </h3>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-[#E4E4E0] flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#17191D] tabular-nums">
                        From {formatINRLakhs(startingPrice)}
                      </span>
                      <span className="text-[#176B50] font-medium">
                        {model.variants.length} trims
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Potential Savings Calculator */}
      <SavingsCalculator />

      {/* How It Works & Why Choose AutoCollective */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 space-y-14">
        <div>
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17191D] font-display">
              How Collective Buying Works
            </h2>
            <p className="text-sm text-[#5A5F6B] mt-2">
              For example, five buyers in Bareilly seeking a Hyundai Creta S(O) IVT are matched
              automatically into one cohort so authorized dealers quote competitively for all five
              units together.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                num: '01',
                title: 'Submit Your Request',
                desc: 'Specify your city, car model, variant, fuel type, transmission, budget, and expected purchase timeline.',
              },
              {
                num: '02',
                title: 'Automatic Group Match',
                desc: 'Our matching engine places you into a compatible group in your city or opens a new cohort targeting 5 buyers.',
              },
              {
                num: '03',
                title: 'Dealer Quotation Round',
                desc: 'Once target capacity is met, AutoCollective approaches authorized dealerships for itemized on-road quotations.',
              },
              {
                num: '04',
                title: 'Compare & Decide',
                desc: 'Review RTO, insurance, accessories, and group discounts side-by-side before confirming your purchase intention.',
              },
            ].map((step) => (
              <div
                key={step.num}
                className="bg-white border border-[#E4E4E0] rounded-xl p-5 flex flex-col"
              >
                <span className="text-xs font-mono font-semibold text-[#176B50]">{step.num}</span>
                <h3 className="text-base font-bold text-[#17191D] font-display mt-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[#5A5F6B] mt-2 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#E4E4E0] rounded-xl p-6 sm:p-8">
          <div className="max-w-2xl mb-6">
            <h2 className="text-2xl font-extrabold text-[#17191D] font-display">
              Why Choose AutoCollective
            </h2>
            <p className="text-sm text-[#5A5F6B] mt-1">
              Structured transparency for serious buyers and measurable fleet volume for regional
              dealerships.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Users className="w-5 h-5 text-[#176B50]" />
              <h3 className="text-sm font-bold text-[#17191D]">Strict Compatibility Matching</h3>
              <p className="text-xs text-[#5A5F6B] leading-relaxed">
                We never mix incompatible variants, fuels, or cities just to pad numbers.
              </p>
            </div>
            <div className="space-y-2">
              <Scale className="w-5 h-5 text-[#176B50]" />
              <h3 className="text-sm font-bold text-[#17191D]">Line-by-Line Clarity</h3>
              <p className="text-xs text-[#5A5F6B] leading-relaxed">
                Every quotation breaks down ex-showroom, RTO, insurance, accessories, and discounts.
              </p>
            </div>
            <div className="space-y-2">
              <ShieldCheck className="w-5 h-5 text-[#176B50]" />
              <h3 className="text-sm font-bold text-[#17191D]">Privacy-Protected Cohorts</h3>
              <p className="text-xs text-[#5A5F6B] leading-relaxed">
                Your phone and email stay masked from other buyers throughout group formation.
              </p>
            </div>
            <div className="space-y-2">
              <Building2 className="w-5 h-5 text-[#176B50]" />
              <h3 className="text-sm font-bold text-[#17191D]">Zero Dealer Lock-In</h3>
              <p className="text-xs text-[#5A5F6B] leading-relaxed">
                Review published offers freely; you only proceed if the terms suit your budget.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-[#17191D] font-display">
              Common Questions
            </h2>
            <p className="text-sm text-[#5A5F6B] mt-1">
              Clear answers on how collective vehicle negotiation operates.
            </p>
          </div>
          <Link to="/faq" className="text-sm font-semibold text-[#176B50] hover:text-[#125640]">
            View all FAQs
          </Link>
        </div>

        <div className="bg-white border border-[#E4E4E0] rounded-xl divide-y divide-[#ECECE8]">
          {HOME_FAQS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="w-full px-6 py-4 flex items-center justify-between gap-4 text-left"
                >
                  <span className="text-sm font-semibold text-[#17191D]">{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#5A5F6B] shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-4 text-sm text-[#5A5F6B] leading-relaxed">{item.a}</div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
