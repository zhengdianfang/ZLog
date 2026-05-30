/**
 * @jest-environment node
 */
import { renderToString } from "react-dom/server";

jest.mock("@/app/stores/keywordStore");

import { useKeywordStore } from "@/app/stores/keywordStore";

const mockUseKeywordStore = useKeywordStore as unknown as jest.Mock;

const ruleA = { id: "1", type: "error" as const, description: "Crash log", pattern: "/FATAL/" };
const ruleB = { id: "2", type: "warn" as const, description: "Slow response", pattern: "/SLOW/" };

import type { KeywordRule } from "@/app/types/keyword";

const baseStore = (savedRules: KeywordRule[], rules: KeywordRule[]) => ({
  savedRules,
  rules,
  setActiveRuleIds: jest.fn(),
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("KeywordRuleList", () => {
  it("renders active rules as tags — both descriptions appear in output", () => {
    mockUseKeywordStore.mockReturnValue(baseStore([ruleA, ruleB], [ruleA, ruleB]));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { KeywordRuleList } = require("../KeywordRuleList");
    const html = renderToString(<KeywordRuleList onEdit={jest.fn()} />);
    expect(html).toContain("Crash log");
    expect(html).toContain("Slow response");
  });

  it("renders tag label element with correct class for each active rule", () => {
    mockUseKeywordStore.mockReturnValue(baseStore([ruleA], [ruleA]));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { KeywordRuleList } = require("../KeywordRuleList");
    const html = renderToString(<KeywordRuleList onEdit={jest.fn()} />);
    expect(html).toContain("Crash log");
    expect(html).toContain("tagLabel");
  });

  it("renders remove button for each active rule with correct aria-label", () => {
    mockUseKeywordStore.mockReturnValue(baseStore([ruleA, ruleB], [ruleA, ruleB]));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { KeywordRuleList } = require("../KeywordRuleList");
    const html = renderToString(<KeywordRuleList onEdit={jest.fn()} />);
    expect(html).toContain(`aria-label="Remove rule: Crash log"`);
    expect(html).toContain(`aria-label="Remove rule: Slow response"`);
  });

  it("shows placeholder text when no active rules exist", () => {
    mockUseKeywordStore.mockReturnValue(baseStore([], []));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { KeywordRuleList } = require("../KeywordRuleList");
    const html = renderToString(<KeywordRuleList onEdit={jest.fn()} />);
    expect(html).toContain("Select saved keyword rules to apply...");
  });

  it("does not show placeholder when active rules exist", () => {
    mockUseKeywordStore.mockReturnValue(baseStore([ruleA], [ruleA]));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { KeywordRuleList } = require("../KeywordRuleList");
    const html = renderToString(<KeywordRuleList onEdit={jest.fn()} />);
    expect(html).not.toContain("Select saved keyword rules");
  });

  it("applies type-based background color from KEYWORD_TYPE_COLORS to the tag", () => {
    mockUseKeywordStore.mockReturnValue(baseStore([ruleA], [ruleA]));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { KeywordRuleList } = require("../KeywordRuleList");
    const html = renderToString(<KeywordRuleList onEdit={jest.fn()} />);
    expect(html).toContain("#fef2f2");
  });
});
