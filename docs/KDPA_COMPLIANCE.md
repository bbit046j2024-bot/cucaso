# Kenya Data Protection Act (KDPA, 2019) Compliance & Legal Notes

## 1. Statutory Context
The **Kenya Data Protection Act, 2019** regulates the collection, processing, and storage of personal data belonging to individuals in Kenya. The CUCASO platform operates as both a **Data Controller** (determining purposes of youth rally coordination) and a **Data Processor** (storing student details).

---

## 2. Key Compliance Implementations

### Consent & Lawful Basis (§30)
- Explicit, unbundled opt-in consent checkboxes are present across all registration, onboarding, and contact forms.
- The platform logs consent timestamp, IP address, user agent, and privacy policy version.

### Protection of Children & Minors (§33)
- Attendees under 18 years must have an associated `GuardianConsent` record before their registration can be confirmed.
- Institutional patrons (teachers, chaplains) serve as verified chaperones.

### Storage Limitation & Retention Schedule (§34)
- **Sensitive Attendee Data**: Dietary requirements, national IDs, and emergency contact numbers are purged/anonymized 90 days following rally completion.
- **Financial Records**: Chapter invoices, payment receipts, and audit logs are retained for 7 years to comply with financial accounting and auditing regulations.

### Data Subject Rights (§26)
- **Right of Access & Portability**: Self-service export tools allow students or chapter representatives to download personal records.
- **Right to Rectification & Erasure**: Users can request correction or deletion through `/contact` or dedicated DPA endpoints.

---

## 3. Recommended Action for CUCASO Leadership
1. **ODPC Registration**: Formally register CUCASO with the Office of the Data Protection Commissioner (ODPC) via [https://odpc.go.ke](https://odpc.go.ke).
2. **Appoint Data Protection Officer (DPO)**: Appoint the CUCASO Secretary or a legal liaison as the designated internal privacy officer.
