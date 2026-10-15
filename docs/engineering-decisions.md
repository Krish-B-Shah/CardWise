# Engineering decisions and guarantees

This document describes implemented choices. It does not claim production use,
measured performance improvements, bank integrations, or multi-user security.

## Atomic portfolio creation

A card and its configured demo base rule are a single logical write. The
`createCardWithDefaultRule` service uses a PostgreSQL data-modifying CTE: both
inserts succeed, or the statement is rolled back. It works through the same
query interface on PGlite and `pg.Pool`.

Why this choice: separate `pool.query('BEGIN')` and `pool.query(...)` calls do not
guarantee the same pooled connection. A single statement provides the required
guarantee here without a transaction framework. More complex workflows would
need a checked-out pool client and an explicit transaction boundary.

Evidence: the regression suite deliberately makes the dependent rule insert
violate a unique constraint, then verifies that no orphan card was saved.

## Contract validation at the boundary

`backend/src/contracts.ts` defines the supported categories, finite monetary
ranges, four-digit suffixes, bounded text, and accepted merchant URLs. Unknown
request fields are rejected. Inputs are validated before database writes.
These contracts describe configured cashback estimates, not issuer eligibility.
Spending caps remain unenforced metadata and are disclosed as such.

The browser clients still perform their own response checks. A single generated
contract package would reduce duplication later, but was deliberately deferred
to avoid a monorepo packaging change immediately before the demonstration.

## Errors that are safe and diagnosable

Every HTTP request receives a server-generated `X-Request-ID`. Errors include
the same ID, a stable code and a client-readable error string. Existing clients
remain compatible with the string field. Validation also returns field paths.
Malformed JSON and unknown routes use the same envelope.

Expected failures use 400/404/409/422; unexpected faults use a redacted 500.
Internal error logs contain an event, code and correlation ID, not request
bodies, card labels, credentials or raw SQL errors. These logs are local console
output, not an external monitoring integration.

## Readiness and persistence

`GET /api/health` performs `SELECT 1`. A reachable database returns 200; a failed
query returns 503. This is readiness at request time, not proof of every feature
or a substitute for operational monitoring.

The compiled smoke checks exercise HTTP endpoints. The disk check additionally
updates a fixture in temporary storage, shuts down cleanly, restarts and verifies
the persisted value. The interview launcher uses a separate explicit dataset;
it does not conceal failure by resetting or recovering the original database.

## Query indexes

The schema creates indexes for active user portfolios, card-rule lookups,
user/date transaction reads and recent recommendation ordering. Their existence
is tested. No latency or scalability improvement is claimed without measurement.
Indexes consume storage and add write cost; these match known access patterns.

## Explain the trade-offs in the interview

- Why should card creation be atomic, and how is rollback tested?
- Why is a connection-pool transaction different from sequential SQL calls?
- How can a user report a failed request without exposing database internals?
- Why does a process being alive not mean its database is ready?
- Why test a restart on real disk when in-memory tests already pass?
- What would change for authentication, tenant isolation and issuer-accurate rules?

The project remains a local single-user prototype. Authentication, tenant-safe
ownership checks, period-based cap accounting and financial reconciliation are
still future work. These improvements strengthen narrow, demonstrable guarantees
rather than changing that scope.
