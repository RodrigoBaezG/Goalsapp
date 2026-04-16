import React, { useEffect, useState } from "react";
import DetailsCss from "./Details.module.css";
import { useContext } from "react";
import { GoalsContext } from "../../../memory/Context.tsx";
import { useNavigate, useParams } from "react-router-dom";
import { CreateGoal, DeleteGoal, UpdateGoal } from "../../../services/Goals.ts";
import { AuthContext } from "../../../memory/Context.tsx";

function Details() {
    const { id } = useParams();
    const navigate = useNavigate();

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
    const [authState] = useContext(AuthContext);
    const token = authState?.token?.token || localStorage.getItem('authToken');

    const { details, events, period_, icon, goal, deadline, completed } = form;

    const onChange = (e, prop) => {
        setForm({ ...form, [prop]: e.target.value });
    };

    useEffect(() => {
        if (!id) return;
        const goalMemory = state.objects[id];
        if (!goalMemory) { navigate("/404"); return; }
        const dl = goalMemory.deadline?.includes('T')
            ? goalMemory.deadline.split('T')[0]
            : goalMemory.deadline || "";
        setForm({ ...goalMemory, deadline: dl });
    }, [id]);

    const frecuencyOptions = ["day", "week", "month", "year"];
    const iconOptions = ["📚", "💻", "🎨", "🏋️‍♂️", "💦", "✈️", "🎯", "🎵", "🌱", "💪"];

    const getToken = () => {
        if (!token) { navigate('/access'); return null; }
        return token;
    };

    const crear = async () => {
        const t = getToken(); if (!t) return;
        try {
            const newGoal = await CreateGoal(form, t);
            dispatch({ type: "create_goal", goal: newGoal });
            navigate("/list");
        } catch (e) { console.error(e); }
    };

    const update = async () => {
        const t = getToken(); if (!t) return;
        try {
            const updatedGoal = await UpdateGoal(form, t);
            dispatch({ type: "update", goal: updatedGoal });
            navigate("/list");
        } catch (e) { console.error(e); }
    };

    const deleteGoal = async () => {
        const t = getToken(); if (!t) return;
        if (!confirm("Delete this goal? This action cannot be undone.")) return;
        try {
            await DeleteGoal(form.id, t);
            dispatch({ type: "delete", id: form.id });
            navigate("/list");
        } catch (e) { console.error(e); }
    };

    const isValid = details.trim().length >= 5 && period_.length > 0;

    return (
        <div className={DetailsCss.content}>
            <div className={DetailsCss.formCard}>
                <div className={DetailsCss.formHeader}>
                    <h2 className={DetailsCss.formTitle}>
                        {id ? "Edit goal" : "New goal"}
                    </h2>
                </div>

                <div className={DetailsCss.formBody}>
                    <label className="label" style={{ gridColumn: '1 / -1' }}>
                        What's your goal?
                        <input
                            className="input"
                            type="text"
                            placeholder="e.g. Read 12 books this year"
                            value={details}
                            onChange={(e) => onChange(e, "details")}
                            autoFocus
                        />
                    </label>

                    <div className={DetailsCss.grid}>
                        <label className="label">
                            Frequency
                            <select className="input" value={period_} onChange={(e) => onChange(e, "period_")}>
                                {frecuencyOptions.map((p) => (
                                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                                ))}
                            </select>
                        </label>

                        <label className="label">
                            Icon
                            <select className="input" value={icon} onChange={(e) => onChange(e, "icon")}>
                                {iconOptions.map((ic) => (
                                    <option key={ic} value={ic}>{ic}</option>
                                ))}
                            </select>
                        </label>

                        <label className="label">
                            Events per period
                            <input className="input" type="number" min="1" value={events} onChange={(e) => onChange(e, "events")} />
                        </label>

                        <label className="label">
                            Total goal
                            <input className="input" type="number" min="1" value={goal} onChange={(e) => onChange(e, "goal")} />
                        </label>

                        <label className="label">
                            Completed so far
                            <input className="input" type="number" min="0" value={completed} onChange={(e) => onChange(e, "completed")} />
                        </label>

                        <label className="label">
                            Deadline
                            <input className="input" type="date" value={deadline} onChange={(e) => onChange(e, "deadline")} />
                        </label>
                    </div>
                </div>

                <div className={DetailsCss.buttons}>
                    <div className={DetailsCss.buttonsLeft}>
                        {!id && (
                            <button className="button button--black" onClick={crear} disabled={!isValid}>
                                Create goal
                            </button>
                        )}
                        {id && (
                            <button className="button button--black" onClick={update} disabled={!isValid}>
                                Save changes
                            </button>
                        )}
                        <button className="button button--gray" onClick={() => navigate("/list")}>
                            Cancel
                        </button>
                    </div>
                    {id && (
                        <button className="button button--red" onClick={deleteGoal}>
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Details;
