# Research

> Exploration results persisted by aif-explore, consumed by aif-new

Updated: {{date}}
Status: active | archived

## Active Summary (input for /aif-new)

<!-- aif:active-summary:start -->
**Topic:**
<!-- What is being explored -->

**Goal:**
<!-- What we want to achieve -->

**Constraints:**
<!-- Known limitations or requirements -->

**Decisions:**
<!-- Decisions made during exploration -->

**Open Questions:**
<!-- Questions that remain unanswered -->

**Success Signals:**
<!-- How we'll know the solution works -->

**Next Step:**
<!-- Recommended next action -->
<!-- aif:active-summary:end -->

## Sessions

<!-- aif:sessions:start -->
### {{date}} — {{session_title}}

**What changed:**
<!-- Key changes in understanding -->

**Key notes:**
<!-- Important findings, diagrams, code snippets -->

**Links:**
<!-- Files read, docs referenced -->
- `path/to/file`

---
<!-- aif:sessions:end -->

## Archived Summaries

<!-- Completed explorations that led to plans -->

### {{archived_date}} — {{plan_id}}

**Outcome:** Created plan `.ai-factory/plans/{{plan_id}}/`

**Summary:** Brief description of what was explored and decided.

---

## Usage

This file is:
- **Written by:** `aif-explore` during exploration sessions
- **Read by:** `aif-new` when creating plans
- **Format:** Keep sections intact, update Active Summary when exploring

When running `aif-new`:
1. Active Summary is imported into plan artifacts
2. Relevant Sessions may be copied to `explore.md`
3. User is asked whether to archive after plan creation
