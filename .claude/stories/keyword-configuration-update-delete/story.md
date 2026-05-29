# [keyword-configuration-update-delete] Edit and delete existing keyword filter rules

---

## Story 1: Edit an Existing Keyword Rule

As a mobile developer
So I want to open an existing keyword rule in the configuration modal and modify its fields
In order to correct or refine a rule without having to delete it and recreate it from scratch

Scenario: Developer edits an existing keyword rule
  Given a keyword rule exists in the rule list (e.g. type "error", description "Crash log", pattern "/FATAL/")
  When the developer clicks the edit button (✎) on that rule row
  Then the keyword configuration modal opens in edit mode
  And the modal title reads "Edit Keyword Rule"
  And the type, description, and pattern fields are pre-populated with the rule's current values
  When the developer changes one or more fields and clicks "Update Rule"
  Then the modal closes
  And the rule list reflects the updated values immediately without a page reload
  And no duplicate or orphaned rule remains in the list

Scenario: Developer cancels an edit
  Given the keyword configuration modal is open in edit mode with pre-populated fields
  When the developer clicks "Cancel" or the × close button or presses Escape
  Then the modal closes
  And the original rule values remain unchanged in the rule list

Scenario: Developer submits an edit with invalid fields
  Given the keyword configuration modal is open in edit mode
  When the developer clears a required field (type, description, or pattern) and clicks "Update Rule"
  Then inline validation errors are shown for each empty required field
  And the modal stays open
  And the rule list is not modified

Notes:
- The store already exposes `updateRule(rule: KeywordRule)` in `keywordStore.ts` — the UI must call this, not `addRule`, when `initialRule` is provided.
- The modal form resets to the `initialRule` values each time it opens for a given rule (keyed by `initialRule.id`).
- The edit button has `aria-label="Edit rule: <description>"` — use this label in tests.
- The "Update Rule" button label must differ from "Save Rule" (used for add) to avoid UI ambiguity.
- Disabled when no log file is loaded: No — the keyword rule panel is always accessible.

---

## Story 2: Delete an Existing Keyword Rule

As a mobile developer
So I want to remove a keyword rule I no longer need from the rule list
In order to keep the configuration clean and avoid false highlights cluttering the log view

Scenario: Developer deletes a keyword rule
  Given one or more keyword rules exist in the rule list
  When the developer clicks the delete button (×) on a rule row
  Then that rule is removed from the list immediately without a confirmation dialog or page reload
  And if the deleted rule was the last one, the empty-state message is shown

Scenario: Deleting a rule removes its highlights from the log view
  Given a keyword rule exists and log lines matching its pattern are currently highlighted
  When the developer deletes that rule
  Then the matching log lines are no longer highlighted

Notes:
- The store already exposes `removeRule(id: string)` in `keywordStore.ts`.
- The delete button has `aria-label="Delete rule: <description>"` — use this label in tests.
- No confirmation dialog is required for deletion (immediate removal on click).
- The log highlight update is reactive via Zustand state — no explicit action required beyond calling `removeRule`.

---

## Acceptance Criteria

### Edit
1. Clicking the edit (✎) button on a rule row opens the keyword configuration modal in edit mode.
2. The modal title reads "Edit Keyword Rule" (not "Add Keyword Rule").
3. The type selector, description input, and pattern input are pre-filled with the selected rule's existing values.
4. Submitting valid changes calls `updateRule` and replaces the old rule in the list without adding a duplicate.
5. The updated rule appears in the list immediately (no page reload).
6. Clicking Cancel / × / Escape while editing leaves the original rule unchanged.
7. Submitting the edit form with a missing required field shows inline errors and keeps the modal open.
8. The submit button is labelled "Update Rule" in edit mode and "Save Rule" in add mode.
9. The modal form is fully keyboard-accessible in edit mode (Tab cycles through all fields; Enter activates type radio buttons).

### Delete
10. Clicking the delete (×) button on a rule row removes exactly that rule from the list immediately.
11. Removing the last rule shows the empty-state message "No keyword rules yet…".
12. After deletion, log lines that were highlighted by the deleted rule's pattern are no longer highlighted.
13. The delete button carries `aria-label="Delete rule: <description>"` for screen-reader accessibility.

---

## Notes

- The store (`keywordStore.ts`) already implements both `updateRule` and `removeRule` — no store changes are needed.
- The `KeywordConfigModal` component already accepts `initialRule?: KeywordRule` and renders the correct title and button label.
- The `KeywordRuleList` component already renders edit and delete buttons per row and receives an `onEdit` prop.
- The `KeywordRulesSection` component already wires `handleOpenEdit` → `setEditingRule` → modal open, and `handleSave` dispatches `updateRule` when `editingRule` is set.
- **Gap:** The e2e spec (`e2e/keyword-configuration.spec.ts`) has no test cases covering the edit (update) flow. A new `test.describe` block for "update and delete" must be added.
- **Gap:** `KeywordRuleList.test.tsx` does not test that the edit button calls `onEdit` with the correct rule — this unit test is missing.
- Related files:
  - `app/stores/keywordStore.ts`
  - `app/types/keyword.ts`
  - `app/_components/KeywordConfigModal/KeywordConfigModal.tsx`
  - `app/_components/KeywordRuleList/KeywordRuleList.tsx`
  - `app/_components/AnalysisPanel/KeywordRulesSection.tsx`
  - `e2e/keyword-configuration.spec.ts`
  - `app/_components/KeywordRuleList/__tests__/KeywordRuleList.test.tsx`
  - `app/_components/KeywordConfigModal/__tests__/KeywordConfigModal.test.tsx`

---

## UX Hints

- Edit (✎) and delete (×) buttons are already present in `KeywordRuleList` — verify they have sufficient touch target size (minimum 44×44px on mobile).
- The edit button icon (✎) may not be universally recognisable; consider a text label or tooltip on hover ("Edit").
- On narrow viewports (375px), the rule row must not clip the action buttons — check that the row wraps or scrolls gracefully.
- The "Update Rule" / "Save Rule" button label change is the primary visual cue distinguishing add vs. edit mode — ensure the label is prominent.
- No confirmation dialog for delete is intentional (per story); if future usability feedback suggests accidental deletions are common, an undo toast can be added in a later story.

---

## Out of Scope

Bulk delete, drag-to-reorder rules, or persisting rules to a backend/local storage across sessions.
