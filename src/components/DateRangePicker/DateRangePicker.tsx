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
    </div>
  );
};

export default DateRangePicker;
