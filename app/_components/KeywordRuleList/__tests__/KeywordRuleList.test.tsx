/**
 * @jest-environment node
 */
import { renderToString } from "react-dom/server";

jest.mock("@/app/stores/keywordStore");

import { useKeywordStore } from "@/app/stores/keywordStore";

const mockUseKeywordStore = useKeywordStore as unknown as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("KeywordRuleList", () => {
  it("renders empty state message when there are no rules", () => {
    mockUseKeywordStore.mockReturnValue({ rules: [], removeRule: jest.fn() });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { KeywordRuleList } = require("../KeywordRuleList");
    const html = renderToString(<KeywordRuleList />);
    expect(html).toContain("No keyword rules yet");
  });

  it("renders a rule row when rules exist", () => {
    mockUseKeywordStore.mockReturnValue({
      rules: [
        {
          id: "1",
          type: "error",
          description: "Crash log",
          pattern: "/FATAL/",
        },
      ],
      removeRule: jest.fn(),
    });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { KeywordRuleList } = require("../KeywordRuleList");
    const html = renderToString(<KeywordRuleList />);
    expect(html).toContain("Crash log");
    expect(html).toContain("/FATAL/");
    expect(html).toContain("error");
  });

  it("renders a delete button for each rule", () => {
    mockUseKeywordStore.mockReturnValue({
      rules: [
        { id: "a", type: "info", description: "Start", pattern: "/start/" },
        { id: "b", type: "warn", description: "Warn", pattern: "/warn/" },
      ],
      removeRule: jest.fn(),
    });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { KeywordRuleList } = require("../KeywordRuleList");
    const html = renderToString(<KeywordRuleList />);
    const deleteMatches = html.match(/aria-label="Delete rule:/g);
    expect(deleteMatches).toHaveLength(2);
  });

  it("does not render empty state when rules exist", () => {
    mockUseKeywordStore.mockReturnValue({
      rules: [
        { id: "1", type: "core", description: "Core", pattern: "/core/" },
      ],
      removeRule: jest.fn(),
    });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { KeywordRuleList } = require("../KeywordRuleList");
    const html = renderToString(<KeywordRuleList />);
    expect(html).not.toContain("No keyword rules yet");
  });
});
