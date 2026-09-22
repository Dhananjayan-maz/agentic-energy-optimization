function ErrorMessage({
  message = "Something went wrong while loading the dashboard.",
  onRetry,
}) {
  return (
    <div className="error-container">
      <div className="error-icon">!</div>

      <div>
        <h3>Unable to load data</h3>
        <p>{message}</p>

        {onRetry && (
          <button className="retry-button" onClick={onRetry}>
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorMessage;