import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useRef } from "react";

import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import "./App.css";
import SystemPage from "./pages/SystemPage";
import StoragePage from "./pages/StoragePage";

import useTouchScroll from "./hooks/useTouchScroll";
import ApplicationsPage from "./pages/ApplicationsPage";

function App() {
  const pageContentRef = useRef(null);

  useTouchScroll(pageContentRef);
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />

        <main ref={pageContentRef} className="page-content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route
              path="/applications"
              element={<ApplicationsPage />}
            />
            <Route path="/system" element={<SystemPage />} />
            <Route
              path="/storage"
              element={<StoragePage />}
            />
            <Route
              path="/settings"
              element={<PlaceholderPage title="Settings" />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
