import { Navigate, Route, Routes } from 'react-router-dom';

import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SelectedBusinessProvider } from './features/businesses/SelectedBusinessContext';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { BusinessesListPage } from './pages/businesses/BusinessesListPage';
import { CreateBusinessPage } from './pages/businesses/CreateBusinessPage';
import { PredictiveVariablesPage } from './pages/businesses/PredictiveVariablesPage';
import { DailyRecordsPage } from './pages/daily-records/DailyRecordsPage';
import { ImportCsvPage } from './pages/daily-records/ImportCsvPage';
import { DashboardHomePage } from './pages/dashboard/DashboardHomePage';
import { EvolutionPage } from './pages/dashboard/EvolutionPage';
import { MetricsPage } from './pages/dashboard/MetricsPage';
import { ComparisonsPage } from './pages/dashboard/ComparisonsPage';
import { ForecastPage } from './pages/forecasts/ForecastPage';
import { ForecastHistoryPage } from './pages/forecasts/ForecastHistoryPage';
import { ExportsPage } from './pages/exports/ExportsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <SelectedBusinessProvider>
              <Layout />
            </SelectedBusinessProvider>
          }
        >
          <Route path="/" element={<DashboardHomePage />} />
          <Route path="/businesses" element={<BusinessesListPage />} />
          <Route path="/businesses/new" element={<CreateBusinessPage />} />
          <Route path="/businesses/:id/predictive-variables" element={<PredictiveVariablesPage />} />
          <Route path="/daily-records" element={<DailyRecordsPage />} />
          <Route path="/daily-records/import" element={<ImportCsvPage />} />
          <Route path="/dashboard/evolution" element={<EvolutionPage />} />
          <Route path="/dashboard/metrics" element={<MetricsPage />} />
          <Route path="/dashboard/comparisons" element={<ComparisonsPage />} />
          <Route path="/forecasts" element={<ForecastPage />} />
          <Route path="/forecasts/history" element={<ForecastHistoryPage />} />
          <Route path="/exports" element={<ExportsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
