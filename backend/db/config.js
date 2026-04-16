const initOptions = {};
const pgp = require('pg-promise')(initOptions);

const connectionString = process.env.DATABASE_URL;

const config = connectionString 
    ? {
        connectionString: connectionString,
        // CLAVE: Configuración SSL necesaria para conectar a Render PostgreSQL desde tu servicio Express.
        ssl: {
            rejectUnauthorized: false, 
        },
    } 
    : {
        // 💡 Bloque de configuración local: AÑADIR credenciales.
        host: 'localhost',      // 99% de las veces es 'localhost'
        port: 5432,             // 99% de las veces es 5432
        database: 'goalsapp',   // El nombre de DB que creaste
        // 👇👇 CLAVE: DEBES AÑADIR ESTO 👇👇
        user: process.env.DB_USER,       // O el usuario que usaste para instalar Postgres (a menudo 'postgres')
        password: process.env.DB_PASSWORD, // **Cambia esto** por la contraseña de tu usuario de Postgres.
    };

const db = pgp(config);

module.exports = db;

