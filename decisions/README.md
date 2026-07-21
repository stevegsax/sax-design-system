# Design decisions (ADRs)

Any change to the style system — a token, a pattern, a standard — is
proposed here **before** it is implemented, and the record stays here
permanently.

## Process

1. **File.** The requesting agent (usually the `sax-designer` skill running
   in a product repo) opens a PR adding `decisions/YYYY-MM-DD-<slug>.md`
   with `status: Proposed`, following the template in
   `.claude/skills/sax-designer/adr-template.md`. Agents without push access
   file a GitHub issue with the same content instead. The requester styles
   the gap provisionally in its mockup and moves on — it does not wait.
2. **Review.** A design review in this repository accepts or rejects the
   proposal by editing the ADR's `status`. Date-prefixed filenames keep
   concurrent filings from colliding.
3. **Implement.** An accepted ADR is implemented via the "Extending the
   system" checklist in `CLAUDE.md`, shipped as a release, and its status
   updated to `Accepted (vX.Y.Z)`. Product repos then bump their pin and
   replace the provisional styling that referenced the ADR.
4. **Record.** ADRs are never deleted. A rejected ADR keeps
   `status: Rejected`; a later reversal files a new ADR and marks the old
   one `Superseded by <file>`.

## Statuses

- `Proposed` — awaiting design review.
- `Accepted (vX.Y.Z)` — implemented and released in that version.
- `Rejected` — declined; kept as a record.
- `Superseded by <file>` — replaced by a later decision.
