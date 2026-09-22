import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    const path = window.location.pathname;

    if (path === "/login") {
        return <Login />;
    }

    if (path === "/register") {
        return <Register />;
    }

    return (
        <ProtectedRoute>
            <Dashboard />
        </ProtectedRoute>
    );
}

export default App;