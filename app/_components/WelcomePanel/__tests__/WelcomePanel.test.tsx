/**
 * @jest-environment node
 */
import { renderToString } from "react-dom/server";
import WelcomePanel from "../WelcomePanel";

describe("WelcomePanel", () => {
  let html: string;

  beforeAll(() => {
    html = renderToString(<WelcomePanel />);
  });

  it('renders the "Get Started" tab as the active tab', () => {
    expect(html).toContain("Get Started");
    expect(html).toContain('aria-selected="true"');
  });

  it("displays a welcome message", () => {
    expect(html).toContain("Welcome to ZLog");
  });

  it("shows the Open Log File button", () => {
    expect(html).toContain("Open Log File");
  });

  it("lists supported file formats from the spec", () => {
    expect(html).toContain(".qlog");
    expect(html).toContain(".zip");
    expect(html).toContain(".gz");
    expect(html).toContain(".log");
    expect(html).toContain(".xlog");
    expect(html).toContain(".txt");
    expect(html).toContain(".xml");
  });

  it("renders documentation links", () => {
    expect(html).toContain("Getting Started Guide");
    expect(html).toContain("Log Format Reference");
  });

  it("renders plugin download links", () => {
    expect(html).toContain("Android Studio Plugin");
    expect(html).toContain("Xcode Plugin");
  });

  it("does not show a validation error by default", () => {
    expect(html).not.toContain('role="alert"');
  });
});
