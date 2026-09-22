import { useState } from "react";

function Register() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
        setSuccess("");
    };

    const handleRegister = (event) => {
        event.preventDefault();

        const {
            name,
            email,
            password,
            confirmPassword,
        } = formData;

        if (!name || !email || !password || !confirmPassword) {
            setError("Please fill in all fields.");
            return;
        }

        if (password.length < 6) {
            setError(
                "Password must contain at least 6 characters."
            );
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        // Store temporary frontend account.
        // This will later be replaced by the backend API.
        const user = {
            name,
            email,
            password,
        };

        localStorage.setItem(
            "registeredUser",
            JSON.stringify(user)
        );

        setSuccess(
            "Registration successful. You can now login."
        );

        setFormData({
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        });
    };

    const goToLogin = () => {
        window.location.href = "/login";
    };

    return (
        <div className="auth-page">

            <div className="auth-card">

                <div className="auth-brand">
                    <div className="auth-logo">
                        ⚡
                    </div>

                    <div>
                        <h1>Smart Energy</h1>
                        <p>Energy Intelligence Platform</p>
                    </div>
                </div>

                <div className="auth-heading">
                    <p className="auth-eyebrow">
                        CREATE ACCOUNT
                    </p>

                    <h2>Register</h2>

                    <p>
                        Create your account to access the
                        energy monitoring dashboard.
                    </p>
                </div>

                {error && (
                    <div className="auth-message error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="auth-message success">
                        {success}
                    </div>
                )}

                <form
                    className="auth-form"
                    onSubmit={handleRegister}
                >

                    <div className="form-group">
                        <label htmlFor="name">
                            Full Name
                        </label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">
                            Email Address
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">
                            Confirm Password
                        </label>

                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        className="auth-button"
                        type="submit"
                    >
                        Create Account
                    </button>

                </form>

                <div className="auth-footer">
                    <span>
                        Already have an account?
                    </span>

                    <button
                        type="button"
                        className="auth-link"
                        onClick={goToLogin}
                    >
                        Login
                    </button>
                </div>

            </div>

        </div>
    );
}

export default Register;