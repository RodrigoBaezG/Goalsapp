import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";


// https://vite.dev/config/
export default defineConfig({
    plugins: [tailwindcss(), react()],
    server: {
        proxy: {
            // Si la URL de React empieza con '/api', redirige al backend
            '/api': {
                // La URL de tu backend
                target: 'http://localhost:3000',

                // Necesario para que el host header sea el del backend
                changeOrigin: true,
            }
        }
    }
});
