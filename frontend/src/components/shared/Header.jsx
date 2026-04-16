import HeaderCss from "./Header.module.css";
import GoalsAppIcon from "../../img/GoalsAppIcon.svg";
import profileIcon from "../../img/profile.svg";
import LinkTo from "./LinkTo";
import { useContext } from "react";
import { AuthContext } from "../../memory/Context.tsx";
import { useNavigate } from "react-router-dom";
import NewGoalIcon from "../../img/newgoal.svg";

function Header() {

    const [authState, authDispatch] = useContext(AuthContext);
    const navigate = useNavigate();

    const isAuthenticated = !!authState.authenticate;

    const handleLogout = () => {
        // 1. Ejecutar la acción 'logout' (que borra localStorage)
        authDispatch({ type: 'logout' });

        // 2. Redirigir al usuario a la página pública
        navigate('/access');
    };

    return (
        <header className={HeaderCss.header}>
            <div className={HeaderCss.titleContainer}>
                <img
                    className={HeaderCss.icon}
                    src={GoalsAppIcon}
                    alt="Descripción del icono"
                />
                <a className={HeaderCss.title} href="/goals">
                    Goals app
                </a>
            </div>
            {isAuthenticated && (
                <>
                    <div className="md:hidden">

                        <LinkTo
                            to="/create"
                            // Clase de Tailwind para ocultar en md: y superiores
                            className="md:hidden flex items-center p-2 rounded-3xl hover:bg-gray-200"
                        >
                            <img
                                className="h-6 w-6" // Estilos simplificados para el icono
                                src={NewGoalIcon}
                                alt="Create Goal Icon"
                            />
                        </LinkTo>
                    </div>

                    <button onClick={handleLogout}
                        className={HeaderCss.logout}>Logout</button>

                </>
            )}
            <nav>
                <LinkTo to="/profile">
                    <img className={HeaderCss.icon} src={profileIcon} />
                </LinkTo>
            </nav>
        </header>
    );
}

export default Header;
