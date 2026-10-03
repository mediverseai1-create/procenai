import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import "./index.css";
import { AuthProvider } from "./lib/auth";
import { AppShell } from "./components/AppShell";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Workspace from "./pages/Workspace";
import Copywriter from "./pages/Copywriter";
import DesignStudio from "./pages/DesignStudio";
import Saved from "./pages/Saved";
import SettingsPage from "./pages/Settings";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/workspace" element={<Workspace />} />
            <Route path="/sourcing" element={<Workspace />} />
            <Route path="/copywriter" element={<Copywriter />} />
            <Route path="/design-studio" element={<DesignStudio />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Landing />} />
        </Routes>
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
