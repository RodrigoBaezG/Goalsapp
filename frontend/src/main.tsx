import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import GoalsMemory from "./memory/Goals.tsx";
import AuthMemory from "./memory/Auth.jsx";

const rootElement = document.getElementById("root");


// Check if the root element exists before creating the root
if (rootElement) {
    createRoot(rootElement).render(
        <StrictMode>
            <AuthMemory>
            <GoalsMemory>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </GoalsMemory>
            </AuthMemory>
        </StrictMode>,
    );
} else {
    // You can optionally add an error message or log a warning here
    console.error("Failed to find the root element with ID 'root'.");
}