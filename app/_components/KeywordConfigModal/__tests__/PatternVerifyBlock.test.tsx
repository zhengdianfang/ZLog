/**
 * @jest-environment node
 */
import { renderToString } from "react-dom/server";

describe("PatternVerifyBlock", () => {
  it("renders the demo input and Verify button", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PatternVerifyBlock } = require("../PatternVerifyBlock");
    const html = renderToString(<PatternVerifyBlock pattern="/foo/" />);
    expect(html).toContain("Verify");
    expect(html).toContain("id=\"pattern-verify-demo\"");
  });

  it("renders with aria-live polite result area", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PatternVerifyBlock } = require("../PatternVerifyBlock");
    const html = renderToString(<PatternVerifyBlock pattern="" />);
    expect(html).toContain('aria-live="polite"');
  });

  it("does not show result text on initial render", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PatternVerifyBlock } = require("../PatternVerifyBlock");
    const html = renderToString(<PatternVerifyBlock pattern="/test/" />);
    expect(html).not.toContain("Match found");
    expect(html).not.toContain("does not match");
    expect(html).not.toContain("Enter a demo string");
  });
});
