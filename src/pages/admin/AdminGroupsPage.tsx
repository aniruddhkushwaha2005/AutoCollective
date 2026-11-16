import React, { useMemo, useState } from 'react';
import { Plus, Trash2, UserPlus, UserMinus, Search } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { FuelType, GroupStatus, PurchaseTimeline, TransmissionType } from '../../types';
import { formatDate } from '../../utils/formatters';
import { StatusBadge } from '../../components/StatusBadge';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Pagination } from '../../components/Pagination';

const GROUP_STATUSES: GroupStatus[] = [
  'Collecting Buyers',
  'Ready for Negotiation',
  'Negotiating',
  'Offer Received',
  'Deal Completed',
  'Expired',
];

export const AdminGroupsPage: React.FC = () => {
  const {
    db,
    adminCreateGroup,
    adminUpdateGroup,
    adminAddMemberToGroup,
    adminRemoveMemberFromGroup,
    adminDeleteGroup,
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // Create Group Modal / Inline Panel
  const [showCreate, setShowCreate] = useState(false);
  const [modelId, setModelId] = useState(db.models[0]?.id || '');
  const selectedModel = db.models.find((m) => m.id === modelId) || db.models[0];
  const [variantId, setVariantId] = useState(selectedModel?.variants[0]?.id || '');
  const [city, setCity] = useState('Bareilly');
  const [timeline, setTimeline] = useState<PurchaseTimeline>('Within 30 Days');
  const [targetBuyers, setTargetBuyers] = useState(5);
  const [expiryDate, setExpiryDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState('');

  // Selected Group Editor
  const [editingGroupId, setEditingGroupId] = useState<string | null>(
    db.groups[0]?.id || null
  );
  const [addUserId, setAddUserId] = useState(
    db.users.find((u) => u.role === 'user')?.id || ''
  );
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return db.groups.filter((g) => {
      const matchQ =
        !q ||
        g.title.toLowerCase().includes(q) ||
        g.code.toLowerCase().includes(q) ||
        g.city.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || g.status === statusFilter;
      return matchQ && matchStatus;
    });
  }, [db.groups, search, statusFilter]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const activeGroup = db.groups.find((g) => g.id === editingGroupId) || null;

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModel) return;
    const variant =
      selectedModel.variants.find((v) => v.id === variantId) || selectedModel.variants[0];
    if (!variant) return;

    const res = adminCreateGroup({
      title: `${selectedModel.name} ${variant.name} — ${city.trim()}`,
      brandId: selectedModel.brandId,
      modelId: selectedModel.id,
      variantId: variant.id,
      city,
      fuelType: variant.fuelType as FuelType,
      transmission: variant.transmission as TransmissionType,
      timeline,
      targetBuyers,
      expiresAt: expiryDate,
      negotiationNotes: notes || 'Created by administrator for regional demand.',
    });
    if (res.ok && res.data) {
      setShowCreate(false);
      setEditingGroupId(res.data.id);
      setNotes('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#17191D] font-display">
            Group Management
          </h1>
          <p className="text-sm text-[#5A5F6B] mt-1">
            Monitor cohort targets, adjust expiry dates, transition negotiation states, and manage
            members.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#176B50] rounded-lg hover:bg-[#125640] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{showCreate ? 'Close Form' : 'Create Group'}</span>
        </button>
      </div>

      {showCreate && (
        <form
          onSubmit={handleCreateGroup}
          className="bg-white border border-[#E4E4E0] rounded-xl p-6 space-y-4"
        >
          <h2 className="text-base font-bold text-[#17191D] font-display">
            Create New Buying Group
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Car Model</label>
              <select
                value={selectedModel?.id || ''}
                onChange={(e) => {
                  const m = db.models.find((item) => item.id === e.target.value);
                  setModelId(e.target.value);
                  if (m?.variants[0]) setVariantId(m.variants[0].id);
                }}
                className="w-full px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
              >
                {db.models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Variant</label>
              <select
                value={variantId}
                onChange={(e) => setVariantId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
              >
                {selectedModel?.variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.fuelType} · {v.transmission})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">City</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Timeline</label>
              <select
                value={timeline}
                onChange={(e) => setTimeline(e.target.value as PurchaseTimeline)}
                className="w-full px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
              >
                <option value="Immediate (Within 15 Days)">Immediate (Within 15 Days)</option>
                <option value="Within 30 Days">Within 30 Days</option>
                <option value="1 - 2 Months">1 - 2 Months</option>
                <option value="2 - 3 Months">2 - 3 Months</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Target Buyers</label>
              <input
                type="number"
                min={2}
                max={25}
                value={targetBuyers}
                onChange={(e) => setTargetBuyers(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Expiry Date</label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Negotiation Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal coordination summary..."
              className="w-full px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold text-white bg-[#176B50] rounded-lg hover:bg-[#125640]"
          >
            Save Group
          </button>
        </form>
      )}

      {/* Search & Filter */}
      <div className="bg-white border border-[#E4E4E0] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#6F7480] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search code, model, city..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
          />
        </div>
        <select
          aria-label="Filter by group status"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
        >
          <option value="all">All Group Statuses</option>
          {GROUP_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Groups Table */}
        <div className="lg:col-span-7 bg-white border border-[#E4E4E0] rounded-xl p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E4E4E0] text-xs text-[#6F7480]">
                  <th className="py-2.5 pr-3 font-semibold">Group</th>
                  <th className="py-2.5 pr-3 font-semibold">Progress</th>
                  <th className="py-2.5 pr-3 font-semibold">Status</th>
                  <th className="py-2.5 font-semibold text-right">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECECE8]">
                {paginated.map((grp) => {
                  const selected = editingGroupId === grp.id;
                  return (
                    <tr
                      key={grp.id}
                      className={selected ? 'bg-[#EBF3F0]/45' : 'hover:bg-[#F8F8F6]/70'}
                    >
                      <td className="py-3 pr-3">
                        <p className="font-semibold text-[#17191D]">{grp.title}</p>
                        <p className="text-xs font-mono text-[#6F7480]">
                          {grp.code} · Exp {formatDate(grp.expiresAt)}
                        </p>
                      </td>
                      <td className="py-3 pr-3 text-xs font-bold tabular-nums">
                        {grp.members.length} / {grp.targetBuyers}
                      </td>
                      <td className="py-3 pr-3">
                        <StatusBadge status={grp.status} />
                      </td>
                      <td className="py-3 text-right whitespace-nowrap space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingGroupId(grp.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-[#176B50] bg-[#EBF3F0] rounded"
                        >
                          Configure
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteGroupId(grp.id)}
                          aria-label={`Delete ${grp.code}`}
                          className="p-1.5 text-red-700 border border-red-200 rounded hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={page}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>

        {/* Active Group Configuration Panel */}
        <div className="lg:col-span-5 bg-white border border-[#E4E4E0] rounded-xl p-6 space-y-5 self-start">
          {activeGroup ? (
            <>
              <div>
                <p className="text-xs font-mono text-[#176B50]">{activeGroup.code}</p>
                <h2 className="text-lg font-bold text-[#17191D] font-display mt-0.5">
                  {activeGroup.title}
                </h2>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#17191D] mb-1">Group Status</label>
                  <select
                    value={activeGroup.status}
                    onChange={(e) =>
                      adminUpdateGroup(activeGroup.id, {
                        status: e.target.value as GroupStatus,
                      })
                    }
                    className="w-full px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
                  >
                    {GROUP_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#17191D] mb-1">
                      Target Buyers
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={25}
                      value={activeGroup.targetBuyers}
                      onChange={(e) =>
                        adminUpdateGroup(activeGroup.id, {
                          targetBuyers: Math.max(2, Number(e.target.value)),
                        })
                      }
                      className="w-full px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#17191D] mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={activeGroup.expiresAt.slice(0, 10)}
                      onChange={(e) =>
                        adminUpdateGroup(activeGroup.id, {
                          expiresAt: new Date(e.target.value).toISOString(),
                        })
                      }
                      className="w-full px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#17191D] mb-1">
                    Negotiation Notes
                  </label>
                  <textarea
                    rows={2}
                    value={activeGroup.negotiationNotes}
                    onChange={(e) =>
                      adminUpdateGroup(activeGroup.id, {
                        negotiationNotes: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
                  />
                </div>
              </div>

              {/* Member Roster Management */}
              <div className="pt-4 border-t border-[#ECECE8] space-y-3">
                <h3 className="text-xs font-bold text-[#17191D]">
                  Assigned Members ({activeGroup.members.length}/{activeGroup.targetBuyers})
                </h3>

                <div className="flex gap-2">
                  <select
                    aria-label="Select user to add"
                    value={addUserId}
                    onChange={(e) => setAddUserId(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-xs bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
                  >
                    {db.users
                      .filter((u) => u.role === 'user')
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.city})
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => adminAddMemberToGroup(activeGroup.id, addUserId)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#176B50] rounded-lg"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Assign</span>
                  </button>
                </div>

                <div className="divide-y divide-[#ECECE8] max-h-52 overflow-y-auto">
                  {activeGroup.members.map((m) => {
                    const user = db.users.find((u) => u.id === m.userId);
                    return (
                      <div
                        key={m.userId}
                        className="py-2 flex items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <p className="font-semibold text-[#17191D]">
                            {user?.name || m.userId}
                          </p>
                          <p className="text-[#5A5F6B]">
                            {m.city} · {m.preferredColor}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => adminRemoveMemberFromGroup(activeGroup.id, m.userId)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-red-700 border border-red-200 rounded hover:bg-red-50"
                        >
                          <UserMinus className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-[#5A5F6B]">Select a group on the left to configure.</p>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteGroupId)}
        title="Delete Buying Group?"
        description="Deleting this group removes associated offers and unlinks matched buyer requests."
        confirmLabel="Delete Group"
        destructive
        onConfirm={() => {
          if (deleteGroupId) adminDeleteGroup(deleteGroupId);
          setDeleteGroupId(null);
        }}
        onCancel={() => setDeleteGroupId(null)}
      />
    </div>
  );
};
