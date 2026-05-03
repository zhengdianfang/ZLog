import { verifyEmailForReset, resetPassword } from "../auth";
import { db } from "@/db";
import bcrypt from "bcryptjs";

// --- mocks ---

jest.mock("@/db", () => ({
  db: { select: jest.fn(), update: jest.fn() },
}));

jest.mock("bcryptjs", () => ({
  __esModule: true,
  default: { hash: jest.fn(), compare: jest.fn() },
}));

jest.mock("next/navigation", () => ({ redirect: jest.fn() }));

jest.mock("drizzle-orm", () => ({ eq: jest.fn() }));
jest.mock("@/db/schema", () => ({
  users: { id: "id", email: "email", passwordHash: "password_hash" },
}));

import { redirect } from "next/navigation";

// --- helpers ---

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) fd.append(key, value);
  return fd;
}

function mockSelectReturning(rows: unknown[]) {
  const limit = jest.fn().mockResolvedValue(rows);
  const where = jest.fn().mockReturnValue({ limit });
  const from = jest.fn().mockReturnValue({ where });
  (db.select as jest.Mock).mockReturnValue({ from });
}

function mockUpdateOk() {
  const where = jest.fn().mockResolvedValue(undefined);
  const set = jest.fn().mockReturnValue({ where });
  (db.update as jest.Mock).mockReturnValue({ set });
}

// --- setup ---

beforeEach(() => {
  jest.clearAllMocks();
  mockSelectReturning([]);
  mockUpdateOk();
  (bcrypt.hash as jest.Mock).mockResolvedValue("new_hashed_password");
});

// --- verifyEmailForReset ---

describe("verifyEmailForReset", () => {
  describe("validation", () => {
    it("returns email error for invalid email format", async () => {
      const result = await verifyEmailForReset(
        makeFormData({ email: "not-an-email" })
      );

      expect(result).toEqual({
        success: false,
        errors: expect.objectContaining({ email: expect.any(Array) }),
      });
    });
  });

  describe("email not found", () => {
    it("returns general error when email is not registered", async () => {
      mockSelectReturning([]);

      const result = await verifyEmailForReset(
        makeFormData({ email: "unknown@example.com" })
      );

      expect(result).toEqual({
        success: false,
        errors: { general: "No account found with that email" },
      });
    });
  });

  describe("email found", () => {
    it("redirects to reset-password page with encoded email", async () => {
      mockSelectReturning([{ id: 1 }]);

      await verifyEmailForReset(
        makeFormData({ email: "user@example.com" })
      );

      expect(redirect).toHaveBeenCalledWith(
        "/reset-password?email=user%40example.com"
      );
    });

    it("normalizes email to lowercase before lookup", async () => {
      mockSelectReturning([{ id: 1 }]);

      await verifyEmailForReset(
        makeFormData({ email: "User@Example.COM" })
      );

      expect(redirect).toHaveBeenCalledWith(
        expect.stringContaining("user%40example.com")
      );
    });
  });
});

// --- resetPassword ---

describe("resetPassword", () => {
  const existingUser = { id: 1 };

  beforeEach(() => {
    mockSelectReturning([existingUser]);
  });

  describe("validation", () => {
    it("returns password error when password is too short", async () => {
      const result = await resetPassword(
        makeFormData({ email: "user@example.com", password: "abc" })
      );

      expect(result).toEqual({
        success: false,
        errors: expect.objectContaining({ password: expect.any(Array) }),
      });
      expect(
        (result as { success: false; errors: { password?: string[] } }).errors.password?.[0]
      ).toBe("Password must be at least 6 characters");
    });
  });

  describe("email not found", () => {
    it("returns general error when user no longer exists", async () => {
      mockSelectReturning([]);

      const result = await resetPassword(
        makeFormData({ email: "gone@example.com", password: "newpassword" })
      );

      expect(result).toEqual({
        success: false,
        errors: { general: "No account found with that email" },
      });
    });
  });

  describe("successful reset", () => {
    it("hashes the new password with cost factor 12", async () => {
      await resetPassword(
        makeFormData({ email: "user@example.com", password: "newpassword" })
      );

      expect(bcrypt.hash).toHaveBeenCalledWith("newpassword", 12);
    });

    it("stores the hashed password, not the plaintext", async () => {
      await resetPassword(
        makeFormData({ email: "user@example.com", password: "newpassword" })
      );

      const setCall = (db.update as jest.Mock).mock.results[0].value.set;
      expect(setCall).toHaveBeenCalledWith(
        expect.objectContaining({ passwordHash: "new_hashed_password" })
      );
    });

    it("redirects to login after successful password reset", async () => {
      await resetPassword(
        makeFormData({ email: "user@example.com", password: "newpassword" })
      );

      expect(redirect).toHaveBeenCalledWith("/login");
    });
  });
});
