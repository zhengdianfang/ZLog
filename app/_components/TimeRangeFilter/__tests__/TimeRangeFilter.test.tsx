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
  startTime: "",
  endTime: "",
  setStartTime: jest.fn(),
  setEndTime: jest.fn(),
  clearFilter: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseFilterStore.mockReturnValue(defaultFilterState);
  mockUseFileStore.mockReturnValue({ loadedFile: null });
});

describe("TimeRangeFilter", () => {
  it("renders start and end time inputs", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const TimeRangeFilter = require("../TimeRangeFilter").default;
    const html = renderToString(<TimeRangeFilter />);
    expect(html).toContain('id="time-range-start"');
    expect(html).toContain('id="time-range-end"');
  });

  it("renders Apply button", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const TimeRangeFilter = require("../TimeRangeFilter").default;
    const html = renderToString(<TimeRangeFilter />);
    expect(html).toContain("Apply");
  });

  it("does not render Clear button when filter is not active", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const TimeRangeFilter = require("../TimeRangeFilter").default;
    const html = renderToString(<TimeRangeFilter />);
    expect(html).not.toContain("Clear");
  });

  it("renders Clear button when filter is active", () => {
    mockUseFilterStore.mockReturnValue({
      ...defaultFilterState,
      startTime: "2024-01-01T00:00",
    });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const TimeRangeFilter = require("../TimeRangeFilter").default;
    const html = renderToString(<TimeRangeFilter />);
    expect(html).toContain("Clear");
  });

  it("disables inputs when no file is loaded", () => {
    mockUseFileStore.mockReturnValue({ loadedFile: null });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const TimeRangeFilter = require("../TimeRangeFilter").default;
    const html = renderToString(<TimeRangeFilter />);
    expect(html).toContain("disabled");
  });

  it("enables inputs when a text file is loaded", () => {
    mockUseFileStore.mockReturnValue({
      loadedFile: { name: "app.log", size: 100, extension: "log", content: "line" },
    });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const TimeRangeFilter = require("../TimeRangeFilter").default;
    const html = renderToString(<TimeRangeFilter />);
    // Apply button should not have disabled when both inputs are empty (they are)
    // but inputs themselves should not be disabled
    const inputMatches = html.match(/type="datetime-local"[^>]*/g) ?? [];
    inputMatches.forEach((tag) => {
      expect(tag).not.toContain("disabled");
    });
  });

  it("renders Start and End labels", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const TimeRangeFilter = require("../TimeRangeFilter").default;
    const html = renderToString(<TimeRangeFilter />);
    expect(html).toContain("Start");
    expect(html).toContain("End");
  });
});
