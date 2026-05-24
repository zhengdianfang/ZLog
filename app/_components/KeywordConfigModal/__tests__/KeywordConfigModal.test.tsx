/**
 * @jest-environment node
 */
import { renderToString } from "react-dom/server";

describe("KeywordConfigModal", () => {
  it("renders nothing when open is false", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { KeywordConfigModal } = require("../KeywordConfigModal");
    const html = renderToString(
      <KeywordConfigModal open={false} onClose={jest.fn()} onSave={jest.fn()} />,
    );
    expect(html).toBe("");
  });

  it("renders the modal title when open", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { KeywordConfigModal } = require("../KeywordConfigModal");
    const html = renderToString(
      <KeywordConfigModal open={true} onClose={jest.fn()} onSave={jest.fn()} />,
    );
    expect(html).toContain("Add Keyword Rule");
  });

  it("renders Cancel and Save Rule buttons", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { KeywordConfigModal } = require("../KeywordConfigModal");
    const html = renderToString(
      <KeywordConfigModal open={true} onClose={jest.fn()} onSave={jest.fn()} />,
    );
    expect(html).toContain("Cancel");
    expect(html).toContain("Save Rule");
  });

  it("renders all five keyword type pills", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { KeywordConfigModal } = require("../KeywordConfigModal");
    const html = renderToString(
      <KeywordConfigModal open={true} onClose={jest.fn()} onSave={jest.fn()} />,
    );
    expect(html).toContain("info");
    expect(html).toContain("core");
    expect(html).toContain("warn");
    expect(html).toContain("error");
    expect(html).toContain("fatal");
  });

  it("renders description and pattern inputs", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { KeywordConfigModal } = require("../KeywordConfigModal");
    const html = renderToString(
      <KeywordConfigModal open={true} onClose={jest.fn()} onSave={jest.fn()} />,
    );
    expect(html).toContain('id="keyword-description"');
    expect(html).toContain('id="keyword-pattern"');
  });

  it("renders the pattern verify area with demo input and Verify button", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { KeywordConfigModal } = require("../KeywordConfigModal");
    const html = renderToString(
      <KeywordConfigModal open={true} onClose={jest.fn()} onSave={jest.fn()} />,
    );
    expect(html).toContain("Verify");
    expect(html).toContain("pattern-verify-demo");
  });

  it("renders with aria-modal and role dialog", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { KeywordConfigModal } = require("../KeywordConfigModal");
    const html = renderToString(
      <KeywordConfigModal open={true} onClose={jest.fn()} onSave={jest.fn()} />,
    );
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
  });
});
