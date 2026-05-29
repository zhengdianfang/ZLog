import { test, expect, type Page } from "@playwright/test";
import path from "path";

const FIXTURE_PATH = path.join(__dirname, "fixtures", "sample.log");

// ---------------------------------------------------------------------------
// The sample.log fixture has lines timestamped 08:00:01–08:00:15 on 2024-01-15.
// Time inputs are HH:MM:SS (step=1).
//
// Ranges that produce matches:
//   MATCH_START / MATCH_END   → 08:00:05–08:00:07  (3 lines: L5, L6, L7)
//   SECOND_START / SECOND_END → 08:00:01–08:00:03  (3 lines: L1, L2, L3)
//
// Range that produces NO match:
//   NO_MATCH_START / NO_MATCH_END → 09:00:00–09:00:59 (no fixture lines)
// ---------------------------------------------------------------------------

const MATCH_START = "08:00:05";
const MATCH_END = "08:00:07";
const MATCH_COUNT = 3;

const SECOND_START = "08:00:01";
const SECOND_END = "08:00:03";
const SECOND_COUNT = 3;

const NO_MATCH_START = "09:00:00";
const NO_MATCH_END = "09:00:59";

const FIXTURE_NAME = "sample.log";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function loadFixture(page: Page) {
  await page.setInputFiles('input[type="file"]', FIXTURE_PATH);
  await expect(page.locator('[class*="logLine"]').first()).toBeVisible({ timeout: 10_000 });
}

/**
 * Fill in the time range inputs and click Apply.
 *
 * The TimeRangeFilter component is rendered in TWO places:
 *   1. Inside the LogViewer (main region)
 *   2. Inside the AnalysisPanel sidebar (complementary region)
 *
 * All selectors are scoped to `main` to avoid strict-mode ambiguity.
 */
async function applyTimeFilter(page: Page, start: string, end: string) {
  const main = page.getByRole("main");
  await main.getByLabel("Start").fill(start);
  await main.getByLabel("End").fill(end);
  await main.getByRole("button", { name: "Apply" }).click();
}

/**
 * Return the expected tab label for a time-filter tab.
 * Matches the format built in handleTimeFilterApply:
 *   "${filename} [${start}–${end}]"  (en dash U+2013)
 */
function timeFilterTabLabel(start: string, end: string) {
  return `${FIXTURE_NAME} [${start}–${end}]`;
}

/**
 * Locate a time-filter tab button scoped to the tablist.
 * Scoping prevents false matches against the results-pane header which also
 * contains the same label text.
 */
function timeFilterTab(page: Page, start: string, end: string) {
  return page
    .getByRole("tablist", { name: "Log view tabs" })
    .getByRole("tab", { name: new RegExp(escapeRegex(timeFilterTabLabel(start, end))) });
}

/**
 * Locate the "Log" tab scoped to the tablist to avoid ambiguity.
 * exact: true prevents partial-text matching against time-filter tab labels
 * that contain the word "Log" (e.g. "sample.log [...]").
 */
function logTab(page: Page) {
  return page
    .getByRole("tablist", { name: "Log view tabs" })
    .getByRole("tab", { name: "Log", exact: true });
}

/**
 * Locate the close button for a time-filter tab.
 * aria-label = "Close {label} time filter tab"
 */
function closeTimeFilterTab(page: Page, start: string, end: string) {
  const label = timeFilterTabLabel(start, end);
  return page.getByRole("button", {
    name: new RegExp(`Close ${escapeRegex(label)} time filter tab`),
  });
}

/**
 * Return the no-match warning alert emitted by LogViewer.
 * Next.js also renders a <div role="alert"> route-announcer, so we filter by
 * text content to select only the LogViewer warning.
 */
function noMatchWarning(page: Page) {
  return page
    .getByRole("alert")
    .filter({ hasText: /No log entries match the selected time range/i });
}

/**
 * Return the validation error alert emitted by TimeRangeFilter (start > end).
 */
function validationAlert(page: Page) {
  return page
    .getByRole("alert")
    .filter({ hasText: /start time must be before end time/i });
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe("TimeFilter — open filtered results in new tab", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await loadFixture(page);
  });

  // -------------------------------------------------------------------------
  // AC1: Apply with ≥1 match → new tab appears, labelled correctly, is active
  // -------------------------------------------------------------------------

  test("golden path: Apply with matches opens a new tab in the tab bar", async ({ page }) => {
    await applyTimeFilter(page, MATCH_START, MATCH_END);

    await expect(timeFilterTab(page, MATCH_START, MATCH_END)).toBeVisible();
  });

  test("golden path: new time-filter tab label is 'filename [start–end]'", async ({ page }) => {
    await applyTimeFilter(page, MATCH_START, MATCH_END);

    const expectedLabel = timeFilterTabLabel(MATCH_START, MATCH_END);
    await expect(timeFilterTab(page, MATCH_START, MATCH_END)).toContainText(expectedLabel);
  });

  test("golden path: new time-filter tab becomes the active tab", async ({ page }) => {
    await applyTimeFilter(page, MATCH_START, MATCH_END);

    await expect(timeFilterTab(page, MATCH_START, MATCH_END)).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("golden path: active time-filter tab shows correct match count in tab", async ({ page }) => {
    await applyTimeFilter(page, MATCH_START, MATCH_END);

    const tab = timeFilterTab(page, MATCH_START, MATCH_END);
    await expect(tab).toContainText(String(MATCH_COUNT));
  });

  // -------------------------------------------------------------------------
  // AC2: Apply with 0 matches → no new tab; inline warning shown
  // -------------------------------------------------------------------------

  test("no-match: no new tab is created when range matches zero lines", async ({ page }) => {
    await applyTimeFilter(page, NO_MATCH_START, NO_MATCH_END);

    // Only the original Log tab should exist in the tablist.
    const tabs = page.getByRole("tablist", { name: "Log view tabs" }).getByRole("tab");
    await expect(tabs).toHaveCount(1);
  });

  test("no-match: warning banner is shown when range matches zero lines", async ({ page }) => {
    await applyTimeFilter(page, NO_MATCH_START, NO_MATCH_END);

    await expect(noMatchWarning(page)).toBeVisible();
  });

  test("no-match: warning banner text mentions the time range mismatch", async ({ page }) => {
    await applyTimeFilter(page, NO_MATCH_START, NO_MATCH_END);

    await expect(noMatchWarning(page)).toContainText(
      /No log entries match the selected time range/i,
    );
  });

  // -------------------------------------------------------------------------
  // AC3: Warning clears when user edits a time input after the no-match warning
  // -------------------------------------------------------------------------

  test("warning clears when the Start input is edited after a no-match", async ({ page }) => {
    await applyTimeFilter(page, NO_MATCH_START, NO_MATCH_END);
    await expect(noMatchWarning(page)).toBeVisible();

    // Edit the start input — warning should disappear immediately.
    await page.getByRole("main").getByLabel("Start").fill("08:00:01");

    await expect(noMatchWarning(page)).not.toBeVisible();
  });

  test("warning clears when the End input is edited after a no-match", async ({ page }) => {
    await applyTimeFilter(page, NO_MATCH_START, NO_MATCH_END);
    await expect(noMatchWarning(page)).toBeVisible();

    await page.getByRole("main").getByLabel("End").fill("08:00:15");

    await expect(noMatchWarning(page)).not.toBeVisible();
  });

  // -------------------------------------------------------------------------
  // AC4: Original Log tab remains unchanged after applying a filter
  // -------------------------------------------------------------------------

  test("original Log tab is still present after opening a time-filter tab", async ({ page }) => {
    await applyTimeFilter(page, MATCH_START, MATCH_END);

    await expect(logTab(page)).toBeVisible();
  });

  test("original Log tab shows all lines when switched back after filter", async ({ page }) => {
    await applyTimeFilter(page, MATCH_START, MATCH_END);

    // Switch back to Log tab.
    await logTab(page).click();

    // All 15 fixture lines must be present.
    await expect(page.locator('[class*="logLine"]')).toHaveCount(15);
  });

  test("Log tab remains non-mutated — aria-controls still points to panel-log", async ({
    page,
  }) => {
    await applyTimeFilter(page, MATCH_START, MATCH_END);

    await expect(logTab(page)).toHaveAttribute("aria-controls", "panel-log");
  });

  // -------------------------------------------------------------------------
  // AC5: Closing a time-filter tab removes it and restores previous active tab
  // -------------------------------------------------------------------------

  test("closing the only time-filter tab removes it from the tab bar", async ({ page }) => {
    await applyTimeFilter(page, MATCH_START, MATCH_END);

    await closeTimeFilterTab(page, MATCH_START, MATCH_END).click();

    await expect(timeFilterTab(page, MATCH_START, MATCH_END)).not.toBeAttached();
  });

  test("closing the only time-filter tab makes the Log tab active again", async ({ page }) => {
    await applyTimeFilter(page, MATCH_START, MATCH_END);
    await closeTimeFilterTab(page, MATCH_START, MATCH_END).click();

    await expect(logTab(page)).toHaveAttribute("aria-selected", "true");
  });

  test("closing a non-active time-filter tab leaves the active tab unchanged", async ({ page }) => {
    // Open two time-filter tabs: first SECOND range, then MATCH range (MATCH is now active).
    await applyTimeFilter(page, SECOND_START, SECOND_END);
    await applyTimeFilter(page, MATCH_START, MATCH_END);

    // MATCH tab is active.
    await expect(timeFilterTab(page, MATCH_START, MATCH_END)).toHaveAttribute(
      "aria-selected",
      "true",
    );

    // Close the non-active SECOND tab.
    await closeTimeFilterTab(page, SECOND_START, SECOND_END).click();

    // MATCH tab must still be active.
    await expect(timeFilterTab(page, MATCH_START, MATCH_END)).toHaveAttribute(
      "aria-selected",
      "true",
    );
    // SECOND tab must be gone.
    await expect(timeFilterTab(page, SECOND_START, SECOND_END)).not.toBeAttached();
  });

  // -------------------------------------------------------------------------
  // AC6: Multiple Apply clicks open multiple independent tabs
  // -------------------------------------------------------------------------

  test("multiple Apply clicks open multiple independent time-filter tabs", async ({ page }) => {
    await applyTimeFilter(page, MATCH_START, MATCH_END);
    await applyTimeFilter(page, SECOND_START, SECOND_END);

    // Both tabs must be visible simultaneously.
    await expect(timeFilterTab(page, MATCH_START, MATCH_END)).toBeVisible();
    await expect(timeFilterTab(page, SECOND_START, SECOND_END)).toBeVisible();
  });

  test("second Apply click makes the new tab active; first tab is inactive", async ({ page }) => {
    await applyTimeFilter(page, MATCH_START, MATCH_END);
    await applyTimeFilter(page, SECOND_START, SECOND_END);

    await expect(timeFilterTab(page, SECOND_START, SECOND_END)).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(timeFilterTab(page, MATCH_START, MATCH_END)).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  test("each independent tab shows its own isolated match count", async ({ page }) => {
    await applyTimeFilter(page, MATCH_START, MATCH_END);
    await applyTimeFilter(page, SECOND_START, SECOND_END);

    // The SECOND tab is active — check its count badge.
    await expect(timeFilterTab(page, SECOND_START, SECOND_END)).toContainText(
      String(SECOND_COUNT),
    );

    // Switch to the MATCH tab and check its count.
    await timeFilterTab(page, MATCH_START, MATCH_END).click();
    await expect(timeFilterTab(page, MATCH_START, MATCH_END)).toContainText(String(MATCH_COUNT));
  });

  test("same range applied twice opens two independent tabs", async ({ page }) => {
    await applyTimeFilter(page, MATCH_START, MATCH_END);
    await applyTimeFilter(page, MATCH_START, MATCH_END);

    // Both tabs share the same label — there must be 2 of them inside the tablist.
    const tablist = page.getByRole("tablist", { name: "Log view tabs" });
    const matchingTabs = tablist.getByRole("tab", {
      name: new RegExp(escapeRegex(timeFilterTabLabel(MATCH_START, MATCH_END))),
    });
    await expect(matchingTabs).toHaveCount(2);
  });

  // -------------------------------------------------------------------------
  // AC7: Apply button is disabled when no file is loaded
  // -------------------------------------------------------------------------

  test("Apply button is not present when no file is loaded", async ({ page }) => {
    await page.goto("/");
    // No file loaded — LogViewer is not rendered, so no Apply button in main.
    await expect(page.getByRole("main").getByRole("button", { name: "Apply" })).not.toBeAttached();
  });

  test("Apply button is disabled when both time inputs are empty", async ({ page }) => {
    // File is loaded but both inputs are empty (default state).
    await expect(page.getByRole("main").getByRole("button", { name: "Apply" })).toBeDisabled();
  });

  test("Apply button is enabled once a time value is entered", async ({ page }) => {
    await page.getByRole("main").getByLabel("Start").fill(MATCH_START);

    await expect(page.getByRole("main").getByRole("button", { name: "Apply" })).toBeEnabled();
  });

  // -------------------------------------------------------------------------
  // AC8: SearchResultsPane header reads "filename [start–end] · N lines matched"
  // -------------------------------------------------------------------------

  test("results pane header shows 'filename [start–end] · N lines matched'", async ({ page }) => {
    await applyTimeFilter(page, MATCH_START, MATCH_END);

    const expectedLabel = timeFilterTabLabel(MATCH_START, MATCH_END);
    // The pane header contains the label text and the count; scope to pane to avoid
    // matching the tab label in the tab bar.
    const pane = page.locator('[role="tabpanel"]');
    await expect(pane.getByText(new RegExp(escapeRegex(expectedLabel)))).toBeVisible();
    await expect(pane.getByText(new RegExp(`${MATCH_COUNT}.*lines matched`))).toBeVisible();
  });

  test("results pane header does NOT say 'Results for:' for time-filter tabs", async ({ page }) => {
    await applyTimeFilter(page, MATCH_START, MATCH_END);

    // Time-filter pane uses a different header format (no "Results for:" prefix).
    await expect(page.getByText(/Results for:/)).not.toBeVisible();
  });

  test("results pane shows the matched log lines", async ({ page }) => {
    await applyTimeFilter(page, MATCH_START, MATCH_END);

    await expect(page.locator('[class*="logLine"]')).toHaveCount(MATCH_COUNT);
  });

  test("switching between time-filter tabs updates the results pane header", async ({ page }) => {
    await applyTimeFilter(page, MATCH_START, MATCH_END);
    await applyTimeFilter(page, SECOND_START, SECOND_END);

    const pane = page.locator('[role="tabpanel"]');
    const secondLabel = timeFilterTabLabel(SECOND_START, SECOND_END);
    // SECOND is active — pane header should contain SECOND label.
    await expect(pane.getByText(new RegExp(escapeRegex(secondLabel)))).toBeVisible();

    // Switch to MATCH tab — pane header should update to MATCH label.
    await timeFilterTab(page, MATCH_START, MATCH_END).click();
    const matchLabel = timeFilterTabLabel(MATCH_START, MATCH_END);
    await expect(pane.getByText(new RegExp(escapeRegex(matchLabel)))).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Validation — start > end order error
  // -------------------------------------------------------------------------

  test("validation: setting Start after End shows an inline error and no new tab", async ({
    page,
  }) => {
    // Start is after End — invalid range.
    await applyTimeFilter(page, "08:00:10", "08:00:05");

    // An error should be shown from TimeRangeFilter's local validation.
    await expect(validationAlert(page)).toBeVisible();
    await expect(validationAlert(page)).toContainText(/start time must be before end time/i);

    // No extra tab should have been created.
    const tabs = page.getByRole("tablist", { name: "Log view tabs" }).getByRole("tab");
    await expect(tabs).toHaveCount(1);
  });

  // -------------------------------------------------------------------------
  // Accessibility
  // -------------------------------------------------------------------------

  test("accessibility: time-filter tab has role=tab", async ({ page }) => {
    await applyTimeFilter(page, MATCH_START, MATCH_END);

    await expect(timeFilterTab(page, MATCH_START, MATCH_END)).toHaveAttribute("role", "tab");
  });

  test("accessibility: time-filter tab close button has descriptive aria-label", async ({
    page,
  }) => {
    await applyTimeFilter(page, MATCH_START, MATCH_END);

    const expectedAriaLabel = `Close ${timeFilterTabLabel(MATCH_START, MATCH_END)} time filter tab`;
    await expect(page.getByRole("button", { name: expectedAriaLabel })).toBeVisible();
  });

  test("accessibility: no-match warning has role=alert", async ({ page }) => {
    await applyTimeFilter(page, NO_MATCH_START, NO_MATCH_END);

    await expect(noMatchWarning(page)).toBeVisible();
    await expect(noMatchWarning(page)).toHaveAttribute("role", "alert");
  });

  test("accessibility: Start and End inputs are labelled and visible", async ({ page }) => {
    const main = page.getByRole("main");

    await expect(main.getByLabel("Start")).toBeVisible();
    await expect(main.getByLabel("End")).toBeVisible();
  });

  test("accessibility: tablist has aria-label 'Log view tabs'", async ({ page }) => {
    await expect(page.getByRole("tablist", { name: "Log view tabs" })).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Responsive
  // -------------------------------------------------------------------------

  test("responsive mobile (375px): Apply button and time inputs are visible after file load", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const main = page.getByRole("main");
    await expect(main.getByLabel("Start")).toBeVisible();
    await expect(main.getByLabel("End")).toBeVisible();
    await expect(main.getByRole("button", { name: "Apply" })).toBeVisible();
  });

  test("responsive mobile (375px): time-filter tab appears after Apply", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await applyTimeFilter(page, MATCH_START, MATCH_END);

    await expect(timeFilterTab(page, MATCH_START, MATCH_END)).toBeVisible();
  });

  test("responsive tablet (768px): time-filter tab appears after Apply", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await applyTimeFilter(page, MATCH_START, MATCH_END);

    await expect(timeFilterTab(page, MATCH_START, MATCH_END)).toBeVisible();
  });

  test("responsive desktop (1280px): time-filter tab appears after Apply", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await applyTimeFilter(page, MATCH_START, MATCH_END);

    await expect(timeFilterTab(page, MATCH_START, MATCH_END)).toBeVisible();
  });
});
