import { Link } from "react-router-dom";

function NotFound() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            padding: '40px 24px',
            textAlign: 'center',
        }}>
            <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '96px',
                fontWeight: '800',
                color: '#e2e8f0',
                lineHeight: 1,
                letterSpacing: '-0.05em',
                marginBottom: '16px',
            }}>
                404
            </div>
            <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '22px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                marginBottom: '8px',
            }}>
                Page not found
            </h1>
            <p style={{
                fontSize: '14px',
                color: 'var(--text-muted)',
                marginBottom: '28px',
            }}>
                The page you're looking for doesn't exist or was moved.
            </p>
            <Link to="/list" className="button button--primary">
                ← Back to goals
            </Link>
        </div>
    );
}

export default NotFound;
