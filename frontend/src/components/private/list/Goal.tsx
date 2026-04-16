import React from 'react';
import { Link } from "react-router-dom";
import styles from "./Goal.module.css";
import type { GoalType } from "../../../types/Goal.ts";

interface GoalProps extends GoalType {}


function Goal({ id, icon, details, period_, events, goal, completed }: GoalProps) {
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
                    <p className="text-center">
                        {completed} of {goal}
                    </p>
                    <div className={styles.progressBar}>
                        <div
                            style={{
                                width: `${Math.round((completed / goal) * 100)}%`,
                            }}
                            className={styles.progress}
                        ></div>
                    </div>
                </div>
                <button className="button--gray mr-2">Completed</button>
            </div>
        </Link>
    );
}

export default Goal;
