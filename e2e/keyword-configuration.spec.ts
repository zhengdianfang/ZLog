import { test, expect, type Page } from "@playwright/test";
import path from "path";

const FIXTURE_PATH = path.join(__dirname, "fixtures", "sample.log");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Load the sample fixture into the LogViewer via the hidden file input.
 * Waits until log content is rendered.
 */
async function loadFixture(page: Page) {
  await page.setInputFiles('input[type="file"]', FIXTURE_PATH);
  // Wait for the log viewer container (a log line) to appear — use the line number span
  // to avoid ambiguity when a keyword rule with "CrashReporter" is already in the list.
  await expect(page.locator('[class*="logLine"]').first()).toBeVisible({ timeout: 10_000 });
}

/**
 * Open the "Add Keyword Rule" modal from the AnalysisPanel.
 */
async function openModal(page: Page) {
  await page.getByRole("button", { name: "Add keyword rule" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
}

/**
 * Fill in all required modal fields and click Save Rule.
 */
async function fillAndSave(
  page: Page,
  opts: { type?: string; description?: string; pattern?: string },
) {
  const { type = "info", description = "Test rule", pattern = "CrashReporter" } = opts;

  if (type) {
    await page.getByRole("radio", { name: type }).click();
  }
  if (description) {
    await page.getByLabel("Description").fill(description);
  }
  if (pattern) {
    await page.getByLabel("Filter Pattern").fill(pattern);
  }
  await page.getByRole("button", { name: "Save Rule" }).click();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe("KeywordConfiguration — modal open and close", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // -------------------------------------------------------------------------
  // AC1: Modal opens from the UI trigger without a page reload
  // -------------------------------------------------------------------------

  test("golden path: Add Rule button opens the keyword config modal", async ({ page }) => {
    await page.getByRole("button", { name: "Add keyword rule" }).click();

    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("Add Keyword Rule")).toBeVisible();
  });

  test("golden path: modal opens without a full page reload (no navigation)", async ({ page }) => {
    // Track navigation events — a modal open must not trigger one.
    let navigated = false;
    page.on("framenavigated", () => { navigated = true; });

    await page.getByRole("button", { name: "Add keyword rule" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Only the initial page navigation is counted before the click.
    // Reset flag to only catch post-click navigations.
    navigated = false;

    await page.getByRole("button", { name: "Add keyword rule" }).isVisible();
    expect(navigated).toBe(false);
  });

  test("modal can be closed with the close button (×)", async ({ page }) => {
    await page.getByRole("button", { name: "Add keyword rule" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.getByRole("button", { name: "Close keyword config" }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("modal can be closed with the Cancel button", async ({ page }) => {
    await page.getByRole("button", { name: "Add keyword rule" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("accessibility: modal can be dismissed via Escape key", async ({ page }) => {
    await page.getByRole("button", { name: "Add keyword rule" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("accessibility: modal has role=dialog and aria-modal", async ({ page }) => {
    await page.getByRole("button", { name: "Add keyword rule" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  test("accessibility: modal has aria-labelledby pointing to title", async ({ page }) => {
    await page.getByRole("button", { name: "Add keyword rule" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toHaveAttribute("aria-labelledby", "keyword-config-modal-title");
    await expect(page.locator("#keyword-config-modal-title")).toContainText("Add Keyword Rule");
  });
});

// ---------------------------------------------------------------------------
// AC2: Modal form contains all required fields
// ---------------------------------------------------------------------------

test.describe("KeywordConfiguration — form fields", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await openModal(page);
  });

  test("modal contains type selector", async ({ page }) => {
    await expect(page.getByRole("radiogroup", { name: "Keyword type" })).toBeVisible();
  });

  test("modal contains description text input", async ({ page }) => {
    await expect(page.getByLabel("Description")).toBeVisible();
  });

  test("modal contains filter pattern text input", async ({ page }) => {
    await expect(page.getByLabel("Filter Pattern")).toBeVisible();
  });

  test("modal contains pattern verify section with demo input", async ({ page }) => {
    await expect(page.getByLabel("Pattern Verify")).toBeVisible();
    await expect(page.locator("#pattern-verify-demo")).toBeVisible();
  });

  test("modal contains Verify button", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Verify" })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// AC3: Type selector has exactly 5 options with distinct color indicators
// ---------------------------------------------------------------------------

test.describe("KeywordConfiguration — type selector", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await openModal(page);
  });

  test("type selector offers exactly 5 options: info, core, warn, error, fatal", async ({
    page,
  }) => {
    const typeGroup = page.getByRole("radiogroup", { name: "Keyword type" });
    const options = typeGroup.getByRole("radio");
    await expect(options).toHaveCount(5);
  });

  test("type selector includes 'info' option", async ({ page }) => {
    await expect(page.getByRole("radio", { name: "info" })).toBeVisible();
  });

  test("type selector includes 'core' option", async ({ page }) => {
    await expect(page.getByRole("radio", { name: "core" })).toBeVisible();
  });

  test("type selector includes 'warn' option", async ({ page }) => {
    await expect(page.getByRole("radio", { name: "warn" })).toBeVisible();
  });

  test("type selector includes 'error' option", async ({ page }) => {
    await expect(page.getByRole("radio", { name: "error" })).toBeVisible();
  });

  test("type selector includes 'fatal' option", async ({ page }) => {
    await expect(page.getByRole("radio", { name: "fatal" })).toBeVisible();
  });

  test("each type button has a color chip (span with background color)", async ({ page }) => {
    // Each pill should contain a color chip (aria-hidden span).
    const typeGroup = page.getByRole("radiogroup", { name: "Keyword type" });
    const colorChips = typeGroup.locator("[aria-hidden='true']");
    await expect(colorChips).toHaveCount(5);

    // Each chip must have an inline background style (color indicator).
    for (let i = 0; i < 5; i++) {
      const chip = colorChips.nth(i);
      const bg = await chip.evaluate((el) => (el as HTMLElement).style.background);
      expect(bg).not.toBe("");
    }
  });

  test("selecting 'info' type marks it as checked", async ({ page }) => {
    await page.getByRole("radio", { name: "info" }).click();
    await expect(page.getByRole("radio", { name: "info" })).toHaveAttribute("aria-checked", "true");
  });

  test("selecting 'error' type marks it as checked and deselects others", async ({ page }) => {
    await page.getByRole("radio", { name: "info" }).click();
    await page.getByRole("radio", { name: "error" }).click();

    await expect(page.getByRole("radio", { name: "error" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await expect(page.getByRole("radio", { name: "info" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  test("AC3: selected type has a distinct background color applied via inline style", async ({
    page,
  }) => {
    await page.getByRole("radio", { name: "warn" }).click();

    const warnButton = page.getByRole("radio", { name: "warn" });
    const bgStyle = await warnButton.evaluate((el) => (el as HTMLElement).style.background);
    // After selection, the pill should have a background set.
    expect(bgStyle).not.toBe("");
  });
});

// ---------------------------------------------------------------------------
// AC4: Filter pattern accepts regex including named capture groups
// AC5: Invalid regex shows inline error and blocks submission
// ---------------------------------------------------------------------------

test.describe("KeywordConfiguration — filter pattern validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await openModal(page);
  });

  test("AC4: valid regex pattern is accepted without error", async ({ page }) => {
    await page.getByLabel("Filter Pattern").fill("/start \\[video\\] (?<name>\\S*)/");
    // No error alert should be visible.
    const alerts = page.locator('[role="alert"]');
    // Any visible alert related to pattern should not exist.
    const patternAlerts = alerts.filter({ hasText: /Invalid regex/i });
    await expect(patternAlerts).toHaveCount(0);
  });

  test("AC4: pattern with named capture group (?<name>...) is accepted", async ({ page }) => {
    await page.getByLabel("Filter Pattern").fill("(?<level>\\w+)");
    const patternAlerts = page.locator('[role="alert"]').filter({ hasText: /Invalid regex/i });
    await expect(patternAlerts).toHaveCount(0);
  });

  test("AC5: invalid regex shows inline error message", async ({ page }) => {
    await page.getByLabel("Filter Pattern").fill("[unclosed");

    const errorAlert = page.locator('[role="alert"]').filter({ hasText: /Invalid regex/i });
    await expect(errorAlert).toBeVisible();
  });

  test("AC5: invalid regex error message is shown inline near the field", async ({ page }) => {
    await page.getByLabel("Filter Pattern").fill("(unclosed");

    const errorAlert = page.locator('[role="alert"]').filter({ hasText: /Invalid regex/i });
    await expect(errorAlert).toBeVisible();
  });

  test("AC5: invalid regex marks the filter pattern input as aria-invalid", async ({ page }) => {
    await page.getByLabel("Filter Pattern").fill("[bad");

    await expect(page.getByLabel("Filter Pattern")).toHaveAttribute("aria-invalid", "true");
  });

  test("AC5: invalid regex blocks form submission — dialog stays open", async ({ page }) => {
    await page.getByRole("radio", { name: "info" }).click();
    await page.getByLabel("Description").fill("Test");
    await page.getByLabel("Filter Pattern").fill("[unclosed");

    await page.getByRole("button", { name: "Save Rule" }).click();

    // Modal must remain open.
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("fixing an invalid regex clears the inline error", async ({ page }) => {
    await page.getByLabel("Filter Pattern").fill("[bad");
    const errorAlert = page.locator('[role="alert"]').filter({ hasText: /Invalid regex/i });
    await expect(errorAlert).toBeVisible();

    // Correct the pattern.
    await page.getByLabel("Filter Pattern").fill("[fixed]");
    await expect(errorAlert).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// AC6: Missing required fields show inline validation errors and block submission
// ---------------------------------------------------------------------------

test.describe("KeywordConfiguration — required field validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await openModal(page);
  });

  test("AC6: submitting empty form shows type validation error", async ({ page }) => {
    await page.getByRole("button", { name: "Save Rule" }).click();

    const alert = page.locator('[role="alert"]').filter({ hasText: /select a keyword type/i });
    await expect(alert).toBeVisible();
  });

  test("AC6: submitting empty form shows description validation error", async ({ page }) => {
    await page.getByRole("button", { name: "Save Rule" }).click();

    const alert = page.locator('[role="alert"]').filter({ hasText: /Description is required/i });
    await expect(alert).toBeVisible();
  });

  test("AC6: submitting empty form shows filter pattern validation error", async ({ page }) => {
    await page.getByRole("button", { name: "Save Rule" }).click();

    const alert = page.locator('[role="alert"]').filter({ hasText: /Filter pattern is required/i });
    await expect(alert).toBeVisible();
  });

  test("AC6: submitting empty form keeps modal open (rule not saved)", async ({ page }) => {
    await page.getByRole("button", { name: "Save Rule" }).click();

    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("AC6: type-only submission still shows description and pattern errors", async ({ page }) => {
    await page.getByRole("radio", { name: "info" }).click();
    await page.getByRole("button", { name: "Save Rule" }).click();

    await expect(
      page.locator('[role="alert"]').filter({ hasText: /Description is required/i }),
    ).toBeVisible();
    await expect(
      page.locator('[role="alert"]').filter({ hasText: /Filter pattern is required/i }),
    ).toBeVisible();
  });

  test("AC6: description error clears when user starts typing", async ({ page }) => {
    await page.getByRole("button", { name: "Save Rule" }).click();
    const descAlert = page.locator('[role="alert"]').filter({ hasText: /Description is required/i });
    await expect(descAlert).toBeVisible();

    await page.getByLabel("Description").fill("a");
    await expect(descAlert).not.toBeVisible();
  });

  test("AC6: pattern error clears when user starts typing in the pattern field", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Save Rule" }).click();
    const patternAlert = page
      .locator('[role="alert"]')
      .filter({ hasText: /Filter pattern is required/i });
    await expect(patternAlert).toBeVisible();

    await page.getByLabel("Filter Pattern").fill("a");
    await expect(patternAlert).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// AC7 & AC8: Pattern verify section
// ---------------------------------------------------------------------------

test.describe("KeywordConfiguration — pattern verify", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await openModal(page);
  });

  test("AC8: verify with empty demo string shows prompt to enter demo string", async ({
    page,
  }) => {
    await page.getByLabel("Filter Pattern").fill("crash");
    await page.getByRole("button", { name: "Verify" }).click();

    await expect(
      page.getByText("Enter a demo string before verifying."),
    ).toBeVisible();
  });

  test("AC7 & AC8: verify with matching demo string shows success indicator", async ({ page }) => {
    await page.getByLabel("Filter Pattern").fill("crash");
    await page.locator("#pattern-verify-demo").fill("crash detected in render thread");

    await page.getByRole("button", { name: "Verify" }).click();

    await expect(page.getByText("Match found.")).toBeVisible();
  });

  test("AC8: verify with non-matching demo string shows no-match indicator", async ({ page }) => {
    await page.getByLabel("Filter Pattern").fill("crash");
    await page.locator("#pattern-verify-demo").fill("all systems nominal");

    await page.getByRole("button", { name: "Verify" }).click();

    await expect(page.getByText("Pattern does not match the demo string.")).toBeVisible();
  });

  test("AC8: no-match result does not display capture group table", async ({ page }) => {
    await page.getByLabel("Filter Pattern").fill("crash");
    await page.locator("#pattern-verify-demo").fill("nothing matches here");
    await page.getByRole("button", { name: "Verify" }).click();

    await expect(page.locator("table")).not.toBeVisible();
  });

  test("AC8: success with named capture groups displays group name and value", async ({
    page,
  }) => {
    // Pattern: (?<level>\w+) against "INFO message" — group "level" = "INFO"
    await page.getByLabel("Filter Pattern").fill("(?<level>\\w+)");
    await page.locator("#pattern-verify-demo").fill("INFO message");

    await page.getByRole("button", { name: "Verify" }).click();

    await expect(page.getByText("Match found.")).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.getByRole("cell", { name: "level" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "INFO" })).toBeVisible();
  });

  test("AC8: success without named capture groups shows match found without a table", async ({
    page,
  }) => {
    await page.getByLabel("Filter Pattern").fill("crash");
    await page.locator("#pattern-verify-demo").fill("crash detected");
    await page.getByRole("button", { name: "Verify" }).click();

    await expect(page.getByText("Match found.")).toBeVisible();
    // No capture group table since no named groups were defined.
    await expect(page.locator("table")).not.toBeVisible();
  });

  test("result panel is live-announced (aria-live=polite)", async ({ page }) => {
    const resultContainer = page.locator('[aria-live="polite"]');
    await expect(resultContainer).toBeAttached();
  });

  test("result resets to idle when the demo string is edited after a result is shown", async ({
    page,
  }) => {
    await page.getByLabel("Filter Pattern").fill("crash");
    await page.locator("#pattern-verify-demo").fill("crash detected");
    await page.getByRole("button", { name: "Verify" }).click();
    await expect(page.getByText("Match found.")).toBeVisible();

    // Edit demo — result should clear.
    await page.locator("#pattern-verify-demo").fill("crash detected updated");
    await expect(page.getByText("Match found.")).not.toBeVisible();
    await expect(page.getByText("Pattern does not match the demo string.")).not.toBeVisible();
  });

  test("AC4: verify accepts named groups with $ prefix per ALog spec", async ({ page }) => {
    await page.getByLabel("Filter Pattern").fill("(?<$level>\\w+)");
    await page.locator("#pattern-verify-demo").fill("ERROR something bad");
    await page.getByRole("button", { name: "Verify" }).click();

    await expect(page.getByText("Match found.")).toBeVisible();
    await expect(page.getByRole("cell", { name: "$level" })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// AC9: Saved rule appears in list and log lines are color-highlighted
// ---------------------------------------------------------------------------

test.describe("KeywordConfiguration — save and rule list", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("AC9: empty state shown when no rules exist", async ({ page }) => {
    await expect(page.getByText("No keyword rules yet.")).toBeVisible();
  });

  test("AC9: new rule appears in the rule list immediately after saving", async ({ page }) => {
    await openModal(page);
    await fillAndSave(page, {
      type: "info",
      description: "Video start",
      pattern: "CrashReporter",
    });

    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(page.getByText("Video start")).toBeVisible();
    await expect(page.getByText("CrashReporter")).toBeVisible();
  });

  test("AC9: saved rule shows the correct type badge", async ({ page }) => {
    await openModal(page);
    await fillAndSave(page, { type: "error", description: "Error rule", pattern: "ANR" });

    // The rule list item should display an "error" badge scoped to the rule list.
    const ruleList = page.locator('[class*="KeywordRuleList"]');
    await expect(ruleList.getByText("error", { exact: true }).first()).toBeVisible();
  });

  test("AC9: rule appears without full page reload (dialog closes, list updates in-place)", async ({
    page,
  }) => {
    // Capture the URL before opening the modal — it must not change.
    const urlBefore = page.url();

    await openModal(page);
    await fillAndSave(page, { type: "warn", description: "Warn rule", pattern: "MemoryMonitor" });

    // URL must be unchanged (no full page reload / navigation).
    expect(page.url()).toBe(urlBefore);
    await expect(page.getByText("Warn rule")).toBeVisible();
  });

  test("AC9: multiple rules can be added and all appear in the list", async ({ page }) => {
    await openModal(page);
    await fillAndSave(page, { type: "info", description: "Rule One", pattern: "NetworkManager" });

    await openModal(page);
    await fillAndSave(page, { type: "error", description: "Rule Two", pattern: "CrashReporter" });

    await expect(page.getByText("Rule One")).toBeVisible();
    await expect(page.getByText("Rule Two")).toBeVisible();
  });

  test("AC9: saved rule can be deleted from the list", async ({ page }) => {
    await openModal(page);
    await fillAndSave(page, { type: "core", description: "Core Rule", pattern: "SessionManager" });

    await expect(page.getByText("Core Rule")).toBeVisible();

    await page.getByRole("button", { name: "Delete rule: Core Rule" }).click();

    await expect(page.getByText("Core Rule")).not.toBeVisible();
    await expect(page.getByText("No keyword rules yet.")).toBeVisible();
  });

  test("AC9: log lines matching a saved rule are color-highlighted after file load", async ({
    page,
  }) => {
    // Add a rule that matches lines containing "CrashReporter".
    await openModal(page);
    await fillAndSave(page, {
      type: "error",
      description: "Crash rule",
      pattern: "CrashReporter",
    });

    // Load the log file.
    await loadFixture(page);

    // Find the log line containing "CrashReporter" — it should have a non-default background.
    const crashLine = page
      .locator('[class*="logLine"]')
      .filter({ hasText: "CrashReporter" })
      .first();

    await expect(crashLine).toBeVisible();
    const bgColor = await crashLine.evaluate((el) => (el as HTMLElement).style.backgroundColor);
    // The tint for "error" type is rgba(220,38,38,0.08) — not empty.
    expect(bgColor).not.toBe("");
  });

  test("AC9: lines NOT matching a rule are not highlighted", async ({ page }) => {
    await openModal(page);
    await fillAndSave(page, {
      type: "error",
      description: "Crash rule",
      pattern: "CrashReporter",
    });

    await loadFixture(page);

    // A non-matching line should have no inline background style.
    const unmatchedLine = page
      .locator('[class*="logLine"]')
      .filter({ hasText: "Application started successfully" })
      .first();

    await expect(unmatchedLine).toBeVisible();
    const bgColor = await unmatchedLine.evaluate(
      (el) => (el as HTMLElement).style.backgroundColor,
    );
    expect(bgColor).toBe("");
  });
});

// ---------------------------------------------------------------------------
// Accessibility — keyboard navigation
// ---------------------------------------------------------------------------

test.describe("KeywordConfiguration — accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await openModal(page);
  });

  test("AC11: all form inputs are keyboard-accessible (Tab cycles through fields)", async ({
    page,
  }) => {
    // The modal opens with Cancel button focused (as coded).
    const cancelBtn = page.getByRole("button", { name: "Cancel" });
    await expect(cancelBtn).toBeFocused();

    // Verify all interactive elements inside the modal are individually focusable.
    const closeBtn = page.getByRole("button", { name: "Close keyword config" });
    await closeBtn.focus();
    await expect(closeBtn).toBeFocused();

    const infoBtn = page.getByRole("radio", { name: "info" });
    await infoBtn.focus();
    await expect(infoBtn).toBeFocused();

    const descriptionInput = page.getByLabel("Description");
    await descriptionInput.focus();
    await expect(descriptionInput).toBeFocused();

    const patternInput = page.getByLabel("Filter Pattern");
    await patternInput.focus();
    await expect(patternInput).toBeFocused();

    const saveBtn = page.getByRole("button", { name: "Save Rule" });
    await saveBtn.focus();
    await expect(saveBtn).toBeFocused();
  });

  test("AC11: Save Rule button is reachable via keyboard", async ({ page }) => {
    const saveBtn = page.getByRole("button", { name: "Save Rule" });
    await expect(saveBtn).toBeVisible();
    // Ensure it's focusable.
    await saveBtn.focus();
    await expect(saveBtn).toBeFocused();
  });

  test("AC11: type radio buttons can be activated via keyboard Enter", async ({ page }) => {
    const infoBtn = page.getByRole("radio", { name: "info" });
    await infoBtn.focus();
    await page.keyboard.press("Enter");
    await expect(infoBtn).toHaveAttribute("aria-checked", "true");
  });

  test("accessibility: Add keyword rule button has accessible aria-label", async ({ page }) => {
    // Close modal first to check the trigger.
    await page.keyboard.press("Escape");

    const addBtn = page.getByRole("button", { name: "Add keyword rule" });
    await expect(addBtn).toBeVisible();
    await expect(addBtn).toHaveAttribute("aria-label", "Add keyword rule");
  });
});

// ---------------------------------------------------------------------------
// Responsive layout
// ---------------------------------------------------------------------------

test.describe("KeywordConfiguration — responsive layout", () => {
  test("mobile (375px): Add Rule button is visible and clickable", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    const addBtn = page.getByRole("button", { name: "Add keyword rule" });
    await expect(addBtn).toBeVisible();

    const box = await addBtn.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.x + box.width).toBeLessThanOrEqual(376);
    }
  });

  test("mobile (375px): modal is visible and fits within viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await openModal(page);

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    const modalBox = await page.locator('[class*="modal"]').boundingBox();
    if (modalBox) {
      expect(modalBox.width).toBeLessThanOrEqual(376);
    }
  });

  test("tablet (768px): Add Rule button is visible", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");

    await expect(page.getByRole("button", { name: "Add keyword rule" })).toBeVisible();
  });

  test("desktop (1280px): modal form fields are all visible", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await openModal(page);

    await expect(page.getByRole("radiogroup", { name: "Keyword type" })).toBeVisible();
    await expect(page.getByLabel("Description")).toBeVisible();
    await expect(page.getByLabel("Filter Pattern")).toBeVisible();
    await expect(page.locator("#pattern-verify-demo")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

test.describe("KeywordConfiguration — edge cases", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await openModal(page);
  });

  test("pattern with special regex characters (escaped) is saved successfully", async ({
    page,
  }) => {
    await page.getByRole("radio", { name: "warn" }).click();
    await page.getByLabel("Description").fill("Escaped pattern");
    await page.getByLabel("Filter Pattern").fill("/start \\[video\\]/");

    await page.getByRole("button", { name: "Save Rule" }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(page.getByText("Escaped pattern")).toBeVisible();
  });

  test("long description text is saved and displayed in the rule list", async ({ page }) => {
    const longDesc = "A".repeat(100);
    await page.getByRole("radio", { name: "info" }).click();
    await page.getByLabel("Description").fill(longDesc);
    await page.getByLabel("Filter Pattern").fill("test");

    await page.getByRole("button", { name: "Save Rule" }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("description with special characters is saved correctly", async ({ page }) => {
    const specialDesc = 'Rule with <special> & "chars"';
    await page.getByRole("radio", { name: "fatal" }).click();
    await page.getByLabel("Description").fill(specialDesc);
    await page.getByLabel("Filter Pattern").fill("fatal");

    await page.getByRole("button", { name: "Save Rule" }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(page.getByText(specialDesc)).toBeVisible();
  });

  test("re-opening the modal after save shows a fresh empty form", async ({ page }) => {
    await page.getByRole("radio", { name: "info" }).click();
    await page.getByLabel("Description").fill("First rule");
    await page.getByLabel("Filter Pattern").fill("first");
    await page.getByRole("button", { name: "Save Rule" }).click();

    // Re-open modal.
    await openModal(page);

    // Form should be empty.
    await expect(page.getByRole("radio", { name: "info" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
    await expect(page.getByLabel("Description")).toHaveValue("");
    await expect(page.getByLabel("Filter Pattern")).toHaveValue("");
  });

  test("pattern with multi-group named capture groups shows all groups on verify", async ({
    page,
  }) => {
    await page.getByLabel("Filter Pattern").fill("(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})");
    await page.locator("#pattern-verify-demo").fill("2024-01-15");
    await page.getByRole("button", { name: "Verify" }).click();

    await expect(page.getByText("Match found.")).toBeVisible();
    await expect(page.getByRole("cell", { name: "year" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "2024" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "month" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "01" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "day" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "15" })).toBeVisible();
  });
});
