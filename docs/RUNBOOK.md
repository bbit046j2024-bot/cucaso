# CUCASO Operational Runbook & Incident Response

## 1. Routine Maintenance & Operations

### Database Backups (Daily at 02:00 EAT)
```bash
# Automated mysqldump script
mysqldump -u cucaso_user -p cucaso --single-transaction --quick --lock-tables=false | gzip > /backups/cucaso_$(date +%F_%T).sql.gz

# Verify backup integrity
gunzip < /backups/cucaso_latest.sql.gz | head -n 30
```

### Database Restore Drill
```bash
# Create staging test database
mysql -u root -p -e "CREATE DATABASE cucaso_restore_test;"
gunzip < /backups/cucaso_latest.sql.gz | mysql -u root -p cucaso_restore_test
# Verify row counts match production
mysql -u root -p -e "SELECT count(*) FROM cucaso_restore_test.Chapter;"
```

---

## 2. Common Operational Incidents & Triage

### Incident 1: M-Pesa Payment Unmatched / Student Typo
- **Symptom**: Chapter treasurer reports paying via Paybill, but invoice remains `UNPAID`.
- **Diagnosis**: Student entered an incorrect account reference (e.g. `TUM-99` instead of `TUM-01`).
- **Resolution**:
  1. Central Treasurer opens **Unmatched Transactions Queue** in `/portal`.
  2. Locate payment by `mpesaReceiptNumber` or student phone number.
  3. Verify against bank statement or Daraja portal.
  4. Select **Match to Chapter** -> select the target chapter and invoice.
  5. The platform updates invoice balance and records an audit log entry.

### Incident 2: Officer Transition & Handover at Term End
- **Symptom**: New executive officers elected; previous officers still have administrative logins.
- **Resolution**:
  1. Super Admin navigates to `/portal` -> **User Management**.
  2. Select departing officer, click **Deactivate Account** (invalidates active sessions).
  3. Create new officer profile with verified email and official position.
  4. Send one-time onboarding link requiring password setup and mandatory TOTP 2FA enrollment.

### Incident 3: System Health Check Degraded
- **Endpoint**: `/api/health`
- **Actions**:
  - `database: DOWN`: Check MySQL service (`systemctl status mysql`) or connection pool settings in `.env`.
  - `disk: FULL`: Check `/backups` and old Docker log files (`docker system prune`).
