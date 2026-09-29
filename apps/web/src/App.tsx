/**
 * Meridian — Xray-core VPN management panel.
 * Route table: public (setup, login, subscription) and protected
 * admin routes gated by per-page permissions.
 */
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./lib/auth";
import { AppLayout } from "./components/layout/app-layout";
import { FullscreenLoader } from "./components/layout/auth-layout";
import SetupPage from "./pages/setup";
import LoginPage from "./pages/login";
import DashboardPage from "./pages/dashboard";
import UsersPage from "./pages/users";
import InboundsPage from "./pages/inbounds";
import RoutingPage from "./pages/routing";
import BotPage from "./pages/bot";
import ActivityPage from "./pages/activity";
import SettingsPage from "./pages/settings";
import SubscriptionPage from "./pages/subscription";

const PERM_ROUTE: Record<string, string> = {
  dashboard: "/",
  users: "/users",
  inbounds: "/inbounds",
  routing: "/routing",
  activity: "/activity",
  bot: "/bot",
  settings: "/settings",
};

function Protected({ children }: { children: React.ReactNode }) {
  const { ready, authed, needsSetup } = useAuth();
  const location = useLocation();
  if (!ready) return <FullscreenLoader />;
  if (needsSetup) return <Navigate to="/setup" replace />;
  if (!authed) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

function RequirePerm({ perm, children }: { perm: string; children: React.ReactNode }) {
  const { can, admin } = useAuth();
  if (can(perm as never)) return <>{children}</>;
  const first = admin?.permissions[0];
  return <Navigate to={first ? PERM_ROUTE[first] : "/login"} replace />;
}

export default function App() {
  const { ready, needsSetup, authed } = useAuth();

  return (
    <Routes>
      <Route path="/sub/:token/view" element={<SubscriptionPage />} />
      <Route path="/sub/:token" element={<SubscriptionPage />} />
      <Route
        path="/setup"
        element={
          !ready ? (
            <FullscreenLoader />
          ) : needsSetup ? (
            <SetupPage />
          ) : (
            <Navigate to={authed ? "/" : "/login"} replace />
          )
        }
      />
      <Route
        path="/login"
        element={
          !ready ? (
            <FullscreenLoader />
          ) : needsSetup ? (
            <Navigate to="/setup" replace />
          ) : authed ? (
            <Navigate to="/" replace />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route
        element={
          <Protected>
            <AppLayout />
          </Protected>
        }
      >
        <Route
          path="/"
          element={
            <RequirePerm perm="dashboard">
              <DashboardPage />
            </RequirePerm>
          }
        />
        <Route
          path="/users"
          element={
            <RequirePerm perm="users">
              <UsersPage />
            </RequirePerm>
          }
        />
        <Route
          path="/inbounds"
          element={
            <RequirePerm perm="inbounds">
              <InboundsPage />
            </RequirePerm>
          }
        />
        <Route
          path="/routing"
          element={
            <RequirePerm perm="routing">
              <RoutingPage />
            </RequirePerm>
          }
        />
        <Route
          path="/bot"
          element={
            <RequirePerm perm="bot">
              <BotPage />
            </RequirePerm>
          }
        />
        <Route
          path="/activity"
          element={
            <RequirePerm perm="activity">
              <ActivityPage />
            </RequirePerm>
          }
        />
        <Route
          path="/settings"
          element={
            <RequirePerm perm="settings">
              <SettingsPage />
            </RequirePerm>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
