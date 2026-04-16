import { useContext, useEffect, useState } from "react";
import Goal from "./Goal.js";
import { GoalsContext } from "../../../memory/Context.tsx";
import { Outlet } from "react-router-dom";
import { RequestGoals } from "../../../services/Goals.ts";
import { AuthContext } from "../../../memory/Context.tsx";

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
            <div className="text-5xl mb-4">🎯</div>
            <p className="text-lg font-medium text-gray-600 mb-1">No goals yet</p>
            <p className="text-sm">Create your first goal to get started.</p>
        </div>
    );
}

function GoalSkeleton() {
    return (
        <div className="card flex h-14 p-2 m-2 justify-between items-center animate-pulse">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200" />
                <div className="h-4 w-8 bg-gray-200 rounded" />
                <div className="h-4 w-32 bg-gray-200 rounded" />
            </div>
            <div className="flex items-center gap-3 mr-4">
                <div className="h-4 w-20 bg-gray-200 rounded" />
                <div className="h-8 w-24 bg-gray-200 rounded-3xl" />
            </div>
        </div>
    );
}

function List() {
    const [state, dispatch] = useContext(GoalsContext);
    const [authState] = useContext(AuthContext);
    const { token } = authState;

    const [loading, setLoading] = useState(false);
    const [goalsLoaded, setGoalsLoaded] = useState(false);

    useEffect(() => {
        const tokenString = token?.token;

        if (!tokenString) {
            if (goalsLoaded) setGoalsLoaded(false);
            return;
        }

        if (tokenString && !goalsLoaded) {
            setLoading(true);
            async function fetchData() {
                try {
                    const goals = await RequestGoals(tokenString);
                    if (Array.isArray(goals)) {
                        dispatch({ type: "add_goal", goals });
                        setGoalsLoaded(true);
                    }
                } catch (error) {
                    console.error("Error fetching goals:", error);
                } finally {
                    setLoading(false);
                }
            }
            fetchData();
        }
    }, [dispatch, token?.token, state.order.length]);

    if (loading) {
        return (
            <>
                {[1, 2, 3].map((n) => <GoalSkeleton key={n} />)}
            </>
        );
    }

    return (
        <>
            {state.order.length === 0 && !loading && <EmptyState />}
            {state.order.map((id) => (
                <Goal key={id} {...state.objects[id]} />
            ))}
            <Outlet />
        </>
    );
}

export default List;
