import axios from "axios";

// =====================================================
// BACKEND API CONFIGURATION
// =====================================================

const api = axios.create({
    baseURL: "http://127.0.0.1:8000",
    headers: {
        "Content-Type": "application/json",
    },
});


// =====================================================
// JWT ACCESS TOKEN INTERCEPTOR
// =====================================================

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


// =====================================================
// PHASE 1 MOCK DASHBOARD DATA
// =====================================================

const mockDashboardData = {

    // -------------------------------------------------
    // CURRENT METRICS
    // -------------------------------------------------

    metrics: {
        energy: 245.6,
        solar: 132.4,
        grid: 113.2,
        temperature: 29.4,
        humidity: 68,
        irradiance: 742,
    },


    // -------------------------------------------------
    // SENSOR STATUS
    // -------------------------------------------------

    sensors: {
        energy: true,
        solar: true,
        temperature: true,
        humidity: true,
    },


    // -------------------------------------------------
    // HISTORICAL ENERGY DATA
    // -------------------------------------------------

    energyHistory: [
        { time: "06:00", value: 180 },
        { time: "07:00", value: 195 },
        { time: "08:00", value: 220 },
        { time: "09:00", value: 240 },
        { time: "10:00", value: 255 },
        { time: "11:00", value: 270 },
        { time: "12:00", value: 245 },
        { time: "13:00", value: 260 },
        { time: "14:00", value: 250 },
        { time: "15:00", value: 245 },
    ],


    // -------------------------------------------------
    // HISTORICAL SOLAR DATA
    // -------------------------------------------------

    solarHistory: [
        { time: "06:00", value: 20 },
        { time: "07:00", value: 40 },
        { time: "08:00", value: 65 },
        { time: "09:00", value: 90 },
        { time: "10:00", value: 115 },
        { time: "11:00", value: 135 },
        { time: "12:00", value: 145 },
        { time: "13:00", value: 140 },
        { time: "14:00", value: 125 },
        { time: "15:00", value: 110 },
    ],


    // -------------------------------------------------
    // ENERGY FORECAST
    // -------------------------------------------------

    energyForecast: [
        { time: "16:00", value: 250 },
        { time: "17:00", value: 245 },
        { time: "18:00", value: 230 },
        { time: "19:00", value: 220 },
        { time: "20:00", value: 215 },
        { time: "21:00", value: 210 },
    ],


    // -------------------------------------------------
    // SOLAR FORECAST
    // -------------------------------------------------

    solarForecast: [
        { time: "16:00", value: 95 },
        { time: "17:00", value: 70 },
        { time: "18:00", value: 40 },
        { time: "19:00", value: 15 },
        { time: "20:00", value: 5 },
        { time: "21:00", value: 0 },
    ],
};


// =====================================================
// SIMULATED API REQUEST
// =====================================================

const simulateRequest = (data, delay = 500) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(data);
        }, delay);
    });
};


// =====================================================
// DASHBOARD API FUNCTIONS
// =====================================================

export const getDashboardData = async () => {
    return simulateRequest(mockDashboardData);
};


// =====================================================
// CURRENT METRICS
// =====================================================

export const getCurrentMetrics = async () => {
    return simulateRequest(mockDashboardData.metrics);
};


// =====================================================
// SENSOR STATUS
// =====================================================

export const getSensorStatus = async () => {
    return simulateRequest(mockDashboardData.sensors);
};


// =====================================================
// ENERGY HISTORY
// =====================================================

export const getEnergyHistory = async () => {
    return simulateRequest(mockDashboardData.energyHistory);
};


// =====================================================
// SOLAR HISTORY
// =====================================================

export const getSolarHistory = async () => {
    return simulateRequest(mockDashboardData.solarHistory);
};


// =====================================================
// ENERGY FORECAST
// =====================================================

export const getEnergyForecast = async () => {
    return simulateRequest(mockDashboardData.energyForecast);
};


// =====================================================
// SOLAR FORECAST
// =====================================================

export const getSolarForecast = async () => {
    return simulateRequest(mockDashboardData.solarForecast);
};


// =====================================================
// DEFAULT AXIOS INSTANCE
// =====================================================

export default api;