import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Shield,
  Users,
  Calendar,
  MapPin,
  FileText,
  ArrowLeft,
  Scale,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import {
  daysRemaining,
  formatDate,
  formatINR,
  maskMemberName,
} from '../utils/formatters';
import { CarImageFrame } from './CarImageFrame';
import { StatusBadge } from './StatusBadge';
import { ConfirmDialog } from './ConfirmDialog';

interface GroupDetailCoreProps {
  groupId: string;
  backPath: string;
  backLabel: string;
}

const STAGES = [
  'Collecting Buyers',
  'Ready for Negotiation',
  'Negotiating',
  'Offer Received',
  'Deal Completed',
] as const;

export const GroupDetailCore: React.FC<GroupDetailCoreProps> = ({
  groupId,
  backPath,
  backLabel,
}) => {
  const { db, currentUser, joinGroup, leaveGroup, confirmPurchaseIntention } = useApp();
  const navigate = useNavigate();

  const group = db.groups.find((g) => g.id === groupId);
  const model = db.models.find((m) => m.id === group?.modelId);
  const brand = db.brands.find((b) => b.id === group?.brandId);
  const variant = model?.variants.find((v) => v.id === group?.variantId);

  const [selectedColor, setSelectedColor] = useState(
    model?.popularColors[0] || 'Atlas White'
  );
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [confirmOfferId, setConfirmOfferId] = useState<string | null>(null);

  if (!group) {
    return (
      <div className="bg-white border border-[#E4E4E0] rounded-xl p-8 text-center">
        <h2 className="text-xl font-bold text-[#17191D] font-display">Buying Group Not Found</h2>
        <p className="text-sm text-[#5A5F6B] mt-2">
          This group may have been removed or the link is invalid.
        </p>
        <Link
          to={backPath}
          className="inline-flex items-center gap-2 mt-5 px-4 py-2 text-sm font-semibold text-white bg-[#176B50] rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{backLabel}</span>
        </Link>
      </div>
    );
  }

  const isMember = Boolean(currentUser && group.members.some((m) => m.userId === currentUser.id));
  const isFull = group.members.length >= group.targetBuyers;
  const isExpired = group.status === 'Expired' || daysRemaining(group.expiresAt) === 0;
  const pct = Math.min(100, Math.round((group.members.length / group.targetBuyers) * 100));

  const publishedOffers = db.offers
    .filter((o) => o.groupId === group.id && o.status === 'Published')
    .sort((a, b) => a.finalOnRoadPrice - b.finalOnRoadPrice);

  const userPurchase = currentUser
    ? db.purchases.find(
        (p) => p.groupId === group.id && p.userId === currentUser.id && p.status !== 'Cancelled'
      )
    : undefined;

  const currentStageIndex = STAGES.indexOf(
    group.status as (typeof STAGES)[number]
  );

  const handleJoin = () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!currentUser) {
      navigate('/login', { state: { from: `/groups/${group.id}` } });
      return;
    }
    const res = joinGroup(group.id, selectedColor);
    if (!res.ok) {
      setErrorMsg(res.error || 'Could not join group.');
    } else {
      setSuccessMsg(
        `You joined group ${group.code}. Current buyer count: ${res.data?.members.length}/${group.targetBuyers}.`
      );
    }
  };

  const handleLeaveConfirmed = () => {
    setLeaveConfirmOpen(false);
    setErrorMsg('');
    setSuccessMsg('');
    const res = leaveGroup(group.id);
    if (!res.ok) {
      setErrorMsg(res.error || 'Unable to leave group.');
    } else {
      setSuccessMsg(`You have left group ${group.code}.`);
    }
  };

  const handleConfirmPurchase = () => {
    if (!confirmOfferId) return;
    const res = confirmPurchaseIntention(confirmOfferId);
    setConfirmOfferId(null);
    if (!res.ok) {
      setErrorMsg(res.error || 'Unable to confirm purchase intention.');
    } else {
      setSuccessMsg(
        `Purchase intention confirmed (${res.data?.dealerReferenceCode}). View progress in Purchase Tracking.`
      );
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <Link
          to={backPath}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5A5F6B] hover:text-[#17191D]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{backLabel}</span>
        </Link>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-sm text-red-800">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-lg border border-[#BFE0D4] bg-[#EBF3F0] text-sm text-[#176B50]">
          {successMsg}
        </div>
      )}

      {/* Overview Split */}
      <div className="bg-white border border-[#E4E4E0] rounded-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-6 bg-[#EFECE6]">
          <CarImageFrame
            imageKey={model?.imageKey || 'creta'}
            alt={group.title}
            className="w-full h-72 lg:h-full min-h-[280px]"
          />
        </div>

        <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono text-[#6F7480] tabular-nums">
                {group.code} · {brand?.name}
              </span>
              <StatusBadge status={group.status} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17191D] font-display mt-3 leading-tight">
              {model?.name} — {variant?.name}
            </h1>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#5A5F6B] mt-3">
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-4 h-4 text-[#176B50]" />
                {group.city}
              </span>
              <span aria-hidden="true">·</span>
              <span>{group.fuelType}</span>
              <span aria-hidden="true">·</span>
              <span>{group.transmission}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-4 h-4 text-[#176B50]" />
                {group.timeline}
              </span>
            </div>

            {variant && (
              <div className="mt-5 grid grid-cols-2 gap-4 py-4 border-y border-[#ECECE8]">
                <div>
                  <p className="text-xs text-[#6F7480]">Ex-Showroom Price</p>
                  <p className="text-lg font-bold text-[#17191D] tabular-nums mt-0.5">
                    {formatINR(variant.exShowroomPrice)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6F7480]">Engine & Efficiency</p>
                  <p className="text-sm font-semibold text-[#17191D] mt-0.5">
                    {variant.engineSpec}
                  </p>
                  <p className="text-xs text-[#5A5F6B]">{variant.mileage}</p>
                </div>
              </div>
            )}

            {/* Dynamic Progress */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-semibold text-[#17191D] tabular-nums inline-flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#176B50]" />
                  {group.members.length} of {group.targetBuyers} buyers joined
                </span>
                <span className="text-xs text-[#5A5F6B] tabular-nums">
                  {pct}% complete · Expires {formatDate(group.expiresAt)}
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#EFECE6] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#176B50] rounded-full transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Join / Leave Action Bar */}
          <div className="mt-6 pt-5 border-t border-[#ECECE8]">
            {isMember ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm font-medium text-[#176B50] inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>You are a verified member of this group</span>
                </div>
                {!userPurchase && group.status !== 'Deal Completed' && (
                  <button
                    type="button"
                    onClick={() => setLeaveConfirmOpen(true)}
                    className="px-4 py-2 text-xs font-semibold text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Leave Group
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {model && model.popularColors.length > 0 && (
                  <select
                    aria-label="Preferred colour"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="px-3 py-2.5 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg text-[#17191D]"
                  >
                    {model.popularColors.map((c) => (
                      <option key={c} value={c}>
                        Colour: {c}
                      </option>
                    ))}
                  </select>
                )}

                <button
                  type="button"
                  disabled={isFull || isExpired || group.status === 'Deal Completed'}
                  onClick={handleJoin}
                  className="flex-1 px-5 py-2.5 text-sm font-semibold text-white bg-[#176B50] rounded-lg hover:bg-[#125640] disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  {!currentUser
                    ? 'Sign In to Join Group'
                    : isExpired
                    ? 'Group Expired'
                    : isFull
                    ? 'Group Capacity Reached'
                    : 'Join Buying Group'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Negotiation Progress Tracker */}
      <section className="bg-white border border-[#E4E4E0] rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <h2 className="text-lg font-bold text-[#17191D] font-display">
              Collective Negotiation Progress
            </h2>
            <p className="text-sm text-[#5A5F6B] mt-0.5">{group.negotiationNotes}</p>
          </div>
          <span className="text-xs text-[#6F7480] tabular-nums shrink-0">
            Created {formatDate(group.createdAt)}
          </span>
        </div>

        {group.status === 'Expired' ? (
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-900">
            This group reached its expiry date ({formatDate(group.expiresAt)}) before completing a
            deal. You can start a new car request to form an updated group.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {STAGES.map((stage, idx) => {
              const reached = currentStageIndex >= idx;
              return (
                <div
                  key={stage}
                  className={`p-3 rounded-lg border text-xs ${
                    reached
                      ? 'bg-[#EBF3F0] border-[#BFE0D4] text-[#176B50] font-semibold'
                      : 'bg-[#F8F8F6] border-[#E4E4E0] text-[#6F7480]'
                  }`}
                >
                  <p className="font-mono text-[11px] mb-1">0{idx + 1}</p>
                  <p>{stage}</p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Variant Highlights + Privacy-Protected Member List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-5 bg-white border border-[#E4E4E0] rounded-xl p-6">
          <h2 className="text-lg font-bold text-[#17191D] font-display mb-4">
            Variant Specifications
          </h2>
          {variant ? (
            <div className="space-y-4">
              <div className="text-sm text-[#5A5F6B] space-y-2">
                <div className="flex justify-between py-2 border-b border-[#ECECE8]">
                  <span>Body Style</span>
                  <span className="font-medium text-[#17191D]">
                    {model?.bodyType} ({model?.seatingCapacity}-Seater)
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#ECECE8]">
                  <span>Powertrain</span>
                  <span className="font-medium text-[#17191D]">{variant.engineSpec}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#ECECE8]">
                  <span>Transmission</span>
                  <span className="font-medium text-[#17191D]">{variant.transmission}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#ECECE8]">
                  <span>Claimed Efficiency</span>
                  <span className="font-medium text-[#17191D]">{variant.mileage}</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#6F7480] mb-2">Key Equipment</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#17191D]">
                  {variant.keyFeatures.map((feat) => (
                    <li
                      key={feat}
                      className="px-3 py-2 rounded-lg bg-[#F8F8F6] border border-[#ECECE8]"
                    >
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#5A5F6B]">Variant details unavailable.</p>
          )}
        </section>

        <section className="lg:col-span-7 bg-white border border-[#E4E4E0] rounded-xl p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#17191D] font-display">
                Verified Group Members ({group.members.length}/{group.targetBuyers})
              </h2>
              <p className="text-xs text-[#5A5F6B] mt-1 inline-flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#176B50]" />
                Names and contact details are masked to protect buyer privacy until dealership
                booking.
              </p>
            </div>
          </div>

          {group.members.length === 0 ? (
            <p className="text-sm text-[#5A5F6B] py-6 text-center bg-[#F8F8F6] rounded-lg">
              No members have joined yet. Be the first buyer in {group.city}.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E4E4E0] text-xs text-[#6F7480]">
                    <th className="py-2.5 pr-4 font-semibold">#</th>
                    <th className="py-2.5 pr-4 font-semibold">Buyer</th>
                    <th className="py-2.5 pr-4 font-semibold">City</th>
                    <th className="py-2.5 pr-4 font-semibold">Preferred Colour</th>
                    <th className="py-2.5 font-semibold text-right">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECECE8]">
                  {group.members.map((member, index) => {
                    const userObj = db.users.find((u) => u.id === member.userId);
                    const isSelf = currentUser?.id === member.userId;
                    return (
                      <tr key={member.userId} className="hover:bg-[#F8F8F6]/60">
                        <td className="py-3 pr-4 text-xs font-mono text-[#6F7480] tabular-nums">
                          0{index + 1}
                        </td>
                        <td className="py-3 pr-4 font-medium text-[#17191D]">
                          {isSelf
                            ? `${userObj?.name || 'You'} (You)`
                            : maskMemberName(userObj?.name || 'Verified Buyer')}
                        </td>
                        <td className="py-3 pr-4 text-[#5A5F6B]">{member.city}</td>
                        <td className="py-3 pr-4 text-[#5A5F6B]">{member.preferredColor}</td>
                        <td className="py-3 text-right text-xs text-[#6F7480] tabular-nums">
                          {formatDate(member.joinedAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Published Dealer Offers */}
      <section className="bg-white border border-[#E4E4E0] rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg font-bold text-[#17191D] font-display">
              Dealership Quotations ({publishedOffers.length})
            </h2>
            <p className="text-xs text-[#5A5F6B] mt-1">
              Clearly labelled sample/demonstration quotations. Final pricing and delivery depend on
              direct dealership verification.
            </p>
          </div>
          {publishedOffers.length > 1 && (
            <Link
              to={`/dashboard/compare?groupId=${group.id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#176B50] bg-[#EBF3F0] rounded-lg hover:bg-[#DCEBE5] transition-colors whitespace-nowrap shrink-0"
            >
              <Scale className="w-4 h-4" />
              <span>Compare Side-by-Side</span>
            </Link>
          )}
        </div>

        {publishedOffers.length === 0 ? (
          <div className="p-6 rounded-lg bg-[#F8F8F6] border border-[#ECECE8] text-center">
            <FileText className="w-6 h-6 text-[#6F7480] mx-auto mb-2" />
            <p className="text-sm font-medium text-[#17191D]">No quotations published yet</p>
            <p className="text-xs text-[#5A5F6B] mt-1 max-w-md mx-auto">
              Once this group reaches {group.targetBuyers} verified buyers, AutoCollective invites
              authorized dealerships in {group.city} to submit transparent quotations.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {publishedOffers.map((offer, idx) => {
              const dealer = db.dealers.find((d) => d.id === offer.dealerId);
              const isConfirmedThis = userPurchase?.offerId === offer.id;
              return (
                <div
                  key={offer.id}
                  className="border border-[#E4E4E0] rounded-xl p-5 flex flex-col justify-between bg-[#F8F8F6]/50"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-[#176B50] font-semibold">
                          Sample Demonstration Quotation {idx === 0 ? '· Lowest Quote' : ''}
                        </p>
                        <h3 className="text-base font-bold text-[#17191D] font-display mt-0.5">
                          {dealer?.name || 'Authorized Dealership'}
                        </h3>
                        <p className="text-xs text-[#5A5F6B]">{dealer?.address}</p>
                      </div>
                      <StatusBadge status={offer.status} />
                    </div>

                    <div className="mt-4 space-y-2 text-xs border-t border-[#E4E4E0] pt-3">
                      <div className="flex justify-between">
                        <span className="text-[#5A5F6B]">Ex-Showroom Price</span>
                        <span className="font-medium text-[#17191D] tabular-nums">
                          {formatINR(offer.exShowroomPrice)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5A5F6B]">RTO & Registration</span>
                        <span className="font-medium text-[#17191D] tabular-nums">
                          {formatINR(offer.rtoCharges)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5A5F6B]">Insurance</span>
                        <span className="font-medium text-[#17191D] tabular-nums">
                          {formatINR(offer.insuranceAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5A5F6B]">Accessories Package</span>
                        <span className="font-medium text-[#17191D] tabular-nums">
                          {formatINR(offer.accessoriesCost)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5A5F6B]">Additional / Handling</span>
                        <span className="font-medium text-[#17191D] tabular-nums">
                          {formatINR(offer.additionalCharges)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[#176B50] font-semibold">
                        <span>Collective Group Discount</span>
                        <span className="tabular-nums">- {formatINR(offer.groupDiscount)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-[#D8D8D2] text-sm font-bold text-[#17191D]">
                        <span>Final On-Road Price</span>
                        <span className="tabular-nums">{formatINR(offer.finalOnRoadPrice)}</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#5A5F6B] mt-3 leading-relaxed">
                      <strong className="text-[#17191D]">Valid until {formatDate(offer.validUntil)}:</strong>{' '}
                      {offer.termsAndConditions}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#E4E4E0] flex items-center justify-between gap-3">
                    {isConfirmedThis ? (
                      <Link
                        to="/dashboard/purchases"
                        className="w-full text-center px-4 py-2 text-xs font-semibold text-[#176B50] bg-[#EBF3F0] rounded-lg"
                      >
                        Intention Confirmed ({userPurchase?.status}) — Track Status
                      </Link>
                    ) : userPurchase ? (
                      <span className="text-xs text-[#5A5F6B]">
                        You already confirmed another offer in this group.
                      </span>
                    ) : isMember ? (
                      <button
                        type="button"
                        onClick={() => setConfirmOfferId(offer.id)}
                        className="w-full px-4 py-2.5 text-xs font-semibold text-white bg-[#176B50] rounded-lg hover:bg-[#125640] transition-colors"
                      >
                        Confirm Purchase Intention
                      </button>
                    ) : (
                      <span className="text-xs text-[#5A5F6B]">
                        Join this group to confirm purchase intention on published offers.
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={leaveConfirmOpen}
        title="Leave Buying Group?"
        description={`You will be removed from ${group.code} and the group buyer count will decrease. You can rejoin later if slots remain open.`}
        confirmLabel="Leave Group"
        destructive
        onConfirm={handleLeaveConfirmed}
        onCancel={() => setLeaveConfirmOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(confirmOfferId)}
        title="Confirm Purchase Intention?"
        description="Confirming expresses your non-binding intent to proceed with this authorized dealership quotation. AutoCollective will generate a tracking reference for your showroom visit."
        confirmLabel="Confirm Intention"
        onConfirm={handleConfirmPurchase}
        onCancel={() => setConfirmOfferId(null)}
      />
    </div>
  );
};
