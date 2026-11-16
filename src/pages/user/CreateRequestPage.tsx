import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Search, ArrowRight } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { FuelType, PurchaseTimeline, TransmissionType } from '../../types';
import { formatINR } from '../../utils/formatters';

const TIMELINES: PurchaseTimeline[] = [
  'Immediate (Within 15 Days)',
  'Within 30 Days',
  '1 - 2 Months',
  '2 - 3 Months',
];

export const CreateRequestPage: React.FC = () => {
  const { db, currentUser, createRequest, updateRequest } = useApp();
  const navigate = useNavigate();
  const { requestId } = useParams();
  const [searchParams] = useSearchParams();

  const editingRequest = requestId
    ? db.requests.find((r) => r.id === requestId && r.userId === currentUser?.id)
    : undefined;

  const initialBrandId =
    editingRequest?.brandId ||
    searchParams.get('brandId') ||
    db.brands[0]?.id ||
    '';

  const initialModel =
    db.models.find((m) => m.id === (editingRequest?.modelId || searchParams.get('modelId'))) ||
    db.models.find((m) => m.brandId === initialBrandId) ||
    db.models[0];

  const initialVariant =
    initialModel?.variants.find(
      (v) => v.id === (editingRequest?.variantId || searchParams.get('variantId'))
    ) || initialModel?.variants[0];

  const [carSearch, setCarSearch] = useState('');
  const [applicantName, setApplicantName] = useState(
    editingRequest?.applicantName || currentUser?.name || ''
  );
  const [phone, setPhone] = useState(editingRequest?.phone || currentUser?.phone || '');
  const [email, setEmail] = useState(editingRequest?.email || currentUser?.email || '');
  const [city, setCity] = useState(editingRequest?.city || currentUser?.city || 'Bareilly');

  const [brandId, setBrandId] = useState(initialModel?.brandId || initialBrandId);
  const [modelId, setModelId] = useState(initialModel?.id || '');
  const [variantId, setVariantId] = useState(initialVariant?.id || '');
  const [fuelType, setFuelType] = useState<FuelType>(
    editingRequest?.fuelType || initialVariant?.fuelType || 'Petrol'
  );
  const [transmission, setTransmission] = useState<TransmissionType>(
    editingRequest?.transmission || initialVariant?.transmission || 'Manual'
  );
  const [preferredColor, setPreferredColor] = useState(
    editingRequest?.preferredColor || initialModel?.popularColors[0] || 'Atlas White'
  );
  const [budget, setBudget] = useState<number>(
    editingRequest?.budget ||
      (initialVariant ? Math.round(initialVariant.exShowroomPrice * 1.15) : 1500000)
  );
  const [timeline, setTimeline] = useState<PurchaseTimeline>(
    editingRequest?.timeline || 'Within 30 Days'
  );
  const [notes, setNotes] = useState(editingRequest?.notes || '');
  const [error, setError] = useState('');

  const [confirmation, setConfirmation] = useState<{
    groupId: string;
    groupCode: string;
    groupTitle: string;
    wasAutoCreated: boolean;
    memberCount: number;
    targetBuyers: number;
  } | null>(null);

  const searchableModels = useMemo(() => {
    const q = carSearch.trim().toLowerCase();
    return db.models.filter((m) => {
      const brand = db.brands.find((b) => b.id === m.brandId);
      const matchesBrand = !q ? m.brandId === brandId : true;
      const matchesQ =
        !q ||
        m.name.toLowerCase().includes(q) ||
        (brand?.name.toLowerCase().includes(q) ?? false);
      return matchesBrand && matchesQ;
    });
  }, [db.models, db.brands, brandId, carSearch]);

  const selectedModel = db.models.find((m) => m.id === modelId) || searchableModels[0];
  const selectedVariant =
    selectedModel?.variants.find((v) => v.id === variantId) || selectedModel?.variants[0];

  const handleBrandChange = (nextBrandId: string) => {
    setBrandId(nextBrandId);
    setCarSearch('');
    const nextModel = db.models.find((m) => m.brandId === nextBrandId);
    if (nextModel) {
      setModelId(nextModel.id);
      setPreferredColor(nextModel.popularColors[0] || 'White');
      const v = nextModel.variants[0];
      if (v) {
        setVariantId(v.id);
        setFuelType(v.fuelType);
        setTransmission(v.transmission);
        setBudget(Math.round(v.exShowroomPrice * 1.15));
      }
    }
  };

  const handleModelChange = (nextModelId: string) => {
    const nextModel = db.models.find((m) => m.id === nextModelId);
    if (!nextModel) return;
    setBrandId(nextModel.brandId);
    setModelId(nextModel.id);
    setPreferredColor(nextModel.popularColors[0] || 'White');
    const v = nextModel.variants[0];
    if (v) {
      setVariantId(v.id);
      setFuelType(v.fuelType);
      setTransmission(v.transmission);
      setBudget(Math.round(v.exShowroomPrice * 1.15));
    }
  };

  const handleVariantChange = (nextVariantId: string) => {
    setVariantId(nextVariantId);
    const v = selectedModel?.variants.find((item) => item.id === nextVariantId);
    if (v) {
      setFuelType(v.fuelType);
      setTransmission(v.transmission);
      setBudget(Math.round(v.exShowroomPrice * 1.15));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!applicantName.trim() || !phone.trim() || !email.trim() || !city.trim()) {
      setError('Please fill in your name, contact details, and city.');
      return;
    }
    if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!selectedModel || !selectedVariant) {
      setError('Please select a valid car model and variant.');
      return;
    }
    if (budget < 400000) {
      setError('Please enter a realistic on-road budget in INR.');
      return;
    }

    if (editingRequest) {
      const res = updateRequest(editingRequest.id, {
        applicantName,
        phone: phone.replace(/\D/g, ''),
        email,
        city,
        preferredColor,
        budget,
        timeline,
        notes,
      });
      if (!res.ok) {
        setError(res.error || 'Unable to update request.');
        return;
      }
      navigate('/dashboard/requests');
      return;
    }

    const res = createRequest({
      applicantName,
      phone: phone.replace(/\D/g, ''),
      email,
      city,
      brandId: selectedModel.brandId,
      modelId: selectedModel.id,
      variantId: selectedVariant.id,
      fuelType,
      transmission,
      preferredColor,
      budget,
      timeline,
      notes,
    });

    if (!res.ok || !res.data) {
      setError(res.error || 'Could not submit car request.');
      return;
    }

    setConfirmation({
      groupId: res.data.group.id,
      groupCode: res.data.group.code,
      groupTitle: res.data.group.title,
      wasAutoCreated: res.data.wasAutoCreated,
      memberCount: res.data.group.members.length,
      targetBuyers: res.data.group.targetBuyers,
    });
  };

  if (confirmation) {
    return (
      <div className="max-w-2xl bg-white border border-[#E4E4E0] rounded-xl p-8 space-y-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-7 h-7 text-[#176B50] shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-[#176B50]">Request Confirmed</p>
            <h1 className="text-2xl font-extrabold text-[#17191D] font-display mt-0.5">
              {confirmation.wasAutoCreated
                ? 'New Buying Group Created Automatically'
                : 'Matched to an Active Buying Group'}
            </h1>
            <p className="text-sm text-[#5A5F6B] mt-2 leading-relaxed">
              Your request has been assigned to <strong>{confirmation.groupCode}</strong> (
              {confirmation.groupTitle}). Current cohort progress:{' '}
              <strong className="tabular-nums">
                {confirmation.memberCount} of {confirmation.targetBuyers} buyers
              </strong>
              .
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-[#ECECE8] flex flex-wrap gap-3">
          <Link
            to={`/dashboard/groups/${confirmation.groupId}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#176B50] rounded-lg hover:bg-[#125640]"
          >
            <span>Open Group Details</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/dashboard/requests"
            className="px-4 py-2.5 text-sm font-semibold text-[#17191D] border border-[#D8D8D2] rounded-lg hover:bg-[#F4F4F0]"
          >
            View My Requests
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#17191D] font-display">
          {editingRequest ? 'Edit Car Request' : 'Submit a Car Buying Request'}
        </h1>
        <p className="text-sm text-[#5A5F6B] mt-1">
          {editingRequest
            ? 'Update your preferred colour, budget, or notes.'
            : 'AutoCollective matches you with compatible buyers in your city or opens a new 5-buyer group automatically.'}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-[#E4E4E0] rounded-xl p-6 sm:p-8 space-y-6"
      >
        {/* Contact Details */}
        <div>
          <h2 className="text-sm font-bold text-[#17191D] pb-2 border-b border-[#ECECE8]">
            1. Buyer Contact & City
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label htmlFor="req-name" className="block text-xs font-semibold text-[#17191D] mb-1.5">
                Full Name *
              </label>
              <input
                id="req-name"
                type="text"
                required
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
              />
            </div>

            <div>
              <label htmlFor="req-phone" className="block text-xs font-semibold text-[#17191D] mb-1.5">
                Mobile Number *
              </label>
              <input
                id="req-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
              />
            </div>

            <div>
              <label htmlFor="req-email" className="block text-xs font-semibold text-[#17191D] mb-1.5">
                Email Address *
              </label>
              <input
                id="req-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
              />
            </div>

            <div>
              <label htmlFor="req-city" className="block text-xs font-semibold text-[#17191D] mb-1.5">
                Registration City *
              </label>
              <input
                id="req-city"
                type="text"
                required
                disabled={Boolean(editingRequest)}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., Bareilly"
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg disabled:opacity-60"
              />
            </div>
          </div>
        </div>

        {/* Vehicle Selection */}
        <div>
          <h2 className="text-sm font-bold text-[#17191D] pb-2 border-b border-[#ECECE8]">
            2. Vehicle Specification
          </h2>

          {!editingRequest && (
            <div className="mt-4">
              <label htmlFor="req-search" className="block text-xs font-semibold text-[#17191D] mb-1.5">
                Quick Search Brand or Model
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-[#6F7480] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="req-search"
                  type="text"
                  value={carSearch}
                  onChange={(e) => {
                    const q = e.target.value;
                    setCarSearch(q);
                    const hit = db.models.find((m) =>
                      m.name.toLowerCase().includes(q.trim().toLowerCase())
                    );
                    if (hit && q.trim().length > 1) {
                      handleModelChange(hit.id);
                    }
                  }}
                  placeholder="Type e.g., Creta, Nexon, Seltos, Scorpio..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label htmlFor="req-brand" className="block text-xs font-semibold text-[#17191D] mb-1.5">
                Car Manufacturer *
              </label>
              <select
                id="req-brand"
                disabled={Boolean(editingRequest)}
                value={brandId}
                onChange={(e) => handleBrandChange(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg disabled:opacity-60"
              >
                {db.brands
                  .filter((b) => b.isActive)
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label htmlFor="req-model" className="block text-xs font-semibold text-[#17191D] mb-1.5">
                Car Model *
              </label>
              <select
                id="req-model"
                disabled={Boolean(editingRequest)}
                value={selectedModel?.id || ''}
                onChange={(e) => handleModelChange(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg disabled:opacity-60"
              >
                {searchableModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.bodyType})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="req-variant" className="block text-xs font-semibold text-[#17191D] mb-1.5">
                Variant / Trim *
              </label>
              <select
                id="req-variant"
                disabled={Boolean(editingRequest)}
                value={selectedVariant?.id || ''}
                onChange={(e) => handleVariantChange(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg disabled:opacity-60"
              >
                {selectedModel?.variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} — {v.fuelType} · {v.transmission} · Ex-Showroom{' '}
                    {formatINR(v.exShowroomPrice)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="req-fuel" className="block text-xs font-semibold text-[#17191D] mb-1.5">
                Fuel Type *
              </label>
              <select
                id="req-fuel"
                disabled={Boolean(editingRequest)}
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as FuelType)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg disabled:opacity-60"
              >
                {(['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'] as FuelType[]).map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="req-trans" className="block text-xs font-semibold text-[#17191D] mb-1.5">
                Transmission *
              </label>
              <select
                id="req-trans"
                disabled={Boolean(editingRequest)}
                value={transmission}
                onChange={(e) => setTransmission(e.target.value as TransmissionType)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg disabled:opacity-60"
              >
                {(['Manual', 'Automatic', 'IVT', 'DCT', 'AMT'] as TransmissionType[]).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Preferences & Timeline */}
        <div>
          <h2 className="text-sm font-bold text-[#17191D] pb-2 border-b border-[#ECECE8]">
            3. Colour, Budget & Timeline
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div>
              <label htmlFor="req-color" className="block text-xs font-semibold text-[#17191D] mb-1.5">
                Preferred Colour
              </label>
              <select
                id="req-color"
                value={preferredColor}
                onChange={(e) => setPreferredColor(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
              >
                {(selectedModel?.popularColors || ['White', 'Silver', 'Grey', 'Black']).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="req-budget" className="block text-xs font-semibold text-[#17191D] mb-1.5">
                Target On-Road Budget (INR) *
              </label>
              <input
                id="req-budget"
                type="number"
                required
                min={400000}
                step={5000}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg tabular-nums"
              />
            </div>

            <div>
              <label htmlFor="req-timeline" className="block text-xs font-semibold text-[#17191D] mb-1.5">
                Expected Purchase Timeline *
              </label>
              <select
                id="req-timeline"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value as PurchaseTimeline)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
              >
                {TIMELINES.map((tl) => (
                  <option key={tl} value={tl}>
                    {tl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="req-notes" className="block text-xs font-semibold text-[#17191D] mb-1.5">
              Additional Requirements (Optional)
            </label>
            <textarea
              id="req-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Prefer zero-dep insurance, no mandatory accessories, or exchange evaluation."
              className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
            />
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
          <Link
            to="/dashboard/requests"
            className="px-4 py-2.5 text-sm font-medium text-[#17191D] border border-[#D8D8D2] rounded-lg hover:bg-[#F4F4F0]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-6 py-2.5 text-sm font-semibold text-white bg-[#176B50] rounded-lg hover:bg-[#125640]"
          >
            {editingRequest ? 'Save Request Updates' : 'Submit & Match to Group'}
          </button>
        </div>
      </form>
    </div>
  );
};
