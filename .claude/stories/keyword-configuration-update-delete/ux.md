# UX Design Outline

Feature: Edit and Delete Existing Keyword Filter Rules
Card: keyword-configuration-update-delete

---

## 1. Screen / Component Breakdown

Only the keyword rules panel and its modal are affected. No new routes are introduced.

```
AnalysisPanel
└── KeywordRulesSection           (existing — wiring already complete)
    ├── section header + "+ Add Rule" button
    ├── KeywordRuleList            (existing — needs touch-target fix + tooltip)
    │   └── rule row (repeated)
    │       ├── type badge
    │       ├── description (truncated)
    │       ├── pattern (truncated, monospace)
    │       ├── edit button ✎      (existing — needs min 44×44 touch target on mobile)
    │       └── delete button ×    (existing — needs min 44×44 touch target on mobile)
    └── KeywordConfigModal         (existing — title + submit label already switch on isEdit)
        ├── modal header ("Edit Keyword Rule" | "Add Keyword Rule")
        ├── × close button
        ├── ModalForm (keyed by rule.id | "new")
        │   ├── KeywordTypeSelector (pre-filled in edit mode)
        │   ├── description input  (pre-filled in edit mode)
        │   ├── pattern input      (pre-filled in edit mode)
        │   └── PatternVerifyBlock
        └── modal footer
            ├── Cancel button
            └── "Update Rule" | "Save Rule" button
```

No new components are required. All changes are fixes and augmentations to existing components.

---

## 2. Interaction Flow

### 2a. Edit a Rule

1. User views the Keyword Rules section in the Analysis Panel.
2. User moves focus (Tab or pointer) to the ✎ edit button on a rule row.
   — On hover: button background shifts to blue-tint (#e8f4fd), icon colour shifts to #1a6fa8. A tooltip "Edit" appears after 300 ms.
3. User clicks (or presses Enter/Space on focused button).
4. `KeywordRulesSection.handleOpenEdit(rule)` fires: sets `editingRule = rule`, sets `modalOpen = true`.
5. `KeywordConfigModal` renders with `initialRule` set. `ModalForm` is keyed by `rule.id` so state initialises fresh from the rule's current values.
6. Modal animates in (existing fadeIn + slideIn). Title reads "Edit Keyword Rule". All three fields are pre-populated. Submit button reads "Update Rule".
7. Focus is placed on the Cancel button (existing `cancelRef` behaviour).
8. User modifies one or more fields.
   — Pattern field: live regex syntax validation fires on every keystroke (existing `handlePatternChange`).
9. User clicks "Update Rule".
   — Validation: all three fields must be non-empty and pattern must be valid regex. If any fail, inline errors appear (`role="alert"`) and the modal stays open.
   — On success: `onSave(rule)` is called with the existing `rule.id`. `KeywordRulesSection.handleSave` detects `editingRule !== null` and calls `updateRule(rule)` (not `addRule`). Modal closes. Rule list reflects updated values immediately via Zustand reactivity.
10. User sees the updated rule row in the list. No duplicate row appears.

### 2b. Cancel / Dismiss Edit

At step 8 or 9 (before submit), user can:
- Click "Cancel" — calls `onClose`, modal closes, original rule unchanged.
- Click × close button — same as Cancel.
- Press Escape — existing `keydown` listener fires `onClose`.
- Click the overlay backdrop — existing `onClick` on overlay fires `onClose`.

Original rule remains in the list with its prior values.

### 2c. Delete a Rule

1. User moves focus (Tab or pointer) to the × delete button on a rule row.
   — On hover: button background shifts to red-tint (#fef2f2), icon colour shifts to #dc2626.
2. User clicks (or presses Enter/Space on focused button).
3. `removeRule(rule.id)` fires immediately (Zustand). No confirmation dialog.
4. Rule row disappears from the list. Zustand state update causes any highlighted log lines that matched this rule's pattern to un-highlight reactively.
5. If it was the last rule: empty-state paragraph "No keyword rules yet. Add one to start highlighting log lines." is shown.

---

## 3. Key UI States

### KeywordRuleList

| State | Visual |
|-------|--------|
| Empty | Single paragraph: "No keyword rules yet. Add one to start highlighting log lines." Muted colour, 12px. |
| Populated | Vertical list of rule rows. Each row: badge + description + pattern + ✎ + ×. |
| Rule row — default | Neutral icon colours (#bbb). |
| Rule row — edit button hover/focus | Icon #1a6fa8, background #e8f4fd. Tooltip "Edit" visible. |
| Rule row — delete button hover/focus | Icon #dc2626, background #fef2f2. |
| Rule row — mobile (< 768px) | Row wraps to two lines if content exceeds viewport, or action buttons maintain min 44×44px tap targets (see Section 6). |

### KeywordConfigModal (edit mode)

| State | Visual |
|-------|--------|
| Closed | Not rendered (returns null). |
| Opening | fadeIn overlay + slideIn modal panel (150 ms, existing). |
| Open — edit mode (clean) | Title "Edit Keyword Rule". All fields pre-populated. Submit reads "Update Rule". |
| Open — validation error | Fields with errors show red border + red inline message with `role="alert"`. Modal stays open. |
| Open — invalid regex (live) | Pattern input red border + inline "Invalid regex: …" message as user types. Submit is not blocked yet (only on submit attempt). |
| Closing | Modal removed from DOM. Focus should return to the ✎ edit button that triggered the open (see Section 5). |

---

## 4. Component Inventory

| Component | File | Change Type | What to Add / Fix |
|-----------|------|-------------|-------------------|
| `KeywordRuleList` | `app/_components/KeywordRuleList/KeywordRuleList.tsx` | **Rewrite** | Replace `<ul>/<li>` with Ant Design `<Select mode="multiple" open={false}>`. Use `tagRender` to render each rule as a colored tag. Tag label click → `onEdit(rule)`. Tag × click → `removeRule(rule.id)`. Use `placeholder` for empty state. |
| `KeywordRuleList.module.css` | `app/_components/KeywordRuleList/KeywordRuleList.module.css` | **Rewrite** | Replace row/badge/button styles with tag styles: `.tag` (base), `.tagLabel` (clickable part, cursor pointer), `.tagDot` (type color dot). Remove `.editBtn`, `.deleteBtn`, `.item`, `.list`. |
| `KeywordRuleList.test.tsx` | `app/_components/KeywordRuleList/__tests__/KeywordRuleList.test.tsx` | Augment | Add tests: (1) each rule renders as a tag with description text; (2) clicking tag label calls `onEdit` with the correct rule; (3) clicking tag × calls `removeRule` with the correct id. |
| `KeywordConfigModal` | `app/_components/KeywordConfigModal/KeywordConfigModal.tsx` | No change | Logic already complete. |
| `KeywordRulesSection` | `app/_components/AnalysisPanel/KeywordRulesSection.tsx` | No change | Wiring already complete. |
| `e2e/keyword-configuration.spec.ts` | `e2e/keyword-configuration.spec.ts` | Augment | Add `test.describe("update and delete")` covering edit happy path, cancel-edit, validation error on edit, delete single rule, delete last rule (empty state / placeholder visible). |

**Key Ant Design Select props:**
```tsx
<Select
  mode="multiple"
  open={false}           // never show dropdown
  value={rules.map(r => r.id)}
  options={rules.map(r => ({ value: r.id, label: r.description }))}
  tagRender={(props) => <KeywordRuleTag rule={...} onEdit={onEdit} onDelete={removeRule} />}
  onChange={(ids) => {
    const removed = rules.find(r => !ids.includes(r.id));
    if (removed) removeRule(removed.id);
  }}
  placeholder="No keyword rules yet. Add one to start highlighting."
  suffixIcon={null}
  className={styles.select}
/>
```

---

## 5. Layout Sketch

### Rule List — Tag Display (Ant Design Select, populated)

Rules are rendered inside an Ant Design `Select` component with `mode="multiple"` and `open={false}` (dropdown never opens). Each rule renders as a custom tag via `tagRender`. The Select acts purely as a tag container — no text input, no dropdown.

```
┌──────────────────────────────────────────────────────────────────┐
│ Keyword Rules                                      [+ Add Rule]  │
├──────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────────┐   │
│ │ [● error  Crash log  ×]  [● warn  Slow render  ×]         │   │
│ │ [● info   App start  ×]                                   │   │
│ └────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘

Legend:
  [● error  Crash log  ×]
   ↑         ↑          ↑
   type      description  × = calls removeRule(id) on click
   color dot              clicking description opens edit modal
```

Tag anatomy (single tag):

```
┌────────────────────────────────┐
│ ●  error · Crash log        ×  │
│ ↑  ←── type ──→ ←── desc ──→  │
│ colour dot (KEYWORD_TYPE_COLORS)│
└────────────────────────────────┘

Hover on tag label  → cursor pointer, subtle background lighten
Click on tag label  → opens KeywordConfigModal in edit mode
Click on ×          → removeRule(rule.id), event.stopPropagation()
```

### Rule List — Tag Display (empty state)

```
┌──────────────────────────────────────────────────────────────────┐
│ Keyword Rules                                      [+ Add Rule]  │
├──────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────────┐   │
│ │  No keyword rules yet. Add one to start highlighting.      │   │
│ └────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

The `placeholder` prop on `Select` shows this text when `value` is empty.

### Modal — Edit Mode (Clean)

```
┌────────────────────────────────────────────────────────────────┐
│ Edit Keyword Rule                                          [×]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Type  *                                                       │
│  ○ error  ○ warn  ○ info  ○ core  ● (pre-selected)            │
│                                                                │
│  Description  *                                               │
│  ┌──────────────────────────────────────────────────────┐     │
│  │ Crash log                                            │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                │
│  Filter Pattern  *                                             │
│  ┌──────────────────────────────────────────────────────┐     │
│  │ /FATAL/                           (monospace font)   │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                │
│  Pattern Verify                                                │
│  ┌──────────────────────────────────────────────────────┐     │
│  │ [PatternVerifyBlock live preview]                    │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                     [Cancel]  [Update Rule]    │
└────────────────────────────────────────────────────────────────┘

"Update Rule" = dark filled button (primary)
"Cancel"      = outline button (secondary)
```

### Modal — Edit Mode (Validation Error)

```
┌────────────────────────────────────────────────────────────────┐
│ Edit Keyword Rule                                          [×]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Type  *                                                       │
│  ○ error  ○ warn  ○ info  ○ core  (none selected)             │
│  ⚠ Please select a keyword type.              ← role="alert"  │
│                                                                │
│  Description  *                                               │
│  ┌────────────────────────────────────────────────────┐       │
│  │                                       (red border) │       │
│  └────────────────────────────────────────────────────┘       │
│  ⚠ Description is required.                  ← role="alert"  │
│                                                                │
│  Filter Pattern  *                                             │
│  ┌────────────────────────────────────────────────────┐       │
│  │                                       (red border) │       │
│  └────────────────────────────────────────────────────┘       │
│  ⚠ Filter pattern is required.               ← role="alert"  │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                     [Cancel]  [Update Rule]    │
└────────────────────────────────────────────────────────────────┘
```

---

## 6. Responsive Behaviour

### Desktop (> 1024px) — primary target

Rule row: single horizontal line. Badge + description (max-width 80px, ellipsis) + pattern (flex-grow) + ✎ (20×20) + × (20×20). No wrapping needed.

Modal: max-width 640px, centred in viewport with 24px padding on all sides.

### Tablet (768–1024px)

Rule row: same single-line layout. Padding reduced slightly. Modal stays centred, constrained by 24px overlay padding.

### Mobile (< 768px)

Rule row: `.editBtn` and `.deleteBtn` hit targets must expand to at least 44×44px via the mobile media query (negative margin trick or explicit padding to keep visual size small but tap zone large). The row flex container must not clip these buttons — verify `overflow: visible` or add `flex-shrink: 0` (already present) and ensure the panel itself does not have `overflow: hidden` that cuts off the row ends.

Pattern text can truncate more aggressively (min-width: 0 already set).

Modal: full-width within the 24px overlay padding. At 375px the modal is ~327px wide. All inputs remain 100% width. Footer buttons remain on one row (combined width fits comfortably).

---

## 7. Accessibility Notes

### KeywordRuleList

- Edit button: `aria-label="Edit rule: {description}"` — already present. Ensure this label is updated if description changes (it re-renders from rule prop, so this is automatic).
- Delete button: `aria-label="Delete rule: {description}"` — already present.
- After delete: focus currently stays at the position of the removed button. If the deleted rule was not the last, focus will land on the next rule's delete button (natural DOM order). If it was the last rule, focus lands on the empty-state paragraph — that element should be focusable (`tabIndex={-1}`) and receive programmatic focus after deletion to announce the empty state via screen readers.
- Consider an `aria-live="polite"` region wrapping the rule list so screen readers announce when a rule is added, updated, or removed without requiring manual focus management.

### KeywordConfigModal

- `role="dialog"` and `aria-modal="true"` — already present.
- `aria-labelledby="keyword-config-modal-title"` — already present. Title text changes to "Edit Keyword Rule" in edit mode — this is the dialog's accessible name.
- Focus on open: currently lands on Cancel button via `cancelRef`. Acceptable; alternative is to focus the modal container or the first field. Cancel is safe to avoid accidental submit.
- Focus on close: must return to the ✎ edit button that triggered the open. `KeywordRulesSection` should hold a `triggerRef` pointing to the last-clicked edit button and call `triggerRef.current?.focus()` in `handleClose`.
- Escape to close: already implemented.
- Tab cycle: Type selector radio buttons → Description input → Pattern input → Pattern Verify (if interactive) → Cancel → Update Rule → wraps to Type selector. Shift+Tab reverses.
- Inline errors: `role="alert"` already present on each `fieldError` paragraph — screen reader will announce them on insertion.
- Keyboard activation of radio buttons in KeywordTypeSelector: Enter and Space must activate the focused radio option.

---

## 8. CSS Module Class Skeleton

No new CSS modules are needed. The only CSS change is an addition to the existing rule list module.

```css
/* KeywordRuleList.module.css — additions only */

.editBtn        { /* existing — no change needed for desktop */ }
.deleteBtn      { /* existing — no change needed for desktop */ }

/* NEW: mobile touch-target expansion */
.editBtnMobile  { }   /* applied via @media (max-width: 767px) on .editBtn */
.deleteBtnMobile { }  /* applied via @media (max-width: 767px) on .deleteBtn */

/* OPTIONAL: tooltip anchor if a CSS-only tooltip is used */
.actionTooltip  { }
```

If a Tooltip component (e.g. Ant Design `Tooltip`) is used instead of a CSS tooltip, no new CSS class is needed — just wrap the edit button element.

---

## 9. Hand-Off Notes

### Files to modify

| File | Change |
|------|--------|
| `app/_components/KeywordRuleList/KeywordRuleList.tsx` | Rewrite: replace `<ul>/<li>` with Ant Design `Select mode="multiple"` + `tagRender`. |
| `app/_components/KeywordRuleList/KeywordRuleList.module.css` | Rewrite: replace row/button styles with tag styles (`.tag`, `.tagLabel`, `.tagDot`). |
| `app/_components/KeywordRuleList/__tests__/KeywordRuleList.test.tsx` | Add unit tests for tag rendering, tag label click → `onEdit`, tag × → `removeRule`. |
| `e2e/keyword-configuration.spec.ts` | Add `test.describe("update and delete")` covering all edit and delete scenarios. |

### Files confirmed as no-change

| File | Reason |
|------|--------|
| `app/_components/KeywordConfigModal/KeywordConfigModal.tsx` | Edit-mode logic complete: title, submit label, field pre-fill, `updateRule` dispatch, keyed `ModalForm`. |
| `app/stores/keywordStore.ts` | `updateRule` and `removeRule` already implemented. |
| `app/types/keyword.ts` | No new type fields required. |

### Zustand store slices

None required. `updateRule(rule: KeywordRule)` and `removeRule(id: string)` are already present.

### Server actions

None required. All state is client-side in Zustand.

### Suggested next step

Invoke the web-dev-agent with the `keyword-configuration-update-delete` card to implement the touch-target fix, tooltip, focus-return behaviour, and the missing test cases.
