import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Services/api";

function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!username || !password) {
            setError("Please enter your username and password.");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post("/api/auth/login/", {
                username,
                password,
                });

            localStorage.setItem(
                "access",
                response.data.access
            );

            localStorage.setItem(
                "refresh",
                response.data.refresh
            );

            // Go to dashboard after successful login
            navigate("/dashboard");

        } catch (error) {
            console.error("Login error:", error);

            setError(
                "Invalid username or password. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = () => {
        navigate("/register");
    };

    return (
        <div className="auth-page">

            <div className="auth-card">

                {/* ==================================
                    BRAND
                ================================== */}

                <div className="auth-brand">

                    <div className="auth-logo">
                        ⚡
                    </div>

                    <div>
                        <h1>Smart Energy</h1>

                        <p>
                            Energy Intelligence Platform
                        </p>
                    </div>

                </div>


                {/* ==================================
                    HEADING
                ================================== */}

                <div className="auth-heading">

                    <p className="auth-eyebrow">
                        SMART ENERGY MONITORING
                    </p>

                    <h2>
                        Welcome Back
                    </h2>

                    <p>
                        Login to access your energy
                        monitoring dashboard.
                    </p>

                </div>


                {/* ==================================
                    ERROR MESSAGE
                ================================== */}

                {error && (
                    <div className="auth-message error">
                        {error}
                    </div>
                )}


                {/* ==================================
                    LOGIN FORM
                ================================== */}

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >

                    {/* Username */}

                    <div className="form-group">

                        <label htmlFor="username">
                            Username
                        </label>

                        <input
                            id="username"
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) =>
                                setUsername(e.target.value)
                            }
                            autoComplete="username"
                            disabled={loading}
                        />

                    </div>


                    {/* Password */}

                    <div className="form-group">

                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            autoComplete="current-password"
                            disabled={loading}
                        />

                    </div>


                    {/* Login button */}

                    <button
                        className="auth-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>


                {/* ==================================
                    REGISTER LINK
                ================================== */}

                <div className="auth-footer">

                    <span>
                        Don't have an account?
                    </span>

                    <button
                        type="button"
                        className="auth-link"
                        onClick={handleRegister}
                        disabled={loading}
                    >
                        Register
                    </button>

                </div>

            </div>

        </div>
    );
}

export default Login;