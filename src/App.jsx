
import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { KarteProvider } from './context/KarteContext';
import { AdminProvider } from './context/AdminContext';
import { LoadingProvider } from './context/LoadingContext';
import { StyledEngineProvider, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import KarteEdit from './pages/KarteEdit';
import KarteList from './pages/KarteList';
import ClientManagement from './pages/ClientManagement';
import ClientManagementV2 from './pages/ClientManagementV2';
import AdminDashboard from './pages/admin/AdminDashboard';
import MonthlyReport from './pages/admin/MonthlyReport';
import StaffManagement from './pages/admin/StaffManagement';
import StaffPerformance from './pages/admin/StaffPerformance';
import './App.css';

// MUIテーマ設定
const theme = createTheme({
  components: {
    MuiModal: {
      defaultProps: {
        // モーダル表示時にroot要素にaria-hiddenを追加しないように設定
        disablePortal: true,
      },
    },
  },
});

// URLからタイムスタンプを取得する関数（キャッシュバスティング用）
const getTimeKey = () => {
  // URLからforce、clearまたはtパラメータを取得
  const url = new URL(window.location.href);
  return url.searchParams.get('force') || 
         url.searchParams.get('clear') || 
         url.searchParams.get('t') || 
         Date.now().toString();
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to={`/karte/new?t=${Date.now()}`} />
  },
  {
    path: "/karte/new",
    // 毎回異なるkeyを使用してコンポーネントを強制的に再マウント
    element: <KarteEdit key={`new-karte-${getTimeKey()}`} />
  },
  {
    path: "/karte/:id",
    // IDをキーに含めて再マウント
    element: <KarteEdit key={`edit-karte-${getTimeKey()}`} />
  },
  {
    path: "/karte-list",
    element: <KarteList />
  },
  {
    path: "/clients",
    element: <ClientManagementV2 />
  },
  {
    path: "/clients-old",
    element: <ClientManagement />
  },
  {
    path: "/admin",
    element: <AdminDashboard />
  },
  {
    path: "/admin/dashboard",
    element: <AdminDashboard />
  },
  {
    path: "/admin/monthly-report",
    element: <MonthlyReport />
  },
  {
    path: "/admin/staff",
    element: <StaffManagement />
  },
  {
    path: "/admin/staff-performance",
    element: <StaffPerformance />
  }
]);

function App() {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoadingProvider>
          <AdminProvider>
            <KarteProvider>
              <RouterProvider router={router} />
            </KarteProvider>
          </AdminProvider>
        </LoadingProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;