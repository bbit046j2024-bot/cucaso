export type InstitutionType = 'UNIVERSITY' | 'COLLEGE' | 'SECONDARY' | 'PRIMARY' | 'OTHER';
export type InstitutionSector = 'PUBLIC' | 'PRIVATE';
export type ChapterStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
export type ApplicationStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED' | 'REJECTED';

export type UserRole = 
  | 'SUPER_ADMIN'
  | 'COUNCIL_MEMBER'
  | 'CENTRAL_TREASURER'
  | 'SECRETARY'
  | 'COMMUNICATIONS_DIRECTOR'
  | 'CHAPLAIN'
  | 'CHAPTER_REP'
  | 'CHAPTER_TREASURER'
  | 'OBSERVER';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  roleTitle?: string;
  chapterId?: string;
  chapterName?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  totpEnabled?: boolean;
  twoFactorEnabled?: boolean;
  lastActive?: string;
  avatarUrl?: string;
}

export interface CapabilityTier {
  id: string;
  name: string; // e.g. 'Tier 1', 'Tier 2', 'Tier 3', 'Tier 4'
  weight: number; // e.g. 2.0, 1.5, 1.0, 0.5
  description?: string;
}

export interface Chapter {
  id: string;
  code: string; // Unique e.g. "TUM-01"
  institutionName: string;
  chapterName: string;
  type: InstitutionType;
  sector: InstitutionSector;
  location: string;
  status: ChapterStatus;
  tierId: string;
  patronName?: string;
  patronPhone?: string;
  patronEmail?: string;
  patronPhoto?: string;
  repName?: string;
  repPhone?: string;
  repPhoto?: string;
  treasurerName?: string;
  treasurerPhone?: string;
  treasurerPhoto?: string;
  secretaryName?: string;
  secretaryPhone?: string;
  secretaryPhoto?: string;
  approximateMembers: number;
  attendeesCount?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  mapPosition?: {
    top: number; // percentage 0-100%
    left: number; // percentage 0-100%
  };
  logoUrl?: string;
  createdAt: string;
}

export interface CoastalAreaPreset {
  id: string;
  name: string;
  county: string;
  lat: number;
  lng: number;
  top: number;
  left: number;
}

export interface Rally {
  id: string;
  code: string; // e.g. "CUR-2026"
  title: string;
  theme: string;
  venueName: string;
  venueLocation: string;
  capacity: number;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  paymentDeadline: string;
  feeLockDate: string;
  state: 'DRAFT' | 'REGISTRATION_OPEN' | 'FEES_LOCKED' | 'PAYMENT_CLOSED' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
  allocationMode: 'CAPABILITY_WEIGHTED' | 'EQUAL' | 'HEADCOUNT_WEIGHTED' | 'BASE_PLUS_PER_HEAD';
  contingencyPercent: number;
}

export interface CostItem {
  id: string;
  rallyId: string;
  category: 'VENUE' | 'CATERING' | 'ACCOMMODATION' | 'TRANSPORT' | 'LOGISTICS' | 'OTHER';
  name: string;
  type: 'FIXED' | 'PER_HEAD' | 'PER_VEHICLE';
  amount: number; // in KES
  quantity?: number;
  notes?: string;
}

export interface RallyChapterParticipation {
  rallyId: string;
  chapterId: string;
  weightSnapshot: number;
  attendeeCount: number;
  calculatedFee: number;
  costToServe: number;
  crossSubsidy: number;
}

export interface FeeAdjustment {
  id: string;
  rallyId: string;
  chapterId: string;
  type: 'FIXED_FEE' | 'PARTIAL_SUBSIDY' | 'FULL_WAIVER';
  amount: number;
  reason: string;
  approvedBy: string;
  fundingTreatment: 'REDISTRIBUTE_REMAINING' | 'EXTERNAL_SPONSOR';
}

export interface Attendee {
  id: string;
  rallyId: string;
  chapterId: string;
  fullName: string;
  admissionOrIdNumber: string;
  department?: string;
  gender: 'MALE' | 'FEMALE';
  ageCategory: 'UNDER_18' | 'ADULT';
  phone?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  dietaryRequirements?: string;
  accommodationNeeded: boolean;
  transportNeeded: boolean;
  role: 'DELEGATE' | 'LEADER' | 'PATRON';
  status: 'CONFIRMED' | 'PENDING_CONSENT' | 'WAITLISTED';
  registrationDate: string;
  registrationSource?: 'ADMIN' | 'SELF_LINK';
  guardianConsent?: {
    guardianName: string;
    guardianPhone: string;
    consentGiven: boolean;
    consentDate: string;
  };
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  rallyId: string;
  chapterId: string;
  institutionName: string;
  amountDue: number; // KES
  amountPaid: number; // KES
  balance: number; // KES
  paymentReference: string; // e.g. "CUCASO-TUM-2026"
  dueDate: string;
  status: 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'OVERPAID';
}

export interface Payment {
  id: string;
  invoiceId: string;
  chapterId: string;
  reference: string;
  amount: number;
  method: 'MPESA_DARAJA' | 'BANK_TRANSFER' | 'CASH';
  mpesaReceiptNumber?: string;
  payerName?: string;
  payerPhone?: string;
  status: 'MATCHED' | 'UNMATCHED' | 'VERIFYING';
  timestamp: string;
}

export interface BudgetSummary {
  totalFixedCosts: number;
  totalPerHeadCosts: number;
  totalVehicleCosts: number;
  subtotal: number;
  contingencyAmount: number;
  totalBudget: number;
  totalAttendees: number;
  perHeadCostToServe: number;
  sufficiencyStatus: 'FUNDED' | 'ON_TRACK' | 'SHORTFALL';
  collectedAmount: number;
  outstandingAmount: number;
  fundingGap: number;
}

export interface ExecutiveLeader {
  id: string;
  positionNumber?: number;
  title: string;
  name: string;
  institution?: string;
  credentials?: string;
  image?: string;
  imageUrl?: string;
  bio?: string;
  contact?: string;
  phone?: string;
  email?: string;
  role?: string;
  category?: "CENTRAL_COUNCIL" | "OTHER" | string;
  status?: string;
}

export interface InstitutionalHead {
  id: string;
  institution: string;
  headName: string;
  roleTitle: string; // Vice Chancellor, Principal, Chief Chaplain
}

export interface ChapterApplication {
  id: string;
  institutionName: string;
  chapterName: string;
  type: InstitutionType;
  sector: InstitutionSector;
  location: string;
  patronName: string;
  patronPhone: string;
  patronEmail: string;
  chairpersonName: string;
  chairpersonPhone: string;
  chairpersonEmail: string;
  treasurerName: string;
  treasurerPhone: string;
  secretaryName?: string;
  approxMembers?: number;
  approximateMembers?: number;
  endorsementDocument: string;
  status: ApplicationStatus;
  assignedTier?: string;
  submittedAt: string;
  notes?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  details: string;
  status: 'SUCCESS' | 'WARNING' | 'CRITICAL';
}
