import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BuyingGroup } from '../types';
import { useApp } from '../store/AppContext';
import { daysRemaining, formatINRLakhs } from '../utils/formatters';
import { CarImageFrame } from './CarImageFrame';
import { StatusBadge } from './StatusBadge';

interface GroupCardProps {
  group: BuyingGroup;
  detailPath?: string;
}

export const GroupCard: React.FC<GroupCardProps> = ({ group, detailPath }) => {
  const { db } = useApp();
  const model = db.models.find((m) => m.id === group.modelId);
  const variant = model?.variants.find((v) => v.id === group.variantId);
  const memberCount = group.members.length;
  const pct = Math.min(100, Math.round((memberCount / group.targetBuyers) * 100));
  const daysLeft = daysRemaining(group.expiresAt);
  const publishedOffersCount = db.offers.filter(
    (o) => o.groupId === group.id && o.status === 'Published'
  ).length;

  const targetHref = detailPath || `/groups/${group.id}`;

  return (
    <article className="bg-white border border-[#E4E4E0] rounded-xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
      <Link to={targetHref} className="block relative overflow-hidden">
        <CarImageFrame
          imageKey={model?.imageKey || 'creta'}
          alt={`${model?.name || 'Car'} ${variant?.name || ''}`}
          className="w-full h-48"
        />
      </Link>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-mono text-[#6F7480] tabular-nums">{group.code}</p>
          <StatusBadge status={group.status} />
        </div>

        <h3 className="text-base font-bold text-[#17191D] font-display mt-2 leading-snug">
          <Link to={targetHref} className="hover:text-[#176B50] transition-colors">
            {model?.name || 'Vehicle'} · {variant?.name || ''}
          </Link>
        </h3>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#5A5F6B] mt-2">
          <span>{group.city}</span>
          <span aria-hidden="true">·</span>
          <span>{group.fuelType}</span>
          <span aria-hidden="true">·</span>
          <span>{group.transmission}</span>
          <span aria-hidden="true">·</span>
          <span>{group.timeline}</span>
        </div>

        {variant && (
          <p className="text-sm font-semibold text-[#17191D] mt-3 tabular-nums">
            Ex-showroom {formatINRLakhs(variant.exShowroomPrice)}
          </p>
        )}

        <div className="mt-4 pt-4 border-t border-[#ECECE8]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-[#17191D] tabular-nums">
              {memberCount} of {group.targetBuyers} buyers joined
            </span>
            <span className="text-[#5A5F6B] tabular-nums">
              {group.status === 'Expired'
                ? 'Expired'
                : group.status === 'Deal Completed'
                ? 'Completed'
                : `${daysLeft}d left`}
            </span>
          </div>
          <div className="w-full h-2 bg-[#EFECE6] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#176B50] rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="mt-4 pt-3 flex items-center justify-between gap-2 text-xs">
          <span className="text-[#5A5F6B] tabular-nums">
            {publishedOffersCount > 0
              ? `${publishedOffersCount} sample ${publishedOffersCount === 1 ? 'offer' : 'offers'} available`
              : 'Collecting verified demand'}
          </span>
          <Link
            to={targetHref}
            className="inline-flex items-center gap-1 font-semibold text-[#176B50] hover:text-[#125640] whitespace-nowrap shrink-0"
          >
            <span>View Group</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
};
