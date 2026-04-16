// CLAVE: Esta será la URL pública que Render te dará.
// Úsala como fallback para desarrollo local.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default API_BASE_URL;