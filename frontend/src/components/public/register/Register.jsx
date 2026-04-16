import Credentials from "../../shared/Credentials.tsx";
import { AuthContext } from "../../../memory/Context.tsx";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../../../services/Auth.ts";

function Register() {
    const navigate = useNavigate();
    const [, Authreducer] = useContext(AuthContext);
    const [error, setError] = useState(null);

    const signupDispatch = async (form) => {
        setError(null);
        try {
            const tokenObject = await signup(form);
            localStorage.setItem('authToken', tokenObject.token);
            Authreducer({ type: 'add', token: tokenObject });
            navigate('/list');
        } catch (err) {
            setError(err.message || 'Sign up failed. Please try again.');
        }
    };

    return (
        <Credentials
            send={signupDispatch}
            title="Sign up"
            button="Sign up"
            condition="Sign up"
            conditionTitle="Sign up"
            button2="Log in"
            url="/access"
            error={error}
        />
    );
}

export default Register;
