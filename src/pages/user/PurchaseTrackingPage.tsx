import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PackageCheck, Sparkles, Store } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { formatDate, formatINR } from '../../utils/formatters';
import { triggerDealCelebration } from '../../utils/celebration';
import { StatusBadge } from '../../components/StatusBadge';

const CELEBRATED_STORAGE_KEY = 'autocollective_celebrated_deliveries_v1';

const PURCHASE_STEPS = [
  'Intention Confirmed',
  'Dealer Assigned',
  'Booking Paid',
  'Vehicle Allocated',
  'Delivered',
] as const;

export const PurchaseTrackingPage: React.FC = () => {
  const { db, currentUser } = useApp();
  if (!currentUser) return null;

  const myPurchases = db.purchases.filter((p) => p.userId === currentUser.id);

  useEffect(() => {
    const deliveredIds = myPurchases
      .filter((p) => p.status === 'Delivered')
      .map((p) => p.id);

    if (deliveredIds.length === 0) return;

    try {
      const raw = localStorage.getItem(CELEBRATED_STORAGE_KEY);
      const celebrated: string[] = raw ? JSON.parse(raw) : [];
      const newlyDelivered = deliveredIds.filter((id) => !celebrated.includes(id));

      if (newlyDelivered.length > 0) {
        triggerDealCelebration();
        localStorage.setItem(
          CELEBRATED_STORAGE_KEY,
          JSON.stringify([...celebrated, ...newlyDelivered])
        );
      }
    } catch {
      // Ignore storage errors
    }
  }, [myPurchases]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#17191D] font-display">Purchase Tracking</h1>
        <p className="text-sm text-[#5A5F6B] mt-1">
          Follow dealership assignment, booking receipt, VIN allocation, and delivery status.
        </p>
      </div>

      {myPurchases.length === 0 ? (
        <div className="bg-white border border-[#E4E4E0] rounded-xl p-10 text-center">
          <PackageCheck className="w-8 h-8 text-[#6F7480] mx-auto mb-2" />
          <p className="text-base font-bold text-[#17191D]">No confirmed purchase intentions yet</p>
          <p className="text-sm text-[#5A5F6B] mt-1 max-w-md mx-auto">
            Review published dealer quotations in your group and click "Confirm Purchase Intention"
            to start tracking.
          </p>
          <Link
            to="/dashboard/offers"
            className="inline-block mt-4 px-4 py-2 text-xs font-semibold text-white bg-[#176B50] rounded-lg"
          >
            View Dealer Offers
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {myPurchases.map((purchase) => {
            const model = db.models.find((m) => m.id === purchase.modelId);
            const variant = model?.variants.find((v) => v.id === purchase.variantId);
            const dealer = db.dealers.find((d) => d.id === purchase.dealerId);
            const group = db.groups.find((g) => g.id === purchase.groupId);
            const currentIdx = PURCHASE_STEPS.indexOf(
              purchase.status as (typeof PURCHASE_STEPS)[number]
            );

            return (
              <article
                key={purchase.id}
                className="bg-white border border-[#E4E4E0] rounded-xl p-6 space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-[#ECECE8]">
                  <div>
                    <p className="text-xs font-mono text-[#6F7480] tabular-nums">
                      Ref: {purchase.dealerReferenceCode} · Group {group?.code}
                    </p>
                    <h2 className="text-lg font-bold text-[#17191D] font-display mt-1">
                      {model?.name} — {variant?.name}
                    </h2>
                    <p className="text-xs text-[#5A5F6B] mt-0.5 tabular-nums">
                      Agreed On-Road Quotation: <strong>{formatINR(purchase.agreedOnRoadPrice)}</strong> · Updated{' '}
                      {formatDate(purchase.updatedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {purchase.status === 'Delivered' && (
                      <button
                        type="button"
                        onClick={triggerDealCelebration}
                        className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[#176B50] bg-[#EBF3F0] rounded-md hover:bg-[#DCEBE5] transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Celebrate Deal</span>
                      </button>
                    )}
                    <StatusBadge status={purchase.status} />
                  </div>
                </div>

                {purchase.status === 'Delivered' && (
                  <div className="p-4 rounded-lg bg-[#EBF3F0] border border-[#BFE0D4] text-xs text-[#176B50] font-medium">
                    Group purchase completed and vehicle delivered. Thank you for buying together
                    with AutoCollective!
                  </div>
                )}

                {purchase.status === 'Cancelled' ? (
                  <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                    This purchase record was cancelled. Remarks: {purchase.remarks || '—'}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    {PURCHASE_STEPS.map((step, idx) => {
                      const done = currentIdx >= idx;
                      return (
                        <div
                          key={step}
                          className={`p-3 rounded-lg border text-xs ${
                            done
                              ? 'bg-[#EBF3F0] border-[#BFE0D4] text-[#176B50] font-semibold'
                              : 'bg-[#F8F8F6] border-[#E4E4E0] text-[#6F7480]'
                          }`}
                        >
                          <p className="font-mono text-[11px] mb-0.5">0{idx + 1}</p>
                          <p>{step}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
                  <div className="p-4 rounded-lg bg-[#F8F8F6] border border-[#ECECE8]">
                    <p className="font-semibold text-[#17191D] inline-flex items-center gap-1.5 mb-1">
                      <Store className="w-3.5 h-3.5 text-[#176B50]" />
                      <span>Assigned Authorized Dealership</span>
                    </p>
                    <p className="font-semibold text-[#17191D]">{dealer?.name}</p>
                    <p className="text-[#5A5F6B] mt-0.5">{dealer?.address}</p>
                    <p className="text-[#5A5F6B] mt-1 tabular-nums">
                      Contact: {dealer?.contactPerson} · {dealer?.phone}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-[#F8F8F6] border border-[#ECECE8]">
                    <p className="font-semibold text-[#17191D] mb-1">Latest Coordination Remarks</p>
                    <p className="text-[#5A5F6B] leading-relaxed">
                      {purchase.remarks || 'Awaiting dealership verification update.'}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
