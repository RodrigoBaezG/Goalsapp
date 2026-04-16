import React, { useContext } from 'react';
import { Link } from "react-router-dom";
import styles from "./Goal.module.css";
import type { GoalType } from "../../../types/Goal.ts";
import { GoalsContext } from "../../../memory/Context.tsx";
import { AuthContext } from "../../../memory/Context.tsx";
import { UpdateGoal } from "../../../services/Goals.ts";

interface GoalProps extends GoalType {}

function Goal({ id, icon, details, period_, events, goal, completed }: GoalProps) {
    const [, dispatch] = useContext(GoalsContext) as any;
    const [authState] = useContext(AuthContext) as any;
    const token = authState?.token?.token || localStorage.getItem('authToken');

    const progressPct = goal > 0 ? Math.min(Math.round((completed / goal) * 100), 100) : 0;

    const handleComplete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!token) return;
        try {
            const updated = await UpdateGoal(
                { id, icon, details, period_, events, goal, completed: completed + 1 } as GoalType,
                token
            );
            dispatch({ type: 'update', goal: updated });
        } catch (error) {
            console.error('Error marking completed:', error);
        }
    };

    return (
        <Link to={`/list/${id}`} className={styles.goal + " card"}>
            <div className="flex items-center justify-center">
                <div className={styles.icon}>{icon}</div>
                <p className={styles.frecuency}>
                    {events}
                    <sub className="text-xs flex ml-2">/{period_}</sub>
                </p>
                <p>{details}</p>
            </div>
            <div className="flex items-center">
                <div className="relative m-5 mx-8">
                    <p className="text-center" data-testid="completed-count">
                        {completed} of {goal}
                    </p>
                    <div
                        className={styles.progressBar}
                        role="progressbar"
                        aria-valuenow={progressPct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    >
                        <div
                            style={{ width: `${progressPct}%` }}
                            className={styles.progress}
                        />
                    </div>
                </div>
                <button
                    className="button--gray mr-2"
                    onClick={handleComplete}
                    aria-label="Mark as completed"
                >
                    Completed
                </button>
            </div>
        </Link>
    );
}

export default Goal;
