import type { GoalType } from "../types/Goal.ts";
import API_BASE_URL from '../config.js';

export async function RequestGoals(token: string) : Promise<GoalType[]> {
    if (!token) {
        throw new Error("Authentication token is required.");
    }
    const response = await fetch(`${API_BASE_URL}/api/goals`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`, // <-- CLAVE: Envío del JWT
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    });

    if (!response.ok) {
        if (response.status === 401) {
            console.warn("Token inválido o expirado. Redirigiendo al login...");
            localStorage.removeItem("authToken");
            // devolvemos array vacío para evitar errores de map
            return [];
        }
        throw new Error(`Error HTTP ${response.status}`);
    }

    const goals: GoalType[] = await response.json();
    return goals;
}

export async function RequestGoal(id: number): Promise<GoalType> {
    const response = await fetch(`${API_BASE_URL}/api/goals/${id}`);
    const goal: GoalType = await response.json();
    return goal;
}

export async function CreateGoal(goal: GoalType, token: string): Promise<GoalType> {
    if (!token) {
        throw new Error("No authorization token was found"); 
    }
    const response = await fetch(`${API_BASE_URL}/api/goals`, {
        method: "POST",
        body: JSON.stringify(goal),
        headers: {
            // AÑADIR ESTE ENCABEZADO
            'Authorization': `Bearer ${token}`, // <-- CLAVE: Envío del JWT
            "Content-Type": "application/json; charset=UTF-8"
        },
        credentials: 'include'
    });
    if (!response.ok) { 
        // Lanza un error para que pueda ser capturado por el try/catch en Details.jsx
        // Lee el cuerpo de la respuesta para obtener el mensaje de error.
        const errorBody = await response.json();
        // El error en el console.log muestra 'el valor nulo...', usa ese mensaje si existe
        throw new Error(errorBody.message || errorBody.error || "Fallo en la creación del objetivo"); 
    }
    const goalCreated: GoalType = await response.json();
    console.log("Goal created!", goalCreated);
    return goalCreated;
}

export async function UpdateGoal(goal: GoalType, token: string): Promise<GoalType> {
    if (!token) {
        throw new Error("Authorization token is required to update a goal."); 
    }
    const response = await fetch(`${API_BASE_URL}/api/goals/${goal.id}`, {
        method: "PUT", // O PATCH, dependiendo de tu backend
        body: JSON.stringify(goal),
        headers: {
            'Authorization': `Bearer ${token}`, // <-- AÑADIR ESTE ENCABEZADO
            "Content-Type": "application/json; charset=UTF-8"
        },
        credentials: 'include'
    });
    const updatedGoal: GoalType = await response.json();
    console.log("Goal updated", updatedGoal);
    return updatedGoal;
}

export async function DeleteGoal(id: number, token: string): Promise<void> {
    if (!token) {
        throw new Error("Authorization token is required to delete a goal."); 
    }
    const response = await fetch(`${API_BASE_URL}/api/goals/${id}`, {
        method: "DELETE",
        headers: {
            'Authorization': `Bearer ${token}`, // <-- AÑADIR ESTE ENCABEZADO
            "Content-Type": "application/json; charset=UTF-8"
        },
        credentials: 'include'
    });
    console.log("Goal deleted", id);
}
