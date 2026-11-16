import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Search } from 'lucide-react';

interface FaqItem {
  category: 'Matching' | 'Pricing & Offers' | 'Privacy & Safety' | 'Purchasing';
  q: string;
  a: string;
}

const ALL_FAQS: FaqItem[] = [
  {
    category: 'Matching',
    q: 'How does AutoCollective group matching ensure compatibility?',
    a: 'We match buyers strictly on manufacturer, model, variant, fuel type, transmission, city, and buying timeline. Incompatible trims or cities are never combined merely to reach the 5-buyer target.',
  },
  {
    category: 'Matching',
    q: 'What happens if no group exists for my car in my city?',
    a: 'Submitting a Car Request automatically creates a new buying group with a default target of 5 buyers and a 30-day window. Other buyers in your city looking for the same car are matched into your group automatically.',
  },
  {
    category: 'Matching',
    q: 'Can I leave a group if my plans change?',
    a: 'Yes. As long as you have not confirmed a purchase intention on a dealership offer, you can leave a group from the Group Details page at any time.',
  },
  {
    category: 'Pricing & Offers',
    q: 'Does AutoCollective guarantee a specific discount?',
    a: 'No. AutoCollective does not sell vehicles directly or guarantee discounts. We aggregate verified demand and invite authorized dealerships to submit transparent, itemized sample and verified quotations.',
  },
  {
    category: 'Pricing & Offers',
    q: 'What is included in every dealer quotation?',
    a: 'Every quotation lists Ex-Showroom Price, RTO Charges, Insurance, Accessories Package, Additional/Handling Charges, Collective Group Discount, Final On-Road Price, Offer Validity, and Terms & Conditions.',
  },
  {
    category: 'Pricing & Offers',
    q: 'Can I compare offers from multiple dealerships?',
    a: 'Yes. When multiple dealerships submit quotations for your group, the Offer Comparison page places them side-by-side so you can evaluate final on-road cost, insurance, and accessory bundles.',
  },
  {
    category: 'Privacy & Safety',
    q: 'Can other buyers in my group see my phone number or full name?',
    a: 'Never. Group rosters mask member names (e.g., P**** S*****) and omit phone numbers and emails. Only authorized platform administrators and your chosen dealership (post-confirmation) receive contact details.',
  },
  {
    category: 'Purchasing',
    q: 'Where do I pay the vehicle booking amount?',
    a: 'All booking tokens, down payments, and vehicle financing are settled directly with the authorized dealership showroom. AutoCollective never collects vehicle payments.',
  },
  {
    category: 'Purchasing',
    q: 'How do I track my car delivery after confirming an offer?',
    a: 'Once you confirm purchase intention, a Purchase Record is created in your dashboard. You can track milestones from Intention Confirmed through Dealer Assigned, Booking Paid, Vehicle Allocated, and Delivered.',
  },
];

export const FaqPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const categories = ['All', 'Matching', 'Pricing & Offers', 'Privacy & Safety', 'Purchasing'];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ALL_FAQS.filter((item) => {
      const catMatch = category === 'All' || item.category === category;
      const qMatch =
        !q || item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q);
      return catMatch && qMatch;
    });
  }, [search, category]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-[#17191D] font-display">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-[#5A5F6B] mt-1.5">
          Everything you need to know about collective vehicle matching, quotations, and privacy.
        </p>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#6F7480] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#D8D8D2] rounded-lg focus:outline-none focus:border-[#176B50]"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                category === cat
                  ? 'bg-[#176B50] text-white border-[#176B50]'
                  : 'bg-white text-[#4A4F59] border-[#E4E4E0] hover:bg-[#F4F4F0]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-[#E4E4E0] rounded-xl p-8 text-center">
          <p className="text-sm font-semibold text-[#17191D]">No matching FAQ found</p>
          <p className="text-xs text-[#5A5F6B] mt-1">
            Reach out via our Contact page if you have a specific question.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#E4E4E0] rounded-xl divide-y divide-[#ECECE8]">
          {filtered.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="w-full px-6 py-4 flex items-center justify-between gap-4 text-left"
                >
                  <div>
                    <span className="text-[11px] font-semibold text-[#176B50]">
                      {item.category}
                    </span>
                    <p className="text-sm font-bold text-[#17191D] mt-0.5">{item.q}</p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#5A5F6B] shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-sm text-[#5A5F6B] leading-relaxed">{item.a}</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-white border border-[#E4E4E0] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-[#17191D]">Still have questions?</p>
          <p className="text-xs text-[#5A5F6B] mt-0.5">
            Contact our buyer coordination team or dealership partnerships desk.
          </p>
        </div>
        <Link
          to="/contact"
          className="px-4 py-2 text-xs font-semibold text-white bg-[#176B50] rounded-lg hover:bg-[#125640] self-start sm:self-auto"
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
};
