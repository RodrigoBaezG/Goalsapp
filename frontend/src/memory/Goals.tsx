import { useReducer } from "react";
import { GoalsContext } from "./Context.tsx";
import type { GoalType } from "../types/Goal.ts";
import type { ReactNode } from "react";


// const listaMock = [
//     {
//         id: 1,
//         icon: "📚",
//         details: "Learn React",
//         period: "week",
//         events: 4,
//         goal: 10,
//         deadline: "",
//         completed: 3,
//     },
//     {
//         id: 2,
//         icon: "📚",
//         details: "Learn Python",
//         period: "week",
//         events: 5,
//         goal: 20,
//         deadline: "",
//         completed: 5,
//     },
//     {
//         id: 3,
//         icon: "📚",
//         details: "Learn JavaScript",
//         period: "week",
//         events: 7,
//         goal: 15,
//         deadline: "",
//         completed: 8,
//     },
// ];

// const memory = localStorage.getItem('goals');
// const inicialState = memory
//     ? JSON.parse(memory)
//     : {
//         order: [],
//         objects: {}
//     };

type StateType = {
    order: Array<string | number>;
    objects: { [id: string]: GoalType };
};

type Action =
    | { type: "add_goal"; goals: GoalType[] }
    | { type: "create_goal"; goal: GoalType }
    | { type: "update"; goal: Partial<GoalType> & { id: string | number } }
    | { type: "delete"; id: string | number }
    

const initialState: StateType = {
    order: [],
    objects: {},
};



function reducer(state: StateType, action: Action): StateType {
    switch (action.type) {
        case "add_goal": {
            // if (!action.goals || !Array.isArray(action.goals)) {
            //     // Esto maneja si el backend devuelve datos nulos/vacíos
            //     console.warn("Goals data is missing or invalid for 'add_goal'. Returning current state.");
            //     return state; 
            // }

            const goals = action.goals;
            const newState = {
                order: goals.map((goal) => goal.id),
                objects: goals.reduce(
                    (object, goal) => ({ ...object, [goal.id]: goal }),
                    {},
                ),
            };
            // localStorage.setItem('goals', JSON.stringify(newState));
            return newState;
        }
        case "create_goal": {
            const id = action.goal.id; /*String(Math.random());*/
            const newState = {
                order: [...state.order, id],
                objects: {
                    ...state.objects,
                    [id]: action.goal,
                },
            };
            // localStorage.setItem('goals', JSON.stringify(newState));
            return newState;
        }
        case "update": {
            const id = action.goal.id;
            const newObjects = {
                ...state.objects,
                [id]: {
                    ...state.objects[id],
                    ...action.goal,
                } as GoalType,
            };
            const newState = {
                ...state,
                objects: newObjects,
            };
            // localStorage.setItem('goals', JSON.stringify(newState));
            return newState;
        }
        case "delete": {
            const id = action.id;
            const newOrder = state.order.filter((item) => item !== id);
            const newObjects = { ...state.objects };
            delete newObjects[id];
            const newState = {
                order: newOrder,
                objects: newObjects,
            };
            console.log(state);
            // localStorage.setItem('goals', JSON.stringify(newState));
            return newState;
        }
        default:
            return state;
    }
}

// reducer(inicialState, { type: 'add_goal', goals: listaMock });

// console.log(reducer(inicialState, { type: 'add_goal', goals: listaMock }));

interface MemoryProps {
    children: ReactNode;
}

function GoalsMemory({ children }: MemoryProps) {
    const value = useReducer(reducer, initialState);

    return (
        <GoalsContext.Provider value={value}>
            {children}
        </GoalsContext.Provider>
    );
}

export default GoalsMemory;
