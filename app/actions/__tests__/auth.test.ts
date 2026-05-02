import { registerUser } from "../auth";
import { db } from "@/db";
import bcrypt from "bcryptjs";

// --- mocks ---

jest.mock("@/db", () => ({
  db: { select: jest.fn(), insert: jest.fn() },
}));

jest.mock("bcryptjs", () => ({
  __esModule: true,
  default: { hash: jest.fn() },
}));

// drizzle-orm eq / schema columns are just values; mock them as no-ops
jest.mock("drizzle-orm", () => ({ eq: jest.fn() }));
jest.mock("@/db/schema", () => ({
  users: { id: "id", email: "email", passwordHash: "password_hash" },
}));

// --- helpers ---

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) fd.append(key, value);
  return fd;
}

/** Wire up db.select().from().where().limit() to resolve with `rows`. */
function mockSelectReturning(rows: unknown[]) {
  const limit = jest.fn().mockResolvedValue(rows);
  const where = jest.fn().mockReturnValue({ limit });
  const from = jest.fn().mockReturnValue({ where });
  (db.select as jest.Mock).mockReturnValue({ from });
}

/** Wire up db.insert().values() to resolve successfully. */
function mockInsertOk() {
  const values = jest.fn().mockResolvedValue(undefined);
  (db.insert as jest.Mock).mockReturnValue({ values });
}

// --- setup ---

beforeEach(() => {
  jest.clearAllMocks();
  mockSelectReturning([]);
  mockInsertOk();
  (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");
});

// --- tests ---

describe("registerUser", () => {
  describe("validation", () => {
    it("returns email error for invalid email format", async () => {
      const result = await registerUser(
        makeFormData({ email: "not-an-email", password: "secret123" })
      );

      expect(result).toEqual({
        success: false,
        errors: expect.objectContaining({ email: expect.any(Array) }),
      });
      expect((result as { success: false; errors: { email?: string[] } }).errors.email?.[0]).toBe(
        "Invalid email format"
      );
    });

    it("returns password error when password is shorter than 6 characters", async () => {
      const result = await registerUser(
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

    it("returns both errors when email and password are both invalid", async () => {
      const result = await registerUser(
        makeFormData({ email: "bad", password: "12" })
      ) as { success: false; errors: { email?: string[]; password?: string[] } };

      expect(result.success).toBe(false);
      expect(result.errors.email).toBeDefined();
      expect(result.errors.password).toBeDefined();
    });
  });

  describe("duplicate email", () => {
    it("returns general error when email is already registered", async () => {
      mockSelectReturning([{ id: 1 }]);

      const result = await registerUser(
        makeFormData({ email: "taken@example.com", password: "secret123" })
      );

      expect(result).toEqual({
        success: false,
        errors: { general: "Email already exists" },
      });
    });
  });

  describe("successful registration", () => {
    it("returns success for valid, unique credentials", async () => {
      const result = await registerUser(
        makeFormData({ email: "new@example.com", password: "secret123" })
      );

      expect(result).toEqual({ success: true });
    });

    it("normalizes email to lowercase before storing", async () => {
      await registerUser(
        makeFormData({ email: "User@Example.COM", password: "secret123" })
      );

      const insertValues = (db.insert as jest.Mock).mock.results[0].value.values;
      expect(insertValues).toHaveBeenCalledWith(
        expect.objectContaining({ email: "user@example.com" })
      );
    });

    it("hashes the password with cost factor 12", async () => {
      await registerUser(
        makeFormData({ email: "new@example.com", password: "mysecret" })
      );

      expect(bcrypt.hash).toHaveBeenCalledWith("mysecret", 12);
    });

    it("stores the hashed password, not the plaintext", async () => {
      await registerUser(
        makeFormData({ email: "new@example.com", password: "mysecret" })
      );

      const insertValues = (db.insert as jest.Mock).mock.results[0].value.values;
      expect(insertValues).toHaveBeenCalledWith(
        expect.objectContaining({ passwordHash: "hashed_password" })
      );
    });
  });
});
