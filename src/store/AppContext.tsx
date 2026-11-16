import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  AppDatabase,
  BuyingGroup,
  CarBrand,
  CarModel,
  CarRequest,
  CarVariant,
  Dealer,
  DealerOffer,
  FuelType,
  GroupStatus,
  NotificationItem,
  PlatformSettings,
  PurchaseRecord,
  PurchaseStatus,
  PurchaseTimeline,
  RequestStatus,
  TransmissionType,
  User,
  UserRole,
} from '../types';
import { INITIAL_SEED_DATA } from '../data/seedData';
import { generateId } from '../utils/formatters';
import { triggerDealCelebration } from '../utils/celebration';
import {
  calculateFinalOnRoadPrice,
  deriveGroupStatusAfterMemberChange,
  deriveRequestStatusFromGroup,
  findDuplicateActiveRequest,
  isGroupExpired,
  matchOrCreateGroupForRequest,
  refreshGroupLifecycleStatuses,
} from '../services/matchingEngine';

const DB_STORAGE_KEY = 'autocollective_db_v1';
const SESSION_STORAGE_KEY = 'autocollective_session_v1';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

export interface ActionResult<T = void> {
  ok: boolean;
  error?: string;
  message?: string;
  data?: T;
}

export interface CreateRequestInput {
  applicantName: string;
  phone: string;
  email: string;
  city: string;
  brandId: string;
  modelId: string;
  variantId: string;
  fuelType: FuelType;
  transmission: TransmissionType;
  preferredColor: string;
  budget: number;
  timeline: PurchaseTimeline;
  notes: string;
}

interface AppContextValue {
  db: AppDatabase;
  currentUser: User | null;
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
  notify: (type: ToastMessage['type'], title: string, description?: string) => void;

  // Auth
  login: (email: string, password: string) => ActionResult<User>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    phone: string;
    city: string;
  }) => ActionResult<User>;
  logout: () => void;
  resetPasswordDemo: (email: string, newPassword: string) => ActionResult;
  updateProfile: (updates: Partial<Pick<User, 'name' | 'phone' | 'city' | 'emailNotifications' | 'smsNotifications'>>) => ActionResult;
  changePassword: (currentPassword: string, newPassword: string) => ActionResult;

  // Requests
  createRequest: (input: CreateRequestInput) => ActionResult<{ request: CarRequest; group: BuyingGroup; wasAutoCreated: boolean }>;
  updateRequest: (requestId: string, updates: Partial<CreateRequestInput>) => ActionResult;
  cancelRequest: (requestId: string) => ActionResult;
  adminUpdateRequestStatus: (requestId: string, status: RequestStatus) => ActionResult;

  // Groups
  joinGroup: (groupId: string, preferredColor?: string) => ActionResult<BuyingGroup>;
  leaveGroup: (groupId: string) => ActionResult;
  adminCreateGroup: (input: {
    title: string;
    brandId: string;
    modelId: string;
    variantId: string;
    city: string;
    fuelType: FuelType;
    transmission: TransmissionType;
    timeline: PurchaseTimeline;
    targetBuyers: number;
    expiresAt: string;
    negotiationNotes: string;
  }) => ActionResult<BuyingGroup>;
  adminUpdateGroup: (
    groupId: string,
    updates: Partial<Pick<BuyingGroup, 'title' | 'targetBuyers' | 'expiresAt' | 'status' | 'negotiationNotes'>>
  ) => ActionResult;
  adminAddMemberToGroup: (groupId: string, userId: string) => ActionResult;
  adminRemoveMemberFromGroup: (groupId: string, userId: string) => ActionResult;
  adminDeleteGroup: (groupId: string) => ActionResult;

  // Catalog (Admin)
  addBrand: (input: Omit<CarBrand, 'id'>) => ActionResult;
  updateBrand: (brandId: string, updates: Partial<CarBrand>) => ActionResult;
  deleteBrand: (brandId: string) => ActionResult;
  addModel: (input: Omit<CarModel, 'id' | 'variants'>) => ActionResult;
  updateModel: (modelId: string, updates: Partial<Omit<CarModel, 'variants'>>) => ActionResult;
  deleteModel: (modelId: string) => ActionResult;
  addVariant: (modelId: string, input: Omit<CarVariant, 'id' | 'modelId'>) => ActionResult;
  updateVariant: (modelId: string, variantId: string, updates: Partial<CarVariant>) => ActionResult;
  deleteVariant: (modelId: string, variantId: string) => ActionResult;

  // Dealers & Offers
  addDealer: (input: Omit<Dealer, 'id' | 'createdAt'>) => ActionResult;
  updateDealer: (dealerId: string, updates: Partial<Dealer>) => ActionResult;
  deleteDealer: (dealerId: string) => ActionResult;
  createOffer: (input: {
    groupId: string;
    dealerId: string;
    exShowroomPrice: number;
    rtoCharges: number;
    insuranceAmount: number;
    accessoriesCost: number;
    groupDiscount: number;
    additionalCharges: number;
    validUntil: string;
    termsAndConditions: string;
    publishImmediately: boolean;
  }) => ActionResult<DealerOffer>;
  updateOffer: (
    offerId: string,
    updates: Partial<Omit<DealerOffer, 'id' | 'createdAt' | 'finalOnRoadPrice'>>
  ) => ActionResult;
  publishOffer: (offerId: string) => ActionResult;
  deleteOffer: (offerId: string) => ActionResult;

  // Purchases
  confirmPurchaseIntention: (offerId: string, remarks?: string) => ActionResult<PurchaseRecord>;
  adminUpdatePurchaseStatus: (
    purchaseId: string,
    status: PurchaseStatus,
    dealerReferenceCode?: string,
    remarks?: string
  ) => ActionResult;

  // Users (Admin)
  adminToggleUserActive: (userId: string) => ActionResult;
  adminUpdateUserRole: (userId: string, role: UserRole) => ActionResult;

  // Notifications
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;

  // Contacts & Settings
  submitContactMessage: (input: {
    name: string;
    email: string;
    phone: string;
    city: string;
    subject: string;
    message: string;
  }) => ActionResult;
  updateSettings: (updates: Partial<PlatformSettings>) => ActionResult;
  resetDemoDatabase: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

function loadInitialDb(): AppDatabase {
  try {
    const raw = localStorage.getItem(DB_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppDatabase;
      if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.groups)) {
        return refreshGroupLifecycleStatuses(parsed);
      }
    }
  } catch {
    // Fallback to seed data if storage is malformed
  }
  return refreshGroupLifecycleStatuses(INITIAL_SEED_DATA);
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<AppDatabase>(() => loadInitialDb());
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(SESSION_STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db));
    } catch {
      // Ignore quota errors in restricted environments
    }
  }, [db]);

  useEffect(() => {
    try {
      if (currentUserId) {
        localStorage.setItem(SESSION_STORAGE_KEY, currentUserId);
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }, [currentUserId]);

  const currentUser = db.users.find((u) => u.id === currentUserId) || null;

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (type: ToastMessage['type'], title: string, description?: string) => {
      const id = generateId('toast');
      setToasts((prev) => [...prev, { id, type, title, description }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const pushActivity = (
    prev: AppDatabase,
    actorName: string,
    actorRole: UserRole,
    action: string,
    detail: string
  ) => [
    {
      id: generateId('act'),
      actorName,
      actorRole,
      action,
      detail,
      createdAt: new Date().toISOString(),
    },
    ...prev.activities.slice(0, 49),
  ];

  const login = (email: string, password: string): ActionResult<User> => {
    const cleanEmail = email.trim().toLowerCase();
    const found = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!found || found.password !== password) {
      return { ok: false, error: 'Invalid email address or password.' };
    }
    if (!found.isActive) {
      return { ok: false, error: 'This account is deactivated. Contact support.' };
    }
    setCurrentUserId(found.id);
    notify('success', `Welcome back, ${found.name}`);
    return { ok: true, data: found };
  };

  const register = (input: {
    name: string;
    email: string;
    password: string;
    phone: string;
    city: string;
  }): ActionResult<User> => {
    const cleanEmail = input.email.trim().toLowerCase();
    if (db.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { ok: false, error: 'An account with this email already exists.' };
    }
    const newUser: User = {
      id: generateId('usr'),
      name: input.name.trim(),
      email: cleanEmail,
      password: input.password,
      phone: input.phone.trim(),
      city: input.city.trim(),
      role: 'user',
      isActive: true,
      emailNotifications: true,
      smsNotifications: true,
      createdAt: new Date().toISOString(),
    };
    setDb((prev) => ({
      ...prev,
      users: [...prev.users, newUser],
      notifications: [
        {
          id: generateId('not'),
          userId: newUser.id,
          title: 'Welcome to AutoCollective',
          message: 'Your buyer profile is ready. Submit a car request or join an active group in your city.',
          type: 'system',
          isRead: false,
          linkTo: '/dashboard/requests/new',
          createdAt: new Date().toISOString(),
        },
        ...prev.notifications,
      ],
      activities: pushActivity(
        prev,
        newUser.name,
        'user',
        'Registered Account',
        `New buyer registered from ${newUser.city}.`
      ),
    }));
    setCurrentUserId(newUser.id);
    notify('success', 'Account created successfully', `Signed in as ${newUser.name}`);
    return { ok: true, data: newUser };
  };

  const logout = () => {
    setCurrentUserId(null);
    notify('info', 'Signed out cleanly');
  };

  const resetPasswordDemo = (email: string, newPassword: string): ActionResult => {
    const cleanEmail = email.trim().toLowerCase();
    const target = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!target) {
      return { ok: false, error: 'No registered account matches this email address.' };
    }
    setDb((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === target.id ? { ...u, password: newPassword } : u)),
    }));
    notify('success', 'Password updated', 'You can now sign in with your new password.');
    return { ok: true };
  };

  const updateProfile = (
    updates: Partial<Pick<User, 'name' | 'phone' | 'city' | 'emailNotifications' | 'smsNotifications'>>
  ): ActionResult => {
    if (!currentUser) return { ok: false, error: 'Authentication required.' };
    setDb((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === currentUser.id ? { ...u, ...updates } : u)),
    }));
    notify('success', 'Profile saved');
    return { ok: true };
  };

  const changePassword = (currentPassword: string, newPassword: string): ActionResult => {
    if (!currentUser) return { ok: false, error: 'Authentication required.' };
    if (currentUser.password !== currentPassword) {
      return { ok: false, error: 'Current password is incorrect.' };
    }
    setDb((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === currentUser.id ? { ...u, password: newPassword } : u
      ),
    }));
    notify('success', 'Password changed successfully');
    return { ok: true };
  };

  const createRequest = (
    input: CreateRequestInput
  ): ActionResult<{ request: CarRequest; group: BuyingGroup; wasAutoCreated: boolean }> => {
    if (!currentUser) return { ok: false, error: 'Please sign in to submit a car request.' };

    const duplicate = findDuplicateActiveRequest(db.requests, currentUser.id, input);
    if (duplicate) {
      return {
        ok: false,
        error:
          'You already have an active request for this exact model, variant, fuel type, transmission, and city.',
      };
    }

    const nowIso = new Date().toISOString();
    const baseRequest: CarRequest = {
      id: generateId('req'),
      userId: currentUser.id,
      applicantName: input.applicantName.trim(),
      phone: input.phone.trim(),
      email: input.email.trim(),
      city: input.city.trim(),
      brandId: input.brandId,
      modelId: input.modelId,
      variantId: input.variantId,
      fuelType: input.fuelType,
      transmission: input.transmission,
      preferredColor: input.preferredColor,
      budget: input.budget,
      timeline: input.timeline,
      notes: input.notes.trim(),
      status: 'Pending Match',
      groupId: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const { matchedGroup, wasAutoCreated, updatedGroups, updatedRequest } =
      matchOrCreateGroupForRequest(db, baseRequest);

    const extraNotifications: NotificationItem[] = [
      {
        id: generateId('not'),
        userId: currentUser.id,
        title: wasAutoCreated ? 'New Buying Group Created' : 'Matched to Compatible Group',
        message: wasAutoCreated
          ? `Group ${matchedGroup.code} was created for ${matchedGroup.title}. Share or wait for verified buyers in ${matchedGroup.city}.`
          : `Your request was matched into group ${matchedGroup.code} (${matchedGroup.members.length}/${matchedGroup.targetBuyers} buyers).`,
        type: 'group',
        isRead: false,
        linkTo: `/dashboard/groups/${matchedGroup.id}`,
        createdAt: nowIso,
      },
    ];

    if (matchedGroup.status === 'Ready for Negotiation') {
      extraNotifications.push({
        id: generateId('not'),
        userId: 'admin',
        title: `Group ${matchedGroup.code} Ready for Negotiation`,
        message: `${matchedGroup.title} reached ${matchedGroup.targetBuyers} buyers and is ready for dealer outreach.`,
        type: 'group',
        isRead: false,
        linkTo: '/admin/groups',
        createdAt: nowIso,
      });
    }

    setDb((prev) => ({
      ...prev,
      requests: [updatedRequest, ...prev.requests],
      groups: updatedGroups,
      notifications: [...extraNotifications, ...prev.notifications],
      activities: pushActivity(
        prev,
        currentUser.name,
        currentUser.role,
        wasAutoCreated ? 'Created Request & New Group' : 'Matched Request to Group',
        `${matchedGroup.title} (${matchedGroup.code})`
      ),
    }));

    notify(
      'success',
      wasAutoCreated ? 'Request submitted & new group created' : 'Request matched to group',
      `Assigned to ${matchedGroup.code}`
    );

    return {
      ok: true,
      data: { request: updatedRequest, group: matchedGroup, wasAutoCreated },
    };
  };

  const updateRequest = (
    requestId: string,
    updates: Partial<CreateRequestInput>
  ): ActionResult => {
    if (!currentUser) return { ok: false, error: 'Authentication required.' };
    const existing = db.requests.find((r) => r.id === requestId);
    if (!existing) return { ok: false, error: 'Request not found.' };
    if (existing.userId !== currentUser.id && currentUser.role !== 'admin') {
      return { ok: false, error: 'Not authorized to edit this request.' };
    }
    if (existing.status === 'Purchase Confirmed' || existing.status === 'Cancelled') {
      return { ok: false, error: 'Confirmed or cancelled requests cannot be modified.' };
    }

    const merged = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    const duplicate = findDuplicateActiveRequest(db.requests, existing.userId, merged, requestId);
    if (duplicate) {
      return {
        ok: false,
        error: 'Another active request with identical car configuration and city already exists.',
      };
    }

    setDb((prev) => ({
      ...prev,
      requests: prev.requests.map((r) => (r.id === requestId ? merged : r)),
    }));
    notify('success', 'Car request updated');
    return { ok: true };
  };

  const cancelRequest = (requestId: string): ActionResult => {
    if (!currentUser) return { ok: false, error: 'Authentication required.' };
    const existing = db.requests.find((r) => r.id === requestId);
    if (!existing) return { ok: false, error: 'Request not found.' };
    if (existing.userId !== currentUser.id && currentUser.role !== 'admin') {
      return { ok: false, error: 'Permission denied.' };
    }
    if (existing.status === 'Purchase Confirmed') {
      return { ok: false, error: 'Cannot cancel a request with a confirmed purchase.' };
    }

    const nowIso = new Date().toISOString();
    setDb((prev) => {
      let nextGroups = prev.groups;
      if (existing.groupId) {
        nextGroups = prev.groups.map((grp) => {
          if (grp.id !== existing.groupId) return grp;
          const remaining = grp.members.filter((m) => m.userId !== existing.userId);
          const hasOffers = prev.offers.some(
            (o) => o.groupId === grp.id && o.status === 'Published'
          );
          return {
            ...grp,
            members: remaining,
            status: deriveGroupStatusAfterMemberChange(
              grp.status,
              remaining.length,
              grp.targetBuyers,
              hasOffers
            ),
          };
        });
      }
      return {
        ...prev,
        requests: prev.requests.map((r) =>
          r.id === requestId ? { ...r, status: 'Cancelled', updatedAt: nowIso } : r
        ),
        groups: nextGroups,
      };
    });

    notify('info', 'Car request cancelled');
    return { ok: true };
  };

  const adminUpdateRequestStatus = (requestId: string, status: RequestStatus): ActionResult => {
    if (currentUser?.role !== 'admin') return { ok: false, error: 'Admin access required.' };
    setDb((prev) => ({
      ...prev,
      requests: prev.requests.map((r) =>
        r.id === requestId ? { ...r, status, updatedAt: new Date().toISOString() } : r
      ),
    }));
    notify('success', `Request status updated to ${status}`);
    return { ok: true };
  };

  const joinGroup = (groupId: string, preferredColor = 'Standard'): ActionResult<BuyingGroup> => {
    if (!currentUser) return { ok: false, error: 'Please sign in to join a buying group.' };
    const group = db.groups.find((g) => g.id === groupId);
    if (!group) return { ok: false, error: 'Buying group not found.' };
    if (isGroupExpired(group) || group.status === 'Expired') {
      return { ok: false, error: 'This group has expired and is no longer accepting buyers.' };
    }
    if (group.status === 'Deal Completed') {
      return { ok: false, error: 'This group deal is already completed.' };
    }
    if (group.members.some((m) => m.userId === currentUser.id)) {
      return { ok: false, error: 'You are already a member of this group.' };
    }
    if (group.members.length >= group.targetBuyers) {
      return { ok: false, error: 'This group has already reached its target buyer capacity.' };
    }

    const nowIso = new Date().toISOString();
    const nextMembers = [
      ...group.members,
      {
        userId: currentUser.id,
        requestId: null,
        joinedAt: nowIso,
        city: group.city,
        preferredColor,
      },
    ];
    const hasPublishedOffers = db.offers.some(
      (o) => o.groupId === group.id && o.status === 'Published'
    );
    const nextStatus = deriveGroupStatusAfterMemberChange(
      group.status,
      nextMembers.length,
      group.targetBuyers,
      hasPublishedOffers
    );

    const updatedGroup: BuyingGroup = {
      ...group,
      members: nextMembers,
      status: nextStatus,
    };

    const extraNotifs: NotificationItem[] = [
      {
        id: generateId('not'),
        userId: currentUser.id,
        title: `Joined Group ${group.code}`,
        message: `You joined ${group.title}. Current progress: ${nextMembers.length}/${group.targetBuyers} buyers.`,
        type: 'group',
        isRead: false,
        linkTo: `/dashboard/groups/${group.id}`,
        createdAt: nowIso,
      },
    ];

    if (nextStatus === 'Ready for Negotiation') {
      extraNotifs.push({
        id: generateId('not'),
        userId: 'admin',
        title: `Target Reached: ${group.code}`,
        message: `${group.title} has reached ${nextMembers.length}/${group.targetBuyers} buyers and is Ready for Negotiation.`,
        type: 'group',
        isRead: false,
        linkTo: '/admin/groups',
        createdAt: nowIso,
      });
    }

    setDb((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => (g.id === group.id ? updatedGroup : g)),
      notifications: [...extraNotifs, ...prev.notifications],
      activities: pushActivity(
        prev,
        currentUser.name,
        currentUser.role,
        'Joined Buying Group',
        `${currentUser.name} joined ${group.code} (${nextMembers.length}/${group.targetBuyers}).`
      ),
    }));

    notify(
      'success',
      `Joined ${group.code}`,
      nextStatus === 'Ready for Negotiation'
        ? 'Group target reached! Status moved to Ready for Negotiation.'
        : `${nextMembers.length} of ${group.targetBuyers} buyers confirmed.`
    );
    return { ok: true, data: updatedGroup };
  };

  const leaveGroup = (groupId: string): ActionResult => {
    if (!currentUser) return { ok: false, error: 'Authentication required.' };
    const group = db.groups.find((g) => g.id === groupId);
    if (!group) return { ok: false, error: 'Group not found.' };
    if (!group.members.some((m) => m.userId === currentUser.id)) {
      return { ok: false, error: 'You are not a member of this group.' };
    }
    const hasConfirmedPurchase = db.purchases.some(
      (p) => p.groupId === groupId && p.userId === currentUser.id && p.status !== 'Cancelled'
    );
    if (hasConfirmedPurchase) {
      return {
        ok: false,
        error: 'You have an active purchase intention in this group and cannot leave.',
      };
    }

    const remaining = group.members.filter((m) => m.userId !== currentUser.id);
    const hasPublishedOffers = db.offers.some(
      (o) => o.groupId === group.id && o.status === 'Published'
    );
    const nextStatus = deriveGroupStatusAfterMemberChange(
      group.status,
      remaining.length,
      group.targetBuyers,
      hasPublishedOffers
    );

    setDb((prev) => ({
      ...prev,
      groups: prev.groups.map((g) =>
        g.id === groupId ? { ...g, members: remaining, status: nextStatus } : g
      ),
      requests: prev.requests.map((r) =>
        r.groupId === groupId && r.userId === currentUser.id
          ? { ...r, groupId: null, status: 'Pending Match', updatedAt: new Date().toISOString() }
          : r
      ),
      activities: pushActivity(
        prev,
        currentUser.name,
        currentUser.role,
        'Left Buying Group',
        `Left ${group.code} (${remaining.length}/${group.targetBuyers} remaining).`
      ),
    }));

    notify('info', `Left group ${group.code}`);
    return { ok: true };
  };

  const adminCreateGroup = (input: {
    title: string;
    brandId: string;
    modelId: string;
    variantId: string;
    city: string;
    fuelType: FuelType;
    transmission: TransmissionType;
    timeline: PurchaseTimeline;
    targetBuyers: number;
    expiresAt: string;
    negotiationNotes: string;
  }): ActionResult<BuyingGroup> => {
    if (currentUser?.role !== 'admin') return { ok: false, error: 'Admin access required.' };
    const created: BuyingGroup = {
      id: generateId('grp'),
      code: `AC-${input.city.slice(0, 3).toUpperCase()}-${Math.floor(230 + Math.random() * 700)}`,
      title: input.title.trim(),
      brandId: input.brandId,
      modelId: input.modelId,
      variantId: input.variantId,
      city: input.city.trim(),
      fuelType: input.fuelType,
      transmission: input.transmission,
      timeline: input.timeline,
      targetBuyers: Math.max(2, input.targetBuyers),
      members: [],
      status: 'Collecting Buyers',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(input.expiresAt).toISOString(),
      negotiationNotes: input.negotiationNotes.trim(),
    };
    setDb((prev) => ({
      ...prev,
      groups: [created, ...prev.groups],
      activities: pushActivity(prev, currentUser.name, 'admin', 'Created Group', created.title),
    }));
    notify('success', `Group ${created.code} created`);
    return { ok: true, data: created };
  };

  const adminUpdateGroup = (
    groupId: string,
    updates: Partial<Pick<BuyingGroup, 'title' | 'targetBuyers' | 'expiresAt' | 'status' | 'negotiationNotes'>>
  ): ActionResult => {
    if (currentUser?.role !== 'admin') return { ok: false, error: 'Admin access required.' };
    setDb((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => (g.id === groupId ? { ...g, ...updates } : g)),
      requests:
        updates.status !== undefined
          ? prev.requests.map((r) =>
              r.groupId === groupId && r.status !== 'Purchase Confirmed' && r.status !== 'Cancelled'
                ? { ...r, status: deriveRequestStatusFromGroup(updates.status as GroupStatus) }
                : r
            )
          : prev.requests,
    }));
    notify('success', 'Group updated');
    return { ok: true };
  };

  const adminAddMemberToGroup = (groupId: string, userId: string): ActionResult => {
    if (currentUser?.role !== 'admin') return { ok: false, error: 'Admin access required.' };
    const group = db.groups.find((g) => g.id === groupId);
    const user = db.users.find((u) => u.id === userId);
    if (!group || !user) return { ok: false, error: 'Group or user not found.' };
    if (group.members.some((m) => m.userId === userId)) {
      return { ok: false, error: 'User is already in this group.' };
    }
    const nextMembers = [
      ...group.members,
      {
        userId,
        requestId: null,
        joinedAt: new Date().toISOString(),
        city: group.city,
        preferredColor: 'Standard',
      },
    ];
    const hasOffers = db.offers.some((o) => o.groupId === group.id && o.status === 'Published');
    const nextStatus = deriveGroupStatusAfterMemberChange(
      group.status,
      nextMembers.length,
      group.targetBuyers,
      hasOffers
    );
    setDb((prev) => ({
      ...prev,
      groups: prev.groups.map((g) =>
        g.id === groupId ? { ...g, members: nextMembers, status: nextStatus } : g
      ),
    }));
    notify('success', `Added ${user.name} to ${group.code}`);
    return { ok: true };
  };

  const adminRemoveMemberFromGroup = (groupId: string, userId: string): ActionResult => {
    if (currentUser?.role !== 'admin') return { ok: false, error: 'Admin access required.' };
    const group = db.groups.find((g) => g.id === groupId);
    if (!group) return { ok: false, error: 'Group not found.' };
    const remaining = group.members.filter((m) => m.userId !== userId);
    const hasOffers = db.offers.some((o) => o.groupId === group.id && o.status === 'Published');
    const nextStatus = deriveGroupStatusAfterMemberChange(
      group.status,
      remaining.length,
      group.targetBuyers,
      hasOffers
    );
    setDb((prev) => ({
      ...prev,
      groups: prev.groups.map((g) =>
        g.id === groupId ? { ...g, members: remaining, status: nextStatus } : g
      ),
    }));
    notify('info', 'Member removed from group');
    return { ok: true };
  };

  const adminDeleteGroup = (groupId: string): ActionResult => {
    if (currentUser?.role !== 'admin') return { ok: false, error: 'Admin access required.' };
    setDb((prev) => ({
      ...prev,
      groups: prev.groups.filter((g) => g.id !== groupId),
      offers: prev.offers.filter((o) => o.groupId !== groupId),
      requests: prev.requests.map((r) =>
        r.groupId === groupId ? { ...r, groupId: null, status: 'Pending Match' } : r
      ),
    }));
    notify('info', 'Group deleted');
    return { ok: true };
  };

  // Brands / Models / Variants
  const addBrand = (input: Omit<CarBrand, 'id'>): ActionResult => {
    if (currentUser?.role !== 'admin') return { ok: false, error: 'Admin access required.' };
    const created: CarBrand = { ...input, id: generateId('brd') };
    setDb((prev) => ({ ...prev, brands: [...prev.brands, created] }));
    notify('success', `Brand ${created.name} added`);
    return { ok: true };
  };

  const updateBrand = (brandId: string, updates: Partial<CarBrand>): ActionResult => {
    if (currentUser?.role !== 'admin') return { ok: false, error: 'Admin access required.' };
    setDb((prev) => ({
      ...prev,
      brands: prev.brands.map((b) => (b.id === brandId ? { ...b, ...updates } : b)),
    }));
    notify('success', 'Brand updated');
    return { ok: true };
  };

  const deleteBrand = (brandId: string): ActionResult => {
    if (currentUser?.role !== 'admin') return { ok: false, error: 'Admin access required.' };
    if (db.models.some((m) => m.brandId === brandId)) {
      return { ok: false, error: 'Remove models belonging to this brand before deleting it.' };
    }
    setDb((prev) => ({ ...prev, brands: prev.brands.filter((b) => b.id !== brandId) }));
    notify('info', 'Brand deleted');
    return { ok: true };
  };

  const addModel = (input: Omit<CarModel, 'id' | 'variants'>): ActionResult => {
    if (currentUser?.role !== 'admin') return { ok: false, error: 'Admin access required.' };
    const created: CarModel = { ...input, id: generateId('mod'), variants: [] };
    setDb((prev) => ({ ...prev, models: [...prev.models, created] }));
    notify('success', `Model ${created.name} added`);
    return { ok: true };
  };

  const updateModel = (
    modelId: string,
    updates: Partial<Omit<CarModel, 'variants'>>
  ): ActionResult => {
    if (currentUser?.role !== 'admin') return { ok: false, error: 'Admin access required.' };
    setDb((prev) => ({
      ...prev,
      models: prev.models.map((m) => (m.id === modelId ? { ...m, ...updates } : m)),
    }));
    notify('success', 'Car model updated');
    return { ok: true };
  };

  const deleteModel = (modelId: string): ActionResult => {
    if (currentUser?.role !== 'admin') return { ok: false, error: 'Admin access required.' };
    setDb((prev) => ({ ...prev, models: prev.models.filter((m) => m.id !== modelId) }));
    notify('info', 'Car model deleted');
    return { ok: true };
  };

  const addVariant = (modelId: string, input: Omit<CarVariant, 'id' | 'modelId'>): ActionResult => {
    if (currentUser?.role !== 'admin') return { ok: false, error: 'Admin access required.' };
    const created: CarVariant = { ...input, id: generateId('var'), modelId };
    setDb((prev) => ({
      ...prev,
      models: prev.models.map((m) =>
        m.id === modelId ? { ...m, variants: [...m.variants, created] } : m
      ),
    }));
    notify('success', `Variant ${created.name} added`);
    return { ok: true };
  };

  const updateVariant = (
    modelId: string,
    variantId: string,
    updates: Partial<CarVariant>
  ): ActionResult => {
    if (currentUser?.role !== 'admin') return { ok: false, error: 'Admin access required.' };
    setDb((prev) => ({
      ...prev,
      models: prev.models.map((m) =>
        m.id === modelId
          ? {
              ...m,
              variants: m.variants.map((v) => (v.id === variantId ? { ...v, ...updates } : v)),
            }
          : m
      ),
    }));
    notify('success', 'Variant updated');
    return { ok: true };
  };

  const deleteVariant = (modelId: string, variantId: string): ActionResult => {
    if (currentUser?.role !== 'admin') return { ok: false, error: 'Admin access required.' };
    setDb((prev) => ({
      ...prev,
      models: prev.models.map((m) =>
        m.id === modelId
          ? { ...m, variants: m.variants.filter((v) => v.id !== variantId) }
          : m
      ),
    }));
    notify('info', 'Variant removed');
    return { ok: true };
  };

  // Dealers & Offers
  const addDealer = (input: Omit<Dealer, 'id' | 'createdAt'>): ActionResult => {
    if (currentUser?.role !== 'admin') return { ok: false, error: 'Admin access required.' };
    const created: Dealer = {
      ...input,
      id: generateId('dlr'),
      createdAt: new Date().toISOString(),
    };
    setDb((prev) => ({
      ...prev,
      dealers: [created, ...prev.dealers],
      activities: pushActivity(prev, currentUser.name, 'admin', 'Registered Dealer', `${created.name} (${created.city})`),
    }));
    notify('success', `Dealership ${created.name} registered`);
    return { ok: true };
  };

  const updateDealer = (dealerId: string, updates: Partial<Dealer>): ActionResult => {
    if (currentUser?.role !== 'admin') return { ok: false, error: 'Admin access required.' };
    setDb((prev) => ({
      ...prev,
      dealers: prev.dealers.map((d) => (d.id === dealerId ? { ...d, ...updates } : d)),
    }));
    notify('success', 'Dealership updated');
    return { ok: true };
  };

  const deleteDealer = (dealerId: string): ActionResult => {
    if (currentUser?.role !== 'admin') return { ok: false, error: 'Admin access required.' };
    setDb((prev) => ({
      ...prev,
      dealers: prev.dealers.filter((d) => d.id !== dealerId),
      offers: prev.offers.filter((o) => o.dealerId !== dealerId),
    }));
    notify('info', 'Dealership deleted');
    return { ok: true };
  };

  const createOffer = (input: {
    groupId: string;
    dealerId: string;
    exShowroomPrice: number;
    rtoCharges: number;
    insuranceAmount: number;
    accessoriesCost: number;
    groupDiscount: number;
    additionalCharges: number;
    validUntil: string;
    termsAndConditions: string;
    publishImmediately: boolean;
  }): ActionResult<DealerOffer> => {
    if (currentUser?.role !== 'admin') return { ok: false, error: 'Admin access required.' };
    const group = db.groups.find((g) => g.id === input.groupId);
    const dealer = db.dealers.find((d) => d.id === input.dealerId);
    if (!group || !dealer) return { ok: false, error: 'Valid group and dealer are required.' };

    const nowIso = new Date().toISOString();
    const finalOnRoadPrice = calculateFinalOnRoadPrice(input);

    const created: DealerOffer = {
      id: generateId('off'),
      groupId: input.groupId,
      dealerId: input.dealerId,
      exShowroomPrice: input.exShowroomPrice,
      rtoCharges: input.rtoCharges,
      insuranceAmount: input.insuranceAmount,
      accessoriesCost: input.accessoriesCost,
      groupDiscount: input.groupDiscount,
      additionalCharges: input.additionalCharges,
      finalOnRoadPrice,
      validUntil: new Date(input.validUntil).toISOString(),
      termsAndConditions: input.termsAndConditions.trim(),
      isSampleQuotation: true,
      status: input.publishImmediately ? 'Published' : 'Draft',
      createdAt: nowIso,
      publishedAt: input.publishImmediately ? nowIso : null,
    };

    const memberNotifs: NotificationItem[] = input.publishImmediately
      ? group.members.map((m) => ({
          id: generateId('not'),
          userId: m.userId,
          title: `New Quotation Published for ${group.code}`,
          message: `${dealer.name} quoted ${finalOnRoadPrice.toLocaleString('en-IN')} INR on-road for ${group.title}.`,
          type: 'offer',
          isRead: false,
          linkTo: '/dashboard/offers',
          createdAt: nowIso,
        }))
      : [];

    setDb((prev) => ({
      ...prev,
      offers: [created, ...prev.offers],
      groups: input.publishImmediately
        ? prev.groups.map((g) =>
            g.id === group.id ? { ...g, status: 'Offer Received' as GroupStatus } : g
          )
        : prev.groups,
      requests: input.publishImmediately
        ? prev.requests.map((r) =>
            r.groupId === group.id && r.status !== 'Purchase Confirmed' && r.status !== 'Cancelled'
              ? { ...r, status: 'Offer Received' as RequestStatus }
              : r
          )
        : prev.requests,
      notifications: [...memberNotifs, ...prev.notifications],
      activities: pushActivity(
        prev,
        currentUser.name,
        'admin',
        input.publishImmediately ? 'Published Dealer Quotation' : 'Saved Draft Quotation',
        `${dealer.name} for ${group.code} (₹${finalOnRoadPrice.toLocaleString('en-IN')})`
      ),
    }));

    notify(
      'success',
      input.publishImmediately ? 'Quotation published to group members' : 'Draft quotation saved'
    );
    return { ok: true, data: created };
  };

  const updateOffer = (
    offerId: string,
    updates: Partial<Omit<DealerOffer, 'id' | 'createdAt' | 'finalOnRoadPrice'>>
  ): ActionResult => {
    if (currentUser?.role !== 'admin') return { ok: false, error: 'Admin access required.' };
    const existing = db.offers.find((o) => o.id === offerId);
    if (!existing) return { ok: false, error: 'Offer not found.' };

    const mergedBase = { ...existing, ...updates };
    const finalOnRoadPrice = calculateFinalOnRoadPrice(mergedBase);
    const updatedOffer: DealerOffer = { ...mergedBase, finalOnRoadPrice };

    setDb((prev) => ({
      ...prev,
      offers: prev.offers.map((o) => (o.id === offerId ? updatedOffer : o)),
    }));
    notify('success', 'Quotation updated');
    return { ok: true };
  };

  const publishOffer = (offerId: string): ActionResult => {
    if (currentUser?.role !== 'admin') return { ok: false, error: 'Admin access required.' };
    const offer = db.offers.find((o) => o.id === offerId);
    if (!offer) return { ok: false, error: 'Offer not found.' };
    const group = db.groups.find((g) => g.id === offer.groupId);
    const dealer = db.dealers.find((d) => d.id === offer.dealerId);
    const nowIso = new Date().toISOString();

    const memberNotifs: NotificationItem[] =
      group?.members.map((m) => ({
        id: generateId('not'),
        userId: m.userId,
        title: `Verified Quotation Published (${group.code})`,
        message: `${dealer?.name || 'Dealer'} quotation for ${group.title} is now available to review and compare.`,
        type: 'offer',
        isRead: false,
        linkTo: '/dashboard/offers',
        createdAt: nowIso,
      })) || [];

    setDb((prev) => ({
      ...prev,
      offers: prev.offers.map((o) =>
        o.id === offerId ? { ...o, status: 'Published', publishedAt: nowIso } : o
      ),
      groups: prev.groups.map((g) =>
        g.id === offer.groupId && g.status !== 'Deal Completed'
          ? { ...g, status: 'Offer Received' }
          : g
      ),
      requests: prev.requests.map((r) =>
        r.groupId === offer.groupId && r.status !== 'Purchase Confirmed' && r.status !== 'Cancelled'
          ? { ...r, status: 'Offer Received' }
          : r
      ),
      notifications: [...memberNotifs, ...prev.notifications],
      activities: pushActivity(
        prev,
        currentUser.name,
        'admin',
        'Published Dealer Quotation',
        `${dealer?.name || 'Dealer'} offer published for ${group?.code || offer.groupId}`
      ),
    }));

    notify('success', 'Quotation published to buyers');
    return { ok: true };
  };

  const deleteOffer = (offerId: string): ActionResult => {
    if (currentUser?.role !== 'admin') return { ok: false, error: 'Admin access required.' };
    setDb((prev) => ({
      ...prev,
      offers: prev.offers.filter((o) => o.id !== offerId),
    }));
    notify('info', 'Quotation deleted');
    return { ok: true };
  };

  const confirmPurchaseIntention = (
    offerId: string,
    remarks = ''
  ): ActionResult<PurchaseRecord> => {
    if (!currentUser) return { ok: false, error: 'Please sign in to confirm purchase intention.' };
    const offer = db.offers.find((o) => o.id === offerId && o.status === 'Published');
    if (!offer) return { ok: false, error: 'Published offer not found.' };
    const group = db.groups.find((g) => g.id === offer.groupId);
    if (!group) return { ok: false, error: 'Associated group not found.' };

    const isMember = group.members.some((m) => m.userId === currentUser.id);
    if (!isMember) {
      return { ok: false, error: 'You must be a member of this group to confirm an offer.' };
    }

    const existingPurchase = db.purchases.find(
      (p) =>
        p.userId === currentUser.id &&
        p.groupId === group.id &&
        p.status !== 'Cancelled'
    );
    if (existingPurchase) {
      return {
        ok: false,
        error: 'You have already confirmed a purchase intention for this buying group.',
      };
    }

    const dealer = db.dealers.find((d) => d.id === offer.dealerId);
    const nowIso = new Date().toISOString();
    const created: PurchaseRecord = {
      id: generateId('pur'),
      userId: currentUser.id,
      groupId: group.id,
      offerId: offer.id,
      dealerId: offer.dealerId,
      modelId: group.modelId,
      variantId: group.variantId,
      agreedOnRoadPrice: offer.finalOnRoadPrice,
      status: 'Intention Confirmed',
      dealerReferenceCode: `AC-${Math.floor(1000 + Math.random() * 9000)}`,
      remarks:
        remarks.trim() ||
        `Confirmed purchase intention on ${dealer?.name || 'authorized dealer'} quotation.`,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    setDb((prev) => ({
      ...prev,
      purchases: [created, ...prev.purchases],
      requests: prev.requests.map((r) =>
        r.userId === currentUser.id && r.groupId === group.id
          ? { ...r, status: 'Purchase Confirmed', updatedAt: nowIso }
          : r
      ),
      notifications: [
        {
          id: generateId('not'),
          userId: 'admin',
          title: 'New Purchase Intention Confirmed',
          message: `${currentUser.name} confirmed quotation from ${dealer?.name || 'dealer'} (${group.code}).`,
          type: 'purchase',
          isRead: false,
          linkTo: '/admin/purchases',
          createdAt: nowIso,
        },
        {
          id: generateId('not'),
          userId: currentUser.id,
          title: 'Purchase Intention Recorded',
          message: `Reference ${created.dealerReferenceCode} created. Track dealership assignment in Purchase Tracking.`,
          type: 'purchase',
          isRead: false,
          linkTo: '/dashboard/purchases',
          createdAt: nowIso,
        },
        ...prev.notifications,
      ],
      activities: pushActivity(
        prev,
        currentUser.name,
        currentUser.role,
        'Confirmed Purchase Intention',
        `${group.code} · ${dealer?.name || ''} · ₹${offer.finalOnRoadPrice.toLocaleString('en-IN')}`
      ),
    }));

    triggerDealCelebration();
    notify('success', 'Purchase intention confirmed', `Reference: ${created.dealerReferenceCode}`);
    return { ok: true, data: created };
  };

  const adminUpdatePurchaseStatus = (
    purchaseId: string,
    status: PurchaseStatus,
    dealerReferenceCode?: string,
    remarks?: string
  ): ActionResult => {
    if (currentUser?.role !== 'admin') return { ok: false, error: 'Admin access required.' };
    const existing = db.purchases.find((p) => p.id === purchaseId);
    if (!existing) return { ok: false, error: 'Purchase record not found.' };
    const nowIso = new Date().toISOString();

    setDb((prev) => {
      const updatedPurchases = prev.purchases.map((p) =>
        p.id === purchaseId
          ? {
              ...p,
              status,
              dealerReferenceCode: dealerReferenceCode?.trim() || p.dealerReferenceCode,
              remarks: remarks !== undefined ? remarks.trim() : p.remarks,
              updatedAt: nowIso,
            }
          : p
      );

      const nextGroups =
        status === 'Delivered'
          ? prev.groups.map((g) =>
              g.id === existing.groupId ? { ...g, status: 'Deal Completed' as GroupStatus } : g
            )
          : prev.groups;

      return {
        ...prev,
        purchases: updatedPurchases,
        groups: nextGroups,
        notifications: [
          {
            id: generateId('not'),
            userId: existing.userId,
            title: `Purchase Status Updated: ${status}`,
            message: `Your vehicle purchase (${existing.dealerReferenceCode}) is now marked "${status}".`,
            type: 'purchase',
            isRead: false,
            linkTo: '/dashboard/purchases',
            createdAt: nowIso,
          },
          ...prev.notifications,
        ],
        activities: pushActivity(
          prev,
          currentUser.name,
          'admin',
          'Updated Purchase Status',
          `${existing.dealerReferenceCode} → ${status}`
        ),
      };
    });

    notify('success', `Purchase status set to ${status}`);
    return { ok: true };
  };

  const adminToggleUserActive = (userId: string): ActionResult => {
    if (currentUser?.role !== 'admin') return { ok: false, error: 'Admin access required.' };
    if (userId === currentUser.id) return { ok: false, error: 'You cannot deactivate yourself.' };
    setDb((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u)),
    }));
    notify('success', 'User account status updated');
    return { ok: true };
  };

  const adminUpdateUserRole = (userId: string, role: UserRole): ActionResult => {
    if (currentUser?.role !== 'admin') return { ok: false, error: 'Admin access required.' };
    if (userId === currentUser.id) return { ok: false, error: 'Cannot change your own active role.' };
    setDb((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === userId ? { ...u, role } : u)),
    }));
    notify('success', `Role updated to ${role}`);
    return { ok: true };
  };

  const markNotificationRead = (notificationId: string) => {
    setDb((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n
      ),
    }));
  };

  const markAllNotificationsRead = () => {
    if (!currentUser) return;
    const targetAudience = currentUser.role === 'admin' ? 'admin' : currentUser.id;
    setDb((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.userId === targetAudience || n.userId === currentUser.id ? { ...n, isRead: true } : n
      ),
    }));
    notify('info', 'All notifications marked as read');
  };

  const submitContactMessage = (input: {
    name: string;
    email: string;
    phone: string;
    city: string;
    subject: string;
    message: string;
  }): ActionResult => {
    const entry = {
      id: generateId('cnt'),
      ...input,
      createdAt: new Date().toISOString(),
    };
    setDb((prev) => ({
      ...prev,
      contacts: [entry, ...prev.contacts],
      notifications: [
        {
          id: generateId('not'),
          userId: 'admin',
          title: 'New Contact Inquiry',
          message: `${input.name} (${input.city}) sent a message: ${input.subject}`,
          type: 'system',
          isRead: false,
          linkTo: '/admin/settings',
          createdAt: new Date().toISOString(),
        },
        ...prev.notifications,
      ],
    }));
    notify('success', 'Inquiry submitted', 'Our coordination desk will respond within 1 business day.');
    return { ok: true };
  };

  const updateSettings = (updates: Partial<PlatformSettings>): ActionResult => {
    if (currentUser?.role !== 'admin') return { ok: false, error: 'Admin access required.' };
    setDb((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
    }));
    notify('success', 'Platform settings updated');
    return { ok: true };
  };

  const resetDemoDatabase = () => {
    localStorage.removeItem(DB_STORAGE_KEY);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setDb(refreshGroupLifecycleStatuses(INITIAL_SEED_DATA));
    setCurrentUserId(null);
    notify('info', 'Demo database reset to initial state');
  };

  return (
    <AppContext.Provider
      value={{
        db,
        currentUser,
        toasts,
        dismissToast,
        notify,
        login,
        register,
        logout,
        resetPasswordDemo,
        updateProfile,
        changePassword,
        createRequest,
        updateRequest,
        cancelRequest,
        adminUpdateRequestStatus,
        joinGroup,
        leaveGroup,
        adminCreateGroup,
        adminUpdateGroup,
        adminAddMemberToGroup,
        adminRemoveMemberFromGroup,
        adminDeleteGroup,
        addBrand,
        updateBrand,
        deleteBrand,
        addModel,
        updateModel,
        deleteModel,
        addVariant,
        updateVariant,
        deleteVariant,
        addDealer,
        updateDealer,
        deleteDealer,
        createOffer,
        updateOffer,
        publishOffer,
        deleteOffer,
        confirmPurchaseIntention,
        adminUpdatePurchaseStatus,
        adminToggleUserActive,
        adminUpdateUserRole,
        markNotificationRead,
        markAllNotificationsRead,
        submitContactMessage,
        updateSettings,
        resetDemoDatabase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
