const initOptions = {};
const pgp = require('pg-promise')(initOptions);

const connectionString = process.env.DATABASE_URL;

const config = connectionString
    ? {
        connectionString,
        ssl: { rejectUnauthorized: false },
    }
    : {
        host: 'localhost',
        port: 5432,
        database: 'goalsapp',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    };

const db = pgp(config);

module.exports = { db, pgp };

