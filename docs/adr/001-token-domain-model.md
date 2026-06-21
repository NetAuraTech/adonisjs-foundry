---
status: accepted
date: 2026-06-21
context:
  - Tokens are consumed from varied contexts (listeners, model hooks, auth services)
  - Routing every verification through a repository adds unnecessary indirection
  - A token must be verifiable as a self-contained object
---

## Context

The project follows a domain-driven architecture with a strict Service / Repository separation: repositories encapsulate data access, services orchestrate business logic. Each model is expected to be "anemic" — carrying only relations and Lucid hooks.

The `Token` model (`app/models/core/token.ts`) deviates from this rule. It exposes static methods that combine query building, hash verification (selector/validator pattern), and relation loading:

- `getPasswordResetUser(token)`
- `getEmailVerificationUser(token)`
- `getEmailChangeUser(token)`
- `getUserInvitationToken(token)`
- `expirePasswordResetTokens(user)`, `expireEmailVerificationTokens(user)`, etc.

A `TokenRepository` exists in parallel and re-implements part of this logic through public methods (`getPasswordResetUser`, `getEmailChangeUser`, `verifyPasswordResetToken`).

## Decision

The Token model retains its static methods as the primary entry point for token verification. The repository serves as an abstraction layer for generic CRUD operations and cases where the caller operates in a context that should not depend directly on the model.

### Rationale

1. **Multi-source consumption**: Tokens are resolved from listeners (`send_forgot_password_email.ts`), auth services (`PasswordService`, `EmailVerificationService`, `InvitationService`), and potentially middleware. Each context needs to verify a token without necessarily wanting to compose with a repository.

2. **Model autonomy**: A token is an object that must be verifiable on its own — the selector/validator logic plus hash verification is intrinsic to the token's nature, not an external CRUD operation.

3. **Unnecessary indirection**: Forcing every token verification through `TokenRepository` would add a layer without added value when the operation is already a single DB round-trip.

### Conventions

- The repository remains the source of truth for CRUD operations (`findById`, `create`, `deleteInvitationTokens`).
- Static methods on the model are preferred for verification (resolve user from token).
- When adding a new token type, verification logic goes in the model; management operations (creation, bulk expiration) go in the repository.

## Consequences

- **Positive**: Tokens remain verifiable from any context without DI dependencies. The selector/validator pattern stays encapsulated and consistent.
- **Negative**: Slight overlap between model and repository for user-resolution-by-token methods. The repository must stay in sync with the model's logic when the verification protocol evolves.
