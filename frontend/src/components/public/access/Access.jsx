import { useContext, useState } from "react";
import Credentials from "../../shared/Credentials.tsx";
import { AuthContext } from "../../../memory/Context.tsx";
import { useNavigate } from "react-router-dom";
import { login } from "../../../services/Auth.ts";

const DEMO_CREDENTIALS = { username: 'example@gmail.com', password: '12345' };

function Access() {
    const navigate = useNavigate();
    const [, authDispatch] = useContext(AuthContext);
    const [error, setError] = useState(null);

    const loginDispatch = async (form) => {
        setError(null);
        try {
            const tokenObject = await login(form);
            localStorage.setItem('authToken', tokenObject.token);
            authDispatch({ type: 'add', token: tokenObject });
            navigate('/list');
        } catch {
            setError('Invalid email or password. Try the demo button below.');
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
            url="/register"
            error={error}
            demoCredentials={DEMO_CREDENTIALS}
        />
    );
}

export default Access;
