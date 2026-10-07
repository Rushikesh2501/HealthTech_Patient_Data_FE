import React, { useState, useMemo } from 'react';
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
  Target,
  Megaphone,
  Share2,
  TrendingUp,
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

  // Top 5 diagnoses only, sorted descending by encounter count
  const top5DiagnosisData = useMemo(() => {
    if (!diagnosisData || !Array.isArray(diagnosisData)) return [];
    const colors = ['#2F8BC2', '#0A9F6E', '#F2A900', '#FF5C70', '#8B5CF6'];
    return [...diagnosisData]
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .slice(0, 5)
      .map((item, index) => ({
        ...item,
        color: item.color || colors[index % colors.length],
      }));
  }, [diagnosisData]);

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
              <p className={styles.chartSubtitle}>Top 5 clinical diagnoses recorded</p>
            </div>
          </div>
          <div className={`${styles.chartWrapper} ${styles.donutWrapper}`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={top5DiagnosisData}
                  cx="50%"
                  cy="36%"
                  innerRadius={46}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {top5DiagnosisData.map((entry, index) => (
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
                  formatter={(val: any, name: any) => [`${val} encounters`, name]}
                />
                <Legend
                  verticalAlign="bottom"
                  wrapperStyle={{
                    paddingTop: '8px',
                    lineHeight: '1.4',
                  }}
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

        {/* Outreach & Patient Acquisition Marketing Card */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h3 className={styles.chartTitle}>Outreach & Patient Acquisition</h3>
              <p className={styles.chartSubtitle}>Active community campaigns & referral channels</p>
            </div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '12px',
                backgroundColor: 'rgba(10, 159, 110, 0.1)',
                color: 'var(--color-success)',
                fontSize: '11px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              <TrendingUp size={12} />
              +18.4% MoM
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-primary-subtle)',
                border: '1px solid var(--color-border-light)',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(47, 139, 194, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Target size={18} color="var(--color-primary)" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-primary-dark)', margin: 0 }}>
                    Community Screening Camps
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>
                    Rural mobile clinics • 1,420 Reached
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-primary)' }}>
                  +385
                </span>
                <p style={{ fontSize: '11px', color: 'var(--color-success)', fontWeight: 600, margin: '2px 0 0 0' }}>
                  27.1% Conv.
                </p>
              </div>
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
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(242, 169, 0, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Megaphone size={18} color="#D97706" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-text-primary)', margin: 0 }}>
                    Digital & Telehealth Ads
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>
                    Preventive awareness • 860 Inquiries
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-text-primary)' }}>
                  +214
                </span>
                <p style={{ fontSize: '11px', color: 'var(--color-success)', fontWeight: 600, margin: '2px 0 0 0' }}>
                  24.8% Conv.
                </p>
              </div>
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
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(10, 159, 110, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Share2 size={18} color="var(--color-success)" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-text-primary)', margin: 0 }}>
                    Physician & Center Referrals
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>
                    Sub-center hubs & GPs • 520 Referred
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-text-primary)' }}>
                  +468
                </span>
                <p style={{ fontSize: '11px', color: 'var(--color-success)', fontWeight: 600, margin: '2px 0 0 0' }}>
                  90.0% Conv.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Dashboard;
