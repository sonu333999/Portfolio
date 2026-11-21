# Security Specification & Invariants

## 1. Data Invariants
1. **Verified Admin Ownership**: Only an authenticated user whose Google token has `email == "sonukhajotiya01@gmail.com"` AND `email_verified == true` may mutate portfolio `profile`, `projects`, `achievements`, `skills`, or read/manage private `inquiries`.
2. **Draft Isolation**: Unauthenticated visitors and non-admin users may only `get` or `list` `projects` and `achievements` where `status == "published"`.
3. **PII Isolation on Inquiries**: Visitor contact inquiries (`senderName`, `senderEmail`, `message`) may be created by visitors with strictly validated schema, `status == "unread"`, and server timestamps (`request.time`), and can NEVER be read, listed, updated, or deleted by non-admin users.
4. **Path Variable & Payload Boundaries**: Every document ID matches `^[a-zA-Z0-9_\-]+$` (`<= 128` chars), every string enforces explicit `.size()` bounds matching `firebase-blueprint.json`, and every write enforces exact key sets (`hasAll` + `hasOnly` on create, `affectedKeys().hasOnly(...)` on update).
5. **Temporal Integrity**: `createdAt` and `updatedAt` must equal `request.time`, and `createdAt` is immutable on updates.

## 2. Adversarial Payloads ("Dirty Dozen")
1. **Unverified Admin Email Spoof**: Auth token `{ email: "sonukhajotiya01@gmail.com", email_verified: false }` attempts write to `/profile/main` -> `PERMISSION_DENIED`.
2. **Draft Leak via List**: Unauthenticated client runs `list` on `/projects` without filtering `status == "published"` -> `PERMISSION_DENIED`.
3. **Shadow Field Injection on Project Create**: Admin or attacker adds `isVerified: true` to `/projects/p1` -> `PERMISSION_DENIED`.
4. **Path ID Poisoning**: Request targets `/projects/` + 200-char string with `/` or `$` -> `PERMISSION_DENIED`.
5. **Oversized String Exhaustion**: Inquiry `message` exceeds 2500 chars -> `PERMISSION_DENIED`.
6. **PII Scrape Attempt**: Non-admin signed-in user attempts `get` or `list` on `/inquiries` -> `PERMISSION_DENIED`.
7. **Status Forgery on Inquiry Create**: Visitor submits inquiry with `status: "read"` -> `PERMISSION_DENIED`.
8. **Backdated Timestamp Forgery**: Visitor submits inquiry with client-supplied past `createdAt` instead of `request.time` -> `PERMISSION_DENIED`.
9. **Immutable Timestamp Mutation**: Update attempts to change `createdAt` on an existing `projects` or `inquiries` doc -> `PERMISSION_DENIED`.
10. **Array Type Poisoning**: Project `techStack` contains `> 12` elements or non-string first element `[123]` -> `PERMISSION_DENIED`.
11. **Invalid Slug Pattern**: Project `slug` contains uppercase or spaces (`"My Project!"`) -> `PERMISSION_DENIED`.
12. **Non-Admin Skill Creation**: Authenticated visitor (different email) attempts `create` on `/skills/s1` -> `PERMISSION_DENIED`.
