export const SUPPORTED_EXTENSIONS = [
  "qlog",
  "zip",
  "gz",
  "log",
  "xlog",
  "txt",
  "xml",
] as const;

export type SupportedExtension = (typeof SUPPORTED_EXTENSIONS)[number];

export function getFileExtension(filename: string): string {
  const lower = filename.toLowerCase();
  const lastDot = lower.lastIndexOf(".");
  return lastDot >= 0 ? lower.slice(lastDot + 1) : "";
}

export function isSupportedFormat(filename: string): boolean {
  const ext = getFileExtension(filename);
  return (SUPPORTED_EXTENSIONS as readonly string[]).includes(ext);
}

export function validateFile(file: { name: string }): {
  valid: boolean;
  error?: string;
} {
  if (!isSupportedFormat(file.name)) {
    const ext = getFileExtension(file.name);
    const formatted = SUPPORTED_EXTENSIONS.map((e) => `.${e}`).join(", ");
    return {
      valid: false,
      error: `Unsupported file format${ext ? ` ".${ext}"` : ""}. Supported: ${formatted}`,
    };
  }
  return { valid: true };
}
