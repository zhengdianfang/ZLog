/**
 * @jest-environment node
 */
import { renderToString } from "react-dom/server";

jest.mock("@/app/stores/fileStore");
jest.mock("@/app/stores/filterStore");

import { useFileStore } from "@/app/stores/fileStore";
import { useFilterStore } from "@/app/stores/filterStore";

const mockUseFileStore = useFileStore as unknown as jest.Mock;
const mockUseFilterStore = useFilterStore as unknown as jest.Mock;

const defaultFilterState = {
  startTime: "",
  endTime: "",
  keyword: "",
  isRegexMode: false,
  isCaseSensitive: false,
  setKeyword: jest.fn(),
  setIsRegexMode: jest.fn(),
  setIsCaseSensitive: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseFilterStore.mockReturnValue(defaultFilterState);
});

describe("LogViewer", () => {
  it("renders nothing when no file is loaded", () => {
    mockUseFileStore.mockReturnValue({ loadedFile: null, closeFile: jest.fn() });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const LogViewer = require("../LogViewer").default;
    const html = renderToString(<LogViewer />);
    expect(html).toBe("");
  });

  it("renders file name and formatted size for a text file", () => {
    mockUseFileStore.mockReturnValue({
      loadedFile: {
        name: "app.log",
        size: 2048,
        extension: "log",
        content: "INFO starting up\nERROR crash",
      },
      closeFile: jest.fn(),
    });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const LogViewer = require("../LogViewer").default;
    const html = renderToString(<LogViewer />);
    expect(html).toContain("app.log");
    expect(html).toContain("2.0 KB");
    expect(html).toContain(".log");
    expect(html).toContain("INFO starting up");
  });

  it("renders each line as a separate element", () => {
    mockUseFileStore.mockReturnValue({
      loadedFile: {
        name: "app.log",
        size: 100,
        extension: "log",
        content: "line one\nline two\nline three",
      },
      closeFile: jest.fn(),
    });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const LogViewer = require("../LogViewer").default;
    const html = renderToString(<LogViewer />);
    expect(html).toContain("line one");
    expect(html).toContain("line two");
    expect(html).toContain("line three");
  });

  it("displays line numbers starting at 1", () => {
    mockUseFileStore.mockReturnValue({
      loadedFile: {
        name: "app.log",
        size: 100,
        extension: "log",
        content: "alpha\nbeta\ngamma",
      },
      closeFile: jest.fn(),
    });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const LogViewer = require("../LogViewer").default;
    const html = renderToString(<LogViewer />);
    expect(html).toContain(">1<");
    expect(html).toContain(">2<");
    expect(html).toContain(">3<");
  });

  it("shows total line count in file metadata", () => {
    mockUseFileStore.mockReturnValue({
      loadedFile: {
        name: "app.log",
        size: 100,
        extension: "log",
        content: "a\nb\nc",
      },
      closeFile: jest.fn(),
    });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const LogViewer = require("../LogViewer").default;
    const html = renderToString(<LogViewer />);
    expect(html).toContain("3 lines");
  });

  it("trims trailing empty line from files ending with newline", () => {
    mockUseFileStore.mockReturnValue({
      loadedFile: {
        name: "app.log",
        size: 100,
        extension: "log",
        content: "first\nsecond\n",
      },
      closeFile: jest.fn(),
    });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const LogViewer = require("../LogViewer").default;
    const html = renderToString(<LogViewer />);
    expect(html).toContain("2 lines");
  });

  it("renders binary placeholder for binary files", () => {
    mockUseFileStore.mockReturnValue({
      loadedFile: {
        name: "trace.qlog",
        size: 512,
        extension: "qlog",
        content: null,
      },
      closeFile: jest.fn(),
    });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const LogViewer = require("../LogViewer").default;
    const html = renderToString(<LogViewer />);
    expect(html).toContain("trace.qlog");
    expect(html).toContain("Binary file loaded");
    expect(html).toContain(".qlog");
  });

  it("renders a close button", () => {
    mockUseFileStore.mockReturnValue({
      loadedFile: {
        name: "app.log",
        size: 100,
        extension: "log",
        content: "",
      },
      closeFile: jest.fn(),
    });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const LogViewer = require("../LogViewer").default;
    const html = renderToString(<LogViewer />);
    expect(html).toContain('aria-label="Close file"');
  });

  it("preserves whitespace content in each line", () => {
    mockUseFileStore.mockReturnValue({
      loadedFile: {
        name: "app.log",
        size: 100,
        extension: "log",
        content: "  indented line\ttabbed",
      },
      closeFile: jest.fn(),
    });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const LogViewer = require("../LogViewer").default;
    const html = renderToString(<LogViewer />);
    expect(html).toContain("  indented line\ttabbed");
  });

  // --- Keyword search filter logic tests ---

  it("filters lines by plain keyword (case-insensitive by default)", () => {
    mockUseFilterStore.mockReturnValue({
      ...defaultFilterState,
      keyword: "error",
      isRegexMode: false,
      isCaseSensitive: false,
    });
    mockUseFileStore.mockReturnValue({
      loadedFile: {
        name: "app.log",
        size: 100,
        extension: "log",
        content: "ERROR: crash\nINFO: all good\nError: timeout",
      },
      closeFile: jest.fn(),
    });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const LogViewer = require("../LogViewer").default;
    const html = renderToString(<LogViewer />);
    // Matching text is wrapped in <mark> for highlighting, so we check for
    // the surrounding non-highlighted parts and the matched count instead.
    expect(html).toContain(": crash");
    expect(html).toContain(": timeout");
    expect(html).not.toContain("INFO: all good");
    expect(html).toContain("2 matched");
  });

  it("filters lines by plain keyword case-sensitively when isCaseSensitive is true", () => {
    mockUseFilterStore.mockReturnValue({
      ...defaultFilterState,
      keyword: "error",
      isRegexMode: false,
      isCaseSensitive: true,
    });
    mockUseFileStore.mockReturnValue({
      loadedFile: {
        name: "app.log",
        size: 100,
        extension: "log",
        content: "error: crash\nERROR: big crash\nINFO: ok",
      },
      closeFile: jest.fn(),
    });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const LogViewer = require("../LogViewer").default;
    const html = renderToString(<LogViewer />);
    // Only the lowercase "error" line should match.
    expect(html).toContain(": crash");
    expect(html).toContain("1 matched");
    expect(html).not.toContain("INFO: ok");
  });

  it("filters lines using multi-keyword OR when pipe is used in non-regex mode", () => {
    mockUseFilterStore.mockReturnValue({
      ...defaultFilterState,
      keyword: "crash|ANR|OOM",
      isRegexMode: false,
      isCaseSensitive: false,
    });
    mockUseFileStore.mockReturnValue({
      loadedFile: {
        name: "app.log",
        size: 100,
        extension: "log",
        content: "crash detected\nANR happened\nOOM error\nINFO: normal",
      },
      closeFile: jest.fn(),
    });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const LogViewer = require("../LogViewer").default;
    const html = renderToString(<LogViewer />);
    // The matched keywords are wrapped in <mark>; check non-highlighted portions.
    expect(html).toContain(" detected");
    expect(html).toContain(" happened");
    expect(html).toContain(" error");
    expect(html).not.toContain("INFO: normal");
    expect(html).toContain("3 matched");
  });

  it("filters lines using a valid regex in regex mode", () => {
    mockUseFilterStore.mockReturnValue({
      ...defaultFilterState,
      keyword: "err.*critical",
      isRegexMode: true,
      isCaseSensitive: false,
    });
    mockUseFileStore.mockReturnValue({
      loadedFile: {
        name: "app.log",
        size: 100,
        extension: "log",
        content: "err: critical issue\nwarning: minor\nerr: critical failure",
      },
      closeFile: jest.fn(),
    });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const LogViewer = require("../LogViewer").default;
    const html = renderToString(<LogViewer />);
    // 2 lines should match; the unmatched "warning" line must not appear.
    expect(html).toContain("2 matched");
    expect(html).toContain(" issue");
    expect(html).toContain(" failure");
    expect(html).not.toContain("warning: minor");
  });

  it("shows all lines (fail-open) when regex mode has an invalid pattern", () => {
    mockUseFilterStore.mockReturnValue({
      ...defaultFilterState,
      keyword: "[unclosed",
      isRegexMode: true,
      isCaseSensitive: false,
    });
    mockUseFileStore.mockReturnValue({
      loadedFile: {
        name: "app.log",
        size: 100,
        extension: "log",
        content: "line one\nline two",
      },
      closeFile: jest.fn(),
    });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const LogViewer = require("../LogViewer").default;
    const html = renderToString(<LogViewer />);
    // All lines should remain visible when regex is invalid.
    expect(html).toContain("line one");
    expect(html).toContain("line two");
  });
});
