import {
  AppDatabase,
  BuyingGroup,
  CarRequest,
  DealerOffer,
  GroupStatus,
  RequestStatus,
} from '../types';
import { generateId } from '../utils/formatters';

export function calculateFinalOnRoadPrice(params: {
  exShowroomPrice: number;
  rtoCharges: number;
  insuranceAmount: number;
  accessoriesCost: number;
  groupDiscount: number;
  additionalCharges: number;
}): number {
  const total =
    params.exShowroomPrice +
    params.rtoCharges +
    params.insuranceAmount +
    params.accessoriesCost +
    params.additionalCharges -
    params.groupDiscount;
  return Math.max(0, Math.round(total));
}

export function isGroupExpired(group: BuyingGroup): boolean {
  if (group.status === 'Deal Completed') return false;
  return new Date(group.expiresAt).getTime() < Date.now();
}

export function refreshGroupLifecycleStatuses(db: AppDatabase): AppDatabase {
  let changed = false;
  const updatedGroups = db.groups.map((grp) => {
    if (grp.status === 'Deal Completed' || grp.status === 'Expired') return grp;
    if (new Date(grp.expiresAt).getTime() < Date.now()) {
      changed = true;
      return { ...grp, status: 'Expired' as GroupStatus };
    }
    return grp;
  });

  if (!changed) return db;
  return { ...db, groups: updatedGroups };
}

export function isRequestCompatibleWithGroup(
  req: Pick<
    CarRequest,
    'brandId' | 'modelId' | 'variantId' | 'city' | 'fuelType' | 'transmission' | 'timeline'
  >,
  grp: BuyingGroup
): boolean {
  return (
    grp.brandId === req.brandId &&
    grp.modelId === req.modelId &&
    grp.variantId === req.variantId &&
    grp.city.trim().toLowerCase() === req.city.trim().toLowerCase() &&
    grp.fuelType === req.fuelType &&
    grp.transmission === req.transmission &&
    grp.timeline === req.timeline
  );
}

export function findDuplicateActiveRequest(
  requests: CarRequest[],
  userId: string,
  candidate: Pick<
    CarRequest,
    'modelId' | 'variantId' | 'city' | 'fuelType' | 'transmission'
  >,
  excludeRequestId?: string
): CarRequest | undefined {
  return requests.find(
    (r) =>
      r.id !== excludeRequestId &&
      r.userId === userId &&
      r.status !== 'Cancelled' &&
      r.modelId === candidate.modelId &&
      r.variantId === candidate.variantId &&
      r.city.trim().toLowerCase() === candidate.city.trim().toLowerCase() &&
      r.fuelType === candidate.fuelType &&
      r.transmission === candidate.transmission
  );
}

export function deriveGroupStatusAfterMemberChange(
  currentStatus: GroupStatus,
  memberCount: number,
  targetBuyers: number,
  hasPublishedOffers: boolean
): GroupStatus {
  if (currentStatus === 'Deal Completed' || currentStatus === 'Expired') {
    return currentStatus;
  }
  if (hasPublishedOffers) {
    return 'Offer Received';
  }
  if (currentStatus === 'Negotiating') {
    return 'Negotiating';
  }
  if (memberCount >= targetBuyers) {
    return 'Ready for Negotiation';
  }
  return 'Collecting Buyers';
}

export function deriveRequestStatusFromGroup(groupStatus: GroupStatus): RequestStatus {
  switch (groupStatus) {
    case 'Negotiating':
      return 'Negotiating';
    case 'Offer Received':
    case 'Deal Completed':
      return 'Offer Received';
    default:
      return 'Matched to Group';
  }
}

export function generateGroupCode(city: string, existingCount: number): string {
  const prefix = city
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 3)
    .padEnd(3, 'X');
  return `AC-${prefix}-${220 + existingCount}`;
}

export function matchOrCreateGroupForRequest(
  db: AppDatabase,
  newRequest: CarRequest
): {
  matchedGroup: BuyingGroup;
  wasAutoCreated: boolean;
  updatedGroups: BuyingGroup[];
  updatedRequest: CarRequest;
} {
  const nowIso = new Date().toISOString();

  // Look for an open compatible group where user is not already a member and capacity isn't full
  const openMatch = db.groups.find((grp) => {
    const isOpen = grp.status === 'Collecting Buyers' || grp.status === 'Ready for Negotiation';
    const hasSpace = grp.members.length < grp.targetBuyers;
    const notExpired = new Date(grp.expiresAt).getTime() > Date.now();
    const alreadyMember = grp.members.some((m) => m.userId === newRequest.userId);
    return (
      isOpen &&
      hasSpace &&
      notExpired &&
      !alreadyMember &&
      isRequestCompatibleWithGroup(newRequest, grp)
    );
  });

  if (openMatch) {
    const nextMembers = [
      ...openMatch.members,
      {
        userId: newRequest.userId,
        requestId: newRequest.id,
        joinedAt: nowIso,
        city: newRequest.city,
        preferredColor: newRequest.preferredColor,
      },
    ];
    const hasPublishedOffers = db.offers.some(
      (o: DealerOffer) => o.groupId === openMatch.id && o.status === 'Published'
    );
    const nextStatus = deriveGroupStatusAfterMemberChange(
      openMatch.status,
      nextMembers.length,
      openMatch.targetBuyers,
      hasPublishedOffers
    );

    const updatedGroup: BuyingGroup = {
      ...openMatch,
      members: nextMembers,
      status: nextStatus,
    };

    const updatedRequest: CarRequest = {
      ...newRequest,
      groupId: updatedGroup.id,
      status: deriveRequestStatusFromGroup(nextStatus),
      updatedAt: nowIso,
    };

    return {
      matchedGroup: updatedGroup,
      wasAutoCreated: false,
      updatedGroups: db.groups.map((g) => (g.id === updatedGroup.id ? updatedGroup : g)),
      updatedRequest,
    };
  }

  // Otherwise auto-create a new group if allowed
  const model = db.models.find((m) => m.id === newRequest.modelId);
  const variant = model?.variants.find((v) => v.id === newRequest.variantId);
  const expiryDays = db.settings.defaultGroupExpiryDays || 30;
  const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString();

  const createdGroup: BuyingGroup = {
    id: generateId('grp'),
    code: generateGroupCode(newRequest.city, db.groups.length),
    title: `${model?.name ?? 'Car'} ${variant?.name ?? ''} — ${newRequest.city}`.trim(),
    brandId: newRequest.brandId,
    modelId: newRequest.modelId,
    variantId: newRequest.variantId,
    city: newRequest.city.trim(),
    fuelType: newRequest.fuelType,
    transmission: newRequest.transmission,
    timeline: newRequest.timeline,
    targetBuyers: db.settings.defaultGroupTarget || 5,
    members: [
      {
        userId: newRequest.userId,
        requestId: newRequest.id,
        joinedAt: nowIso,
        city: newRequest.city.trim(),
        preferredColor: newRequest.preferredColor,
      },
    ],
    status: 'Collecting Buyers',
    createdAt: nowIso,
    expiresAt,
    negotiationNotes:
      'Automatically created from verified buyer demand. Collecting compatible buyers in the same city and timeline.',
  };

  const updatedRequest: CarRequest = {
    ...newRequest,
    groupId: createdGroup.id,
    status: 'Matched to Group',
    updatedAt: nowIso,
  };

  return {
    matchedGroup: createdGroup,
    wasAutoCreated: true,
    updatedGroups: [createdGroup, ...db.groups],
    updatedRequest,
  };
}
