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
  submittedKeyword: "",
  isRegexMode: false,
  isCaseSensitive: false,
  setKeyword: jest.fn(),
  setSubmittedKeyword: jest.fn(),
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

  // --- Tab bar tests ---

  it("renders the Log tab when a file is loaded", () => {
    mockUseFileStore.mockReturnValue({
      loadedFile: {
        name: "app.log",
        size: 100,
        extension: "log",
        content: "line one",
      },
      closeFile: jest.fn(),
    });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const LogViewer = require("../LogViewer").default;
    const html = renderToString(<LogViewer />);
    expect(html).toContain("Log");
  });

  it("does not render the Search Results tab before a search is run", () => {
    mockUseFileStore.mockReturnValue({
      loadedFile: {
        name: "app.log",
        size: 100,
        extension: "log",
        content: "line one",
      },
      closeFile: jest.fn(),
    });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const LogViewer = require("../LogViewer").default;
    const html = renderToString(<LogViewer />);
    expect(html).not.toContain("Search Results");
  });

  // --- Log tab shows all time-filtered lines (no keyword inline filtering) ---

  it("shows all lines on the Log tab regardless of keyword store value", () => {
    mockUseFilterStore.mockReturnValue({
      ...defaultFilterState,
      keyword: "error",
      submittedKeyword: "error",
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
    // Log tab shows all lines — no inline keyword filtering.
    expect(html).toContain("ERROR: crash");
    expect(html).toContain("INFO: all good");
    expect(html).toContain("Error: timeout");
  });
});
