
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Overview from "./pages/Overview";
import AppLayout from "./components/layout/AppLayout";
import DataQualityPage from "./pages/DataQualityPage";
import HistoricalAnalyticsPage from "./pages/HistoricalAnalyticsPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Authentication pages */}
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Main application */}
                <Route
                    path="/dashboard"
                    element={
                        <AppLayout>
                            <Overview />
                        </AppLayout>
                    }
                />

                {/* Pages we'll implement next */}
                <Route
                    path="/dashboard/data-quality"
                    element={
                        <AppLayout>
                            <DataQualityPage />
                        </AppLayout>
                    }
                />
                <Route
                    path="/dashboard/analytics"
                    element={
                        <AppLayout>
                            <HistoricalAnalyticsPage />
                        </AppLayout>
                    }
                />

                {/* Unknown routes */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
