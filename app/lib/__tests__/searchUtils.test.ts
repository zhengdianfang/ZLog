/**
 * @jest-environment node
 */
import { resolveDescription, buildSearchRegex } from "@/app/lib/searchUtils";

describe("resolveDescription", () => {
  it("substitutes a single named capture group by its key", () => {
    expect(resolveDescription("hh : type=$1", { "$1": "2000" })).toBe("hh : type=2000");
  });

  it("substitutes multiple capture groups", () => {
    expect(
      resolveDescription("$name is $age years old", { "$name": "Alice", "$age": "30" }),
    ).toBe("Alice is 30 years old");
  });

  it("returns the template unchanged when groups is empty", () => {
    expect(resolveDescription("no placeholders", {})).toBe("no placeholders");
  });

  it("returns the template unchanged when no key matches", () => {
    expect(resolveDescription("type=$2", { "$1": "2000" })).toBe("type=$2");
  });

  it("replaces all occurrences of the same placeholder", () => {
    expect(resolveDescription("$1 and $1", { "$1": "X" })).toBe("X and X");
  });

  it("handles empty captured value", () => {
    expect(resolveDescription("prefix$1suffix", { "$1": "" })).toBe("prefixsuffix");
  });

  it("handles capture group names without dollar sign", () => {
    expect(resolveDescription("type=level", { "level": "warn" })).toBe("type=warn");
  });
});

describe("buildSearchRegex", () => {
  it("returns null for empty keyword", () => {
    expect(buildSearchRegex("", false, false)).toBeNull();
  });

  it("builds case-insensitive regex by default", () => {
    const regex = buildSearchRegex("error", false, false);
    expect(regex?.flags).toContain("i");
    expect(regex?.test("ERROR")).toBe(true);
  });

  it("builds case-sensitive regex when isCaseSensitive is true", () => {
    const regex = buildSearchRegex("error", false, true);
    expect(regex?.flags).not.toContain("i");
    expect(regex?.test("ERROR")).toBe(false);
    expect(regex?.test("error")).toBe(true);
  });

  it("splits pipe-delimited terms in non-regex mode", () => {
    const regex = buildSearchRegex("crash|ANR", false, false);
    expect(regex?.test("app crash occurred")).toBe(true);
    expect(regex?.test("ANR detected")).toBe(true);
  });

  it("returns null for invalid regex in regex mode", () => {
    expect(buildSearchRegex("[unclosed", true, false)).toBeNull();
  });
});
