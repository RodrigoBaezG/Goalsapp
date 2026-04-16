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
        if (!goalMemory) {
            navigate("/404");
            return;
        }
        const deadline = goalMemory.deadline?.includes('T')
            ? goalMemory.deadline.split('T')[0]
            : goalMemory.deadline || "";
        setForm({ ...goalMemory, deadline });
    }, [id]);

    const frecuencyOptions = ["day", "week", "month", "year"];
    const iconOptions = ["📚", "💻", "🎨", "🏋️‍♂️", "💦", "✈️"];

    const getToken = () => {
        if (!token) {
            navigate('/access');
            return null;
        }
        return token;
    };

    const crear = async () => {
        const t = getToken();
        if (!t) return;
        try {
            const newGoal = await CreateGoal(form, t);
            dispatch({ type: "create_goal", goal: newGoal });
            navigate("/list");
        } catch (error) {
            console.error("Error creating goal:", error);
        }
    };

    const cancel = () => navigate("/list");

    const update = async () => {
        const t = getToken();
        if (!t) return;
        try {
            const updatedGoal = await UpdateGoal(form, t);
            dispatch({ type: "update", goal: updatedGoal });
            navigate("/list");
        } catch (error) {
            console.error("Error updating goal:", error);
        }
    };

    const deleteGoal = async () => {
        const t = getToken();
        if (!t) return;
        try {
            await DeleteGoal(form.id, t);
            dispatch({ type: "delete", id: form.id });
            navigate("/list");
        } catch (error) {
            console.error("Error deleting goal:", error);
        }
    };

    const isValid = details.length >= 5 && period_.length > 0;

    return (
        <div className={DetailsCss.content}>
            <div className="card">
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
                        Frequency
                        <select
                            value={period_}
                            className="input"
                            onChange={(e) => onChange(e, "period_")}
                        >
                            {frecuencyOptions.map((period) => (
                                <option key={period} value={period}>{period}</option>
                            ))}
                        </select>
                    </label>
                    <label className="label">
                        Events per period
                        <input
                            className="input"
                            type="number"
                            min="1"
                            value={events}
                            onChange={(e) => onChange(e, "events")}
                        />
                    </label>
                    <label className="label">
                        Goal (total)
                        <input
                            className="input"
                            type="number"
                            min="1"
                            value={goal}
                            onChange={(e) => onChange(e, "goal")}
                        />
                    </label>
                    <label className="label">
                        Completed
                        <input
                            className="input"
                            type="number"
                            min="0"
                            value={completed}
                            onChange={(e) => onChange(e, "completed")}
                        />
                    </label>
                    <label className="label">
                        Icon
                        <select
                            value={icon}
                            className="input"
                            onChange={(e) => onChange(e, "icon")}
                        >
                            {iconOptions.map((icon) => (
                                <option key={icon} value={icon}>{icon}</option>
                            ))}
                        </select>
                    </label>
                </form>
                <div className={DetailsCss.buttons}>
                    {!id && (
                        <button className="button button--black" onClick={crear} disabled={!isValid}>
                            Create
                        </button>
                    )}
                    {id && (
                        <button className="button button--black" onClick={update} disabled={!isValid}>
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
