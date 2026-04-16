import { useContext } from "react";
import Credentials from "../../shared/Credentials.tsx";
import { AuthContext } from "../../../memory/Context.tsx";
import { useNavigate } from "react-router-dom";
import { login } from "../../../services/Auth.ts";
import LinkTo from "../../shared/LinkTo.jsx";


function Access() {

    const navigate = useNavigate();

    const [auth, authDispatch] = useContext(AuthContext);

    const loginDispatch = async (form) => {
        try {
            // 1. Llama a la API (devuelve { token: "..." })
            const tokenObject = await login(form);

            // 2. GUARDAR EL TOKEN EN EL NAVEGADOR (Paso clave)
            // tokenObject es { token: "jwt_string" }, por eso usamos tokenObject.token
            localStorage.setItem('authToken', tokenObject.token);

            // 3. Actualizar el Contexto
            authDispatch({ type: 'add', token: tokenObject });

            // 4. Redirigir
            navigate('/list');

        } catch (error) {
            console.error("Fallo el inicio de sesión:", error);
            // Manejar errores de login aquí (ej. mostrar mensaje de 'Contraseña incorrecta')
        }
    };

    return (
            <Credentials
                send={loginDispatch}
                title="Log in"
                button="Log in"
                condition="Log in"
                conditionTitle="Log in"
                button2="Sign up"
                url="/register">
            </Credentials>
    );
}

export default Access;