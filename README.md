# HealthTech Patient Data Dashboard (Frontend)

A secure, responsive, and clinical-grade dashboard designed for rural Indian government primary health centers, sub-centers, and telemedicine NGOs. Built with React 18, TypeScript, CSS Modules, TanStack Query, React Hook Form, and Zod.

---

## 🌟 Key Features

- **Real-Time Clinical Encounters**: Rapidly log, view, and update patient encounters, clinical vitals (BP, temperature), symptoms, diagnoses, and prescribed treatments.
- **Anonymized Patient Profiles**: Zero personally identifiable information (PII) stored; patients are identified via anonymized clinical registration codes (`PT-XXXX`) with age and gender demographics.
- **Role-Based Access Control (RBAC)**: Centralized permission matrix supporting `admin`, `clinician`, and `nurse` roles with strict route, UI action, and button guards.
- **Dynamic Epidemiological Visualizations**: Interactive Recharts dashboards for longitudinal visit volumes, disease breakdowns (pie charts), age/gender cohorts, and multi-condition seasonal illness trajectories.
- **Immediate State Synchronization**: Zero stale UI state via automated TanStack Query cache invalidation across all patient and encounter mutations.
- **Form Draft Recovery & Session Expiry**: Auto-saves form progress to `localStorage` to protect against rural connectivity disruptions; catches JWT 401 expiration gracefully without hard page reloads.
- **Strict CSS Modules Design System**: 100% scoped CSS modules (`variables.css`, reset, and modular typography/elevation tokens) without utility framework overhead.
- **Fully Responsive**: Optimized for primary health center desktops, field tablets, and mobile smartphones.

---

## 🏗️ Architecture & Folder Structure

```
pm_ui/
├── public/                     # Static assets, SVG favicon, web manifest
├── src/
│   ├── components/             # Reusable design system components
│   │   ├── Avatar/             # Role/initials avatar
│   │   ├── ConfirmDialog/      # Deletion & irreversible action confirmation
│   │   ├── DataTable/          # Sortable, paginated data table
│   │   ├── DateRangePicker/    # 7d, 30d, 90d, 1y, and custom date selector
│   │   ├── EmptyState/         # Consistent empty lists feedback
│   │   ├── ErrorState/         # Retryable error boundary display
│   │   ├── FilterSelect/       # Standardized custom select dropdown
│   │   ├── FormField/          # Accessible input field with validation
│   │   ├── LoadingState/       # Skeleton and pulse loading indicators
│   │   ├── PageContainer/      # Consistent page layout bounding box
│   │   ├── PageHeader/         # Title, subtitle, and primary actions bar
│   │   ├── Pagination/         # Page navigation controls
│   │   ├── PrimaryButton/      # Design system primary action button
│   │   ├── SecondaryButton/    # Design system secondary action button
│   │   ├── DangerButton/       # Destructive action button
│   │   ├── IconButton/         # Micro-action button
│   │   ├── RowActions/         # Table row view/edit/delete menu
│   │   ├── SearchBar/          # Debounced search bar
│   │   ├── StatCard/           # KPI stat summary card with trend indicator
│   │   └── StatusBadge/        # Clinical status badge (active/completed/etc.)
│   ├── context/
│   │   └── AuthContext.tsx     # Session management, JWT decoding & RBAC state
│   ├── hooks/
│   │   ├── useAuth.ts          # Authentication & permission hook
│   │   ├── useDashboard.ts     # KPI & chart data queries
│   │   ├── useEncounters.ts    # Encounter queries & mutation hooks
│   │   └── usePatients.ts      # Patient queries & mutation hooks
│   ├── layouts/
│   │   ├── AppHeader.tsx       # System navigation header
│   │   ├── AppSidebar.tsx      # Responsive sidebar navigation
│   │   └── DashboardLayout.tsx # Main authenticated frame
│   ├── pages/
│   │   ├── Analytics/          # Seasonal & epidemiological trends
│   │   ├── AuditLogs/          # Immutable system & security audit trails
│   │   ├── Dashboard/          # Clinical KPI overview & distributions
│   │   ├── Encounters/         # Encounter registry & modal logger
│   │   ├── Login/              # Clinical sign-in with JWT auth
│   │   ├── PatientDetails/     # Demographics & patient encounter history
│   │   ├── Patients/           # Anonymized patient registry & registration modal
│   │   └── Settings/           # System configuration & environment status
│   ├── routes/
│   │   ├── AppRoutes.tsx       # React Router v6 route configuration
│   │   └── ProtectedRoute.tsx  # RBAC & authentication route wrapper
│   ├── services/
│   │   └── api.ts              # Axios client with JWT interceptor & 401 handler
│   ├── theme/
│   │   ├── variables.css       # Design tokens (colors, radii, elevations)
│   │   └── global.css          # CSS reset, base typography & scrollbars
│   ├── types/                  # TypeScript interface definitions
│   └── utils/                  # RBAC permissions, constants, validators & formatters
├── .env.development           # Local development environment configuration
├── .env.example               # Environment variables template
└── package.json
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 (Create React App + TypeScript 4.9) |
| **Styling** | CSS Modules (zero Tailwind / zero inline styles) |
| **Data Fetching & Caching** | TanStack Query v5 (`@tanstack/react-query`) |
| **Forms & Validation** | React Hook Form + Zod v3 |
| **Data Visualization** | Recharts v2 |
| **HTTP Client** | Axios with request & response interceptors |
| **Icons** | Lucide React |

---

## 🚀 Getting Started

### Prerequisites

- Node.js `18.x` or higher
- npm `9.x` or higher
- Running backend service: [FastAPI Backend Service](https://github.com/Rushikesh2501/HealthTech_Patient_Data_BE)

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Rushikesh2501/HealthTech_Patient_Data_FE.git
cd HealthTech_Patient_Data_FE
npm install
```

### 2. Environment Configuration

Copy the sample environment file:

```bash
cp .env.example .env.development
```

Ensure the API URL points to your running FastAPI backend:

```env
REACT_APP_API_URL=http://localhost:8000/api/v1
```

### 3. Start Development Server

```bash
npm start
```

The application will start on [http://localhost:3000](http://localhost:3000).

### 4. Build for Production

```bash
npm run build
```

Creates an optimized production bundle in the `build/` folder.

---

## 🔒 Role-Based Access Control (RBAC)

The system enforces granular permissions based on clinician roles:

| Feature / Resource | Administrator (`admin`) | Clinician (`clinician`) | Nurse (`nurse`) |
|---|:---:|:---:|:---:|
| **Dashboard KPIs & Charts** | Full Access | Full Access | Full Access |
| **View Patient Records** | Yes | Yes | Yes |
| **Register / Update Patient** | Yes | Yes | Yes |
| **Delete Patient Record** | Yes | No | No |
| **Record Clinical Encounter** | Yes | Yes | Yes |
| **Edit Clinical Encounter** | Yes | Yes | No |
| **Delete Encounter** | Yes | No | No |
| **Epidemiological Analytics** | Full Access | Full Access | Read-Only |
| **System Audit Logs** | Full Access | No Access | No Access |
| **System Settings** | Full Access | No Access | No Access |

---

## 📡 API Contract Reference

The frontend connects directly to the FastAPI backend API:

- `POST /api/v1/auth/login` – Authenticate clinician and obtain JWT bearer token
- `GET /api/v1/auth/me` – Retrieve active user profile and roles
- `POST /api/v1/auth/logout` – Invalidate session
- `GET /api/v1/patients` – List paginated anonymized patients
- `POST /api/v1/patients` – Register a new patient
- `GET /api/v1/patients/{id}` – Retrieve patient details
- `PATCH /api/v1/patients/{id}` – Update patient details
- `DELETE /api/v1/patients/{id}` – Delete patient profile
- `GET /api/v1/encounters` – List clinical encounters
- `POST /api/v1/encounters` – Log an encounter
- `PATCH /api/v1/encounters/{id}` – Update clinical encounter
- `DELETE /api/v1/encounters/{id}` – Delete encounter record
- `GET /api/v1/dashboard/summary` – Summary KPI metrics
- `GET /api/v1/dashboard/trends` – Encounter volume trends
- `GET /api/v1/dashboard/diagnoses` – Diagnosis distribution
- `GET /api/v1/dashboard/age-distribution` – Age cohort demographics
- `GET /api/v1/analytics/trends` – Longitudinal seasonal patterns
- `GET /api/v1/audit-logs` – System security and event logs

---

## 📄 License

This project is licensed under the MIT License.
