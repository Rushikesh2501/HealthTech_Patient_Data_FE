import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import {
  Users,
  ClipboardList,
  CalendarCheck,
  UserCheck,
  PlusCircle,
  UserPlus,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { PageContainer } from '../../components/PageContainer/PageContainer';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { StatCard } from '../../components/StatCard/StatCard';
import { PrimaryButton } from '../../components/PrimaryButton/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton/SecondaryButton';
import { DateRangePicker } from '../../components/DateRangePicker/DateRangePicker';
import { LoadingState } from '../../components/LoadingState/LoadingState';
import { ErrorState } from '../../components/ErrorState/ErrorState';
import {
  useDashboardSummary,
  useEncounterTrends,
  useDiagnosisTrends,
  useAgeDistribution,
} from '../../hooks/useDashboard';
import { ROUTES } from '../../utils/constants';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<string>('7d');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    refetch: refetchSummary,
  } = useDashboardSummary();

  const {
    data: encounterTrends,
    isLoading: isTrendsLoading,
  } = useEncounterTrends(dateRange);

  const {
    data: diagnosisData,
    isLoading: isDiagnosisLoading,
  } = useDiagnosisTrends();

  const {
    data: ageData,
    isLoading: isAgeLoading,
  } = useAgeDistribution();

  const isLoading = isSummaryLoading || isTrendsLoading || isDiagnosisLoading || isAgeLoading;

  if (isSummaryError) {
    return (
      <PageContainer>
        <ErrorState
          title="Unable to load dashboard data"
          message="Could not retrieve clinical summary metrics. Please check network connectivity and try again."
          onRetry={() => refetchSummary()}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Clinical Overview"
        subtitle="Securely manage anonymized patient encounters and monitor clinical health trends."
        action={
          <>
            <SecondaryButton
              icon={<UserPlus size={16} />}
              onClick={() => navigate(ROUTES.PATIENTS, { state: { openRegister: true } })}
            >
              Register Patient
            </SecondaryButton>
            <PrimaryButton
              icon={<PlusCircle size={16} />}
              onClick={() => navigate(ROUTES.ENCOUNTERS, { state: { openNew: true } })}
            >
              Add Encounter
            </PrimaryButton>
          </>
        }
      />

      {/* Date Range Control Bar */}
      <div className={styles.controlsBar}>
        <div className={styles.filterLabel}>
          <Calendar size={16} color="var(--color-primary)" />
          <span>Analytics Timeframe</span>
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

      {/* Stat Cards */}
      {isLoading && !summary ? (
        <LoadingState message="Calculating clinical metrics..." />
      ) : (
        <div className={styles.statsGrid}>
          <StatCard
            title="Total Patients"
            value={summary?.totalPatients || 0}
            icon={<Users size={24} />}
            color="blue"
            changePercentage={summary?.patientsChangePercentage}
          />
          <StatCard
            title="Total Encounters"
            value={summary?.totalEncounters || 0}
            icon={<ClipboardList size={24} />}
            color="green"
            changePercentage={summary?.encountersChangePercentage}
          />
          <StatCard
            title="Encounters Today"
            value={summary?.encountersToday || 0}
            icon={<CalendarCheck size={24} />}
            color="orange"
            changePercentage={summary?.todayChangePercentage}
          />
          <StatCard
            title="Active Clinicians"
            value={summary?.activeClinicians || 0}
            icon={<UserCheck size={24} />}
            color="purple"
            changeLabel="on active roster"
          />
        </div>
      )}

      {/* Primary Charts */}
      <div className={styles.chartsGrid}>
        {/* Encounters Over Time */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h3 className={styles.chartTitle}>Encounters Over Time</h3>
              <p className={styles.chartSubtitle}>
                Patient visits recorded in the selected period ({dateRange})
              </p>
            </div>
          </div>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={encounterTrends || []}
                margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="encounterGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2F8BC2" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2F8BC2" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5EDF5" />
                <XAxis dataKey="date" stroke="#8B96A8" fontSize={12} tickLine={false} />
                <YAxis stroke="#8B96A8" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #D9E5F1',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="encounters"
                  stroke="#2F8BC2"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#encounterGrad)"
                  name="Encounters"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Diagnosis Distribution */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h3 className={styles.chartTitle}>Diagnosis Distribution</h3>
              <p className={styles.chartSubtitle}>Top clinical diagnoses recorded</p>
            </div>
          </div>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={diagnosisData || []}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {(diagnosisData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#2F8BC2'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #D9E5F1',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span style={{ fontSize: '11px', color: '#687386' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Age Distribution by Gender */}
      <div className={styles.bottomGrid}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h3 className={styles.chartTitle}>Patient Age & Demographics</h3>
              <p className={styles.chartSubtitle}>Encounter volume categorized by age cohort</p>
            </div>
          </div>
          <div className={styles.chartWrapper}>
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
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={28}
                  formatter={(val) => (
                    <span style={{ fontSize: '11px', color: '#687386', textTransform: 'capitalize' }}>
                      {val}
                    </span>
                  )}
                />
                <Bar dataKey="male" fill="#2F8BC2" radius={[4, 4, 0, 0]} name="Male" />
                <Bar dataKey="female" fill="#0A9F6E" radius={[4, 4, 0, 0]} name="Female" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Recent Activity Card */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h3 className={styles.chartTitle}>Program Implementation Status</h3>
              <p className={styles.chartSubtitle}>Rural Health Center Telemedicine Network</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-primary-subtle)',
                border: '1px solid var(--color-border-light)',
              }}
            >
              <div>
                <p style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-primary-dark)' }}>
                  Active Primary Health Sub-Centers
                </p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  Raigad, Pune, Nashik, Satara, Solapur
                </p>
              </div>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: '16px',
                  color: 'var(--color-primary)',
                }}
              >
                5 Hubs
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: '#F8FAFD',
                border: '1px solid var(--color-border-light)',
              }}
            >
              <div>
                <p style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-text-primary)' }}>
                  Encryption & Anonymization
                </p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  De-identified identifiers (PT-XXXX) active
                </p>
              </div>
              <span style={{ fontWeight: 600, fontSize: '12px', color: 'var(--color-success)' }}>
                Compliant
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: '#F8FAFD',
                border: '1px solid var(--color-border-light)',
              }}
            >
              <div>
                <p style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-text-primary)' }}>
                  FastAPI Backend Endpoint
                </p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  Ready for JWT RBAC connection
                </p>
              </div>
              <span style={{ fontWeight: 600, fontSize: '12px', color: 'var(--color-info)' }}>
                Ready
              </span>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Dashboard;
