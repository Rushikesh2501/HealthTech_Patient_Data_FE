import React, { ChangeEvent } from 'react';
import styles from './FilterSelect.module.css';
import { ChevronDown } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterSelectProps {
  label?: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  'aria-label'?: string;
}

export const FilterSelect: React.FC<FilterSelectProps> = ({
  label,
  value,
  options,
  onChange,
  placeholder = 'All',
  className = '',
  id,
  'aria-label': ariaLabel,
}) => {
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`${styles.container} ${className}`.trim()}>
      {label && <label htmlFor={id} className={styles.label}>{label}</label>}
      <div className={styles.selectWrapper}>
        <select
          id={id}
          value={value}
          onChange={handleChange}
          className={styles.select}
          aria-label={ariaLabel || label}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className={styles.arrow} aria-hidden="true">
          <ChevronDown size={14} />
        </span>
      </div>
    </div>
  );
};

export default FilterSelect;
