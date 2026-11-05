import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useId, useRef } from "react";

import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import "./App.css";
import SystemPage from "./pages/SystemPage";
import StoragePage from "./pages/StoragePage";
import ApplicationsPage from "./pages/ApplicationsPage";
import ApplicationDetailPage from "./pages/ApplicationDetailPage";
import SettingsPage from "./pages/SettingsPage";
import useTouchScroll from "./hooks/useTouchScroll";
import WeatherPage from "./pages/WeatherPage";
import HomeAssistantPage from "./pages/HomeAssistantPage";
import BambuPage from "./pages/BambuPage";
import ProjectsPage from "./pages/ProjectsPage";
import SpotifyPage from "./pages/SpotifyPage";
import Screensaver from "./components/Screensaver";
import useIdleTimer from "./hooks/useIdleTimer";
import { useSettings } from "./context/SettingsContext";

function App() {
  const pageContentRef = useRef(null);
  const { settings } = useSettings();
  const isIdle = useIdleTimer(settings.screensaver);

  useTouchScroll(pageContentRef);
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />
        {isIdle && <Screensaver />}

        <main ref={pageContentRef} className="page-content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route path="/applications/weather" element={<WeatherPage />} />
            <Route
              path="/applications/home-assistant"
              element={<HomeAssistantPage />}
            />
            <Route path="/applications/bambu-printer" element={<BambuPage />} />
            <Route path="/applications/project" element={<ProjectsPage />} />
            <Route path="/applications/spotify" element={<SpotifyPage />} />
            <Route
              path="/applications/:applicationId"
              element={<ApplicationDetailPage />}
            />
            <Route path="/system" element={<SystemPage />} />
            <Route path="/storage" element={<StoragePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
