"use client";

import { useState, useCallback } from "react";
import { resolveDescription } from "@/app/lib/searchUtils";
import styles from "./PatternVerifyBlock.module.css";

type VerifyState =
  | { status: "idle" }
  | { status: "empty-demo" }
  | { status: "success"; groups: Record<string, string> }
  | { status: "no-match" };

interface PatternVerifyBlockProps {
  pattern: string;
  description?: string;
}

function parsePatternBody(pattern: string): string {
  const trimmed = pattern.trim();
  if (trimmed.startsWith("/") && trimmed.lastIndexOf("/") > 0) {
    const lastSlash = trimmed.lastIndexOf("/");
    return trimmed.slice(1, lastSlash);
  }
  return trimmed;
}

export function PatternVerifyBlock({ pattern, description }: PatternVerifyBlockProps) {
  const [demoString, setDemoString] = useState("");
  const [verifyState, setVerifyState] = useState<VerifyState>({ status: "idle" });

  const handleVerify = useCallback(() => {
    if (demoString.trim() === "") {
      setVerifyState({ status: "empty-demo" });
      return;
    }

    let regex: RegExp;
    try {
      const body = parsePatternBody(pattern);
      regex = new RegExp(body);
    } catch {
      setVerifyState({ status: "no-match" });
      return;
    }

    const match = regex.exec(demoString);
    if (!match) {
      setVerifyState({ status: "no-match" });
      return;
    }

    const groups: Record<string, string> = {};
    if (match.groups) {
      for (const [key, val] of Object.entries(match.groups)) {
        groups[key] = val ?? "";
      }
    }
    setVerifyState({ status: "success", groups });
  }, [demoString, pattern]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.inputRow}>
        <input
          id="pattern-verify-demo"
          type="text"
          className={styles.demoInput}
          placeholder="Paste a sample log line…"
          value={demoString}
          onChange={(e) => {
            setDemoString(e.target.value);
            setVerifyState({ status: "idle" });
          }}
          spellCheck={false}
        />
        <button
          type="button"
          className={styles.verifyBtn}
          onClick={handleVerify}
        >
          Verify
        </button>
      </div>
      <div className={styles.result} aria-live="polite">
        {verifyState.status === "empty-demo" && (
          <p className={styles.resultPrompt}>Enter a demo string before verifying.</p>
        )}
        {verifyState.status === "no-match" && (
          <p className={styles.resultNoMatch}>Pattern does not match the demo string.</p>
        )}
        {verifyState.status === "success" && (
          <div className={styles.resultSuccess}>
            <p className={styles.resultSuccessLabel}>Match found.</p>
            {Object.keys(verifyState.groups).length > 0 && (
              <>
                <table className={styles.groupTable}>
                  <thead>
                    <tr>
                      <th className={styles.groupTableTh}>Group</th>
                      <th className={styles.groupTableTh}>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(verifyState.groups).map(([name, value]) => (
                      <tr key={name}>
                        <td className={styles.groupTableTd}>{name}</td>
                        <td className={styles.groupTableTd}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {description && (() => {
                  const resolved = resolveDescription(description, verifyState.groups);
                  return resolved !== description ? (
                    <p className={styles.resolvedPreview}>
                      Preview: <span className={styles.resolvedValue}>{resolved}</span>
                    </p>
                  ) : null;
                })()}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
