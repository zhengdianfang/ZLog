/**
 * @jest-environment node
 */
import {
  SUPPORTED_EXTENSIONS,
  getFileExtension,
  isSupportedFormat,
  validateFile,
} from "@/app/lib/fileUtils";

describe("getFileExtension", () => {
  it("returns the extension in lowercase", () => {
    expect(getFileExtension("app.log")).toBe("log");
    expect(getFileExtension("CRASH.LOG")).toBe("log");
    expect(getFileExtension("data.XLOG")).toBe("xlog");
  });

  it("returns the last extension for multiple dots", () => {
    expect(getFileExtension("file.tar.gz")).toBe("gz");
    expect(getFileExtension("archive.old.zip")).toBe("zip");
  });

  it("returns empty string when there is no extension", () => {
    expect(getFileExtension("filename")).toBe("");
    expect(getFileExtension("")).toBe("");
  });
});

describe("isSupportedFormat", () => {
  it("accepts all supported extensions", () => {
    for (const ext of SUPPORTED_EXTENSIONS) {
      expect(isSupportedFormat(`file.${ext}`)).toBe(true);
    }
  });

  it("is case-insensitive", () => {
    expect(isSupportedFormat("file.LOG")).toBe(true);
    expect(isSupportedFormat("file.TXT")).toBe(true);
  });

  it("rejects unsupported formats", () => {
    expect(isSupportedFormat("photo.jpg")).toBe(false);
    expect(isSupportedFormat("document.pdf")).toBe(false);
    expect(isSupportedFormat("archive.tar")).toBe(false);
  });
});

describe("validateFile", () => {
  it("returns valid for supported formats", () => {
    expect(validateFile({ name: "app.log" })).toEqual({ valid: true });
    expect(validateFile({ name: "trace.qlog" })).toEqual({ valid: true });
    expect(validateFile({ name: "output.txt" })).toEqual({ valid: true });
    expect(validateFile({ name: "data.xml" })).toEqual({ valid: true });
  });

  it("returns an error for unsupported formats", () => {
    const result = validateFile({ name: "image.jpg" });
    expect(result.valid).toBe(false);
    expect(result.error).toContain(".jpg");
    expect(result.error).toContain("Supported");
  });

  it("error message includes all supported extensions", () => {
    const result = validateFile({ name: "file.pdf" });
    expect(result.valid).toBe(false);
    for (const ext of SUPPORTED_EXTENSIONS) {
      expect(result.error).toContain(`.${ext}`);
    }
  });

  it("handles files with no extension", () => {
    const result = validateFile({ name: "noextension" });
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });
});
