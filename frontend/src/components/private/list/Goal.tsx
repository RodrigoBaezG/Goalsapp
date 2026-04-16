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
    const isDone = progressPct >= 100;

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
        <Link to={`/list/${id}`} className={styles.card} data-testid="goal-card">
            <div className={styles.icon}>{icon}</div>

            <div className={styles.body}>
                <div className={styles.title}>{details}</div>
                <div className={styles.meta}>
                    <span className={styles.badge}>{period_}</span>
                    <span className={styles.events}>{events} event{events !== 1 ? 's' : ''}</span>
                </div>
                <div className={styles.progressTrack}>
                    <div
                        className={`${styles.progressFill} ${isDone ? styles.done : ''}`}
                        style={{ width: `${progressPct}%` }}
                        role="progressbar"
                        aria-valuenow={progressPct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    />
                </div>
            </div>

            <div className={styles.right}>
                <div className={styles.counter}>
                    <span className={styles.counterValue} data-testid="completed-count">
                        {completed}<span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/{goal}</span>
                    </span>
                    <span className={styles.counterLabel}>{progressPct}%</span>
                </div>
                <button
                    className={styles.completeBtn}
                    onClick={handleComplete}
                    aria-label="Mark as completed"
                    title="Mark as completed"
                >
                    ✓
                </button>
            </div>
        </Link>
    );
}

export default Goal;
