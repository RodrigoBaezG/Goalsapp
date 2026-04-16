import React, { useEffect, useState } from "react";
import DetailsCss from "./Details.module.css";
import { useContext } from "react";
import { GoalsContext } from "../../../memory/Context.tsx";
import { useNavigate, useParams } from "react-router-dom";
import { CreateGoal, DeleteGoal, UpdateGoal } from "../../../services/Goals.ts";

function Details() {
    const { id } = useParams();

    const [form, setForm] = useState({
        details: "",
        events: 1,
        period_: "week",
        icon: "📚",
        goal: 1,
        deadline: "",
        completed: 0,
    });

    const [state, dispatch] = useContext(GoalsContext);

    const { details, events, period_, icon, goal, deadline, completed } = form;

    const onChange = (e, prop) => {
        setForm({ ...form, [prop]: e.target.value });
    };

    useEffect(() => {
        const goalMemory = state.objects[id];
        if (!id) return;
        if (!goalMemory) {
            return navigate("/404");
        }
        if (goalMemory.deadline && goalMemory.deadline.includes('T')) {
            // Separa la fecha del resto de la cadena ISO (ej: "2025-10-18")
            goalMemory.deadline = goalMemory.deadline.split('T')[0];
        }
        setForm(goalMemory);
    }, [id]);

    const frecuencyOptions = ["day", "week", "month", "year"];
    const iconOptions = ["📚", "💻", "🎨", "🏋️‍♂️", "💦", "✈️"];

    const navigate = useNavigate();

    const crear = async () => {
        // 1. RECUPERAR EL TOKEN (Asumiendo que ya lo guardaste en Register.jsx)
        const token = localStorage.getItem('authToken');
        
        if (!token) {
            // Si no hay token, redirigimos al login para evitar el error 401
            console.error("Token de autorización no encontrado. Redirigiendo a acceso.");
            return navigate('/access'); 
        }
        
        try {
            // 2. PASAR EL TOKEN a la función CreateGoal
            // Antes: const newGoal = await CreateGoal(form);
            const newGoal = await CreateGoal(form, token); // <--- CAMBIO CLAVE
            
            dispatch({
                type: "create_goal",
                goal: newGoal,
            });
            navigate("/list");
        } catch (error) {
            console.error("Error al crear la meta:", error);
            // Manejar errores de la API aquí
        }
    };

    const cancel = () => {
        navigate("/list");
    };

    const update = async () => {
        // 1. RECUPERAR EL TOKEN
        const token = localStorage.getItem('authToken');
        
        if (!token) {
            console.error("Token de autorización no encontrado. Redirigiendo a acceso.");
            return navigate('/access'); 
        }

        try {
            // 2. PASAR EL TOKEN
            const updatedGoal = await UpdateGoal(form, token); // <-- CAMBIO CLAVE
            dispatch({ type: "update", goal: updatedGoal });
            navigate("/list");
        } catch (error) {
            console.error("Error al actualizar la meta:", error);
        }
    };

    const deleteGoal = async () => {
        // 1. RECUPERAR EL TOKEN
        const token = localStorage.getItem('authToken');
        
        if (!token) {
            console.error("Token de autorización no encontrado. Redirigiendo a acceso.");
            return navigate('/access'); 
        }

        try {
            // 2. PASAR EL TOKEN
            await DeleteGoal(form.id, token); // <-- CAMBIO CLAVE
            dispatch({ type: "delete", id: form.id });
            navigate("/list");
        } catch (error) {
            console.error("Error al eliminar la meta:", error);
        }
    };

    return (
            <div className={DetailsCss.content}>
                <div className=" card ">
                    <form className="m-3">
                    <label className="label">
                        Details
                        <input
                            className="input"
                            type="text"
                            placeholder="Type your new goal"
                            value={details}
                            onChange={(e) => onChange(e, "details")}
                        />
                    </label>
                    <label className="label">
                        Deadline
                        <input
                            className="input"
                            type="date"
                            value={deadline}
                            onChange={(e) => onChange(e, "deadline")}
                        />
                    </label>
                    <label className="label">
                        Frecuency
                        <select
                            value={period_}
                            className="input"
                            onChange={(e) => onChange(e, "period_")}
                        >
                            {frecuencyOptions.map((period) => (
                                <option key={period} value={period}>
                                    {period}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="label">
                        Events
                        <input
                            className="input"
                            type="number"
                            value={events}
                            onChange={(e) => onChange(e, "events")}
                        />
                    </label>
                    <label className="label">
                        Goal
                        <input
                            className="input"
                            type="number"
                            value={goal}
                            onChange={(e) => onChange(e, "goal")}
                        />
                    </label>
                    <label className="label">
                        Completed
                        <input
                            className="input"
                            type="number"
                            value={completed}
                            onChange={(e) => onChange(e, "completed")}
                        />
                    </label>
                    <label className="label">
                        Choose an icon for your goal
                        <select
                            value={icon}
                            className="input"
                            onChange={(e) => onChange(e, "icon")}
                        >
                            {iconOptions.map((icon) => (
                                <option key={icon} value={icon}>
                                    {icon}
                                </option>
                            ))}
                        </select>
                    </label>
                </form>
                <div className={DetailsCss.buttons}>
                    {!id && (
                        <button className="button button--black" onClick={crear}>
                            Create
                        </button>
                    )}
                    {id && (
                        <button className="button button--black" onClick={update}>
                            Update
                        </button>
                    )}
                    {id && (
                        <button className="button button--red" onClick={deleteGoal}>
                            Delete
                        </button>
                    )}
                    <button className="button button--gray" onClick={cancel}>
                        Cancel
                    </button>
                </div>
                </div>
            </div>
    );
}

export default Details;
