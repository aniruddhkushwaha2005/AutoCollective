import React, { useMemo, useState } from 'react';
import { Pencil, Plus, Send, Trash2 } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { calculateFinalOnRoadPrice } from '../../services/matchingEngine';
import { formatDate, formatINR } from '../../utils/formatters';
import { StatusBadge } from '../../components/StatusBadge';
import { ConfirmDialog } from '../../components/ConfirmDialog';

export const AdminOffersPage: React.FC = () => {
  const { db, createOffer, updateOffer, publishOffer, deleteOffer } = useApp();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [groupId, setGroupId] = useState(db.groups[0]?.id || '');
  const [dealerId, setDealerId] = useState(db.dealers[0]?.id || '');

  const selectedGroup = db.groups.find((g) => g.id === groupId);
  const selectedModel = db.models.find((m) => m.id === selectedGroup?.modelId);
  const selectedVariant = selectedModel?.variants.find(
    (v) => v.id === selectedGroup?.variantId
  );

  const [exShowroomPrice, setExShowroomPrice] = useState(
    selectedVariant?.exShowroomPrice || 1500000
  );
  const [rtoCharges, setRtoCharges] = useState(150000);
  const [insuranceAmount, setInsuranceAmount] = useState(48000);
  const [accessoriesCost, setAccessoriesCost] = useState(12000);
  const [groupDiscount, setGroupDiscount] = useState(45000);
  const [additionalCharges, setAdditionalCharges] = useState(4000);
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [termsAndConditions, setTermsAndConditions] = useState(
    'Sample demonstration quotation valid for verified group buyers. Includes standard warranty and optional accessories.'
  );
  const [publishImmediately, setPublishImmediately] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const liveFinalOnRoad = calculateFinalOnRoadPrice({
    exShowroomPrice,
    rtoCharges,
    insuranceAmount,
    accessoriesCost,
    groupDiscount,
    additionalCharges,
  });

  const handleGroupChange = (nextGid: string) => {
    setGroupId(nextGid);
    const g = db.groups.find((item) => item.id === nextGid);
    const m = db.models.find((item) => item.id === g?.modelId);
    const v = m?.variants.find((item) => item.id === g?.variantId);
    if (v) {
      setExShowroomPrice(v.exShowroomPrice);
      setRtoCharges(Math.round(v.exShowroomPrice * 0.1));
    }
    const matchingDealer = db.dealers.find(
      (d) => g && (d.modelIds.includes(g.modelId) || d.city === g.city)
    );
    if (matchingDealer) setDealerId(matchingDealer.id);
  };

  const resetForm = () => {
    setEditingId(null);
    setPublishImmediately(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateOffer(editingId, {
        groupId,
        dealerId,
        exShowroomPrice: Number(exShowroomPrice),
        rtoCharges: Number(rtoCharges),
        insuranceAmount: Number(insuranceAmount),
        accessoriesCost: Number(accessoriesCost),
        groupDiscount: Number(groupDiscount),
        additionalCharges: Number(additionalCharges),
        validUntil: new Date(validUntil).toISOString(),
        termsAndConditions,
      });
      resetForm();
      return;
    }

    createOffer({
      groupId,
      dealerId,
      exShowroomPrice: Number(exShowroomPrice),
      rtoCharges: Number(rtoCharges),
      insuranceAmount: Number(insuranceAmount),
      accessoriesCost: Number(accessoriesCost),
      groupDiscount: Number(groupDiscount),
      additionalCharges: Number(additionalCharges),
      validUntil,
      termsAndConditions,
      publishImmediately,
    });
    resetForm();
  };

  const startEdit = (offerId: string) => {
    const o = db.offers.find((item) => item.id === offerId);
    if (!o) return;
    setEditingId(o.id);
    setGroupId(o.groupId);
    setDealerId(o.dealerId);
    setExShowroomPrice(o.exShowroomPrice);
    setRtoCharges(o.rtoCharges);
    setInsuranceAmount(o.insuranceAmount);
    setAccessoriesCost(o.accessoriesCost);
    setGroupDiscount(o.groupDiscount);
    setAdditionalCharges(o.additionalCharges);
    setValidUntil(o.validUntil.slice(0, 10));
    setTermsAndConditions(o.termsAndConditions);
  };

  const filteredOffers = useMemo(() => {
    return db.offers.filter((o) => statusFilter === 'all' || o.status === statusFilter);
  }, [db.offers, statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#17191D] font-display">
          Dealer Offer Management
        </h1>
        <p className="text-sm text-[#5A5F6B] mt-1">
          Upload, edit, and publish clearly labelled sample dealership quotations for buying groups.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-5 bg-white border border-[#E4E4E0] rounded-xl p-6 space-y-3.5 self-start"
        >
          <h2 className="text-base font-bold text-[#17191D] font-display">
            {editingId ? 'Edit Quotation' : 'Upload Dealership Quotation'}
          </h2>

          <div>
            <label className="block text-xs font-semibold mb-1">Buying Group *</label>
            <select
              value={groupId}
              onChange={(e) => handleGroupChange(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
            >
              {db.groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.code} — {g.title} ({g.members.length}/{g.targetBuyers})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Authorized Dealership *</label>
            <select
              value={dealerId}
              onChange={(e) => setDealerId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
            >
              {db.dealers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.city})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Ex-Showroom (₹)</label>
              <input
                type="number"
                required
                min={0}
                value={exShowroomPrice}
                onChange={(e) => setExShowroomPrice(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">RTO Charges (₹)</label>
              <input
                type="number"
                required
                min={0}
                value={rtoCharges}
                onChange={(e) => setRtoCharges(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Insurance (₹)</label>
              <input
                type="number"
                required
                min={0}
                value={insuranceAmount}
                onChange={(e) => setInsuranceAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Accessories (₹)</label>
              <input
                type="number"
                required
                min={0}
                value={accessoriesCost}
                onChange={(e) => setAccessoriesCost(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-[#176B50]">
                Group Discount (₹)
              </label>
              <input
                type="number"
                required
                min={0}
                value={groupDiscount}
                onChange={(e) => setGroupDiscount(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-[#EBF3F0]/50 border border-[#BFE0D4] rounded-lg tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Additional Charges (₹)</label>
              <input
                type="number"
                required
                min={0}
                value={additionalCharges}
                onChange={(e) => setAdditionalCharges(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg tabular-nums"
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#F8F8F6] border border-[#E4E4E0] flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5A5F6B]">
              Calculated Final On-Road Price
            </span>
            <span className="text-base font-extrabold text-[#17191D] tabular-nums">
              {formatINR(liveFinalOnRoad)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Offer Valid Until *</label>
            <input
              type="date"
              required
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Terms & Conditions *</label>
            <textarea
              rows={3}
              required
              value={termsAndConditions}
              onChange={(e) => setTermsAndConditions(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
            />
          </div>

          {!editingId && (
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={publishImmediately}
                onChange={(e) => setPublishImmediately(e.target.checked)}
                className="rounded border-[#D8D8D2] text-[#176B50]"
              />
              <span>Publish immediately & notify group buyers</span>
            </label>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#176B50] rounded-lg hover:bg-[#125640]"
            >
              <Plus className="w-4 h-4" />
              <span>{editingId ? 'Save Changes' : 'Save Quotation'}</span>
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-2 text-xs border border-[#D8D8D2] rounded-lg"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {['all', 'Published', 'Draft', 'Expired'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${
                  statusFilter === st
                    ? 'bg-[#176B50] text-white border-[#176B50]'
                    : 'bg-white text-[#4A4F59] border-[#E4E4E0]'
                }`}
              >
                {st === 'all' ? 'All Quotations' : st}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredOffers.map((offer) => {
              const dealer = db.dealers.find((d) => d.id === offer.dealerId);
              const group = db.groups.find((g) => g.id === offer.groupId);
              return (
                <article
                  key={offer.id}
                  className="bg-white border border-[#E4E4E0] rounded-xl p-5 space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-mono text-[#6F7480]">
                        Sample Quotation · {group?.code}
                      </p>
                      <h3 className="text-base font-bold text-[#17191D] font-display">
                        {dealer?.name} — {group?.title}
                      </h3>
                    </div>
                    <StatusBadge status={offer.status} />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-[#ECECE8] text-xs">
                    <div>
                      <span className="text-[#6F7480]">Ex-Showroom</span>
                      <p className="font-semibold tabular-nums">
                        {formatINR(offer.exShowroomPrice)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#6F7480]">Discount</span>
                      <p className="font-semibold text-[#176B50] tabular-nums">
                        -{formatINR(offer.groupDiscount)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#6F7480]">Final On-Road</span>
                      <p className="font-bold text-[#17191D] tabular-nums">
                        {formatINR(offer.finalOnRoadPrice)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#6F7480]">Valid Until</span>
                      <p className="font-medium tabular-nums">{formatDate(offer.validUntil)}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {offer.status === 'Draft' && (
                      <button
                        type="button"
                        onClick={() => publishOffer(offer.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#176B50] rounded-md hover:bg-[#125640]"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Publish Offer</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => startEdit(offer.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs border border-[#D8D8D2] rounded-md hover:bg-[#F4F4F0]"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTargetId(offer.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-700 border border-red-200 rounded-md hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTargetId)}
        title="Delete Quotation?"
        description="Are you sure you want to delete this dealership quotation?"
        confirmLabel="Delete Quotation"
        destructive
        onConfirm={() => {
          if (deleteTargetId) deleteOffer(deleteTargetId);
          setDeleteTargetId(null);
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
