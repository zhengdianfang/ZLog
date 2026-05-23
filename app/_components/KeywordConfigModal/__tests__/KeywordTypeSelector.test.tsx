/**
 * @jest-environment node
 */
import { renderToString } from "react-dom/server";

describe("KeywordTypeSelector", () => {
  it("renders all five type options", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { KeywordTypeSelector } = require("../KeywordTypeSelector");
    const html = renderToString(
      <KeywordTypeSelector value={null} onChange={jest.fn()} />,
    );
    expect(html).toContain("info");
    expect(html).toContain("core");
    expect(html).toContain("warn");
    expect(html).toContain("error");
    expect(html).toContain("fatal");
  });

  it("renders with role radiogroup", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { KeywordTypeSelector } = require("../KeywordTypeSelector");
    const html = renderToString(
      <KeywordTypeSelector value={null} onChange={jest.fn()} />,
    );
    expect(html).toContain('role="radiogroup"');
  });

  it("renders each pill with role radio", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { KeywordTypeSelector } = require("../KeywordTypeSelector");
    const html = renderToString(
      <KeywordTypeSelector value={null} onChange={jest.fn()} />,
    );
    const radioMatches = html.match(/role="radio"/g);
    expect(radioMatches).toHaveLength(5);
  });

  it("sets aria-checked=true on the selected type", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { KeywordTypeSelector } = require("../KeywordTypeSelector");
    const html = renderToString(
      <KeywordTypeSelector value="warn" onChange={jest.fn()} />,
    );
    expect(html).toContain('aria-checked="true"');
  });

  it("sets aria-checked=false on non-selected types", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { KeywordTypeSelector } = require("../KeywordTypeSelector");
    const html = renderToString(
      <KeywordTypeSelector value="info" onChange={jest.fn()} />,
    );
    const falseMatches = html.match(/aria-checked="false"/g);
    expect(falseMatches).toHaveLength(4);
  });
});
