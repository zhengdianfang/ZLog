import styles from "./WelcomePanel.module.css";

const SUPPORTED_FORMATS = [
  { ext: ".log", label: "Standard log" },
  { ext: ".txt", label: "Plain text" },
  { ext: ".crash", label: "Crash report" },
  { ext: ".ips", label: "iOS crash" },
  { ext: ".logcat", label: "Android logcat" },
];

const DOC_LINKS = [
  { label: "Getting Started Guide", href: "#" },
  { label: "Log Format Reference", href: "#" },
  { label: "Scenario Analysis Overview", href: "#" },
];

const PLUGIN_LINKS = [
  { label: "Android Studio Plugin", href: "#" },
  { label: "Xcode Plugin", href: "#" },
];

export default function WelcomePanel() {
  return (
    <div className={styles.panel}>
      <div className={styles.tabBar} role="tablist">
        <button
          role="tab"
          aria-selected="true"
          className={`${styles.tab} ${styles.tabActive}`}
          type="button"
        >
          Get Started
        </button>
      </div>

      <div className={styles.scrollArea}>
        <div className={styles.inner}>
          <section className={styles.hero}>
            <h2 className={styles.heading}>Welcome to ZLog</h2>
            <p className={styles.description}>
              A scenario-based log content analysis tool. View log information
              as a key timeline to quickly locate issues on mobile clients.
            </p>
            <button className={styles.openButton} type="button">
              Open Log File
            </button>
          </section>

          <div className={styles.divider} />

          <section className={styles.section} aria-labelledby="formats-title">
            <h3 className={styles.sectionTitle} id="formats-title">
              Supported Formats
            </h3>
            <ul className={styles.formatList} aria-label="Supported file formats">
              {SUPPORTED_FORMATS.map(({ ext, label }) => (
                <li key={ext} className={styles.formatChip} title={label}>
                  {ext}
                </li>
              ))}
            </ul>
          </section>

          <div className={styles.divider} />

          <section className={styles.section} aria-labelledby="docs-title">
            <h3 className={styles.sectionTitle} id="docs-title">
              Documentation
            </h3>
            <ul className={styles.linkList}>
              {DOC_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className={styles.link}>
                    {label}
                    <span className={styles.linkArrow} aria-hidden="true">→</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <div className={styles.divider} />

          <section className={styles.section} aria-labelledby="plugins-title">
            <h3 className={styles.sectionTitle} id="plugins-title">
              Plugins
            </h3>
            <ul className={styles.linkList}>
              {PLUGIN_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className={styles.link}>
                    {label}
                    <span className={styles.linkArrow} aria-hidden="true">↓</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
