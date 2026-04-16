import { useContext, useEffect, useState } from "react";
import Goal from "./Goal.js";
import { GoalsContext } from "../../../memory/Context.tsx";
import { Outlet, Link } from "react-router-dom";
import { RequestGoals } from "../../../services/Goals.ts";
import { AuthContext } from "../../../memory/Context.tsx";

function EmptyState() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '64px 24px',
            textAlign: 'center',
        }}>
            <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '18px',
                background: 'var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                marginBottom: '20px',
            }}>
                🎯
            </div>
            <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '20px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                marginBottom: '8px',
            }}>
                No goals yet
            </h2>
            <p style={{
                fontSize: '14px',
                color: 'var(--text-muted)',
                marginBottom: '24px',
                maxWidth: '280px',
                lineHeight: '1.6',
            }}>
                Start by creating your first goal. Track habits, projects, or anything you want to improve.
            </p>
            <Link to="/create" className="button button--primary">
                + Create my first goal
            </Link>
        </div>
    );
}

function GoalSkeleton() {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '14px 16px',
            marginBottom: '8px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            width: '100%',
            animation: 'pulse 1.5s ease-in-out infinite',
        }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f1f5f9', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
                <div style={{ height: '14px', background: '#f1f5f9', borderRadius: '6px', marginBottom: '8px', width: '55%' }} />
                <div style={{ height: '10px', background: '#f8fafc', borderRadius: '6px', width: '35%', marginBottom: '8px' }} />
                <div style={{ height: '5px', background: '#f1f5f9', borderRadius: '4px', width: '180px' }} />
            </div>
            <div style={{ width: '60px', height: '34px', borderRadius: '20px', background: '#f1f5f9' }} />
        </div>
    );
}

function ListHeader({ count }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            marginBottom: '16px',
        }}>
            <div>
                <h1 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '20px',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.02em',
                }}>
                    My Goals
                </h1>
                {count > 0 && (
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {count} goal{count !== 1 ? 's' : ''} tracked
                    </p>
                )}
            </div>
            <Link to="/create" className="button button--primary" style={{ flexShrink: 0 }}>
                + New goal
            </Link>
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
        if (!tokenString) { if (goalsLoaded) setGoalsLoaded(false); return; }
        if (tokenString && !goalsLoaded) {
            setLoading(true);
            async function fetchData() {
                try {
                    const goals = await RequestGoals(tokenString);
                    if (Array.isArray(goals)) {
                        dispatch({ type: "add_goal", goals });
                        setGoalsLoaded(true);
                    }
                } catch (e) {
                    console.error("Error fetching goals:", e);
                } finally {
                    setLoading(false);
                }
            }
            fetchData();
        }
    }, [dispatch, token?.token, state.order.length]);

    if (loading) {
        return (
            <div style={{ width: '100%', maxWidth: '680px' }}>
                {[1, 2, 3].map((n) => <GoalSkeleton key={n} />)}
            </div>
        );
    }

    return (
        <div style={{ width: '100%', maxWidth: '680px' }}>
            <ListHeader count={state.order.length} />
            {state.order.length === 0 ? (
                <EmptyState />
            ) : (
                state.order.map((id) => (
                    <Goal key={id} {...state.objects[id]} />
                ))
            )}
            <Outlet />
        </div>
    );
}

export default List;
