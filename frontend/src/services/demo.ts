import type { GoalType } from "../types/Goal.ts";

export const DEMO_USERNAME = "example@gmail.com";
const DEMO_FLAG_KEY = "demoMode";
const DEMO_GOALS_KEY = "demoGoals";

const SEED_GOALS: GoalType[] = [
    {
        id: "demo-1",
        icon: "📚",
        details: "Read 12 books this year",
        period_: "year",
        events: 1,
        goal: 12,
        completed: 7,
    },
    {
        id: "demo-2",
        icon: "🏋️‍♂️",
        details: "Workout 4x per week",
        period_: "week",
        events: 4,
        goal: 4,
        completed: 3,
    },
    {
        id: "demo-3",
        icon: "💻",
        details: "Ship 3 side projects",
        period_: "year",
        events: 1,
        goal: 3,
        completed: 1,
    },
    {
        id: "demo-4",
        icon: "🌱",
        details: "Meditate 10 minutes daily",
        period_: "day",
        events: 1,
        goal: 1,
        completed: 1,
    },
    {
        id: "demo-5",
        icon: "💦",
        details: "Drink 8 glasses of water",
        period_: "day",
        events: 8,
        goal: 8,
        completed: 5,
    },
    {
        id: "demo-6",
        icon: "🎵",
        details: "Practice guitar 3x per week",
        period_: "week",
        events: 3,
        goal: 3,
        completed: 2,
    },
    {
        id: "demo-7",
        icon: "✈️",
        details: "Visit 4 new cities",
        period_: "year",
        events: 1,
        goal: 4,
        completed: 2,
    },
];

export function isDemoMode(): boolean {
    return localStorage.getItem(DEMO_FLAG_KEY) === "true";
}

export function setDemoMode(active: boolean): void {
    if (active) {
        localStorage.setItem(DEMO_FLAG_KEY, "true");
        if (!localStorage.getItem(DEMO_GOALS_KEY)) {
            localStorage.setItem(DEMO_GOALS_KEY, JSON.stringify(SEED_GOALS));
        }
    } else {
        localStorage.removeItem(DEMO_FLAG_KEY);
        localStorage.removeItem(DEMO_GOALS_KEY);
    }
}

function readGoals(): GoalType[] {
    const raw = localStorage.getItem(DEMO_GOALS_KEY);
    if (!raw) {
        localStorage.setItem(DEMO_GOALS_KEY, JSON.stringify(SEED_GOALS));
        return [...SEED_GOALS];
    }
    try {
        return JSON.parse(raw) as GoalType[];
    } catch {
        return [...SEED_GOALS];
    }
}

function writeGoals(goals: GoalType[]): void {
    localStorage.setItem(DEMO_GOALS_KEY, JSON.stringify(goals));
}

export async function getDemoGoals(): Promise<GoalType[]> {
    return readGoals();
}

export async function createDemoGoal(goal: GoalType): Promise<GoalType> {
    const goals = readGoals();
    const newGoal: GoalType = { ...goal, id: `demo-${Date.now()}` };
    writeGoals([...goals, newGoal]);
    return newGoal;
}

export async function updateDemoGoal(goal: GoalType): Promise<GoalType> {
    const goals = readGoals();
    const next = goals.map((g) => (g.id === goal.id ? { ...g, ...goal } : g));
    writeGoals(next);
    return goal;
}

export async function deleteDemoGoal(id: string | number): Promise<void> {
    const goals = readGoals();
    writeGoals(goals.filter((g) => g.id !== id));
}
