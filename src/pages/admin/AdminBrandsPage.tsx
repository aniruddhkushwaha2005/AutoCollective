import React, { useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { StatusBadge } from '../../components/StatusBadge';
import { ConfirmDialog } from '../../components/ConfirmDialog';

export const AdminBrandsPage: React.FC = () => {
  const { db, addBrand, updateBrand, deleteBrand } = useApp();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [country, setCountry] = useState('India');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCountry('India');
    setDescription('');
    setIsActive(true);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Brand name is required.');
      return;
    }
    if (editingId) {
      updateBrand(editingId, { name: name.trim(), country: country.trim(), description, isActive });
    } else {
      addBrand({ name: name.trim(), country: country.trim(), description, isActive });
    }
    resetForm();
  };

  const startEdit = (id: string) => {
    const b = db.brands.find((item) => item.id === id);
    if (!b) return;
    setEditingId(b.id);
    setName(b.name);
    setCountry(b.country);
    setDescription(b.description);
    setIsActive(b.isActive);
  };

  const handleDelete = () => {
    if (!deleteTargetId) return;
    const res = deleteBrand(deleteTargetId);
    if (!res.ok && res.error) setError(res.error);
    setDeleteTargetId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#17191D] font-display">
          Car Brand Management
        </h1>
        <p className="text-sm text-[#5A5F6B] mt-1">
          Add, edit, or disable automobile manufacturers supported on AutoCollective.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-4 bg-white border border-[#E4E4E0] rounded-xl p-6 space-y-4 self-start"
        >
          <h2 className="text-base font-bold text-[#17191D] font-display">
            {editingId ? 'Edit Car Brand' : 'Add Car Brand'}
          </h2>

          <div>
            <label htmlFor="brd-name" className="block text-xs font-semibold text-[#17191D] mb-1">
              Brand Name *
            </label>
            <input
              id="brd-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Honda"
              className="w-full px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
            />
          </div>

          <div>
            <label htmlFor="brd-country" className="block text-xs font-semibold text-[#17191D] mb-1">
              Origin / Operations
            </label>
            <input
              id="brd-country"
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
            />
          </div>

          <div>
            <label htmlFor="brd-desc" className="block text-xs font-semibold text-[#17191D] mb-1">
              Description
            </label>
            <textarea
              id="brd-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-[#17191D]">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-[#D8D8D2] text-[#176B50]"
            />
            <span>Active in request form</span>
          </label>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#176B50] rounded-lg hover:bg-[#125640]"
            >
              <Plus className="w-4 h-4" />
              <span>{editingId ? 'Save Changes' : 'Add Brand'}</span>
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-2 text-xs font-medium border border-[#D8D8D2] rounded-lg"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="lg:col-span-8 bg-white border border-[#E4E4E0] rounded-xl p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E4E4E0] text-xs text-[#6F7480]">
                  <th className="py-2.5 pr-4 font-semibold">Brand</th>
                  <th className="py-2.5 pr-4 font-semibold">Models</th>
                  <th className="py-2.5 pr-4 font-semibold">Status</th>
                  <th className="py-2.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECECE8]">
                {db.brands.map((brand) => {
                  const modelCount = db.models.filter((m) => m.brandId === brand.id).length;
                  return (
                    <tr key={brand.id} className="hover:bg-[#F8F8F6]/70">
                      <td className="py-3.5 pr-4">
                        <p className="font-semibold text-[#17191D]">{brand.name}</p>
                        <p className="text-xs text-[#5A5F6B]">{brand.country}</p>
                      </td>
                      <td className="py-3.5 pr-4 text-xs tabular-nums">
                        {modelCount} {modelCount === 1 ? 'model' : 'models'}
                      </td>
                      <td className="py-3.5 pr-4">
                        <StatusBadge status={brand.isActive ? 'Active' : 'Inactive'} />
                      </td>
                      <td className="py-3.5 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => startEdit(brand.id)}
                          aria-label={`Edit ${brand.name}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border border-[#D8D8D2] rounded-md hover:bg-[#F4F4F0]"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTargetId(brand.id)}
                          aria-label={`Delete ${brand.name}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-700 border border-red-200 rounded-md hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTargetId)}
        title="Delete Car Brand?"
        description="Deleting a brand is permanent. Brands with linked car models cannot be deleted until their models are removed."
        confirmLabel="Delete Brand"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
