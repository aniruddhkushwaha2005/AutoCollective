import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { formatDate, formatINR } from '../../utils/formatters';
import { ConfirmDialog } from '../../components/ConfirmDialog';

export const OfferComparisonPage: React.FC = () => {
  const { db, currentUser, confirmPurchaseIntention } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const groupsWithOffers = useMemo(() => {
    const groupIdsWithPublished = new Set(
      db.offers.filter((o) => o.status === 'Published').map((o) => o.groupId)
    );
    return db.groups.filter((g) => groupIdsWithPublished.has(g.id));
  }, [db.groups, db.offers]);

  const initialGroupId =
    searchParams.get('groupId') ||
    groupsWithOffers.find((g) =>
      g.members.some((m) => m.userId === currentUser?.id)
    )?.id ||
    groupsWithOffers[0]?.id ||
    '';

  const [selectedGroupId, setSelectedGroupId] = useState(initialGroupId);
  const [confirmOfferId, setConfirmOfferId] = useState<string | null>(null);

  const selectedGroup = db.groups.find((g) => g.id === selectedGroupId);
  const groupOffers = useMemo(
    () =>
      db.offers
        .filter((o) => o.groupId === selectedGroupId && o.status === 'Published')
        .sort((a, b) => a.finalOnRoadPrice - b.finalOnRoadPrice),
    [db.offers, selectedGroupId]
  );

  const lowestOnRoad =
    groupOffers.length > 0 ? Math.min(...groupOffers.map((o) => o.finalOnRoadPrice)) : 0;
  const highestDiscount =
    groupOffers.length > 0 ? Math.max(...groupOffers.map((o) => o.groupDiscount)) : 0;

  const isMember = Boolean(
    currentUser && selectedGroup?.members.some((m) => m.userId === currentUser.id)
  );
  const existingPurchase = currentUser
    ? db.purchases.find(
        (p) =>
          p.userId === currentUser.id &&
          p.groupId === selectedGroupId &&
          p.status !== 'Cancelled'
      )
    : undefined;

  const handleGroupSelect = (gid: string) => {
    setSelectedGroupId(gid);
    setSearchParams({ groupId: gid });
  };

  const handleConfirm = () => {
    if (!confirmOfferId) return;
    confirmPurchaseIntention(confirmOfferId);
    setConfirmOfferId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#17191D] font-display">
            Offer Comparison Matrix
          </h1>
          <p className="text-sm text-[#5A5F6B] mt-1">
            Compare itemized on-road pricing, group discounts, and validity across participating
            dealerships.
          </p>
        </div>

        {groupsWithOffers.length > 0 && (
          <div className="w-full sm:w-80">
            <label htmlFor="cmp-group" className="block text-xs font-semibold text-[#5A5F6B] mb-1">
              Select Buying Group
            </label>
            <select
              id="cmp-group"
              value={selectedGroupId}
              onChange={(e) => handleGroupSelect(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-[#D8D8D2] rounded-lg"
            >
              {groupsWithOffers.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.code} — {g.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {groupOffers.length === 0 ? (
        <div className="bg-white border border-[#E4E4E0] rounded-xl p-10 text-center">
          <p className="text-base font-bold text-[#17191D]">
            No published offers available to compare for this group
          </p>
          <p className="text-sm text-[#5A5F6B] mt-1">
            Choose another group above or wait for dealerships to submit quotations.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#E4E4E0] rounded-xl overflow-hidden">
          <div className="px-6 py-4 bg-[#F8F8F6] border-b border-[#E4E4E0] flex flex-wrap items-center justify-between gap-2 text-xs text-[#5A5F6B]">
            <span>
              <strong className="text-[#17191D]">{selectedGroup?.title}</strong> ({selectedGroup?.code})
            </span>
            <span>Sample Demonstration Quotations · Prices in INR</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E4E4E0]">
                  <th className="py-4 px-5 text-xs font-semibold text-[#6F7480] w-52">
                    Quotation Component
                  </th>
                  {groupOffers.map((offer) => {
                    const dealer = db.dealers.find((d) => d.id === offer.dealerId);
                    const isBest = offer.finalOnRoadPrice === lowestOnRoad;
                    return (
                      <th key={offer.id} className="py-4 px-5 min-w-[230px]">
                        <p className="text-xs font-semibold text-[#176B50]">
                          {isBest ? 'Lowest On-Road Quote' : 'Verified Quotation'}
                        </p>
                        <p className="text-base font-bold text-[#17191D] font-display mt-0.5">
                          {dealer?.name}
                        </p>
                        <p className="text-xs font-normal text-[#5A5F6B]">{dealer?.city}</p>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECECE8] text-sm">
                <tr>
                  <td className="py-3.5 px-5 font-medium text-[#5A5F6B]">Ex-Showroom Price</td>
                  {groupOffers.map((o) => (
                    <td key={o.id} className="py-3.5 px-5 tabular-nums font-medium">
                      {formatINR(o.exShowroomPrice)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-medium text-[#5A5F6B]">RTO & Registration</td>
                  {groupOffers.map((o) => (
                    <td key={o.id} className="py-3.5 px-5 tabular-nums">
                      {formatINR(o.rtoCharges)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-medium text-[#5A5F6B]">Insurance</td>
                  {groupOffers.map((o) => (
                    <td key={o.id} className="py-3.5 px-5 tabular-nums">
                      {formatINR(o.insuranceAmount)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-medium text-[#5A5F6B]">Accessories Package</td>
                  {groupOffers.map((o) => (
                    <td key={o.id} className="py-3.5 px-5 tabular-nums">
                      {formatINR(o.accessoriesCost)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-medium text-[#5A5F6B]">Additional Charges</td>
                  {groupOffers.map((o) => (
                    <td key={o.id} className="py-3.5 px-5 tabular-nums">
                      {formatINR(o.additionalCharges)}
                    </td>
                  ))}
                </tr>
                <tr className="bg-[#EBF3F0]/40">
                  <td className="py-3.5 px-5 font-semibold text-[#176B50]">
                    Collective Group Discount
                  </td>
                  {groupOffers.map((o) => (
                    <td key={o.id} className="py-3.5 px-5 tabular-nums font-bold text-[#176B50]">
                      - {formatINR(o.groupDiscount)}
                      {o.groupDiscount === highestDiscount && (
                        <span className="block text-[11px] font-medium">Highest discount</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="bg-[#F8F8F6]">
                  <td className="py-4 px-5 font-bold text-[#17191D]">Final On-Road Price</td>
                  {groupOffers.map((o) => (
                    <td key={o.id} className="py-4 px-5 tabular-nums text-base font-extrabold text-[#17191D]">
                      {formatINR(o.finalOnRoadPrice)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-medium text-[#5A5F6B]">Valid Until</td>
                  {groupOffers.map((o) => (
                    <td key={o.id} className="py-3.5 px-5 text-xs tabular-nums">
                      {formatDate(o.validUntil)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-medium text-[#5A5F6B] align-top">
                    Terms & Conditions
                  </td>
                  {groupOffers.map((o) => (
                    <td key={o.id} className="py-3.5 px-5 text-xs text-[#5A5F6B] leading-relaxed align-top">
                      {o.termsAndConditions}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 px-5 font-medium text-[#5A5F6B]">Selection</td>
                  {groupOffers.map((o) => (
                    <td key={o.id} className="py-4 px-5">
                      {existingPurchase?.offerId === o.id ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#176B50]">
                          <CheckCircle2 className="w-4 h-4" />
                          Confirmed ({existingPurchase.status})
                        </span>
                      ) : existingPurchase ? (
                        <span className="text-xs text-[#6F7480]">
                          Another quote confirmed
                        </span>
                      ) : isMember ? (
                        <button
                          type="button"
                          onClick={() => setConfirmOfferId(o.id)}
                          className="w-full px-3.5 py-2 text-xs font-semibold text-white bg-[#176B50] rounded-lg hover:bg-[#125640]"
                        >
                          Confirm This Offer
                        </button>
                      ) : (
                        <Link
                          to={`/dashboard/groups/${selectedGroupId}`}
                          className="inline-block px-3.5 py-2 text-xs font-semibold text-[#176B50] border border-[#176B50] rounded-lg"
                        >
                          Join Group to Select
                        </Link>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmOfferId)}
        title="Confirm Purchase Intention?"
        description="Confirming generates a dealership reference code and updates your Purchase Tracking dashboard."
        confirmLabel="Confirm Offer"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOfferId(null)}
      />
    </div>
  );
};
