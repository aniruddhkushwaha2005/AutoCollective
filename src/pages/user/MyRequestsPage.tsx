import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, XCircle, ExternalLink } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { formatDate, formatINR } from '../../utils/formatters';
import { StatusBadge } from '../../components/StatusBadge';
import { ConfirmDialog } from '../../components/ConfirmDialog';

export const MyRequestsPage: React.FC = () => {
  const { db, currentUser, cancelRequest } = useApp();
  const [statusFilter, setStatusFilter] = useState('all');
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);

  if (!currentUser) return null;

  const myRequests = useMemo(() => {
    return db.requests
      .filter((r) => r.userId === currentUser.id)
      .filter((r) => statusFilter === 'all' || r.status === statusFilter);
  }, [db.requests, currentUser.id, statusFilter]);

  const handleConfirmCancel = () => {
    if (!cancelTargetId) return;
    cancelRequest(cancelTargetId);
    setCancelTargetId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#17191D] font-display">My Car Requests</h1>
          <p className="text-sm text-[#5A5F6B] mt-1">
            Track submitted vehicle preferences, matched groups, and edit or cancel active
            requests.
          </p>
        </div>
        <Link
          to="/dashboard/requests/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#176B50] rounded-lg hover:bg-[#125640] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Car Request</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-1.5">
        {['all', 'Matched to Group', 'Offer Received', 'Purchase Confirmed', 'Cancelled'].map(
          (st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                statusFilter === st
                  ? 'bg-[#176B50] text-white border-[#176B50]'
                  : 'bg-white text-[#4A4F59] border-[#E4E4E0] hover:bg-[#F4F4F0]'
              }`}
            >
              {st === 'all' ? 'All Requests' : st}
            </button>
          )
        )}
      </div>

      {myRequests.length === 0 ? (
        <div className="bg-white border border-[#E4E4E0] rounded-xl p-10 text-center">
          <p className="text-base font-bold text-[#17191D]">No car requests found</p>
          <p className="text-sm text-[#5A5F6B] mt-1">
            Submit your preferred car model, variant, and city to be matched automatically.
          </p>
          <Link
            to="/dashboard/requests/new"
            className="inline-block mt-4 px-4 py-2 text-xs font-semibold text-white bg-[#176B50] rounded-lg"
          >
            Submit First Request
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {myRequests.map((req) => {
            const brand = db.brands.find((b) => b.id === req.brandId);
            const model = db.models.find((m) => m.id === req.modelId);
            const variant = model?.variants.find((v) => v.id === req.variantId);
            const group = db.groups.find((g) => g.id === req.groupId);
            const canModify = req.status !== 'Purchase Confirmed' && req.status !== 'Cancelled';

            return (
              <article
                key={req.id}
                className="bg-white border border-[#E4E4E0] rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <StatusBadge status={req.status} />
                    <span className="text-xs text-[#6F7480] tabular-nums">
                      Submitted {formatDate(req.createdAt)}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-[#17191D] font-display">
                    {brand?.name} {model?.name} — {variant?.name}
                  </h2>
                  <p className="text-xs text-[#5A5F6B] tabular-nums">
                    {req.city} · {req.fuelType} · {req.transmission} · Colour: {req.preferredColor}{' '}
                    · Budget: {formatINR(req.budget)} · {req.timeline}
                  </p>
                  {req.notes && (
                    <p className="text-xs text-[#6F7480] italic">Notes: {req.notes}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {group && (
                    <Link
                      to={`/dashboard/groups/${group.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#176B50] bg-[#EBF3F0] rounded-lg hover:bg-[#DCEBE5]"
                    >
                      <span>Group {group.code}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}

                  {canModify && (
                    <>
                      <Link
                        to={`/dashboard/requests/${req.id}/edit`}
                        className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-[#17191D] border border-[#D8D8D2] rounded-lg hover:bg-[#F4F4F0]"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => setCancelTargetId(req.id)}
                        className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-red-700 border border-red-200 rounded-lg hover:bg-red-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(cancelTargetId)}
        title="Cancel Car Request?"
        description="Cancelling this request will also remove your slot from any matched group that has not yet confirmed a purchase."
        confirmLabel="Cancel Request"
        destructive
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelTargetId(null)}
      />
    </div>
  );
};
