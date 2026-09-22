import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardHeader from "../components/Dashboard/DashboardHeader";
import MetricCard from "../components/Dashboard/MetricCard";
import SensorStatus from "../components/Dashboard/SensorStatus";
import EnergyChart from "../components/Dashboard/EnergyChart";
import SolarChart from "../components/Dashboard/SolarChart";
import ForecastChart from "../components/Dashboard/ForecastChart";

import Loading from "../components/Common/Loading";
import ErrorMessage from "../components/Common/ErrorMessage";

import { getDashboardData } from "../Services/api";

function Dashboard() {
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ------------------------------------------
    // LOGOUT
    // ------------------------------------------

    const handleLogout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        navigate("/login");
    };

    // ------------------------------------------
    // LOAD DASHBOARD DATA
    // ------------------------------------------

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await getDashboardData();

            setData(result);
        } catch (err) {
            console.error("Dashboard loading error:", err);

            setError(
                "Unable to retrieve the smart energy monitoring data."
            );
        } finally {
            setLoading(false);
        }
    };

    // ------------------------------------------
    // LOAD DATA WHEN PAGE OPENS
    // ------------------------------------------

    useEffect(() => {
        loadDashboard();
    }, []);

    // ------------------------------------------
    // LOADING STATE
    // ------------------------------------------

    if (loading) {
        return (
            <Loading message="Loading smart energy dashboard..." />
        );
    }

    // ------------------------------------------
    // ERROR STATE
    // ------------------------------------------

    if (error) {
        return (
            <ErrorMessage
                message={error}
                onRetry={loadDashboard}
            />
        );
    }

    // ------------------------------------------
    // SAFETY CHECK
    // ------------------------------------------

    if (!data) {
        return null;
    }

    const { metrics } = data;

    // ------------------------------------------
    // DASHBOARD
    // ------------------------------------------

    return (
        <main className="dashboard-page">

            {/* ==================================
                HEADER
            ================================== */}

            <DashboardHeader />

            {/* ==================================
                LOGOUT
            ================================== */}

            <div className="dashboard-actions">
                <button
                    className="logout-button"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>

            {/* ==================================
                CURRENT ENERGY & ENVIRONMENT
            ================================== */}

            <section className="metrics-grid">

                {/* Energy Consumption */}

                <MetricCard
                    title="Energy Consumption"
                    value={metrics.energy}
                    unit=" kWh"
                    icon="⚡"
                    description="Current electricity consumption"
                    type="energy"
                />

                {/* Solar Generation */}

                <MetricCard
                    title="Solar Generation"
                    value={metrics.solar}
                    unit=" kWh"
                    icon="☀"
                    description="Current renewable generation"
                    type="solar"
                />

                {/* Grid Contribution */}

                <MetricCard
                    title="Grid Contribution"
                    value={metrics.grid}
                    unit=" kWh"
                    icon="▣"
                    description="Energy supplied by the grid"
                    type="grid"
                />

                {/* Temperature */}

                <MetricCard
                    title="Temperature"
                    value={metrics.temperature}
                    unit=" °C"
                    icon="🌡"
                    description="Current environmental temperature"
                    type="temperature"
                />

                {/* Humidity */}

                <MetricCard
                    title="Humidity"
                    value={metrics.humidity}
                    unit=" %"
                    icon="💧"
                    description="Current relative humidity"
                    type="humidity"
                />

                {/* Solar Irradiance */}

                <MetricCard
                    title="Solar Irradiance"
                    value={metrics.irradiance}
                    unit=" W/m²"
                    icon="☀"
                    description="Current solar radiation"
                    type="irradiance"
                />

            </section>

            {/* ==================================
                SENSOR STATUS
            ================================== */}

            <SensorStatus
                sensors={data.sensors}
            />

            {/* ==================================
                HISTORICAL ENERGY
            ================================== */}

            <EnergyChart
                data={data.energyHistory}
            />

            {/* ==================================
                HISTORICAL SOLAR
            ================================== */}

            <SolarChart
                data={data.solarHistory}
            />

            {/* ==================================
                ENERGY FORECAST
            ================================== */}

            <ForecastChart
                data={data.energyForecast}
                title="Energy Demand Forecast"
                unit="kWh"
                type="energy"
            />

            {/* ==================================
                SOLAR FORECAST
            ================================== */}

            <ForecastChart
                data={data.solarForecast}
                title="Solar Generation Forecast"
                unit="kWh"
                type="solar"
            />

        </main>
    );
}

export default Dashboard;