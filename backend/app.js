var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { expressjwt: jwt } = require('express-jwt');
const cors = require('cors');

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
    console.error('FATAL: JWT_SECRET env var is required in production');
    process.exit(1);
}

var indexRouter = require('./routes/index');
var goalsRouter = require('./routes/goals');
var accountsRouter = require('./routes/accounts');

var app = express();

const { db } = require('./db/config');

async function setupDatabase() {
    try {
        await db.none(`
            CREATE TABLE IF NOT EXISTS accounts (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                hash VARCHAR(255) NOT NULL
            )
        `);
        await db.none(`
            CREATE TABLE IF NOT EXISTS goals (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
                details VARCHAR(255) NOT NULL,
                icon TEXT,
                events INTEGER,
                goal INTEGER,
                period_ VARCHAR(50),
                deadline DATE,
                completed INTEGER DEFAULT 0,
                is_completed BOOLEAN DEFAULT FALSE
            )
        `);
        console.log('Database schema ready.');
    } catch (error) {
        console.error('Database setup failed:', error.message);
    }
}

setupDatabase();

const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
const allowedOrigins = [frontendURL, 'https://rodrigogoals-app.netlify.app'];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`Not allowed by CORS: ${origin}`));
        }
    },
    optionsSuccessStatus: 200,
    credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
    jwt({
        secret: JWT_SECRET || 'dev-secret-change-me',
        algorithms: ['HS256'],
    }).unless((req) => {
        if (req.method === 'OPTIONS') return true;
        return ['/api/signup', '/api/login'].includes(req.path);
    })
);

app.use('/', indexRouter);
app.use('/api/goals', goalsRouter);
app.use('/api', accountsRouter);

app.use(function (req, res, next) {
    next(createError(404));
});

app.use(function (err, req, res, next) {
    const status = err.status || 500;
    const isDev = req.app.get('env') === 'development';
    res.status(status).json({
        error: status === 404 ? 'Not found' : 'Internal server error',
        ...(isDev && { message: err.message }),
    });
});

if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
