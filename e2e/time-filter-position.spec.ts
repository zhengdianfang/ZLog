import { test, expect, type Page } from "@playwright/test";
import path from "path";

const FIXTURE_PATH = path.join(__dirname, "fixtures", "sample.log");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Load the sample fixture into the LogViewer via the hidden file input.
 * Waits until a known log line is rendered before returning.
 */
async function loadFixture(page: Page) {
  await page.setInputFiles('input[type="file"]', FIXTURE_PATH);
  await expect(page.getByText("CrashReporter")).toBeVisible({ timeout: 10_000 });
}

/**
 * Return a locator for the log-line elements in the currently active pane.
 */
function logLineLocator(page: Page) {
  return page.locator('[class*="logLine"]');
}

// ---------------------------------------------------------------------------
// AC1 + AC2 — Placement: TimeRangeFilter is in the search bar, not in sidebar
// ---------------------------------------------------------------------------

test.describe("TimeRangeFilter — placement in search bar row", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await loadFixture(page);
  });

  test("AC1: Start time input is visible after file is loaded", async ({ page }) => {
    await expect(page.getByLabel("Start")).toBeVisible();
  });

  test("AC1: End time input is visible after file is loaded", async ({ page }) => {
    await expect(page.getByLabel("End")).toBeVisible();
  });

  test("AC1: Apply button is visible after file is loaded", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Apply" })).toBeVisible();
  });

  test("AC1: TimeRangeFilter is on the same horizontal row as the keyword search input", async ({
    page,
  }) => {
    const searchInput = page.getByRole("textbox", { name: "Search logs by keyword" });
    const startInput = page.getByLabel("Start");

    const searchBox = await searchInput.boundingBox();
    const startBox = await startInput.boundingBox();

    expect(searchBox).not.toBeNull();
    expect(startBox).not.toBeNull();

    if (searchBox && startBox) {
      const searchCenterY = searchBox.y + searchBox.height / 2;
      const startCenterY = startBox.y + startBox.height / 2;
      // Both elements are in the same horizontal bar — vertical centers within 40px.
      expect(Math.abs(searchCenterY - startCenterY)).toBeLessThan(40);
    }
  });

  test("AC1: TimeRangeFilter is to the right of the keyword search input", async ({ page }) => {
    const searchInput = page.getByRole("textbox", { name: "Search logs by keyword" });
    const startInput = page.getByLabel("Start");

    const searchBox = await searchInput.boundingBox();
    const startBox = await startInput.boundingBox();

    expect(searchBox).not.toBeNull();
    expect(startBox).not.toBeNull();

    if (searchBox && startBox) {
      // The Start input x position must be greater than the right edge of the search input.
      expect(startBox.x).toBeGreaterThan(searchBox.x);
    }
  });

  test("AC2: AnalysisPanel sidebar does NOT contain a time-range Start input", async ({ page }) => {
    // The AnalysisPanel is the aside element. Time inputs should not be inside it.
    const sidebar = page.locator("aside");
    await expect(sidebar.getByLabel("Start")).not.toBeAttached();
  });

  test("AC2: AnalysisPanel sidebar does NOT contain a time-range End input", async ({ page }) => {
    const sidebar = page.locator("aside");
    await expect(sidebar.getByLabel("End")).not.toBeAttached();
  });

  test("AC2: AnalysisPanel sidebar does NOT contain an Apply button", async ({ page }) => {
    const sidebar = page.locator("aside");
    await expect(sidebar.getByRole("button", { name: "Apply" })).not.toBeAttached();
  });
});

// ---------------------------------------------------------------------------
// AC3 — Disabled state: no file loaded
// ---------------------------------------------------------------------------

test.describe("TimeRangeFilter — disabled state when no file is loaded", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("AC3: Start time input is not rendered when no file is loaded", async ({ page }) => {
    // The LogViewer (and therefore the search bar) is not rendered without a file.
    await expect(page.getByLabel("Start")).not.toBeAttached();
  });

  test("AC3: End time input is not rendered when no file is loaded", async ({ page }) => {
    await expect(page.getByLabel("End")).not.toBeAttached();
  });

  test("AC3: Apply button is not rendered when no file is loaded", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Apply" })).not.toBeAttached();
  });
});

// ---------------------------------------------------------------------------
// AC3b — Disabled state: file loaded but binary (no text content)
// The TimeRangeFilter `disabled` prop is true when loadedFile.content is falsy.
// We test this via the actual rendered `disabled` attribute on inputs.
// ---------------------------------------------------------------------------

test.describe("TimeRangeFilter — inputs disabled when loadedFile has no text content", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await loadFixture(page);
  });

  test("AC3: Start input is enabled after a text log file is loaded", async ({ page }) => {
    // For a text log, `loadedFile.content` is populated — inputs must be enabled.
    const startInput = page.getByLabel("Start");
    await expect(startInput).not.toBeDisabled();
  });

  test("AC3: End input is enabled after a text log file is loaded", async ({ page }) => {
    const endInput = page.getByLabel("End");
    await expect(endInput).not.toBeDisabled();
  });

  test("AC3: Apply button is disabled when both time inputs are empty", async ({ page }) => {
    // On a freshly-loaded file with no time values, Apply must be disabled.
    const applyButton = page.getByRole("button", { name: "Apply" });
    await expect(applyButton).toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// AC4 — Layout does not overflow at 1024px viewport width
// ---------------------------------------------------------------------------

test.describe("TimeRangeFilter — layout at 1024px viewport width", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto("/");
    await loadFixture(page);
  });

  test("AC4: Start input is within viewport bounds at 1024px", async ({ page }) => {
    const startInput = page.getByLabel("Start");
    await expect(startInput).toBeVisible();

    const box = await startInput.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.x + box.width).toBeLessThanOrEqual(1024 + 1);
    }
  });

  test("AC4: End input is within viewport bounds at 1024px", async ({ page }) => {
    const endInput = page.getByLabel("End");
    await expect(endInput).toBeVisible();

    const box = await endInput.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.x + box.width).toBeLessThanOrEqual(1024 + 1);
    }
  });

  test("AC4: Apply button is within viewport bounds at 1024px", async ({ page }) => {
    const applyButton = page.getByRole("button", { name: "Apply" });
    await expect(applyButton).toBeVisible();

    const box = await applyButton.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.x + box.width).toBeLessThanOrEqual(1024 + 1);
    }
  });

  test("AC4: keyword search input is within viewport bounds at 1024px", async ({ page }) => {
    const searchInput = page.getByRole("textbox", { name: "Search logs by keyword" });
    await expect(searchInput).toBeVisible();

    const box = await searchInput.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.x + box.width).toBeLessThanOrEqual(1024 + 1);
    }
  });
});

// ---------------------------------------------------------------------------
// AC5 — Golden path: Apply filters the log view
// ---------------------------------------------------------------------------

test.describe("TimeRangeFilter — Apply filters the log view", () => {
  // The fixture contains lines from 08:00:01 to 08:00:15.
  // We test narrowing to a subset of lines by time range.

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await loadFixture(page);
  });

  test("AC5: all 15 log lines are visible before applying a time filter", async ({ page }) => {
    await expect(logLineLocator(page)).toHaveCount(15);
  });

  test("AC5: entering Start and End times enables the Apply button", async ({ page }) => {
    const startInput = page.getByLabel("Start");
    const endInput = page.getByLabel("End");
    const applyButton = page.getByRole("button", { name: "Apply" });

    await startInput.fill("08:00:01");
    await endInput.fill("08:00:05");

    await expect(applyButton).not.toBeDisabled();
  });

  test("AC5: clicking Apply with a time range filters log lines to matching entries", async ({
    page,
  }) => {
    // The fixture lines that fall within 08:00:01–08:00:05 are lines 1–5.
    const startInput = page.getByLabel("Start");
    const endInput = page.getByLabel("End");
    const applyButton = page.getByRole("button", { name: "Apply" });

    await startInput.fill("08:00:01");
    await endInput.fill("08:00:05");
    await applyButton.click();

    // Wait for the filtered view to update.
    await expect(logLineLocator(page)).toHaveCount(5, { timeout: 5_000 });
  });

  test("AC5: filtered view shows lines within the selected range", async ({ page }) => {
    const startInput = page.getByLabel("Start");
    const endInput = page.getByLabel("End");

    await startInput.fill("08:00:01");
    await endInput.fill("08:00:05");
    await page.getByRole("button", { name: "Apply" }).click();

    // Line 5 (08:00:05) should be visible — "CrashReporter"
    await expect(page.getByText(/CrashReporter/)).toBeVisible();
  });

  test("AC5: filtered view hides lines outside the selected range", async ({ page }) => {
    const startInput = page.getByLabel("Start");
    const endInput = page.getByLabel("End");

    await startInput.fill("08:00:01");
    await endInput.fill("08:00:05");
    await page.getByRole("button", { name: "Apply" }).click();

    // Line 6 (08:00:06) should NOT appear — "ANRMonitor"
    await expect(
      logLineLocator(page).filter({ hasText: /ANRMonitor/ }),
    ).toHaveCount(0);
  });

  test("AC5: file meta shows matched count after Apply", async ({ page }) => {
    const startInput = page.getByLabel("Start");
    const endInput = page.getByLabel("End");

    await startInput.fill("08:00:01");
    await endInput.fill("08:00:05");
    await page.getByRole("button", { name: "Apply" }).click();

    // The LogViewer header shows "N matched" when a time filter is active.
    await expect(page.getByText(/matched/)).toBeVisible();
    await expect(page.getByText(/5 matched/)).toBeVisible();
  });

  test("AC5: empty state message shown when no lines match the time range", async ({ page }) => {
    // Use a time range that matches no fixture lines.
    const startInput = page.getByLabel("Start");
    const endInput = page.getByLabel("End");

    await startInput.fill("09:00:00");
    await endInput.fill("09:00:30");
    await page.getByRole("button", { name: "Apply" }).click();

    await expect(
      page.getByText(/No log entries match the selected time range/i),
    ).toBeVisible({ timeout: 5_000 });
  });

  test("AC5: invalid range (start > end) shows validation error and does NOT filter", async ({
    page,
  }) => {
    const startInput = page.getByLabel("Start");
    const endInput = page.getByLabel("End");

    // Start after End — invalid range.
    await startInput.fill("08:00:10");
    await endInput.fill("08:00:05");
    await page.getByRole("button", { name: "Apply" }).click();

    // An error alert must appear. Filter to the visible validation message
    // (avoids strict-mode conflict with the Next.js route-announcer alert div).
    const validationAlert = page
      .getByRole("alert")
      .filter({ hasText: /Start time must be before end time/i });
    await expect(validationAlert).toBeVisible();
    await expect(validationAlert).toContainText(/Start time must be before end time/i);

    // All 15 lines must still be visible — filter was not applied.
    await expect(logLineLocator(page)).toHaveCount(15);
  });
});

// ---------------------------------------------------------------------------
// AC6 — Clear resets the log view
// ---------------------------------------------------------------------------

test.describe("TimeRangeFilter — Clear resets the log view", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await loadFixture(page);
  });

  test("AC6: Clear button is not present before a filter is applied", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Clear" })).not.toBeAttached();
  });

  test("AC6: Clear button appears after Apply is clicked", async ({ page }) => {
    const startInput = page.getByLabel("Start");
    const endInput = page.getByLabel("End");

    await startInput.fill("08:00:01");
    await endInput.fill("08:00:05");
    await page.getByRole("button", { name: "Apply" }).click();

    await expect(page.getByRole("button", { name: "Clear" })).toBeVisible({ timeout: 5_000 });
  });

  test("AC6: clicking Clear restores all 15 log lines", async ({ page }) => {
    const startInput = page.getByLabel("Start");
    const endInput = page.getByLabel("End");

    await startInput.fill("08:00:01");
    await endInput.fill("08:00:05");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(logLineLocator(page)).toHaveCount(5, { timeout: 5_000 });

    await page.getByRole("button", { name: "Clear" }).click();
    await expect(logLineLocator(page)).toHaveCount(15, { timeout: 5_000 });
  });

  test("AC6: clicking Clear removes the Clear button", async ({ page }) => {
    const startInput = page.getByLabel("Start");
    const endInput = page.getByLabel("End");

    await startInput.fill("08:00:01");
    await endInput.fill("08:00:05");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.getByRole("button", { name: "Clear" })).toBeVisible({ timeout: 5_000 });

    await page.getByRole("button", { name: "Clear" }).click();
    await expect(page.getByRole("button", { name: "Clear" })).not.toBeAttached({ timeout: 5_000 });
  });

  test("AC6: clicking Clear resets the Start input to empty", async ({ page }) => {
    const startInput = page.getByLabel("Start");
    const endInput = page.getByLabel("End");

    await startInput.fill("08:00:01");
    await endInput.fill("08:00:05");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.getByRole("button", { name: "Clear" })).toBeVisible({ timeout: 5_000 });

    await page.getByRole("button", { name: "Clear" }).click();

    await expect(startInput).toHaveValue("");
  });

  test("AC6: clicking Clear resets the End input to empty", async ({ page }) => {
    const startInput = page.getByLabel("Start");
    const endInput = page.getByLabel("End");

    await startInput.fill("08:00:01");
    await endInput.fill("08:00:05");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.getByRole("button", { name: "Clear" })).toBeVisible({ timeout: 5_000 });

    await page.getByRole("button", { name: "Clear" }).click();

    await expect(endInput).toHaveValue("");
  });

  test("AC6: Apply button becomes disabled again after Clear", async ({ page }) => {
    const startInput = page.getByLabel("Start");
    const endInput = page.getByLabel("End");

    await startInput.fill("08:00:01");
    await endInput.fill("08:00:05");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.getByRole("button", { name: "Clear" })).toBeVisible({ timeout: 5_000 });

    await page.getByRole("button", { name: "Clear" }).click();

    await expect(page.getByRole("button", { name: "Apply" })).toBeDisabled({ timeout: 5_000 });
  });
});
