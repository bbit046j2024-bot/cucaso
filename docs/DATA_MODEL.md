# CUCASO Platform Data Dictionary & Schema Reference

## 1. Overview
The CUCASO data model is defined in `prisma/schema.prisma` and hosted on TiDB / MySQL 8.0+.
All financial figures are stored as whole-shilling integers (`amountKes`, `finalFeeKes`, `totalBudgetKes`) to eliminate floating-point calculation errors.

---

## 2. Core Entities

### Chapter & Institution Domain
- **Institution**: Represents the host university, college, or polytechnic.
  - `id`: String (CUID)
  - `name`: String (e.g. "Technical University of Mombasa")
  - `type`: Enum (`UNIVERSITY`, `COLLEGE`, `SECONDARY`, `PRIMARY`, `OTHER`)
  - `sector`: Enum (`PUBLIC`, `PRIVATE`)
  - `location`, `county`: String
- **Chapter**: Represents the organized SDA student fellowship on campus.
  - `id`: String (CUID)
  - `code`: String (Unique, e.g. `TUM-01`, `PWANI-02`)
  - `name`: String
  - `tierId`: FK to `CapabilityTier`
  - `status`: Enum (`PENDING`, `APPROVED`, `SUSPENDED`, `INACTIVE`)
  - `approximateMembers`: Integer
  - `patronName`, `patronPhone`, `patronEmail`: String
- **CapabilityTier**:
  - `id`: String (PK, e.g. `TIER_1`, `TIER_2`, `TIER_3`, `TIER_4`)
  - `name`: String
  - `weightBasisPoints`: Int (200 = 2.0x, 150 = 1.5x, 100 = 1.0x, 50 = 0.5x)
  - `description`: String

### Rallies & Financial Engine
- **Rally**:
  - `id`: String (CUID)
  - `code`: String (Unique, e.g. `RAL-2026-MBO`)
  - `name`: String (e.g. "CUCASO 1st Quarter Spiritual Rally 2026")
  - `theme`: String
  - `startDate`, `endDate`: DateTime
  - `registrationDeadline`, `feeLockDate`, `paymentDeadline`: DateTime
  - `state`: Enum (`DRAFT`, `REGISTRATION_OPEN`, `FEES_LOCKED`, `PAYMENT_CLOSED`, `IN_PROGRESS`, `COMPLETED`, `ARCHIVED`)
  - `contingencyPercent`: Int (Default 10)
- **CostItem**:
  - `id`: String (CUID)
  - `rallyId`: FK to `Rally`
  - `category`: Enum (`VENUE`, `CATERING`, `TRANSPORT`, `SOUND`, `SECURITY`, `MISC`)
  - `type`: Enum (`FIXED`, `PER_HEAD`, `PER_VEHICLE`)
  - `amountKes`: Int (Integer KES)
  - `quantity`: Int (Default 1)
- **Participation**:
  - `id`: String (CUID)
  - `rallyId`, `chapterId`: FKs
  - `weightSnapshotBasisPoints`: Int (Frozen weight at fee lock)
  - `calculatedFeeKes`, `costToServeKes`, `crossSubsidyKes`: Int
  - `status`: Enum (`REGISTERED`, `CONFIRMED`, `WITHDRAWN`)
- **Invoice**:
  - `id`: String (CUID)
  - `invoiceNumber`: String (Unique, e.g. `INV-2026-TUM-01`)
  - `participationId`: FK to `Participation`
  - `totalDueKes`, `amountPaidKes`, `balanceKes`: Int
  - `status`: Enum (`UNPAID`, `PARTIAL`, `PAID`, `OVERDUE`, `OVERPAID`)
  - `dueDate`: DateTime
- **Payment**:
  - `id`: String (CUID)
  - `invoiceId`: FK to `Invoice`
  - `mpesaReceiptNumber`: String (Unique, e.g. `QDF728XN1P`)
  - `amountKes`: Int
  - `channel`: Enum (`MPESA_C2B`, `MPESA_STK`, `BANK_TRANSFER`, `CASH`)
  - `status`: Enum (`MATCHED`, `UNMATCHED`, `DISPUTED`, `REFUNDED`)
  - `transactionTime`: DateTime

### Attendees & Minor Compliance
- **Attendee**:
  - `id`: String (CUID)
  - `participationId`: FK to `Participation`
  - `fullName`: String
  - `admissionOrIdNumber`: String
  - `gender`: Enum (`MALE`, `FEMALE`)
  - `ageCategory`: Enum (`ADULT`, `UNDER_18`)
  - `phone`, `emergencyContactName`, `emergencyContactPhone`: String
  - `dietaryRequirements`: String
  - `status`: Enum (`CONFIRMED`, `PENDING_CONSENT`, `WAITLISTED`)
- **GuardianConsent**:
  - `id`: String (CUID)
  - `attendeeId`: FK to `Attendee` (Unique)
  - `guardianName`, `guardianPhone`, `relationship`: String
  - `consentGivenAt`: DateTime
  - `noticeVersion`: String

### Audit & Security
- **AuditLog**:
  - `id`: String (CUID)
  - `actorUserId`: FK to `User`
  - `action`: String (`LOGIN`, `VOTE`, `FEE_LOCK`, `PAYMENT_MATCH`, etc.)
  - `entityType`, `entityId`: String
  - `beforeJson`, `afterJson`: Text
  - `ipAddress`: String
  - `createdAt`: DateTime
