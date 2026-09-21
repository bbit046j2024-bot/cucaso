# ADR-001: Use TiDB Cloud (MySQL-compatible) as Primary Database

## Status
**Accepted** — September 21, 2026

## Context
The CUCASO Platform was initially scaffolded by the development team using **TiDB Cloud**, a managed MySQL-compatible distributed SQL database by PingCAP. The Prisma schema already targets `provider = "mysql"` with `relationMode = "prisma"` (required for TiDB because foreign key constraints are handled at the ORM layer, not enforced at the database engine layer in TiDB). Credentials are configured in `.env` and the Prisma client is already operational.

The architectural brief specified PostgreSQL with `pg-boss` for background jobs, `@vercel/postgres`, and PostgreSQL-native constraints. However, TiDB Cloud is already provisioned, connected, and battle-tested in the existing codebase.

## Decision
We adopt **TiDB Cloud (MySQL-compatible)** as the primary database for CUCASO. This means:

1. **Prisma** remains the ORM; the schema uses `provider = "mysql"` with `relationMode = "prisma"`.
2. **Foreign key cascade enforcement** is handled by Prisma middleware, not the database engine.
3. **Background jobs** use an HTTP/REST-based queue approach or `pg-boss` replaced by a MySQL-backed equivalent (e.g., custom `JobQueue` table polled by a cron-style Next.js route, or Trigger.dev for managed queues).
4. **Monetary values**: `Float` fields storing KES amounts in the current schema will be migrated to `Int` (storing amounts as integer KES cents, 1 KES = 1 unit) — i.e., KES 660,000 is stored as `660000`. This eliminates float precision drift. 
5. **Tier weights**: Currently stored as `Float`. Will be changed to `Decimal(5,2)` in a migration to eliminate float drift in fee calculations while maintaining MySQL compatibility.
6. **UUID IDs**: TiDB Cloud natively supports `CUID` (used by Prisma's `@default(cuid())`). No change needed.
7. **TiDB-specific features used**: MySQL 8.x compatible dialect, TiDB's built-in replication ensures high availability.

## Consequences

### Positive
- No database provisioning overhead — TiDB Cloud is already live.
- Horizontal scalability provided out of the box by TiDB's distributed architecture.
- Managed backups, TLS, and connection pooling via TiDB Cloud.
- `relationMode = "prisma"` is supported and documented for TiDB.

### Negative / Mitigations
- **No native CHECK constraints on MySQL < 8.0.16**: TiDB supports CHECK constraints (since 5.2.x). We add them with `@db.Check` annotations where Prisma supports them (partial).
- **No `pg-boss`**: We implement a lightweight `background_job` table with a `pg-boss`-like contract (status, attempts, payload, scheduled_at, dead_letter) polled via a dedicated Next.js API route `/api/queue/worker`.
- **No PostgreSQL-native enums at DB level**: MySQL/TiDB `ENUM` is used; Prisma handles this transparently.
- **`relationMode = "prisma"` means no DB-level cascade deletes**: All cascades handled in application code / Prisma's `onDelete` middleware.

## Alternatives Considered
- **PostgreSQL on Railway/Neon**: Would require full re-provisioning and data migration.
- **PlanetScale (MySQL)**: Similar to TiDB Cloud but without TiDB's distributed transaction semantics. Ruled out given TiDB is already provisioned.
- **SQLite (local dev)**: Not suitable for shared staging and production.

## References
- TiDB Cloud Prisma Integration: https://docs.pingcap.com/tidbcloud/dev-guide-build-tidb-app-with-prisma
- Prisma MySQL docs: https://www.prisma.io/docs/concepts/database-connectors/mysql
