var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { expressjwt: jwt } = require('express-jwt');
const PORT = process.env.PORT || 3000;
const cors = require('cors');

var indexRouter = require('./routes/index');
var goalsRouter = require('./routes/goals');
var accountsRouter = require('./routes/accounts');


var app = express();

const db = require('./db/config'); // Tu conexión a pg-promise

async function setupDatabase() {
  console.log('Verificando esquema de base de datos...');
  try {
    const createTableSQL = `
            CREATE TABLE IF NOT EXISTS accounts (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                hash VARCHAR(255) NOT NULL
            );
        `;

    const createGoalsTableSQL = `
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
            );
        `;
    // Ejecuta el comando SQL. db.none() es ideal para comandos que no devuelven datos.
    // Asumo que tu objeto 'db' es tu instancia de pg-promise.
    await db.none(createTableSQL);
    console.log('Tabla "accounts" verificada y lista.');

    await db.none(createGoalsTableSQL);
    console.log('Tabla "goals" verificada y lista.');

  } catch (error) {
    // Si hay algún problema (ej. error de sintaxis SQL o de conexión), se reporta aquí.
    console.error('ERROR CRÍTICO: No se pudo configurar la base de datos:', error);
  }
}

// Llama a esta función para que se ejecute cuando el servidor se inicie.
setupDatabase();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';

// CLAVE DE DEBUG: Agrega esta línea
console.log(`CORS ORIGIN CONFIGURADO A: ${frontendURL}`);

const allowedOrigins = [
  frontendURL, // Ejemplo: https://tudominio.com
  // ⚠️ AÑADE AQUÍ LA URL POR DEFECTO DE NETLIFY:
  // (Ejemplo: https://nombre-de-tu-app.netlify.app)
  'https://rodrigogoals-app.netlify.app',

  // Puedes añadir http://localhost:5173 si lo necesitas para testing en móvil.
];

const corsOptions = {
  origin: (origin, callback) => {
    // Si la solicitud no tiene origen (ej: curl, o algunas peticiones internas)
    if (!origin) return callback(null, true);

    // Si el origen está en nuestra lista, se permite.
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // De lo contrario, se bloquea por CORS.
      // console.log(`CORS Blocked: ${origin}`); 
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  }, // ¡Usando la variable!
  optionsSuccessStatus: 200,
  credentials: true, // Si usas cookies o sesiones
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(logger('dev'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  jwt({
    secret: "secret",
    algorithms: ["HS256"],
  }).unless((req) => { // 💡 CLAVE: Usamos una función para la exclusión

    // 1. Excluir todas las peticiones OPTIONS (CORS preflight)
    if (req.method === 'OPTIONS') {
      return true;
    }

    // 2. Excluir los caminos públicos para POST (login/signup)
    const unprotectedPaths = ["/api/signup", "/api/login"];
    return unprotectedPaths.includes(req.path);
  })
);

app.use('/', indexRouter);
app.use('/api/goals', goalsRouter);
app.use('/api', accountsRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.log(err);
  res.json({ error: 'Server Error', message: err.message, details: res.locals.error });
});

module.exports = app;
