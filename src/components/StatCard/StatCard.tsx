import React, { ReactNode } from 'react';
import styles from './StatCard.module.css';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatNumber } from '../../utils/formatters';

export interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color?: 'blue' | 'green' | 'orange' | 'purple';
  changePercentage?: number;
  changeLabel?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = 'blue',
  changePercentage,
  changeLabel = 'vs last period',
  className = '',
}) => {
  const isPositive = changePercentage !== undefined && changePercentage >= 0;
  const colorClass = styles[color] || styles.blue;

  return (
    <div className={`${styles.card} ${className}`.trim()}>
      <div className={styles.content}>
        <span className={styles.title}>{title}</span>
        <span className={styles.value}>
          {typeof value === 'number' ? formatNumber(value) : value}
        </span>

        {changePercentage !== undefined && (
          <div className={styles.trendRow}>
            <span className={isPositive ? styles.trendPositive : styles.trendNegative}>
              {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {Math.abs(changePercentage)}%
            </span>
            <span className={styles.trendLabel}>{changeLabel}</span>
          </div>
        )}
      </div>

      <div className={`${styles.iconWrapper} ${colorClass}`}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
