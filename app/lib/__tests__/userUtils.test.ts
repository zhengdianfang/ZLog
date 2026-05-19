import { getInitials } from "@/app/lib/userUtils";
import type { AuthUser } from "@/app/stores/authStore";

function makeUser(overrides: Partial<AuthUser>): AuthUser {
  return { id: "1", email: "user@example.com", ...overrides };
}

describe("getInitials", () => {
  it("returns the first character of the display name uppercased when it is set", () => {
    const user = makeUser({ displayName: "alice" });
    expect(getInitials(user)).toBe("A");
  });

  it("falls back to the email address when display name is not set", () => {
    const user = makeUser({ displayName: undefined });
    expect(getInitials(user)).toBe("U");
  });

  it("falls back to the email address when display name is null-ish (undefined)", () => {
    const user = makeUser({ email: "bob@example.com", displayName: undefined });
    expect(getInitials(user)).toBe("B");
  });

  it("uppercases a lowercase display name initial", () => {
    const user = makeUser({ displayName: "charlie" });
    expect(getInitials(user)).toBe("C");
  });

  it("handles a display name that starts with an already uppercase character", () => {
    const user = makeUser({ displayName: "Diana" });
    expect(getInitials(user)).toBe("D");
  });

  it("returns the first character of a multi-word display name", () => {
    const user = makeUser({ displayName: "John Doe" });
    expect(getInitials(user)).toBe("J");
  });

  it("handles an email that starts with a number", () => {
    const user = makeUser({ email: "9nine@example.com", displayName: undefined });
    expect(getInitials(user)).toBe("9");
  });
});
