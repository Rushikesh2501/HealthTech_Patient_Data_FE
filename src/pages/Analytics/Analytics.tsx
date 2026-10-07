import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import styles from './Analytics.module.css';
import { Calendar, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { PageContainer } from '../../components/PageContainer/PageContainer';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { DateRangePicker } from '../../components/DateRangePicker/DateRangePicker';
import { LoadingState } from '../../components/LoadingState/LoadingState';
import { analyticsApi } from './api';

export const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState<string>('30d');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  const { data: encountersData, isLoading: isEncountersLoading } = useQuery({
    queryKey: ['analytics', 'encounters', dateRange],
    queryFn: () => analyticsApi.getEncounterTrends(dateRange),
  });
  const { data: seasonalData, isLoading: isSeasonalLoading } = useQuery({
    queryKey: ['analytics', 'seasonal'],
    queryFn: () => analyticsApi.getSeasonalTrends(),
  });
  const { data: ageData, isLoading: isAgeLoading } = useQuery({
    queryKey: ['analytics', 'demographics'],
    queryFn: () => analyticsApi.getAgeDistribution(),
  });

  const isLoading = isEncountersLoading || isSeasonalLoading || isAgeLoading;

  return (
    <PageContainer>
      <PageHeader
        title="Clinical Analytics"
        subtitle="Population health surveillance, disease patterns, and longitudinal demographic insights."
      />

      {/* Date Filter Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.filterHeader}>
          <Calendar size={16} color="var(--color-primary)" />
          <span>Surveillance Window</span>
        </div>
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          startDate={customStart}
          endDate={customEnd}
          onCustomChange={(start, end) => {
            setCustomStart(start);
            setCustomEnd(end);
          }}
        />
      </div>

      {isLoading ? (
        <LoadingState message="Aggregating epidemiological trends..." />
      ) : (
        <div className={styles.chartsGrid}>
          {/* Seasonal Multi-Condition Illness Trends (Full width) */}
          <div className={`${styles.card} ${styles.fullWidthCard}`}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>Seasonal Disease Patterns</h3>
                <p className={styles.cardSubtitle}>
                  Comparative monthly volume of seasonal infectious diseases vs non-communicable indicators
                </p>
              </div>
              <span className={styles.metricBadge}>Surveillance Alert: Low</span>
            </div>
            <div className={styles.chartContainer} style={{ height: '340px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={seasonalData || []}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="viralGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2F8BC2" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2F8BC2" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="vectorGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F2A900" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F2A900" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5EDF5" />
                  <XAxis dataKey="month" stroke="#8B96A8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#8B96A8" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #D9E5F1',
                      fontSize: '12px',
                    }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Area
                    type="monotone"
                    dataKey="viralRespiratory"
                    name="Viral / Respiratory"
                    stroke="#2F8BC2"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#viralGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="vectorBorne"
                    name="Vector-borne (Malaria/Dengue)"
                    stroke="#F2A900"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#vectorGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="gastrointestinal"
                    name="Gastrointestinal"
                    stroke="#FF5C70"
                    strokeWidth={2}
                    fillOpacity={0.1}
                    fill="#FF5C70"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Viral/Respiratory Case Trends */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>Viral & Respiratory Trajectory</h3>
                <p className={styles.cardSubtitle}>ARI and flu encounters per reporting interval</p>
              </div>
              <TrendingUp size={18} color="var(--color-primary)" />
            </div>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={seasonalData || []}
                  margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5EDF5" />
                  <XAxis dataKey="month" stroke="#8B96A8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#8B96A8" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #D9E5F1',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="viralRespiratory"
                    stroke="#2F8BC2"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#2F8BC2' }}
                    activeDot={{ r: 6 }}
                    name="ARI Cases"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Diabetes & Chronic Care Monitoring */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>Diabetes & Chronic Disease Follow-ups</h3>
                <p className={styles.cardSubtitle}>Regular management and glycemic control consultations</p>
              </div>
              <span className={styles.metricBadge}>Chronic Care</span>
            </div>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={seasonalData || []}
                  margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5EDF5" />
                  <XAxis dataKey="month" stroke="#8B96A8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#8B96A8" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #D9E5F1',
                      fontSize: '12px',
                    }}
                  />
                  <Bar
                    dataKey="diabetesRelated"
                    name="Diabetes Consults"
                    fill="#0A9F6E"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Total Encounters */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>Aggregate Encounter Volume</h3>
                <p className={styles.cardSubtitle}>Consultations across telemedicine clinics</p>
              </div>
            </div>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={encountersData || []}
                  margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5EDF5" />
                  <XAxis dataKey="date" stroke="#8B96A8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#8B96A8" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #D9E5F1',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="encounters"
                    name="Encounters"
                    stroke="#1D4775"
                    fill="#EAF4FB"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Demographic & Age Cohort Analytics */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>Age Cohort Distribution</h3>
                <p className={styles.cardSubtitle}>Encounter volume mapped across demographic brackets</p>
              </div>
            </div>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ageData || []}
                  margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5EDF5" />
                  <XAxis dataKey="ageGroup" stroke="#8B96A8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#8B96A8" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #D9E5F1',
                      fontSize: '12px',
                    }}
                  />
                  <Legend verticalAlign="top" height={30} />
                  <Bar dataKey="male" name="Male" fill="#2F8BC2" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="female" name="Female" fill="#0A9F6E" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="other" name="Other" fill="#F2A900" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default Analytics;
