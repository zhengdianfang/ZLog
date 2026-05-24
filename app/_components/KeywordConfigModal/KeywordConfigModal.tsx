"use client";

import { useEffect, useRef, useState } from "react";
import type { KeywordRule, KeywordType } from "@/app/types/keyword";
import { KeywordTypeSelector } from "./KeywordTypeSelector";
import { PatternVerifyBlock } from "./PatternVerifyBlock";
import styles from "./KeywordConfigModal.module.css";

interface FormErrors {
  type?: string;
  description?: string;
  pattern?: string;
}

interface KeywordConfigModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (rule: KeywordRule) => void;
  initialRule?: KeywordRule;
}

function validatePatternSyntax(value: string): string | null {
  if (value.trim() === "") return null;
  const body = value.trim().startsWith("/") && value.trim().lastIndexOf("/") > 0
    ? value.trim().slice(1, value.trim().lastIndexOf("/"))
    : value.trim();
  try {
    new RegExp(body);
    return null;
  } catch (err) {
    return err instanceof Error ? err.message : "Invalid regular expression";
  }
}

interface ModalFormProps {
  onClose: () => void;
  onSave: (rule: KeywordRule) => void;
  initialRule?: KeywordRule;
}

function ModalForm({ onClose, onSave, initialRule }: ModalFormProps) {
  const isEdit = initialRule !== undefined;
  const [selectedType, setSelectedType] = useState<KeywordType | null>(initialRule?.type ?? null);
  const [description, setDescription] = useState(initialRule?.description ?? "");
  const [pattern, setPattern] = useState(initialRule?.pattern ?? "");
  const [patternError, setPatternError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  const handlePatternChange = (value: string) => {
    setPattern(value);
    setPatternError(validatePatternSyntax(value));
    setErrors((prev) => ({ ...prev, pattern: undefined }));
  };

  const handleSave = () => {
    const nextErrors: FormErrors = {};

    if (!selectedType) {
      nextErrors.type = "Please select a keyword type.";
    }
    if (description.trim() === "") {
      nextErrors.description = "Description is required.";
    }
    if (pattern.trim() === "") {
      nextErrors.pattern = "Filter pattern is required.";
    } else {
      const syntaxError = validatePatternSyntax(pattern);
      if (syntaxError) {
        nextErrors.pattern = `Invalid regex: ${syntaxError}`;
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSave({
      id: isEdit ? initialRule.id : crypto.randomUUID(),
      type: selectedType as KeywordType,
      description: description.trim(),
      pattern: pattern.trim(),
    });
    onClose();
  };

  return (
    <>
      <div className={styles.body}>
        <div className={styles.row}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Type <span className={styles.required} aria-hidden="true">*</span>
            </label>
            <KeywordTypeSelector value={selectedType} onChange={setSelectedType} />
            {errors.type && (
              <p className={styles.fieldError} role="alert">{errors.type}</p>
            )}
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="keyword-description" className={styles.label}>
            Description <span className={styles.required} aria-hidden="true">*</span>
          </label>
          <input
            id="keyword-description"
            type="text"
            className={`${styles.input}${errors.description ? ` ${styles.inputError}` : ""}`}
            placeholder="e.g. Video start"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setErrors((prev) => ({ ...prev, description: undefined }));
            }}
            aria-invalid={!!errors.description}
          />
          {errors.description && (
            <p className={styles.fieldError} role="alert">{errors.description}</p>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="keyword-pattern" className={styles.label}>
            Filter Pattern <span className={styles.required} aria-hidden="true">*</span>
          </label>
          <input
            id="keyword-pattern"
            type="text"
            className={`${styles.input} ${styles.monoInput}${errors.pattern || patternError ? ` ${styles.inputError}` : ""}`}
            placeholder="/pattern/"
            value={pattern}
            onChange={(e) => handlePatternChange(e.target.value)}
            aria-invalid={!!(errors.pattern || patternError)}
            spellCheck={false}
          />
          {patternError && !errors.pattern && (
            <p className={styles.fieldError} role="alert">Invalid regex: {patternError}</p>
          )}
          {errors.pattern && (
            <p className={styles.fieldError} role="alert">{errors.pattern}</p>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="pattern-verify-demo" className={styles.label}>
            Pattern Verify
          </label>
          <PatternVerifyBlock pattern={pattern} />
        </div>
      </div>

      <div className={styles.footer}>
        <button
          type="button"
          className={styles.buttonCancel}
          onClick={onClose}
          ref={cancelRef}
        >
          Cancel
        </button>
        <button
          type="button"
          className={styles.buttonSave}
          onClick={handleSave}
        >
          {isEdit ? "Update Rule" : "Save Rule"}
        </button>
      </div>
    </>
  );
}

export function KeywordConfigModal({ open, onClose, onSave, initialRule }: KeywordConfigModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="keyword-config-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 id="keyword-config-modal-title" className={styles.title}>
            {initialRule ? "Edit Keyword Rule" : "Add Keyword Rule"}
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close keyword config"
          >
            ×
          </button>
        </div>
        <ModalForm key={initialRule?.id ?? "new"} onClose={onClose} onSave={onSave} initialRule={initialRule} />
      </div>
    </div>
  );
}
