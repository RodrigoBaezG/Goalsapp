import "./App.css";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/shared/Layout.jsx";
import List from "./components/private/list/List.jsx";
import Details from "./components/private/new/Details.jsx";
import NotFound from "./components/shared/NotFound.jsx";
import Modal from "./components/shared/Modal.jsx";
import { useContext } from "react";
import { GoalsContext } from "./memory/Context.tsx";
import { useEffect } from "react";
import { RequestGoals } from "./services/Goals.ts";
import Access from "./components/public/access/Access.jsx";
import Register from "./components/public/register/Register.jsx";
import Authenticate from "./components/shared/Authenticate.jsx";
import { AuthContext } from "./memory/Context.tsx";
import { useState } from "react";

function App() {

    const [, dispatch] = useContext(GoalsContext);
    const [authState, authDispatch] = useContext(AuthContext);
    const { token } = authState;

    // CORRECCIÓN CLAVE 1: Estado para controlar si las metas ya fueron cargadas
    const [goalsLoaded, setGoalsLoaded] = useState(false);

    // useEffect(() => {
    //     const storedToken = localStorage.getItem('authToken');
        
    //     // Comprobar si hay token en localStorage Y si NO está en el Contexto.
    //     if (storedToken && !token?.token) { // Usamos token?.token para chequear el valor string
    //          authDispatch({ type: 'add', token: { token: storedToken } });
    //     }
    // }, [authDispatch, token]); 


    // useEffect EXISTENTE: CARGA LAS METAS
    // useEffect(() => {
    //     // 1. OBTENER EL TOKEN: Solo del Contexto (token es { token: "..." })
    //     const tokenString = token?.token;
         
    //     // 2. CONDICIÓN DE CORTE: Si no hay token en el Contexto, salimos y esperamos.
    //     if (!tokenString || goalsLoaded) { 
    //          // Si el token desaparece, queremos volver a cargarlas la próxima vez.
    //          if (!tokenString) setGoalsLoaded(false); 
    //          return;
    //     }

    //     console.log("Token válido en Contexto. Iniciando RequestGoals...");

    //     async function FetchData() {
    //         try {
    //             const goals = await RequestGoals(tokenString); 
    //             dispatch({ type: "add_goal", goals }); 
    //             // 2. Marcar como cargadas para que no se vuelva a ejecutar
    //             setGoalsLoaded(true); 
    //         } catch (error) {
    //             console.error("Error al cargar metas:", error);
    //             // Si falla la carga, podríamos resetear el token para forzar login
    //         }
    //     }
        
    //     FetchData();
        
    // }, [dispatch, token?.token, goalsLoaded]); // <--- DEPENDENCIA: token completo.

    

    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/access" element={<Access />}></Route>
                <Route path="/register" element={<Register />}></Route>
                <Route path="*" element={<NotFound />} />
            </Route>
            <Route element={<Layout privateRoute />}>
                <Route element={<Authenticate />}>
                    <Route index element={<List />} />
                    <Route path="/list" element={<List />}>
                        <Route
                            path="/list/:id"
                            element={
                                <Modal>
                                    <Details />
                                </Modal>
                            }
                        />
                    </Route>
                    <Route path="/create" element={<Details />} />
                </Route>
            </Route>
        </Routes>
    );
}

export default App;
