import { BrowserRouter, Route, Routes } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import "./App.css";
import SystemPage from "./pages/SystemPage";

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />

        <main className="page-content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route
              path="/applications"
              element={<PlaceholderPage title="Applications" />}
            />
            <Route path="/system" element={<SystemPage />} />
            <Route
              path="/storage"
              element={<PlaceholderPage title="Storage" />}
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
