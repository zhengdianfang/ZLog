/**
 * @jest-environment node
 */
import { renderToString } from "react-dom/server";

jest.mock("@/app/stores/filterStore");
jest.mock("@/app/stores/fileStore");

import { useFilterStore } from "@/app/stores/filterStore";
import { useFileStore } from "@/app/stores/fileStore";

const mockUseFilterStore = useFilterStore as unknown as jest.Mock;
const mockUseFileStore = useFileStore as unknown as jest.Mock;

const defaultFilterState = {
  keyword: "",
  setKeyword: jest.fn(),
  isRegexMode: false,
  setIsRegexMode: jest.fn(),
  isCaseSensitive: false,
  setIsCaseSensitive: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseFilterStore.mockReturnValue(defaultFilterState);
  mockUseFileStore.mockReturnValue({ loadedFile: null });
});

describe("KeywordSearch", () => {
  it("renders a search input", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const KeywordSearch = require("../KeywordSearch").default;
    const html = renderToString(<KeywordSearch />);
    expect(html).toContain('aria-label="Search logs by keyword"');
  });

  it("renders placeholder text", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const KeywordSearch = require("../KeywordSearch").default;
    const html = renderToString(<KeywordSearch />);
    expect(html).toContain("Search logs");
  });

  it("does not show result count when no keyword is set", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const KeywordSearch = require("../KeywordSearch").default;
    const html = renderToString(<KeywordSearch matchCount={0} totalFiltered={10} />);
    expect(html).not.toContain("match");
  });

  it("shows no-match message when keyword is active and matchCount is 0", () => {
    mockUseFilterStore.mockReturnValue({ ...defaultFilterState, keyword: "foobar" });
    mockUseFileStore.mockReturnValue({
      loadedFile: { name: "app.log", size: 100, extension: "log", content: "line" },
    });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const KeywordSearch = require("../KeywordSearch").default;
    const html = renderToString(<KeywordSearch matchCount={0} totalFiltered={5} />);
    expect(html).toContain("No matches found");
  });

  it("shows match count when keyword is active and matches exist", () => {
    mockUseFilterStore.mockReturnValue({ ...defaultFilterState, keyword: "error" });
    mockUseFileStore.mockReturnValue({
      loadedFile: { name: "app.log", size: 100, extension: "log", content: "error line" },
    });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const KeywordSearch = require("../KeywordSearch").default;
    const html = renderToString(<KeywordSearch matchCount={3} totalFiltered={10} />);
    expect(html).toContain("3");
    expect(html).toContain("10");
    expect(html).toContain("match");
  });

  it("shows clear button when input has a value", () => {
    mockUseFilterStore.mockReturnValue({ ...defaultFilterState, keyword: "error" });
    mockUseFileStore.mockReturnValue({ loadedFile: null });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const KeywordSearch = require("../KeywordSearch").default;
    const html = renderToString(<KeywordSearch />);
    expect(html).toContain('aria-label="Clear search"');
  });

  it("does not show clear button when input is empty", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const KeywordSearch = require("../KeywordSearch").default;
    const html = renderToString(<KeywordSearch />);
    expect(html).not.toContain('aria-label="Clear search"');
  });

  // --- New toggle button tests ---

  it('renders the case sensitivity toggle button with aria-label "Toggle case sensitivity"', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const KeywordSearch = require("../KeywordSearch").default;
    const html = renderToString(<KeywordSearch />);
    expect(html).toContain('aria-label="Toggle case sensitivity"');
  });

  it('renders the regex mode toggle button with aria-label "Toggle regex mode"', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const KeywordSearch = require("../KeywordSearch").default;
    const html = renderToString(<KeywordSearch />);
    expect(html).toContain('aria-label="Toggle regex mode"');
  });

  it("case sensitivity toggle reflects aria-pressed=false when isCaseSensitive is false", () => {
    mockUseFilterStore.mockReturnValue({ ...defaultFilterState, isCaseSensitive: false });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const KeywordSearch = require("../KeywordSearch").default;
    const html = renderToString(<KeywordSearch />);
    // aria-pressed="false" on the Aa button
    expect(html).toContain('aria-label="Toggle case sensitivity" aria-pressed="false"');
  });

  it("case sensitivity toggle reflects aria-pressed=true when isCaseSensitive is true", () => {
    mockUseFilterStore.mockReturnValue({ ...defaultFilterState, isCaseSensitive: true });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const KeywordSearch = require("../KeywordSearch").default;
    const html = renderToString(<KeywordSearch />);
    expect(html).toContain('aria-label="Toggle case sensitivity" aria-pressed="true"');
  });

  it("regex mode toggle reflects aria-pressed=false when isRegexMode is false", () => {
    mockUseFilterStore.mockReturnValue({ ...defaultFilterState, isRegexMode: false });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const KeywordSearch = require("../KeywordSearch").default;
    const html = renderToString(<KeywordSearch />);
    expect(html).toContain('aria-label="Toggle regex mode" aria-pressed="false"');
  });

  it("regex mode toggle reflects aria-pressed=true when isRegexMode is true", () => {
    mockUseFilterStore.mockReturnValue({ ...defaultFilterState, isRegexMode: true });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const KeywordSearch = require("../KeywordSearch").default;
    const html = renderToString(<KeywordSearch />);
    expect(html).toContain('aria-label="Toggle regex mode" aria-pressed="true"');
  });

  it("does not show regex error when regex mode is inactive", () => {
    mockUseFilterStore.mockReturnValue({
      ...defaultFilterState,
      keyword: "[unclosed",
      isRegexMode: false,
    });
    mockUseFileStore.mockReturnValue({ loadedFile: null });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const KeywordSearch = require("../KeywordSearch").default;
    const html = renderToString(<KeywordSearch />);
    expect(html).not.toContain("Invalid regex");
  });

  it("shows regex error with role=alert when regex mode is active and pattern is invalid", () => {
    mockUseFilterStore.mockReturnValue({
      ...defaultFilterState,
      keyword: "[unclosed",
      isRegexMode: true,
    });
    mockUseFileStore.mockReturnValue({ loadedFile: null });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const KeywordSearch = require("../KeywordSearch").default;
    const html = renderToString(<KeywordSearch />);
    expect(html).toContain("Invalid regex");
    expect(html).toContain('role="alert"');
  });

  it("sets aria-invalid on the input when regex mode is active and pattern is invalid", () => {
    mockUseFilterStore.mockReturnValue({
      ...defaultFilterState,
      keyword: "[unclosed",
      isRegexMode: true,
    });
    mockUseFileStore.mockReturnValue({ loadedFile: null });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const KeywordSearch = require("../KeywordSearch").default;
    const html = renderToString(<KeywordSearch />);
    expect(html).toContain('aria-invalid="true"');
  });

  it("does not show regex error when regex mode is active and pattern is valid", () => {
    mockUseFilterStore.mockReturnValue({
      ...defaultFilterState,
      keyword: "erro.*critical",
      isRegexMode: true,
    });
    mockUseFileStore.mockReturnValue({ loadedFile: null });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const KeywordSearch = require("../KeywordSearch").default;
    const html = renderToString(<KeywordSearch />);
    expect(html).not.toContain("Invalid regex");
    expect(html).not.toContain('role="alert"');
  });
});
