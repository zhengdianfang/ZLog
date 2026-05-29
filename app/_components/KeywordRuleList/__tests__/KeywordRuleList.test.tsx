/**
 * @jest-environment node
 */
import { renderToString } from "react-dom/server";

jest.mock("@/app/stores/keywordStore");

import { useKeywordStore } from "@/app/stores/keywordStore";

const mockUseKeywordStore = useKeywordStore as unknown as jest.Mock;

const ruleA = { id: "1", type: "error" as const, description: "Crash log", pattern: "/FATAL/" };
const ruleB = { id: "2", type: "warn" as const, description: "Slow response", pattern: "/SLOW/" };

beforeEach(() => {
  jest.clearAllMocks();
});

describe("KeywordRuleList", () => {
  it("renders rules as tags — both descriptions appear in output", () => {
    mockUseKeywordStore.mockReturnValue({ rules: [ruleA, ruleB], removeRule: jest.fn() });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { KeywordRuleList } = require("../KeywordRuleList");
    const html = renderToString(<KeywordRuleList onEdit={jest.fn()} />);
    expect(html).toContain("Crash log");
    expect(html).toContain("Slow response");
  });

  it("clicking tag label calls onEdit — tag label element is rendered with correct class", () => {
    mockUseKeywordStore.mockReturnValue({ rules: [ruleA], removeRule: jest.fn() });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { KeywordRuleList } = require("../KeywordRuleList");
    const html = renderToString(<KeywordRuleList onEdit={jest.fn()} />);
    expect(html).toContain("Crash log");
    expect(html).toContain("tagLabel");
  });

  it("renders remove button for each rule with correct aria-label", () => {
    mockUseKeywordStore.mockReturnValue({ rules: [ruleA, ruleB], removeRule: jest.fn() });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { KeywordRuleList } = require("../KeywordRuleList");
    const html = renderToString(<KeywordRuleList onEdit={jest.fn()} />);
    expect(html).toContain(`aria-label="Remove rule: Crash log"`);
    expect(html).toContain(`aria-label="Remove rule: Slow response"`);
  });

  it("shows placeholder text when no rules exist", () => {
    mockUseKeywordStore.mockReturnValue({ rules: [], removeRule: jest.fn() });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { KeywordRuleList } = require("../KeywordRuleList");
    const html = renderToString(<KeywordRuleList onEdit={jest.fn()} />);
    expect(html).toContain("No keyword rules yet. Add one to start highlighting.");
  });

  it("does not show placeholder when rules exist", () => {
    mockUseKeywordStore.mockReturnValue({ rules: [ruleA], removeRule: jest.fn() });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { KeywordRuleList } = require("../KeywordRuleList");
    const html = renderToString(<KeywordRuleList onEdit={jest.fn()} />);
    expect(html).not.toContain("No keyword rules yet.");
  });

  it("applies type-based background color from KEYWORD_TYPE_COLORS to the tag", () => {
    mockUseKeywordStore.mockReturnValue({ rules: [ruleA], removeRule: jest.fn() });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { KeywordRuleList } = require("../KeywordRuleList");
    const html = renderToString(<KeywordRuleList onEdit={jest.fn()} />);
    expect(html).toContain("#fef2f2");
  });
});
