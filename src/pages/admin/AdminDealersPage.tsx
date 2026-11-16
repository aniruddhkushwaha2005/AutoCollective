import React, { useMemo, useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { StatusBadge } from '../../components/StatusBadge';
import { ConfirmDialog } from '../../components/ConfirmDialog';

export const AdminDealersPage: React.FC = () => {
  const { db, addDealer, updateDealer, deleteDealer } = useApp();

  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [city, setCity] = useState('Bareilly');
  const [address, setAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([db.models[0]?.id || '']);
  const [isVerified, setIsVerified] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return db.dealers.filter(
      (d) =>
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.city.toLowerCase().includes(q) ||
        d.contactPerson.toLowerCase().includes(q)
    );
  }, [db.dealers, search]);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCity('Bareilly');
    setAddress('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setSelectedModelIds([db.models[0]?.id || '']);
    setIsVerified(true);
  };

  const toggleModelSelection = (mid: string) => {
    setSelectedModelIds((prev) =>
      prev.includes(mid) ? prev.filter((id) => id !== mid) : [...prev, mid]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !city.trim()) return;
    const brandIds = Array.from(
      new Set(
        db.models
          .filter((m) => selectedModelIds.includes(m.id))
          .map((m) => m.brandId)
      )
    );
    const payload = {
      name: name.trim(),
      city: city.trim(),
      address: address.trim(),
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      email: email.trim(),
      brandIds,
      modelIds: selectedModelIds,
      isVerified,
    };

    if (editingId) {
      updateDealer(editingId, payload);
    } else {
      addDealer(payload);
    }
    resetForm();
  };

  const startEdit = (id: string) => {
    const d = db.dealers.find((item) => item.id === id);
    if (!d) return;
    setEditingId(d.id);
    setName(d.name);
    setCity(d.city);
    setAddress(d.address);
    setContactPerson(d.contactPerson);
    setPhone(d.phone);
    setEmail(d.email);
    setSelectedModelIds(d.modelIds);
    setIsVerified(d.isVerified);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#17191D] font-display">Dealer Management</h1>
        <p className="text-sm text-[#5A5F6B] mt-1">
          Register authorized regional dealerships and associate them with eligible car models.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-5 bg-white border border-[#E4E4E0] rounded-xl p-6 space-y-3.5 self-start"
        >
          <h2 className="text-base font-bold text-[#17191D] font-display">
            {editingId ? 'Edit Dealership' : 'Register New Dealership'}
          </h2>

          <div>
            <label className="block text-xs font-semibold mb-1">Dealership Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Kumaon Hyundai Bareilly"
              className="w-full px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">City *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Contact Person *</label>
              <input
                type="text"
                required
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Phone *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Showroom Address *</label>
            <textarea
              rows={2}
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
            />
          </div>

          <div>
            <p className="text-xs font-semibold mb-1.5">Associated Car Models</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-2 bg-[#F8F8F6] border border-[#E4E4E0] rounded-lg">
              {db.models.map((m) => (
                <label key={m.id} className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedModelIds.includes(m.id)}
                    onChange={() => toggleModelSelection(m.id)}
                    className="rounded border-[#D8D8D2] text-[#176B50]"
                  />
                  <span>{m.name}</span>
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={isVerified}
              onChange={(e) => setIsVerified(e.target.checked)}
              className="rounded border-[#D8D8D2] text-[#176B50]"
            />
            <span>Verified Authorized Dealership</span>
          </label>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#176B50] rounded-lg hover:bg-[#125640]"
            >
              <Plus className="w-4 h-4" />
              <span>{editingId ? 'Save Dealership' : 'Register Dealership'}</span>
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
          <div className="bg-white border border-[#E4E4E0] rounded-xl p-4">
            <div className="relative">
              <Search className="w-4 h-4 text-[#6F7480] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search dealerships by name, city, contact..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filtered.map((dealer) => {
              const models = db.models.filter((m) => dealer.modelIds.includes(m.id));
              return (
                <article
                  key={dealer.id}
                  className="bg-white border border-[#E4E4E0] rounded-xl p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[#17191D] font-display">
                        {dealer.name}
                      </h3>
                      <StatusBadge status={dealer.isVerified ? 'Verified' : 'Inactive'} />
                    </div>
                    <p className="text-xs text-[#5A5F6B]">
                      {dealer.city} · {dealer.address}
                    </p>
                    <p className="text-xs text-[#5A5F6B] tabular-nums">
                      Contact: {dealer.contactPerson} · {dealer.phone} · {dealer.email}
                    </p>
                    <p className="text-xs text-[#176B50] font-medium pt-1">
                      Models: {models.map((m) => m.name).join(', ') || 'None assigned'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(dealer.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs border border-[#D8D8D2] rounded-md hover:bg-[#F4F4F0]"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTargetId(dealer.id)}
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
        title="Delete Dealership?"
        description="Deleting this dealership will also remove any quotations linked to it."
        confirmLabel="Delete Dealership"
        destructive
        onConfirm={() => {
          if (deleteTargetId) deleteDealer(deleteTargetId);
          setDeleteTargetId(null);
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
