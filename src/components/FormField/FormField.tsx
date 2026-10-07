import React, { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';
import styles from './FormField.module.css';
import { ChevronDown } from 'lucide-react';

interface BaseFieldProps {
  label?: string;
  error?: ReactNode;
  hint?: string;
  required?: boolean;
  className?: string;
  id?: string;
}

export interface TextInputFieldProps extends BaseFieldProps, InputHTMLAttributes<HTMLInputElement> {
  as?: 'input';
}

export interface TextareaFieldProps extends BaseFieldProps, TextareaHTMLAttributes<HTMLTextAreaElement> {
  as: 'textarea';
}

export interface SelectFieldProps extends BaseFieldProps, SelectHTMLAttributes<HTMLSelectElement> {
  as: 'select';
  children: ReactNode;
}

export type FormFieldProps = TextInputFieldProps | TextareaFieldProps | SelectFieldProps;

export const FormField = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  FormFieldProps
>((props, ref) => {
  const { label, error, hint, required, className = '', id, ...rest } = props;
  const fieldId = id || (label ? `field-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={`${styles.group} ${className}`.trim()}>
      {label && (
        <div className={styles.labelWrapper}>
          <label htmlFor={fieldId} className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
          {hint && <span className={styles.hint}>{hint}</span>}
        </div>
      )}

      <div className={styles.inputWrapper}>
        {rest.as === 'textarea' ? (
          <textarea
            id={fieldId}
            ref={ref as React.Ref<HTMLTextAreaElement>}
            className={`${styles.textarea} ${error ? styles.textareaError : ''}`.trim()}
            {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : rest.as === 'select' ? (
          <>
            <select
              id={fieldId}
              ref={ref as React.Ref<HTMLSelectElement>}
              className={`${styles.select} ${error ? styles.selectError : ''}`.trim()}
              {...(rest as SelectHTMLAttributes<HTMLSelectElement>)}
            >
              {(props as SelectFieldProps).children}
            </select>
            <span className={styles.selectArrow} aria-hidden="true">
              <ChevronDown size={16} />
            </span>
          </>
        ) : (
          <input
            id={fieldId}
            ref={ref as React.Ref<HTMLInputElement>}
            className={`${styles.input} ${error ? styles.inputError : ''}`.trim()}
            {...(rest as InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
      </div>

      {error && (
        <div className={styles.errorMessage} role="alert">
          {error}
        </div>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

export default FormField;
