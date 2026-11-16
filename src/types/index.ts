export type UserRole = 'user' | 'admin';

export type FuelType = 'Petrol' | 'Diesel' | 'CNG' | 'Electric' | 'Hybrid';

export type TransmissionType = 'Manual' | 'Automatic' | 'IVT' | 'DCT' | 'AMT';

export type PurchaseTimeline =
  | 'Immediate (Within 15 Days)'
  | 'Within 30 Days'
  | '1 - 2 Months'
  | '2 - 3 Months';

export type RequestStatus =
  | 'Pending Match'
  | 'Matched to Group'
  | 'Negotiating'
  | 'Offer Received'
  | 'Purchase Confirmed'
  | 'Cancelled';

export type GroupStatus =
  | 'Collecting Buyers'
  | 'Ready for Negotiation'
  | 'Negotiating'
  | 'Offer Received'
  | 'Deal Completed'
  | 'Expired';

export type OfferStatus = 'Draft' | 'Published' | 'Expired';

export type PurchaseStatus =
  | 'Intention Confirmed'
  | 'Dealer Assigned'
  | 'Booking Paid'
  | 'Vehicle Allocated'
  | 'Delivered'
  | 'Cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  role: UserRole;
  isActive: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  createdAt: string;
}

export interface CarBrand {
  id: string;
  name: string;
  country: string;
  description: string;
  isActive: boolean;
}

export interface CarVariant {
  id: string;
  modelId: string;
  name: string;
  fuelType: FuelType;
  transmission: TransmissionType;
  exShowroomPrice: number;
  engineSpec: string;
  mileage: string;
  keyFeatures: string[];
}

export interface CarModel {
  id: string;
  brandId: string;
  name: string;
  bodyType: string;
  seatingCapacity: number;
  imageKey: string;
  description: string;
  popularColors: string[];
  isFeatured: boolean;
  variants: CarVariant[];
}

export interface CarRequest {
  id: string;
  userId: string;
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
  status: RequestStatus;
  groupId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GroupMember {
  userId: string;
  requestId: string | null;
  joinedAt: string;
  city: string;
  preferredColor: string;
}

export interface BuyingGroup {
  id: string;
  code: string;
  title: string;
  brandId: string;
  modelId: string;
  variantId: string;
  city: string;
  fuelType: FuelType;
  transmission: TransmissionType;
  timeline: PurchaseTimeline;
  targetBuyers: number;
  members: GroupMember[];
  status: GroupStatus;
  createdAt: string;
  expiresAt: string;
  negotiationNotes: string;
}

export interface Dealer {
  id: string;
  name: string;
  city: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  brandIds: string[];
  modelIds: string[];
  isVerified: boolean;
  createdAt: string;
}

export interface DealerOffer {
  id: string;
  groupId: string;
  dealerId: string;
  exShowroomPrice: number;
  rtoCharges: number;
  insuranceAmount: number;
  accessoriesCost: number;
  groupDiscount: number;
  additionalCharges: number;
  finalOnRoadPrice: number;
  validUntil: string;
  termsAndConditions: string;
  isSampleQuotation: boolean;
  status: OfferStatus;
  createdAt: string;
  publishedAt: string | null;
}

export interface PurchaseRecord {
  id: string;
  userId: string;
  groupId: string;
  offerId: string;
  dealerId: string;
  modelId: string;
  variantId: string;
  agreedOnRoadPrice: number;
  status: PurchaseStatus;
  dealerReferenceCode: string;
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string; // 'admin' or specific user id
  title: string;
  message: string;
  type: 'group' | 'offer' | 'purchase' | 'system';
  isRead: boolean;
  linkTo: string;
  createdAt: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  detail: string;
  createdAt: string;
}

export interface PlatformSettings {
  defaultGroupTarget: number;
  defaultGroupExpiryDays: number;
  allowAutoGroupCreation: boolean;
  requireEmailVerificationDemo: boolean;
  supportEmail: string;
  supportPhone: string;
  maintenanceNotice: string;
}

export interface AppDatabase {
  users: User[];
  brands: CarBrand[];
  models: CarModel[];
  requests: CarRequest[];
  groups: BuyingGroup[];
  dealers: Dealer[];
  offers: DealerOffer[];
  purchases: PurchaseRecord[];
  notifications: NotificationItem[];
  contacts: ContactSubmission[];
  activities: ActivityLog[];
  settings: PlatformSettings;
}
