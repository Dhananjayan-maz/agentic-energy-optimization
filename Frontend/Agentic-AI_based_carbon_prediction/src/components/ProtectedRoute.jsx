function ProtectedRoute({ children }) {
    const accessToken = localStorage.getItem("access");

    if (!accessToken) {
        window.location.href = "/login";
        return null;
    }

    return children;
}

export default ProtectedRoute;