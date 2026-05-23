/**
 * @jest-environment node
 */

describe("keywordStore", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("initialises with an empty rules array", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useKeywordStore } = require("../keywordStore");
    expect(useKeywordStore.getState().rules).toEqual([]);
  });

  it("addRule appends a rule to the list", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useKeywordStore } = require("../keywordStore");
    const rule = { id: "1", type: "info" as const, description: "Test", pattern: "/test/" };
    useKeywordStore.getState().addRule(rule);
    expect(useKeywordStore.getState().rules).toHaveLength(1);
    expect(useKeywordStore.getState().rules[0]).toEqual(rule);
  });

  it("removeRule deletes a rule by id", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useKeywordStore } = require("../keywordStore");
    const ruleA = { id: "a", type: "warn" as const, description: "A", pattern: "/a/" };
    const ruleB = { id: "b", type: "error" as const, description: "B", pattern: "/b/" };
    useKeywordStore.getState().addRule(ruleA);
    useKeywordStore.getState().addRule(ruleB);
    useKeywordStore.getState().removeRule("a");
    const rules = useKeywordStore.getState().rules;
    expect(rules).toHaveLength(1);
    expect(rules[0].id).toBe("b");
  });

  it("removeRule with unknown id does not change rules", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useKeywordStore } = require("../keywordStore");
    const rule = { id: "x", type: "fatal" as const, description: "X", pattern: "/x/" };
    useKeywordStore.getState().addRule(rule);
    useKeywordStore.getState().removeRule("unknown");
    expect(useKeywordStore.getState().rules).toHaveLength(1);
  });
});
