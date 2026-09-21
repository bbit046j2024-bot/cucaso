# ADR-005: Kenya Data Protection Act (KDPA 2019) Compliance, Minor Consent & Data Retention

## Status
Accepted

## Context
Under the Kenya Data Protection Act (KDPA) 2019, organizations handling personal identifiable information (PII) of Kenyan citizens must establish lawful basis, protect children's data, provide data subject rights, and enforce data minimization. CUCASO collects student data, emergency contacts, medical/dietary restrictions, and includes secondary school students who may be minors (under 18 years of age).

## Decision
1. **Lawful Basis & Consent Recording**:
   - Explicit, unbundled consent checkboxes are implemented across attendee registration, chapter application, and media intake forms.
   - The platform records `consentGiven: true`, `consentTimestamp`, `ipAddress`, and `noticeVersion`.
2. **Minor Protection Policy (§33 KDPA)**:
   - Attendees flagged as `ageCategory: UNDER_18` cannot be confirmed without a verified `GuardianConsent` record containing guardian name, guardian phone number, and relationship.
   - High school and secondary delegates are registered under their institutional patron who acts as the authorized chaperone.
3. **Automated 90-Day PII Purging Schedule**:
   - In accordance with the principle of storage limitation, sensitive attendee logistics data (dietary requirements, national ID/admission numbers, emergency contacts) are scheduled for redaction/anonymization 90 days following rally completion.
   - Aggregate statistics (total attendees per chapter, financial contributions) are preserved indefinitely for institutional memory and historical reporting.
4. **Data Subject Rights**:
   - Self-service endpoints for Data Subject Access Requests (DSAR export) and Right to Erasure (deletion) are provisioned.
5. **Organizational Governance**:
   - The platform includes drafted registration documents for CUCASO to register with the Office of the Data Protection Commissioner (ODPC) as a Data Controller / Processor.

## Consequences
- Protects CUCASO leadership from statutory penalties under the KDPA.
- Protects vulnerable young students and minors attending youth rallies.
