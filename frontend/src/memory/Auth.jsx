import { useReducer } from "react";
import { AuthContext } from "./Context.tsx";
import { useEffect } from "react";

const storedToken = localStorage.getItem("authToken");

const InitialState = {
    token: storedToken ? { token: storedToken } : null, // <-- clave
    authenticate: !!storedToken, // true si existe token
};

function reducer(state, action) {
    switch (action.type) {
        case "add": {
            console.log("Adding token", action.token);
            const jwtString = action.token.token;
            const newState = {
                token: { token: jwtString },
                authenticate: true
            };
            console.log("New state", newState);

            // 2️⃣ Sincronizar automáticamente con localStorage
            localStorage.setItem("authToken", jwtString);

            return newState;
        };

        case "logout": {
            console.log("Removing token");
            localStorage.removeItem("authToken");
            return { token: null, authenticate: false };
        }


        default:
            return state;
    };
};

function AuthMemory({ children }) {
    const [value, dispatch] = useReducer(reducer, InitialState);

    return (
        <AuthContext.Provider value={[value, dispatch]}>{children}</AuthContext.Provider>
    );
}

export default AuthMemory;