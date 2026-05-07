import { parseLineTimestamp } from "../timestampParser";

describe("parseLineTimestamp", () => {
  it("parses ISO 8601 with T separator", () => {
    const result = parseLineTimestamp("2024-01-15T10:30:45.123Z INFO startup");
    expect(result).toBeInstanceOf(Date);
    expect(result!.getUTCFullYear()).toBe(2024);
    expect(result!.getUTCMonth()).toBe(0);
    expect(result!.getUTCDate()).toBe(15);
  });

  it("parses ISO 8601 with space separator", () => {
    const result = parseLineTimestamp("2024-06-20 14:22:05 ERROR crash");
    expect(result).toBeInstanceOf(Date);
    expect(result!.getUTCFullYear()).toBe(2024);
  });

  it("parses ISO 8601 with milliseconds and no timezone", () => {
    const result = parseLineTimestamp("2024-03-01 09:00:00.456 DEBUG msg");
    expect(result).toBeInstanceOf(Date);
  });

  it("parses syslog-style timestamp", () => {
    const result = parseLineTimestamp("Jan 15 10:30:45 host process: message");
    expect(result).toBeInstanceOf(Date);
  });

  it("parses syslog-style with single-digit day", () => {
    const result = parseLineTimestamp("Jan  5 08:00:00 host kernel: boot");
    expect(result).toBeInstanceOf(Date);
  });

  it("returns null for lines with no timestamp", () => {
    expect(parseLineTimestamp("no timestamp here")).toBeNull();
    expect(parseLineTimestamp("  indented line with no date")).toBeNull();
    expect(parseLineTimestamp("")).toBeNull();
  });

  it("returns null for malformed dates", () => {
    expect(parseLineTimestamp("9999-99-99T99:99:99Z bad date")).toBeNull();
  });

  it("correctly orders two parsed timestamps", () => {
    const earlier = parseLineTimestamp("2024-01-01T00:00:00Z first");
    const later = parseLineTimestamp("2024-12-31T23:59:59Z last");
    expect(earlier!.getTime()).toBeLessThan(later!.getTime());
  });
});
