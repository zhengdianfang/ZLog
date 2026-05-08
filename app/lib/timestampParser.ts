const TIMESTAMP_PATTERNS: RegExp[] = [
  // ISO 8601 with T or space separator: 2024-01-15T10:30:45.123Z or 2024-01-15 10:30:45
  /(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)/,
  // Syslog style: Jan 15 10:30:45 or Jan  5 10:30:45
  /^(\w{3}\s{1,2}\d{1,2}\s+\d{2}:\d{2}:\d{2})/,
];

export function parseLineTimestamp(line: string): Date | null {
  for (const pattern of TIMESTAMP_PATTERNS) {
    const match = line.match(pattern);
    if (!match) continue;
    const raw = match[1];
    const normalized = /^\w{3}/.test(raw) ? raw : raw.replace(" ", "T");
    const date = new Date(normalized);
    if (!isNaN(date.getTime())) return date;
  }
  return null;
}
