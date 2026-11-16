import React, { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { FuelType, TransmissionType } from '../../types';
import { formatINR } from '../../utils/formatters';
import { ConfirmDialog } from '../../components/ConfirmDialog';

export const AdminModelsPage: React.FC = () => {
  const {
    db,
    addModel,
    updateModel,
    deleteModel,
    addVariant,
    updateVariant,
    deleteVariant,
  } = useApp();

  const [selectedModelId, setSelectedModelId] = useState(db.models[0]?.id || '');

  // Model Form State
  const [editingModelId, setEditingModelId] = useState<string | null>(null);
  const [mBrandId, setMBrandId] = useState(db.brands[0]?.id || '');
  const [mName, setMName] = useState('');
  const [mBodyType, setMBodyType] = useState('Compact SUV');
  const [mSeating, setMSeating] = useState(5);
  const [mImageKey, setMImageKey] = useState('creta');
  const [mColors, setMColors] = useState('Pearl White, Silver, Grey');
  const [mDesc, setMDesc] = useState('');

  // Variant Form State
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [vName, setVName] = useState('');
  const [vFuel, setVFuel] = useState<FuelType>('Petrol');
  const [vTrans, setVTrans] = useState<TransmissionType>('Manual');
  const [vPrice, setVPrice] = useState(1200000);
  const [vEngine, setVEngine] = useState('1497 cc Petrol · 115 PS');
  const [vMileage, setVMileage] = useState('17.5 km/l');
  const [vFeatures, setVFeatures] = useState('6 Airbags, Touchscreen, Rear AC');

  const [deleteTarget, setDeleteTarget] = useState<
    { kind: 'model'; id: string } | { kind: 'variant'; modelId: string; id: string } | null
  >(null);

  const selectedModel = db.models.find((m) => m.id === selectedModelId) || db.models[0];

  const resetModelForm = () => {
    setEditingModelId(null);
    setMName('');
    setMDesc('');
  };

  const handleModelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mName.trim()) return;
    const payload = {
      brandId: mBrandId,
      name: mName.trim(),
      bodyType: mBodyType.trim(),
      seatingCapacity: Number(mSeating) || 5,
      imageKey: mImageKey,
      description: mDesc.trim() || `${mName.trim()} passenger vehicle.`,
      popularColors: mColors
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
      isFeatured: true,
    };
    if (editingModelId) {
      updateModel(editingModelId, payload);
    } else {
      addModel(payload);
    }
    resetModelForm();
  };

  const startEditModel = (id: string) => {
    const m = db.models.find((item) => item.id === id);
    if (!m) return;
    setEditingModelId(m.id);
    setMBrandId(m.brandId);
    setMName(m.name);
    setMBodyType(m.bodyType);
    setMSeating(m.seatingCapacity);
    setMImageKey(m.imageKey);
    setMColors(m.popularColors.join(', '));
    setMDesc(m.description);
  };

  const resetVariantForm = () => {
    setEditingVariantId(null);
    setVName('');
    setVPrice(1200000);
  };

  const handleVariantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModel || !vName.trim()) return;
    const payload = {
      name: vName.trim(),
      fuelType: vFuel,
      transmission: vTrans,
      exShowroomPrice: Number(vPrice),
      engineSpec: vEngine.trim(),
      mileage: vMileage.trim(),
      keyFeatures: vFeatures
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean),
    };
    if (editingVariantId) {
      updateVariant(selectedModel.id, editingVariantId, payload);
    } else {
      addVariant(selectedModel.id, payload);
    }
    resetVariantForm();
  };

  const startEditVariant = (variantId: string) => {
    const v = selectedModel?.variants.find((item) => item.id === variantId);
    if (!v) return;
    setEditingVariantId(v.id);
    setVName(v.name);
    setVFuel(v.fuelType);
    setVTrans(v.transmission);
    setVPrice(v.exShowroomPrice);
    setVEngine(v.engineSpec);
    setVMileage(v.mileage);
    setVFeatures(v.keyFeatures.join(', '));
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.kind === 'model') {
      deleteModel(deleteTarget.id);
    } else {
      deleteVariant(deleteTarget.modelId, deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[#17191D] font-display">
          Car Model & Variant Management
        </h1>
        <p className="text-sm text-[#5A5F6B] mt-1">
          Configure models, trims, fuel types, transmissions, and ex-showroom pricing.
        </p>
      </div>

      {/* Models CRUD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form
          onSubmit={handleModelSubmit}
          className="lg:col-span-4 bg-white border border-[#E4E4E0] rounded-xl p-5 space-y-3 self-start"
        >
          <h2 className="text-base font-bold text-[#17191D] font-display">
            {editingModelId ? 'Edit Model' : 'Add New Car Model'}
          </h2>
          <div>
            <label className="block text-xs font-semibold mb-1">Brand</label>
            <select
              value={mBrandId}
              onChange={(e) => setMBrandId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
            >
              {db.brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Model Name *</label>
            <input
              type="text"
              required
              value={mName}
              onChange={(e) => setMName(e.target.value)}
              placeholder="e.g., Honda Elevate"
              className="w-full px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Body Type</label>
              <input
                type="text"
                value={mBodyType}
                onChange={(e) => setMBodyType(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Seats</label>
              <input
                type="number"
                min={2}
                max={9}
                value={mSeating}
                onChange={(e) => setMSeating(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Image Preset</label>
            <select
              value={mImageKey}
              onChange={(e) => setMImageKey(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
            >
              <option value="creta">Hyundai Creta (Atlas White)</option>
              <option value="nexon">Tata Nexon (Daytona Grey)</option>
              <option value="seltos">Kia Seltos (Pewter Olive)</option>
              <option value="scorpion">Mahindra Scorpio-N (Napoli Black)</option>
              <option value="brezza">Maruti Suzuki Brezza (Splendid Silver)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Colours (comma separated)</label>
            <input
              type="text"
              value={mColors}
              onChange={(e) => setMColors(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Summary</label>
            <textarea
              rows={2}
              value={mDesc}
              onChange={(e) => setMDesc(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#176B50] rounded-lg hover:bg-[#125640]"
            >
              <Plus className="w-4 h-4" />
              <span>{editingModelId ? 'Save Model' : 'Add Model'}</span>
            </button>
            {editingModelId && (
              <button
                type="button"
                onClick={resetModelForm}
                className="px-3 py-2 text-xs border border-[#D8D8D2] rounded-lg"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="lg:col-span-8 bg-white border border-[#E4E4E0] rounded-xl p-5">
          <h2 className="text-base font-bold text-[#17191D] font-display mb-3">
            Catalog Models ({db.models.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E4E4E0] text-xs text-[#6F7480]">
                  <th className="py-2.5 pr-4 font-semibold">Model</th>
                  <th className="py-2.5 pr-4 font-semibold">Body Style</th>
                  <th className="py-2.5 pr-4 font-semibold">Variants</th>
                  <th className="py-2.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECECE8]">
                {db.models.map((m) => {
                  const brand = db.brands.find((b) => b.id === m.brandId);
                  const active = selectedModel?.id === m.id;
                  return (
                    <tr
                      key={m.id}
                      className={active ? 'bg-[#EBF3F0]/40' : 'hover:bg-[#F8F8F6]/70'}
                    >
                      <td className="py-3 pr-4">
                        <button
                          type="button"
                          onClick={() => setSelectedModelId(m.id)}
                          className="text-left font-semibold text-[#17191D] hover:text-[#176B50]"
                        >
                          {m.name}
                        </button>
                        <p className="text-xs text-[#5A5F6B]">{brand?.name}</p>
                      </td>
                      <td className="py-3 pr-4 text-xs text-[#5A5F6B]">
                        {m.bodyType} · {m.seatingCapacity}-Str
                      </td>
                      <td className="py-3 pr-4 text-xs font-semibold tabular-nums">
                        {m.variants.length} trims
                      </td>
                      <td className="py-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedModelId(m.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-[#176B50] bg-[#EBF3F0] rounded"
                        >
                          Trims
                        </button>
                        <button
                          type="button"
                          onClick={() => startEditModel(m.id)}
                          className="px-2.5 py-1 text-xs border border-[#D8D8D2] rounded"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget({ kind: 'model', id: m.id })}
                          className="px-2.5 py-1 text-xs text-red-700 border border-red-200 rounded"
                        >
                          Delete
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

      {/* Selected Model Variants CRUD */}
      {selectedModel && (
        <section className="bg-white border border-[#E4E4E0] rounded-xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#ECECE8]">
            <div>
              <p className="text-xs font-semibold text-[#176B50]">Managing Variants For</p>
              <h2 className="text-xl font-bold text-[#17191D] font-display">
                {selectedModel.name}
              </h2>
            </div>
          </div>

          <form
            onSubmit={handleVariantSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#F8F8F6] border border-[#E4E4E0] rounded-lg p-4"
          >
            <input
              type="text"
              required
              value={vName}
              onChange={(e) => setVName(e.target.value)}
              placeholder="Variant Name (e.g., VX CVT)"
              className="px-3 py-2 text-sm bg-white border border-[#D8D8D2] rounded-lg"
            />
            <select
              value={vFuel}
              onChange={(e) => setVFuel(e.target.value as FuelType)}
              className="px-3 py-2 text-sm bg-white border border-[#D8D8D2] rounded-lg"
            >
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="CNG">CNG</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
            </select>
            <select
              value={vTrans}
              onChange={(e) => setVTrans(e.target.value as TransmissionType)}
              className="px-3 py-2 text-sm bg-white border border-[#D8D8D2] rounded-lg"
            >
              <option value="Manual">Manual</option>
              <option value="Automatic">Automatic</option>
              <option value="IVT">IVT</option>
              <option value="DCT">DCT</option>
              <option value="AMT">AMT</option>
            </select>
            <input
              type="number"
              required
              min={300000}
              value={vPrice}
              onChange={(e) => setVPrice(Number(e.target.value))}
              placeholder="Ex-showroom INR"
              className="px-3 py-2 text-sm bg-white border border-[#D8D8D2] rounded-lg tabular-nums"
            />
            <input
              type="text"
              value={vEngine}
              onChange={(e) => setVEngine(e.target.value)}
              placeholder="Engine spec"
              className="px-3 py-2 text-sm bg-white border border-[#D8D8D2] rounded-lg"
            />
            <input
              type="text"
              value={vMileage}
              onChange={(e) => setVMileage(e.target.value)}
              placeholder="Mileage"
              className="px-3 py-2 text-sm bg-white border border-[#D8D8D2] rounded-lg"
            />
            <input
              type="text"
              value={vFeatures}
              onChange={(e) => setVFeatures(e.target.value)}
              placeholder="Features (comma separated)"
              className="px-3 py-2 text-sm bg-white border border-[#D8D8D2] rounded-lg"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-xs font-semibold text-white bg-[#176B50] rounded-lg hover:bg-[#125640]"
              >
                {editingVariantId ? 'Save Variant' : 'Add Variant'}
              </button>
              {editingVariantId && (
                <button
                  type="button"
                  onClick={resetVariantForm}
                  className="px-3 py-2 text-xs bg-white border border-[#D8D8D2] rounded-lg"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E4E4E0] text-xs text-[#6F7480]">
                  <th className="py-2.5 pr-4 font-semibold">Variant</th>
                  <th className="py-2.5 pr-4 font-semibold">Fuel / Trans</th>
                  <th className="py-2.5 pr-4 font-semibold">Engine</th>
                  <th className="py-2.5 pr-4 font-semibold text-right">Ex-Showroom</th>
                  <th className="py-2.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECECE8]">
                {selectedModel.variants.map((v) => (
                  <tr key={v.id}>
                    <td className="py-3 pr-4 font-semibold text-[#17191D]">{v.name}</td>
                    <td className="py-3 pr-4 text-xs text-[#5A5F6B]">
                      {v.fuelType} · {v.transmission}
                    </td>
                    <td className="py-3 pr-4 text-xs text-[#5A5F6B]">
                      {v.engineSpec} ({v.mileage})
                    </td>
                    <td className="py-3 pr-4 text-right font-bold tabular-nums">
                      {formatINR(v.exShowroomPrice)}
                    </td>
                    <td className="py-3 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => startEditVariant(v.id)}
                        aria-label={`Edit ${v.name}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs border border-[#D8D8D2] rounded"
                      >
                        <Pencil className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget({
                            kind: 'variant',
                            modelId: selectedModel.id,
                            id: v.id,
                          })
                        }
                        aria-label={`Delete ${v.name}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-red-700 border border-red-200 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Confirm Deletion"
        description="Are you sure you want to remove this catalog entry? Existing groups referencing it may display fallback labels."
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
