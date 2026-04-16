import { useContext } from "react";
import Goal from "./Goal.js";
import { GoalsContext } from "../../../memory/Context.tsx";
import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { RequestGoals } from "../../../services/Goals.ts";
import { AuthContext } from "../../../memory/Context.tsx";
import { useState } from "react";


function List() {
    const [state, dispatch] = useContext(GoalsContext);
    const [authState] = useContext(AuthContext);
    const { token } = authState;

    const [goalsLoaded, setGoalsLoaded] = useState(false);

    useEffect(() => {
        const tokenString = token?.token;

        // 1. Lógica de RESET: Si el token se va (logout), reseteamos la bandera.
        if (!tokenString) {
            if (goalsLoaded) setGoalsLoaded(false);
            return;
        }

        // 2. Lógica de CARGA: Solo si tenemos un token Y aún no hemos cargado en esta sesión.
        if (tokenString && !goalsLoaded) {
            console.log("List.jsx: Token ESTABLE detectado. Iniciando RequestGoals...");

            async function FetchData() {
                try {
                    // Usamos la cadena del token
                    const goals = await RequestGoals(tokenString);
                    if (Array.isArray(goals)) {
                        dispatch({ type: "add_goal", goals });
                        setGoalsLoaded(true); // 💡 Marcar como cargado
                    }
                } catch (error) {
                    console.error("Error al obtener metas:", error);
                }
            }

            FetchData();
        }
        // Dependencia CLAVE: Solo se dispara si cambia la cadena del token o el dispatch.
    }, [dispatch, token?.token, state.order.length]);



    return (
        <>
            {state.order.map((id) => (
                <Goal key={id} {...state.objects[id]} />
            ))}
            <Outlet />
        </>
    );
}

export default List;
