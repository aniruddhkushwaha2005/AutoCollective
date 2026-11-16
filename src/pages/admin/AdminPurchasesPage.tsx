import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { PurchaseStatus } from '../../types';
import { formatDate, formatINR } from '../../utils/formatters';
import { StatusBadge } from '../../components/StatusBadge';

const PURCHASE_STATUSES: PurchaseStatus[] = [
  'Intention Confirmed',
  'Dealer Assigned',
  'Booking Paid',
  'Vehicle Allocated',
  'Delivered',
  'Cancelled',
];

export const AdminPurchasesPage: React.FC = () => {
  const { db, adminUpdatePurchaseStatus } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingRemarks, setEditingRemarks] = useState<Record<string, string>>({});
  const [editingRefs, setEditingRefs] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return db.purchases.filter((p) => {
      const buyer = db.users.find((u) => u.id === p.userId);
      const dealer = db.dealers.find((d) => d.id === p.dealerId);
      const matchQ =
        !q ||
        p.dealerReferenceCode.toLowerCase().includes(q) ||
        (buyer?.name.toLowerCase().includes(q) ?? false) ||
        (dealer?.name.toLowerCase().includes(q) ?? false);
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchQ && matchStatus;
    });
  }, [db.purchases, db.users, db.dealers, search, statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#17191D] font-display">
          Purchase Management
        </h1>
        <p className="text-sm text-[#5A5F6B] mt-1">
          Update confirmed buyer purchase milestones, dealer reference codes, and delivery notes.
        </p>
      </div>

      <div className="bg-white border border-[#E4E4E0] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#6F7480] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference code, buyer, dealership..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
          />
        </div>
        <select
          aria-label="Filter by purchase status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
        >
          <option value="all">All Purchase Statuses</option>
          {PURCHASE_STATUSES.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-[#E4E4E0] rounded-xl p-10 text-center">
          <p className="text-sm font-semibold text-[#17191D]">No purchase records found</p>
          <p className="text-xs text-[#5A5F6B] mt-1">
            Records appear here when buyers confirm purchase intention on published offers.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((p) => {
            const buyer = db.users.find((u) => u.id === p.userId);
            const dealer = db.dealers.find((d) => d.id === p.dealerId);
            const model = db.models.find((m) => m.id === p.modelId);
            const variant = model?.variants.find((v) => v.id === p.variantId);
            const group = db.groups.find((g) => g.id === p.groupId);

            const refVal = editingRefs[p.id] ?? p.dealerReferenceCode;
            const remVal = editingRemarks[p.id] ?? p.remarks;

            return (
              <article
                key={p.id}
                className="bg-white border border-[#E4E4E0] rounded-xl p-5 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-mono text-[#6F7480] tabular-nums">
                      {p.dealerReferenceCode} · Group {group?.code} · Updated{' '}
                      {formatDate(p.updatedAt)}
                    </p>
                    <h2 className="text-base font-bold text-[#17191D] font-display mt-0.5">
                      {buyer?.name} — {model?.name} {variant?.name}
                    </h2>
                    <p className="text-xs text-[#5A5F6B] tabular-nums">
                      Dealership: <strong>{dealer?.name}</strong> · Agreed On-Road:{' '}
                      <strong>{formatINR(p.agreedOnRoadPrice)}</strong>
                    </p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-3 border-t border-[#ECECE8]">
                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-semibold text-[#6F7480] mb-1">
                      Purchase Status
                    </label>
                    <select
                      aria-label={`Purchase status for ${buyer?.name}`}
                      value={p.status}
                      onChange={(e) =>
                        adminUpdatePurchaseStatus(
                          p.id,
                          e.target.value as PurchaseStatus,
                          refVal,
                          remVal
                        )
                      }
                      className="w-full px-3 py-2 text-xs bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
                    >
                      {PURCHASE_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-semibold text-[#6F7480] mb-1">
                      Dealer Reference Code
                    </label>
                    <input
                      type="text"
                      value={refVal}
                      onChange={(e) =>
                        setEditingRefs((prev) => ({ ...prev, [p.id]: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-xs font-mono bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
                    />
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-[11px] font-semibold text-[#6F7480] mb-1">
                      Coordination Remarks
                    </label>
                    <input
                      type="text"
                      value={remVal}
                      onChange={(e) =>
                        setEditingRemarks((prev) => ({ ...prev, [p.id]: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-xs bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
                    />
                  </div>

                  <div className="md:col-span-2 flex items-end">
                    <button
                      type="button"
                      onClick={() =>
                        adminUpdatePurchaseStatus(p.id, p.status, refVal, remVal)
                      }
                      className="w-full px-3 py-2 text-xs font-semibold text-white bg-[#176B50] rounded-lg hover:bg-[#125640]"
                    >
                      Save Update
                    </button>
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
