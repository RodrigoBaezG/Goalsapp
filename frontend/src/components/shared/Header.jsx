import styles from "./Header.module.css";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../memory/Context.tsx";
import { useNavigate } from "react-router-dom";

function Header() {
    const [authState, authDispatch] = useContext(AuthContext);
    const navigate = useNavigate();
    const isAuthenticated = !!authState.authenticate;

    const handleLogout = () => {
        authDispatch({ type: 'logout' });
        navigate('/access');
    };

    return (
        <header className={styles.header}>
            <Link to={isAuthenticated ? "/list" : "/access"} className={styles.brand}>
                <div className={styles.brandMark}>🎯</div>
                <span className={styles.brandName}>
                    Goals<span>App</span>
                </span>
            </Link>

            <div className={styles.right}>
                {isAuthenticated && (
                    <>
                        <Link to="/create" className={styles.mobileNewGoal + " md:hidden"} aria-label="New goal">
                            +
                        </Link>
                        <button onClick={handleLogout} className={styles.logout}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            Log out
                        </button>
                    </>
                )}
            </div>
        </header>
    );
}

export default Header;
