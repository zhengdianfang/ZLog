import { test, expect, type Page, type BrowserContext } from "@playwright/test";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * The Zustand auth store persists to localStorage under this key.
 * Injecting it before page load simulates a logged-in session without
 * going through the real login form / database.
 */
const STORAGE_KEY = "zlog-auth";

interface MockUser {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
}

const DEFAULT_USER: MockUser = {
  id: "test-user-1",
  email: "qa@zlog.test",
  displayName: "QA Tester",
};

/**
 * Seed the Zustand auth store into localStorage so the TopNav renders
 * the avatar instead of the "Sign In" link on first load.
 */
async function seedAuthState(context: BrowserContext, user: MockUser = DEFAULT_USER) {
  await context.addInitScript((args: { key: string; user: MockUser }) => {
    const { key, user } = args;
    const state = { state: { user }, version: 0 };
    window.localStorage.setItem(key, JSON.stringify(state));
  }, { key: STORAGE_KEY, user });
}

/**
 * Clear any persisted auth state from localStorage so the page renders
 * in logged-out state.
 */
async function clearAuthState(context: BrowserContext) {
  await context.addInitScript((key: string) => {
    window.localStorage.removeItem(key);
  }, STORAGE_KEY);
}

/**
 * Navigate to the home page and wait for the nav bar to be fully rendered.
 */
async function gotoHome(page: Page) {
  await page.goto("/");
  await expect(page.locator("header")).toBeVisible();
}

/**
 * Open the avatar dropdown menu. Assumes the user is already logged in.
 */
async function openAvatarMenu(page: Page) {
  await page.getByRole("button", { name: "Open account menu" }).click();
  await expect(page.getByRole("menu", { name: "Account menu" })).toBeVisible();
}

// ---------------------------------------------------------------------------
// Tests — Logged-out state
// ---------------------------------------------------------------------------

test.describe("LoginStatus — logged-out state", () => {
  test.beforeEach(async ({ context, page }) => {
    await clearAuthState(context);
    await gotoHome(page);
  });

  test("golden path: Sign In link is visible when no user is authenticated", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Sign In" })).toBeVisible();
  });

  test("logged-out: avatar button is not rendered", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "Open account menu" }),
    ).not.toBeAttached();
  });

  test("logged-out: Sign In link navigates to the login page", async ({ page }) => {
    await page.getByRole("link", { name: "Sign In" }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("accessibility (logged-out): Sign In is a link with correct href", async ({ page }) => {
    const signInLink = page.getByRole("link", { name: "Sign In" });
    await expect(signInLink).toHaveAttribute("href", "/login");
  });

  test("responsive mobile (375px): Sign In link visible when logged out", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole("link", { name: "Sign In" })).toBeVisible();
  });

  test("responsive tablet (768px): Sign In link visible when logged out", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByRole("link", { name: "Sign In" })).toBeVisible();
  });

  test("responsive desktop (1280px): Sign In link visible when logged out", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.getByRole("link", { name: "Sign In" })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Tests — Logged-in state (avatar replaces Sign In)
// ---------------------------------------------------------------------------

test.describe("LoginStatus — logged-in state", () => {
  test.beforeEach(async ({ context, page }) => {
    await seedAuthState(context);
    await gotoHome(page);
  });

  // -------------------------------------------------------------------------
  // Acceptance Criterion 1 & 2: Avatar replaces Sign In button
  // -------------------------------------------------------------------------

  test("golden path: avatar button is visible after login", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "Open account menu" }),
    ).toBeVisible();
  });

  test("golden path: Sign In link is NOT visible when logged in", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Sign In" })).not.toBeAttached();
  });

  test("golden path: avatar shows user initials when no avatarUrl is set", async ({ page }) => {
    // DEFAULT_USER has displayName "QA Tester" → getInitials returns first char "Q"
    const avatarButton = page.getByRole("button", { name: "Open account menu" });
    await expect(avatarButton).toBeVisible();
    // getInitials() returns only the first character of displayName
    await expect(avatarButton).toContainText("Q");
  });

  test("golden path: avatar shows image when avatarUrl is provided", async ({
    context,
    page,
  }) => {
    // We need a fresh context with a user that has an avatarUrl
    await context.addInitScript((args: { key: string; user: MockUser }) => {
      const { key, user } = args;
      window.localStorage.setItem(key, JSON.stringify({ state: { user }, version: 0 }));
    }, {
      key: STORAGE_KEY,
      user: {
        id: "test-user-avatar",
        email: "avatar@zlog.test",
        displayName: "Avatar User",
        avatarUrl: "https://via.placeholder.com/40",
      },
    });
    await page.goto("/");
    await expect(page.locator("header")).toBeVisible();

    const avatarImg = page
      .getByRole("button", { name: "Open account menu" })
      .locator("img");
    await expect(avatarImg).toBeVisible();
    await expect(avatarImg).toHaveAttribute("src", "https://via.placeholder.com/40");
  });

  // -------------------------------------------------------------------------
  // Acceptance Criterion 3: Clicking avatar opens dropdown menu
  // -------------------------------------------------------------------------

  test("golden path: clicking avatar opens the dropdown menu", async ({ page }) => {
    await page.getByRole("button", { name: "Open account menu" }).click();
    await expect(page.getByRole("menu", { name: "Account menu" })).toBeVisible();
  });

  test("golden path: avatar button has aria-expanded=false before click", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "Open account menu" }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  test("golden path: avatar button has aria-expanded=true after click", async ({ page }) => {
    await page.getByRole("button", { name: "Open account menu" }).click();
    await expect(
      page.getByRole("button", { name: "Open account menu" }),
    ).toHaveAttribute("aria-expanded", "true");
  });

  test("golden path: clicking avatar again closes the dropdown", async ({ page }) => {
    const avatarButton = page.getByRole("button", { name: "Open account menu" });
    await avatarButton.click();
    await expect(page.getByRole("menu", { name: "Account menu" })).toBeVisible();

    await avatarButton.click();
    await expect(page.getByRole("menu", { name: "Account menu" })).not.toBeAttached();
  });

  // -------------------------------------------------------------------------
  // Acceptance Criterion 4: Dropdown menu contains required items
  // -------------------------------------------------------------------------

  test("golden path: dropdown contains a menu item for user name/email", async ({ page }) => {
    await openAvatarMenu(page);
    // First item shows displayName or email
    await expect(
      page.getByRole("menuitem", { name: DEFAULT_USER.displayName }),
    ).toBeVisible();
  });

  test("golden path: dropdown contains Update Password menu item", async ({ page }) => {
    await openAvatarMenu(page);
    await expect(
      page.getByRole("menuitem", { name: "Update Password" }),
    ).toBeVisible();
  });

  test("golden path: dropdown contains Logout menu item", async ({ page }) => {
    await openAvatarMenu(page);
    await expect(page.getByRole("menuitem", { name: "Logout" })).toBeVisible();
  });

  test("golden path: dropdown has exactly three menu items", async ({ page }) => {
    await openAvatarMenu(page);
    const items = page.getByRole("menuitem");
    await expect(items).toHaveCount(3);
  });

  // -------------------------------------------------------------------------
  // Acceptance Criterion 4b: User Info Settings menu item opens modal
  // -------------------------------------------------------------------------

  test("User Info Settings: clicking user name/email opens User Info modal", async ({ page }) => {
    await openAvatarMenu(page);
    await page.getByRole("menuitem", { name: DEFAULT_USER.displayName }).click();

    // UserInfoModal has role=dialog and aria-labelledby → title "User Info"
    await expect(
      page.getByRole("dialog", { name: "User Info" }),
    ).toBeVisible();
  });

  test("User Info Settings: modal shows the user's email", async ({ page }) => {
    await openAvatarMenu(page);
    await page.getByRole("menuitem", { name: DEFAULT_USER.displayName }).click();

    await expect(page.getByRole("dialog", { name: "User Info" })).toBeVisible();
    await expect(
      page.getByLabel("Email"),
    ).toHaveValue(DEFAULT_USER.email);
  });

  test("User Info Settings: modal closes when Close button is clicked", async ({ page }) => {
    await openAvatarMenu(page);
    await page.getByRole("menuitem", { name: DEFAULT_USER.displayName }).click();

    const dialog = page.getByRole("dialog", { name: "User Info" });
    await expect(dialog).toBeVisible();

    await page.getByRole("button", { name: "Close user info" }).click();
    await expect(dialog).not.toBeAttached();
  });

  // -------------------------------------------------------------------------
  // Acceptance Criterion 5: Change Password menu item opens modal
  // -------------------------------------------------------------------------

  test("Change Password: clicking Update Password opens Change Password modal", async ({
    page,
  }) => {
    await openAvatarMenu(page);
    await page.getByRole("menuitem", { name: "Update Password" }).click();

    await expect(
      page.getByRole("dialog", { name: "Change Password" }),
    ).toBeVisible();
  });

  test("Change Password: modal contains password fields", async ({ page }) => {
    await openAvatarMenu(page);
    await page.getByRole("menuitem", { name: "Update Password" }).click();

    // Use placeholder text to target the password inputs specifically,
    // avoiding ambiguity with the "Show current password" reveal button
    await expect(page.getByPlaceholder("Enter current password")).toBeVisible();
    await expect(page.getByPlaceholder("Enter new password")).toBeVisible();
  });

  test("Change Password: modal closes when Cancel button is clicked", async ({ page }) => {
    await openAvatarMenu(page);
    await page.getByRole("menuitem", { name: "Update Password" }).click();

    const dialog = page.getByRole("dialog", { name: "Change Password" });
    await expect(dialog).toBeVisible();

    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).not.toBeAttached();
  });

  // -------------------------------------------------------------------------
  // Acceptance Criterion 6 (partial): Logout clears client-side state
  // The server action deletes the session cookie; in E2E we verify the
  // client-side Zustand state is cleared and the Sign In link reappears.
  // -------------------------------------------------------------------------

  test("Logout: clicking Logout removes the avatar and shows Sign In", async ({ page }) => {
    await openAvatarMenu(page);
    await page.getByRole("menuitem", { name: "Logout" }).click();

    // After logout the Zustand store is cleared; TopNav renders Sign In link
    await expect(page.getByRole("link", { name: "Sign In" })).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      page.getByRole("button", { name: "Open account menu" }),
    ).not.toBeAttached();
  });

  // -------------------------------------------------------------------------
  // Dropdown close behaviour
  // -------------------------------------------------------------------------

  test("dropdown closes when clicking outside", async ({ page }) => {
    await page.getByRole("button", { name: "Open account menu" }).click();
    await expect(page.getByRole("menu", { name: "Account menu" })).toBeVisible();

    // Click outside the menu (the brand logo area)
    await page.locator("header").click({ position: { x: 30, y: 20 } });

    await expect(page.getByRole("menu", { name: "Account menu" })).not.toBeAttached();
  });

  test("dropdown closes when pressing Escape", async ({ page }) => {
    await page.getByRole("button", { name: "Open account menu" }).click();
    await expect(page.getByRole("menu", { name: "Account menu" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu", { name: "Account menu" })).not.toBeAttached();
  });

  // -------------------------------------------------------------------------
  // Accessibility
  // -------------------------------------------------------------------------

  test("accessibility: avatar button has aria-haspopup=menu", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "Open account menu" }),
    ).toHaveAttribute("aria-haspopup", "menu");
  });

  test("accessibility: dropdown has role=menu", async ({ page }) => {
    await page.getByRole("button", { name: "Open account menu" }).click();
    await expect(page.getByRole("menu")).toBeVisible();
  });

  test("accessibility: each item in the dropdown has role=menuitem", async ({ page }) => {
    await openAvatarMenu(page);
    const items = page.getByRole("menuitem");
    await expect(items).toHaveCount(3);
  });

  test("accessibility: avatar button can be activated with keyboard Enter", async ({ page }) => {
    const avatarButton = page.getByRole("button", { name: "Open account menu" });
    await avatarButton.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("menu", { name: "Account menu" })).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Responsive layout — logged in
  // -------------------------------------------------------------------------

  test("responsive mobile (375px): avatar button visible and menu opens", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const avatarButton = page.getByRole("button", { name: "Open account menu" });
    await expect(avatarButton).toBeVisible();

    await avatarButton.click();
    await expect(page.getByRole("menu", { name: "Account menu" })).toBeVisible();
  });

  test("responsive tablet (768px): avatar button visible and menu opens", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    const avatarButton = page.getByRole("button", { name: "Open account menu" });
    await expect(avatarButton).toBeVisible();

    await avatarButton.click();
    await expect(page.getByRole("menu", { name: "Account menu" })).toBeVisible();
  });

  test("responsive desktop (1280px): avatar button visible and menu opens", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const avatarButton = page.getByRole("button", { name: "Open account menu" });
    await expect(avatarButton).toBeVisible();

    await avatarButton.click();
    await expect(page.getByRole("menu", { name: "Account menu" })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Tests — Login page (input validation / error states)
// ---------------------------------------------------------------------------

test.describe("LoginStatus — login page input validation", () => {
  test.beforeEach(async ({ context, page }) => {
    await clearAuthState(context);
    await page.goto("/login");
  });

  test("login page: email and password fields are present", async ({ page }) => {
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });

  test("login page: Sign in button is present", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("input validation: submitting empty form shows required errors", async ({ page }) => {
    // HTML5 required validation prevents submission — email field should get focus
    const emailInput = page.getByLabel("Email");
    await emailInput.fill("");
    await page.getByRole("button", { name: "Sign in" }).click();

    // The browser required validation fires; email field should be invalid
    const validationMessage = await emailInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage,
    );
    expect(validationMessage).not.toBe("");
  });

  test("input validation: entering invalid email format is rejected", async ({ page }) => {
    const emailInput = page.getByLabel("Email");
    await emailInput.fill("not-an-email");
    await page.getByRole("button", { name: "Sign in" }).click();

    const validationMessage = await emailInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage,
    );
    expect(validationMessage).not.toBe("");
  });

  test("error state: wrong credentials show general error alert", async ({ page }) => {
    await page.getByLabel("Email").fill("nonexistent@zlog.test");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign in" }).click();

    // Server returns "Account does not exist" error rendered in a role=alert element
    await expect(page.getByRole("alert")).toBeVisible({ timeout: 15_000 });
  });

  test("accessibility: email input has autocomplete=email", async ({ page }) => {
    await expect(page.getByLabel("Email")).toHaveAttribute("autocomplete", "email");
  });

  test("accessibility: password input has autocomplete=current-password", async ({ page }) => {
    await expect(page.getByLabel("Password")).toHaveAttribute(
      "autocomplete",
      "current-password",
    );
  });

  test("accessibility: Sign in button is keyboard-focusable", async ({ page }) => {
    const signInButton = page.getByRole("button", { name: "Sign in" });
    await signInButton.focus();
    await expect(signInButton).toBeFocused();
  });
});
