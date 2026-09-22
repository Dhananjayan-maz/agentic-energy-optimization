import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Services/api";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    // ------------------------------------------
    // HANDLE INPUT CHANGES
    // ------------------------------------------

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));

        setError("");
    };

    // ------------------------------------------
    // REGISTER
    // ------------------------------------------

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        // Basic validation
        if (
            !formData.username ||
            !formData.email ||
            !formData.password
        ) {
            setError("Please fill in all fields.");
            return;
        }

        if (formData.password.length < 8) {
            setError(
                "Password must contain at least 8 characters."
            );
            return;
        }

        try {
            setLoading(true);

            await api.post(
                "/api/auth/register/",
                formData
            );

            setSuccess(
                "Registration successful! Redirecting to login..."
            );

            // Redirect after a short delay
            setTimeout(() => {
                navigate("/login");
            }, 1200);

        } catch (error) {
            console.error(
                "Registration error:",
                error
            );

            // Django / DRF validation errors
            if (error.response?.data) {
                const responseData =
                    error.response.data;

                if (responseData.username) {
                    setError(
                        Array.isArray(
                            responseData.username
                        )
                            ? responseData.username[0]
                            : responseData.username
                    );
                } else if (responseData.email) {
                    setError(
                        Array.isArray(
                            responseData.email
                        )
                            ? responseData.email[0]
                            : responseData.email
                    );
                } else if (responseData.password) {
                    setError(
                        Array.isArray(
                            responseData.password
                        )
                            ? responseData.password[0]
                            : responseData.password
                    );
                } else if (responseData.detail) {
                    setError(
                        responseData.detail
                    );
                } else {
                    setError(
                        "Registration failed. Please check your details."
                    );
                }
            } else {
                setError(
                    "Unable to connect to the server. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    // ------------------------------------------
    // GO TO LOGIN
    // ------------------------------------------

    const handleLogin = () => {
        navigate("/login");
    };

    // ------------------------------------------
    // UI
    // ------------------------------------------

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
                        <h1>
                            Smart Energy
                        </h1>

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
                        Create Account
                    </h2>

                    <p>
                        Create your account to access
                        the energy monitoring dashboard.
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
                    SUCCESS MESSAGE
                ================================== */}

                {success && (
                    <div className="auth-message success">
                        {success}
                    </div>
                )}


                {/* ==================================
                    REGISTER FORM
                ================================== */}

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >

                    {/* USERNAME */}

                    <div className="form-group">

                        <label htmlFor="username">
                            Username
                        </label>

                        <input
                            id="username"
                            type="text"
                            name="username"
                            placeholder="Enter your username"
                            value={formData.username}
                            onChange={handleChange}
                            autoComplete="username"
                            disabled={loading}
                        />

                    </div>


                    {/* EMAIL */}

                    <div className="form-group">

                        <label htmlFor="email">
                            Email Address
                        </label>

                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="email"
                            disabled={loading}
                        />

                    </div>


                    {/* PASSWORD */}

                    <div className="form-group">

                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            name="password"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="new-password"
                            disabled={loading}
                        />

                    </div>


                    {/* REGISTER BUTTON */}

                    <button
                        className="auth-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating Account..."
                            : "Create Account"}
                    </button>

                </form>


                {/* ==================================
                    LOGIN LINK
                ================================== */}

                <div className="auth-footer">

                    <span>
                        Already have an account?
                    </span>

                    <button
                        type="button"
                        className="auth-link"
                        onClick={handleLogin}
                        disabled={loading}
                    >
                        Login
                    </button>

                </div>

            </div>

        </div>
    );
}

export default Register;