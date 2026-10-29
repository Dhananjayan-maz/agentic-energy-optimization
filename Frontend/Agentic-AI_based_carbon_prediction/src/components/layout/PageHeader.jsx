
import "./PageHeader.css";

function PageHeader({
    section = "WORKSPACE",
    title,
    description,
    updatedAt,
    actions,
}) {
    return (
        <header className="page-header">
            <div className="page-header-main">
                <div className="page-header-breadcrumb">
                    <span>{section}</span>
                    <span className="page-header-separator">/</span>
                    <span className="page-header-current">{title}</span>
                </div>

                <p className="page-header-eyebrow">
                    ENERGIQ · SMART ENERGY INTELLIGENCE
                </p>

                <h1 className="page-header-title">{title}</h1>

                {description && (
                    <p className="page-header-description">
                        {description}
                    </p>
                )}
            </div>

            <div className="page-header-side">
                {updatedAt && (
                    <div className="page-header-update">
                        <span className="page-header-update-dot" />

                        <div className="page-header-update-text">
                            <span className="page-header-update-label">
                                Last updated
                            </span>

                            <strong>{updatedAt}</strong>
                        </div>
                    </div>
                )}

                {actions && (
                    <div className="page-header-actions">
                        {actions}
                    </div>
                )}
            </div>
        </header>
    );
}

export default PageHeader;
