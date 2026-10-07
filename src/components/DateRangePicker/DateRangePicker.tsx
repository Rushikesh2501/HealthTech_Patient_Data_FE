import React from 'react';
import styles from './DateRangePicker.module.css';
import { DATE_RANGE_PRESETS } from '../../utils/constants';

export interface DateRangePickerProps {
  value: string;
  onChange: (value: string) => void;
  startDate?: string;
  endDate?: string;
  onCustomChange?: (start: string, end: string) => void;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  startDate = '',
  endDate = '',
  onCustomChange,
  className = '',
}) => {
  return (
    <div className={`${styles.wrapper} ${className}`.trim()} role="group" aria-label="Date range filter">
      {DATE_RANGE_PRESETS.map((preset) => {
        const isActive = value === preset.value;
        return (
          <button
            key={preset.value}
            type="button"
            className={`${styles.presetButton} ${isActive ? styles.active : ''}`.trim()}
            onClick={() => onChange(preset.value)}
            aria-pressed={isActive}
          >
            {preset.label}
          </button>
        );
      })}

      {value === 'custom' && (
        <div className={styles.customInputs}>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onCustomChange && onCustomChange(e.target.value, endDate)}
            className={styles.dateInput}
            aria-label="Start date"
          />
          <span className={styles.separator}>to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onCustomChange && onCustomChange(startDate, e.target.value)}
            className={styles.dateInput}
            aria-label="End date"
          />
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
