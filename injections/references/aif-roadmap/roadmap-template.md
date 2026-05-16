# ROADMAP Template

Create `.ai-factory/ROADMAP.md` with this structure:

```markdown
# Project Roadmap

## Summary

[1-2 paragraphs: overall project health, key strengths, critical gaps]

---

## GitHub Milestone Phase Audit

**Milestone evidence:** [used/unavailable/partial]

### Phase: [Milestone title]

**Milestone:** [#number if available, open/closed, open_issues/closed_issues, closed date if closed]

**Local evidence status:** [done/partial/missing, based on repository artifacts]

**Linked GitHub evidence:**
- [Issue/PR/milestone link or "not available"]

**Phase audit:**
- [Closed milestone audit summary, or open milestone progress/drift summary]

**Drift:**
- [phase-completion drift, local evidence gap, stale GitHub linkage, or "none found"]

### Unphased backlog/drift

- [Unmilestoned issue/PR link, local evidence status, and required action]

---

## Slice: Launch / Runtime

**Status:** [done/partial/missing]

**Evidence:**
- [File or pattern found]

**GitHub evidence:** [optional milestone/issue/PR links or "not available"]

**Commentary:**
- [Assessment]

**Next Steps:**
- [ ] [Actionable task]

---

[... repeat for all 11 slices ...]

---

## Strategic Priorities

1. [Priority 1 with rationale]
2. [Priority 2 with rationale]
3. [Priority 3 with rationale]

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| [Risk description] | [High/Medium/Low] | [How to address] |

## Suggested Planning Order

1. [First area to focus on]
2. [Second area]
3. [Third area]

---

*Last updated: [DATE]*
*Analyzed slices: 11*
```

## Update Rules

- Preserve valid manual notes when updating an existing roadmap.
- In check mode, mention slices whose status changed and explain why.
- Make next steps concrete enough to become implementation tasks later.
- GitHub evidence may include milestones, issues, PRs, labels, linked branches, and current git tree state when available.
- Treat GitHub milestones as roadmap phases when milestone evidence is available.
- Closed milestones produce phase audit sections with linked issues/PRs and local evidence status.
- Open milestones with `open_issues = 0` produce `phase-completion drift`; do not present them as closed phases.
- Milestone-bound issues/PRs attach to their phase; unmilestoned issues/PRs remain in `unphased backlog/drift`.
- GitHub links are optional; do not require them for every roadmap entry.
- local artifact evidence remains required for `done` status decisions.
- Do not include tokens, authorization headers, raw credential helper output, or private authentication diagnostics.
