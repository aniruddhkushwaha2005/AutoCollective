import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Scale, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { formatDate, formatINR } from '../../utils/formatters';
import { StatusBadge } from '../../components/StatusBadge';
import { ConfirmDialog } from '../../components/ConfirmDialog';

export const DealerOffersPage: React.FC = () => {
  const { db, currentUser, confirmPurchaseIntention } = useApp();
  const [scope, setScope] = useState<'my_groups' | 'all_published'>('my_groups');
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [remarks, setRemarks] = useState('');

  if (!currentUser) return null;

  const myGroupIds = useMemo(
    () =>
      new Set(
        db.groups
          .filter((g) => g.members.some((m) => m.userId === currentUser.id))
          .map((g) => g.id)
      ),
    [db.groups, currentUser.id]
  );

  const offers = useMemo(() => {
    return db.offers
      .filter((o) => o.status === 'Published')
      .filter((o) => (scope === 'my_groups' ? myGroupIds.has(o.groupId) : true))
      .sort((a, b) => a.finalOnRoadPrice - b.finalOnRoadPrice);
  }, [db.offers, scope, myGroupIds]);

  const handleConfirm = () => {
    if (!selectedOfferId) return;
    confirmPurchaseIntention(selectedOfferId, remarks);
    setSelectedOfferId(null);
    setRemarks('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#17191D] font-display">Dealer Offers</h1>
          <p className="text-sm text-[#5A5F6B] mt-1">
            Review clearly labelled sample dealership quotations published for your buying groups.
          </p>
        </div>
        <Link
          to="/dashboard/compare"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#176B50] bg-[#EBF3F0] rounded-lg hover:bg-[#DCEBE5] self-start sm:self-auto"
        >
          <Scale className="w-4 h-4" />
          <span>Compare Offers Side-by-Side</span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setScope('my_groups')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-lg border ${
            scope === 'my_groups'
              ? 'bg-[#176B50] text-white border-[#176B50]'
              : 'bg-white text-[#4A4F59] border-[#E4E4E0]'
          }`}
        >
          My Joined Groups
        </button>
        <button
          type="button"
          onClick={() => setScope('all_published')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-lg border ${
            scope === 'all_published'
              ? 'bg-[#176B50] text-white border-[#176B50]'
              : 'bg-white text-[#4A4F59] border-[#E4E4E0]'
          }`}
        >
          All Sample Quotations
        </button>
      </div>

      {offers.length === 0 ? (
        <div className="bg-white border border-[#E4E4E0] rounded-xl p-10 text-center">
          <p className="text-base font-bold text-[#17191D]">
            No published dealer quotations for your groups yet
          </p>
          <p className="text-sm text-[#5A5F6B] mt-1">
            Quotations appear here as soon as an admin publishes offers for a group you joined.
          </p>
          <Link
            to="/dashboard/groups"
            className="inline-block mt-4 px-4 py-2 text-xs font-semibold text-white bg-[#176B50] rounded-lg"
          >
            Check My Groups
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {offers.map((offer) => {
            const group = db.groups.find((g) => g.id === offer.groupId);
            const dealer = db.dealers.find((d) => d.id === offer.dealerId);
            const isMember = myGroupIds.has(offer.groupId);
            const existingPurchase = db.purchases.find(
              (p) =>
                p.userId === currentUser.id &&
                p.groupId === offer.groupId &&
                p.status !== 'Cancelled'
            );

            return (
              <article
                key={offer.id}
                className="bg-white border border-[#E4E4E0] rounded-xl p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-[#176B50]">
                        Sample Quotation · {group?.code}
                      </p>
                      <h2 className="text-lg font-bold text-[#17191D] font-display mt-0.5">
                        {dealer?.name}
                      </h2>
                      <p className="text-xs text-[#5A5F6B]">{group?.title}</p>
                    </div>
                    <StatusBadge status={offer.status} />
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#ECECE8] space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#5A5F6B]">Ex-Showroom</span>
                      <span className="font-medium tabular-nums">
                        {formatINR(offer.exShowroomPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5A5F6B]">RTO & Registration</span>
                      <span className="font-medium tabular-nums">
                        {formatINR(offer.rtoCharges)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5A5F6B]">Insurance</span>
                      <span className="font-medium tabular-nums">
                        {formatINR(offer.insuranceAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5A5F6B]">Accessories</span>
                      <span className="font-medium tabular-nums">
                        {formatINR(offer.accessoriesCost)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5A5F6B]">Additional Charges</span>
                      <span className="font-medium tabular-nums">
                        {formatINR(offer.additionalCharges)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#176B50] font-semibold">
                      <span>Group Discount</span>
                      <span className="tabular-nums">- {formatINR(offer.groupDiscount)}</span>
                    </div>
                    <div className="flex justify-between pt-2.5 border-t border-[#D8D8D2] text-sm font-bold text-[#17191D]">
                      <span>Final On-Road Price</span>
                      <span className="tabular-nums">{formatINR(offer.finalOnRoadPrice)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#5A5F6B] mt-3 leading-relaxed">
                    <strong>Valid until {formatDate(offer.validUntil)}:</strong>{' '}
                    {offer.termsAndConditions}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[#ECECE8] flex flex-wrap items-center justify-between gap-2">
                  <Link
                    to={`/dashboard/compare?groupId=${offer.groupId}`}
                    className="text-xs font-semibold text-[#176B50] hover:underline"
                  >
                    Compare Group Offers
                  </Link>

                  {existingPurchase?.offerId === offer.id ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#176B50]">
                      <CheckCircle2 className="w-4 h-4" />
                      Confirmed ({existingPurchase.status})
                    </span>
                  ) : existingPurchase ? (
                    <span className="text-xs text-[#6F7480]">
                      Already confirmed another quote
                    </span>
                  ) : isMember ? (
                    <button
                      type="button"
                      onClick={() => setSelectedOfferId(offer.id)}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#176B50] rounded-lg hover:bg-[#125640]"
                    >
                      Confirm Purchase Intention
                    </button>
                  ) : (
                    <Link
                      to={`/dashboard/groups/${offer.groupId}`}
                      className="px-3 py-1.5 text-xs font-semibold border border-[#D8D8D2] rounded-lg hover:bg-[#F4F4F0]"
                    >
                      View Group
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(selectedOfferId)}
        title="Confirm Purchase Intention?"
        description="This creates a purchase tracking record with the selected dealership quotation. You remain free to finalize financing and booking directly at the showroom."
        confirmLabel="Confirm Intention"
        onConfirm={handleConfirm}
        onCancel={() => setSelectedOfferId(null)}
      />
    </div>
  );
};
