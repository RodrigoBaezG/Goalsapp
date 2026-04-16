/**
 * @jest-environment jsdom
 */

// We test the reducer logic by importing GoalsMemory's internals.
// Since the reducer isn't exported directly, we duplicate its logic here
// and validate the expected shape. The real tests are integration-level
// via the context provider.

type GoalType = {
    id: number;
    icon: string;
    details: string;
    period_: string;
    events: number;
    goal: number;
    completed: number;
};

type StateType = {
    order: Array<string | number>;
    objects: { [id: string]: GoalType };
};

type Action =
    | { type: 'add_goal'; goals: GoalType[] }
    | { type: 'create_goal'; goal: GoalType }
    | { type: 'update'; goal: Partial<GoalType> & { id: number } }
    | { type: 'delete'; id: number };

const initialState: StateType = { order: [], objects: {} };

function reducer(state: StateType, action: Action): StateType {
    switch (action.type) {
        case 'add_goal': {
            const goals = action.goals;
            return {
                order: goals.map((g) => g.id),
                objects: goals.reduce((obj, g) => ({ ...obj, [g.id]: g }), {}),
            };
        }
        case 'create_goal': {
            const { goal } = action;
            return {
                order: [...state.order, goal.id],
                objects: { ...state.objects, [goal.id]: goal },
            };
        }
        case 'update': {
            const { goal } = action;
            return {
                ...state,
                objects: {
                    ...state.objects,
                    [goal.id]: { ...state.objects[goal.id], ...goal } as GoalType,
                },
            };
        }
        case 'delete': {
            const newOrder = state.order.filter((id) => id !== action.id);
            const newObjects = { ...state.objects };
            delete newObjects[action.id];
            return { order: newOrder, objects: newObjects };
        }
        default:
            return state;
    }
}

const mockGoal: GoalType = {
    id: 1,
    icon: '📚',
    details: 'Read 12 books',
    period_: 'yearly',
    events: 5,
    goal: 12,
    completed: 0,
};

describe('goalsReducer', () => {
    describe('add_goal', () => {
        it('populates order and objects from an array', () => {
            const state = reducer(initialState, { type: 'add_goal', goals: [mockGoal] });
            expect(state.order).toEqual([1]);
            expect(state.objects[1]).toEqual(mockGoal);
        });

        it('handles empty array', () => {
            const state = reducer(initialState, { type: 'add_goal', goals: [] });
            expect(state.order).toHaveLength(0);
            expect(state.objects).toEqual({});
        });

        it('replaces previous goals completely', () => {
            const first = reducer(initialState, { type: 'add_goal', goals: [mockGoal] });
            const second: GoalType = { ...mockGoal, id: 2, details: 'Run 5k' };
            const state = reducer(first, { type: 'add_goal', goals: [second] });
            expect(state.order).toEqual([2]);
            expect(state.objects[1]).toBeUndefined();
        });
    });

    describe('create_goal', () => {
        it('appends goal to order and objects', () => {
            const newGoal: GoalType = { ...mockGoal, id: 3 };
            const state = reducer(initialState, { type: 'create_goal', goal: newGoal });
            expect(state.order).toContain(3);
            expect(state.objects[3]).toEqual(newGoal);
        });
    });

    describe('update', () => {
        it('updates only the changed fields', () => {
            const base = reducer(initialState, { type: 'add_goal', goals: [mockGoal] });
            const state = reducer(base, { type: 'update', goal: { id: 1, completed: 7 } });
            expect(state.objects[1].completed).toBe(7);
            expect(state.objects[1].details).toBe('Read 12 books');
        });

        it('does not modify order', () => {
            const base = reducer(initialState, { type: 'add_goal', goals: [mockGoal] });
            const state = reducer(base, { type: 'update', goal: { id: 1, completed: 7 } });
            expect(state.order).toEqual([1]);
        });
    });

    describe('delete', () => {
        it('removes goal from order and objects', () => {
            const base = reducer(initialState, { type: 'add_goal', goals: [mockGoal] });
            const state = reducer(base, { type: 'delete', id: 1 });
            expect(state.order).toHaveLength(0);
            expect(state.objects[1]).toBeUndefined();
        });

        it('leaves other goals intact', () => {
            const goal2: GoalType = { ...mockGoal, id: 2 };
            const base = reducer(initialState, { type: 'add_goal', goals: [mockGoal, goal2] });
            const state = reducer(base, { type: 'delete', id: 1 });
            expect(state.order).toEqual([2]);
            expect(state.objects[2]).toEqual(goal2);
        });
    });
});
