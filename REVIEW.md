# GoalsApp — Revisión Integral

**Fecha:** 2026-04-16  
**Stack:** React 19 + Vite + TypeScript (frontend) / Express 4 + PostgreSQL + pg-promise (backend)

---

## Índice

1. [Estructura del Proyecto](#1-estructura-del-proyecto)
2. [Seguridad](#2-seguridad)
3. [Bugs y Errores Potenciales](#3-bugs-y-errores-potenciales)
4. [Calidad de Código](#4-calidad-de-código)
5. [UI y Estética](#5-ui-y-estética)
6. [Tests — Estado Actual y Plan Propuesto](#6-tests--estado-actual-y-plan-propuesto)

---

## 1. Estructura del Proyecto

### Fortalezas
- Separación clara `frontend/` / `backend/`
- Contextos separados para Auth y Goals
- Servicios centralizados para las llamadas a la API

### Problemas y Mejoras

#### 1.1 Mezcla de `.jsx` y `.tsx`
Varios componentes que deberían ser TypeScript siguen siendo `.jsx`, perdiendo el beneficio del tipado estático. Migrar progresivamente:

```
# Archivos que deben ser .tsx
components/private/list/List.jsx
components/private/new/Details.jsx
components/public/access/Access.jsx
components/public/register/Register.jsx
components/shared/Layout.jsx
components/shared/Header.jsx
components/shared/Aside.jsx
components/shared/Modal.jsx
memory/Auth.jsx
```

#### 1.2 Estructura de Carpetas del Backend
El backend carece de una separación por capas. La lógica de negocio está mezclada con las rutas:

```
# Estructura actual
routes/accounts.js    ← lógica de negocio embebida
routes/goals.js       ← lógica de negocio embebida
db/requests.js        ← queries SQL sueltas

# Estructura recomendada
routes/
  accounts.js         ← solo routing + validación
  goals.js
controllers/
  accountsController.js  ← lógica de negocio
  goalsController.js
services/
  accountsService.js     ← acceso a datos
  goalsService.js
```

#### 1.3 ESLint Desactivado
El archivo `eslint.config.js` tiene la configuración comentada. Reactivarlo previene errores en CI/CD y mantiene consistencia de código.

#### 1.4 Backend Sin TypeScript
El backend es JavaScript puro. Migrar a TypeScript o agregar JSDoc typings mejoraría la mantenibilidad y detectaría errores de tipo en las queries SQL.

#### 1.5 Variables de Entorno Sin Validación
El backend arranca aunque falten variables críticas como `JWT_SECRET` o `DATABASE_URL`, fallando silenciosamente en runtime. Agregar validación en el arranque:

```javascript
// backend/config/env.js
const required = ['JWT_SECRET', 'DATABASE_URL'];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required env var: ${key}`);
}
```

---

## 2. Seguridad

### 2.1 CRÍTICO — SQL Injection en `db/requests.js`

Todas las queries usan interpolación de template literals con datos del usuario. Esto permite inyección SQL directa:

```javascript
// INSEGURO — código actual
db.any(`SELECT * FROM ${table} WHERE id = ${id}`)
db.any(`SELECT * FROM accounts WHERE username = '${username}'`)
db.none(`DELETE FROM ${table} WHERE id = ${id}`)
```

pg-promise soporta queries parametrizadas. Reemplazar así:

```javascript
// SEGURO
db.any('SELECT * FROM goals WHERE id = $1', [id])
db.any('SELECT * FROM accounts WHERE username = $1', [username])
db.none('DELETE FROM goals WHERE id = $1', [id])

// Para nombres de tabla (deben ser literales, nunca datos de usuario)
db.any('SELECT * FROM $1:name WHERE user_id = $2', [table, userId])
```

> **Impacto:** Un usuario malintencionado puede leer, modificar o eliminar datos de cualquier cuenta.

### 2.2 CRÍTICO — JWT Secret Hardcodeado

```javascript
// app.js y accounts.js — INSEGURO
jwt({ secret: "secret", algorithms: ["HS256"] })
sign({ id: account.id }, "secret", { expiresIn: "1h" })
```

Cualquier persona con el código puede firmar tokens válidos arbitrarios.

```javascript
// Correcto
jwt({ secret: process.env.JWT_SECRET, algorithms: ["HS256"] })
sign({ id: account.id }, process.env.JWT_SECRET, { expiresIn: "1h" })
```

Agregar `JWT_SECRET` a `.env` con un valor aleatorio de al menos 256 bits:
```
JWT_SECRET=<openssl rand -base64 32>
```

### 2.3 ALTO — Sin Rate Limiting en Endpoints de Auth

Los endpoints `/api/signup` y `/api/login` no tienen límite de peticiones. Esto permite ataques de fuerza bruta sobre contraseñas.

```javascript
// Instalar: npm install express-rate-limit
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  message: { error: 'Too many attempts, try again later' }
});

router.post('/api/login', authLimiter, ...);
router.post('/api/signup', authLimiter, ...);
```

### 2.4 ALTO — Contraseñas Débiles Permitidas

Validación actual: mínimo 5 caracteres. El demo usa `12345`.

```javascript
// Cambiar en accounts.js (backend)
body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  .matches(/[A-Z]/).withMessage('Must contain at least one uppercase letter')
  .matches(/[0-9]/).withMessage('Must contain at least one number')
```

### 2.5 ALTO — Credenciales Demo Expuestas en la UI

`Credentials.tsx` muestra `example@gmail.com / 12345` como texto visible. Si estas credenciales existen en producción, cualquiera puede acceder a esos datos.

```tsx
// Eliminar completamente este bloque o usar solo en entorno dev
{import.meta.env.DEV && (
  <p className="text-xs text-gray-400">Demo: example@gmail.com / 12345</p>
)}
```

### 2.6 ALTO — Sin Autorización en `GET /api/goals/:id` y `DELETE /api/goals/:id`

El endpoint `GET /api/goals/:id` no verifica que el goal pertenece al usuario autenticado. Un usuario puede leer goals de otros con solo conocer el ID.

```javascript
// Inseguro — actual
const goal = await db.one('SELECT * FROM goals WHERE id = $1', [id]);

// Seguro
const goal = await db.one(
  'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
  [id, req.auth.id]
);
if (!goal) return res.status(404).json({ error: 'Not found' });
```

Lo mismo aplica a `PUT` y `DELETE`.

### 2.7 MEDIO — Mensajes de Error Verbose

```javascript
// Actual — expone detalles internos al cliente
res.status(500).json({ error: 'Server Error', message: err.message, details: res.locals.error });

// Mejor
res.status(500).json({ error: 'Internal server error' });
// Loggear err internamente (Winston/Pino)
```

### 2.8 MEDIO — Sin Refresh Tokens

Los tokens de acceso expiran en 15-60 min y no existe mecanismo de renovación. El usuario es desconectado sin aviso.

Implementar refresh tokens (almacenados en cookie httpOnly) o usar una librería como `passport-jwt` con manejo de expiración.

### 2.9 MEDIO — Tokens Almacenados en localStorage

```javascript
// Auth.jsx — VULNERABLE a XSS
localStorage.setItem('token', JSON.stringify(token))
```

Si hay XSS, cualquier script puede robar el token. La alternativa más segura es almacenar el token de acceso en memoria (`useState`) y usar cookies `httpOnly` para el refresh token.

---

## 3. Bugs y Errores Potenciales

### 3.1 `navigate` Usado Antes de Ser Declarado — `Details.jsx`

```jsx
// Bug: navigate() se llama dentro de useEffect que puede ejecutarse
// antes de que la función esté en scope
useEffect(() => {
  if (!id) return navigate("/404");  // navigate puede no estar declarado aún
}, []);

const navigate = useNavigate(); // declarado después
```

**Fix:** Mover `const navigate = useNavigate()` al inicio del componente, antes de cualquier hook.

### 3.2 Botón "Completed" Sin Handler

En `Goal.tsx` el botón "Completed" renderiza pero no tiene `onClick`:

```tsx
// Sin acción
<button className={styles.button}>Completed</button>
```

El estado `completed` en la base de datos nunca se actualiza. Implementar el handler:

```tsx
const handleComplete = async () => {
  const updated = await UpdateGoal({ ...goal, completed: goal.completed + 1 }, token);
  dispatch({ type: 'update', payload: updated });
};

<button onClick={handleComplete}>Completed</button>
```

### 3.3 Sin Manejo de Errores en `Register.jsx`

```jsx
// Sin try/catch — falla silenciosamente
const response = await signup(credentials);
dispatch({ type: 'add', payload: response });
```

El usuario no recibe feedback si el registro falla (email duplicado, red caída, etc.).

### 3.4 Mismatch de Tipos de ID

El backend devuelve IDs como `number` (INTEGER de PostgreSQL), pero `GoalType` los tipifica como `string | number`. El parámetro de URL (`:id`) es siempre `string`. Esto puede causar fallos en comparaciones `===`.

```typescript
// Consistencia: usar number en el contexto, parsear el param de URL
const id = parseInt(params.id, 10);
```

### 3.5 Sin Estado de Carga (Loading)

`List.jsx` hace fetch de goals pero no muestra ningún spinner o skeleton. La pantalla aparece en blanco durante la carga.

```jsx
const [loading, setLoading] = useState(true);
// ...
if (loading) return <GoalsSkeleton />;
```

### 3.6 Sin Estado Vacío

Si el usuario no tiene goals, la lista muestra nada. Falta un estado vacío que invite a crear el primer goal.

### 3.7 Modal Sin Cierre al Hacer Click Fuera

`Modal.jsx` no implementa el patrón de cierre al hacer click en el overlay. El usuario queda atrapado si accidentalmente abre un modal sin saber que hay botón "Cancel".

```jsx
// En Modal.jsx
<div
  className={styles.overlay}
  onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
>
```

### 3.8 Middleware de Logger Duplicado

```javascript
// app.js — duplicado
app.use(logger('dev'));
// ...más código...
app.use(logger('dev')); // línea duplicada
```

---

## 4. Calidad de Código

### 4.1 Queries SQL en Capa de Rutas

La lógica de acceso a datos está en `requests.js` pero es llamada directamente desde las rutas sin una capa de servicios intermedia. Esto acopla routing con persistencia.

### 4.2 Context Tipado Incompleto

```tsx
// Goals.tsx — tipos incompletos
const GoalsContext = createContext({});
const GoalsDispatchContext = createContext({});
```

Sin tipos, el autocompletado y el type-checking no funcionan. Tipar completamente:

```tsx
interface GoalsState { order: number[]; objects: Record<number, GoalType>; }
type GoalsAction = | { type: 'add_goal'; payload: GoalType[] } | { type: 'update'; payload: GoalType } | { type: 'delete'; payload: number };

const GoalsContext = createContext<GoalsState>({ order: [], objects: {} });
const GoalsDispatchContext = createContext<Dispatch<GoalsAction>>(() => {});
```

### 4.3 Código Comentado

Hay múltiples bloques de código comentado en `app.js`, `Details.jsx` y otros archivos. Deben eliminarse; el historial de git guarda el contexto.

### 4.4 Sin Paginación

`GET /api/goals` devuelve todos los goals de un usuario sin límite. Si un usuario tiene cientos de goals, esto degrada el rendimiento.

```javascript
// Agregar soporte de paginación
router.get('/api/goals', async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  const goals = await db.any(
    'SELECT * FROM goals WHERE user_id = $1 LIMIT $2 OFFSET $3',
    [req.auth.id, limit, offset]
  );
  res.json(goals);
});
```

### 4.5 Sin Shutdown Graceful del Servidor

El proceso de Node termina abruptamente sin cerrar las conexiones a la base de datos:

```javascript
// bin/www — agregar
process.on('SIGTERM', async () => {
  server.close(() => {
    db.$pool.end();
    process.exit(0);
  });
});
```

---

## 5. UI y Estética

El diseño actual usa neumorphism que puede dificultar la accesibilidad (bajo contraste). La propuesta es mantener la limpieza pero mejorar la legibilidad y la experiencia de usuario.

### 5.1 Paleta de Colores

Definir variables CSS consistentes en lugar de depender solo de Tailwind clases inline:

```css
/* index.css */
:root {
  --color-bg: #f0f4f8;
  --color-surface: #ffffff;
  --color-primary: #3b82f6;       /* blue-500 */
  --color-primary-hover: #2563eb; /* blue-600 */
  --color-danger: #ef4444;
  --color-text: #1e293b;
  --color-text-muted: #64748b;
  --color-border: #e2e8f0;
  --radius: 12px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.10);
}
```

### 5.2 Tipografía

Usar una fuente moderna. Agregar en `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

```css
body { font-family: 'Inter', system-ui, sans-serif; }
```

### 5.3 Cards

Reemplazar neumorphism por sombras planas más modernas y mayor contraste:

```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s ease;
}

.card:hover {
  box-shadow: var(--shadow-md);
}
```

### 5.4 Barra de Progreso

La barra de progreso del goal debería tener animación al cargar:

```css
.progress-bar {
  height: 8px;
  border-radius: 4px;
  background: #e2e8f0;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, #3b82f6, #6366f1);
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 5.5 Botones

Unificar y modernizar:

```css
.button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.15s ease;
  cursor: pointer;
  border: none;
}

.button--primary { background: var(--color-primary); color: white; }
.button--primary:hover { background: var(--color-primary-hover); }
.button--ghost { background: transparent; border: 1px solid var(--color-border); color: var(--color-text); }
.button--danger { background: #fef2f2; color: var(--color-danger); border: 1px solid #fecaca; }
```

### 5.6 Formularios

Mostrar errores de validación inline junto a cada campo, no solo deshabilitar el submit:

```tsx
{errors.details && (
  <p className="text-red-500 text-xs mt-1">{errors.details}</p>
)}
```

### 5.7 Feedback Visual

- **Toast notifications** para operaciones exitosas/fallidas (librería recomendada: `sonner` — ligera, moderna)
- **Loading skeletons** en la lista de goals mientras carga
- **Estado vacío** con ilustración y CTA cuando no hay goals
- **Confirmación modal** antes de eliminar un goal

### 5.8 Layout Responsive

- El sidebar (`Aside`) se oculta en móvil pero no hay menú hamburguesa alternativo
- Implementar un bottom navigation bar en móvil (patrón moderno para apps)

```tsx
// components/shared/BottomNav.tsx — solo visible en móvil
<nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t flex justify-around p-2">
  <NavItem to="/list" icon={<ListIcon />} label="Goals" />
  <NavItem to="/create" icon={<PlusIcon />} label="New" />
</nav>
```

### 5.9 Icono del Goal

El campo `icon` acepta cualquier texto. Limitar a un selector de emojis predefinidos o usar una librería de iconos como Lucide React para coherencia visual.

### 5.10 Accesibilidad (a11y)

- Todos los botones de icono deben tener `aria-label`
- El modal debe gestionar el focus trap y `aria-modal="true"`
- Los inputs deben estar asociados con `<label>` mediante `htmlFor`
- Verificar contraste de colores (WCAG AA mínimo 4.5:1 para texto normal)

---

## 6. Tests — Estado Actual y Plan Propuesto

### Estado Actual

Solo existe `goal.test.tsx` con 2 tests básicos de renderizado. No hay tests de:
- Lógica de contexto/reducers
- Servicios (llamadas a API)
- Formularios y validaciones
- Rutas protegidas
- API del backend

---

### 6.1 Tests Unitarios — Frontend

#### Setup recomendado

```bash
# Ya instalado en package.json, solo verificar:
npm install --save-dev @testing-library/react @testing-library/user-event @testing-library/jest-dom jest-fetch-mock
```

#### Tests de Reducers

**`src/memory/__tests__/goalsReducer.test.ts`**

```typescript
import { goalsReducer } from '../Goals';

const mockGoal = {
  id: 1, icon: '📚', details: 'Read 12 books', period_: 'yearly',
  events: 5, goal: 12, completed: 0
};

describe('goalsReducer', () => {
  it('add_goal stores goals by id', () => {
    const state = goalsReducer({ order: [], objects: {} }, {
      type: 'add_goal',
      payload: [mockGoal]
    });
    expect(state.order).toEqual([1]);
    expect(state.objects[1]).toEqual(mockGoal);
  });

  it('update replaces goal in objects', () => {
    const initial = { order: [1], objects: { 1: mockGoal } };
    const updated = { ...mockGoal, events: 6 };
    const state = goalsReducer(initial, { type: 'update', payload: updated });
    expect(state.objects[1].events).toBe(6);
  });

  it('delete removes goal from order and objects', () => {
    const initial = { order: [1], objects: { 1: mockGoal } };
    const state = goalsReducer(initial, { type: 'delete', payload: 1 });
    expect(state.order).toEqual([]);
    expect(state.objects[1]).toBeUndefined();
  });
});
```

#### Tests de Servicios (con mock de fetch)

**`src/services/__tests__/Auth.test.ts`**

```typescript
import { signup, login } from '../Auth';

global.fetch = jest.fn();

describe('Auth service', () => {
  beforeEach(() => jest.clearAllMocks());

  it('signup sends POST and returns token', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'abc123' })
    });

    const result = await signup({ username: 'test@test.com', password: 'password123' });
    expect(result).toEqual({ token: 'abc123' });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/signup'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('login throws on 401', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Invalid credentials' })
    });

    await expect(login({ username: 'x@x.com', password: 'wrong' })).rejects.toThrow();
  });
});
```

#### Tests de Componentes

**`src/components/shared/__tests__/Authenticate.test.tsx`**

```tsx
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Authenticate from '../Authenticate';
import { AuthContext } from '../../../memory/Auth';

const renderWithAuth = (authenticated: boolean) =>
  render(
    <AuthContext.Provider value={{ authenticate: authenticated, token: null }}>
      <MemoryRouter>
        <Authenticate>
          <div>Protected Content</div>
        </Authenticate>
      </MemoryRouter>
    </AuthContext.Provider>
  );

it('renders children when authenticated', () => {
  const { getByText } = renderWithAuth(true);
  expect(getByText('Protected Content')).toBeInTheDocument();
});

it('redirects to /access when not authenticated', () => {
  const { queryByText } = renderWithAuth(false);
  expect(queryByText('Protected Content')).not.toBeInTheDocument();
});
```

**`src/components/private/list/__tests__/Goal.test.tsx`** (mejorado)

```tsx
import { render, fireEvent } from '@testing-library/react';
import Goal from '../Goal';

const mockDispatch = jest.fn();
jest.mock('../../../../memory/Goals', () => ({
  useGoalsDispatch: () => mockDispatch
}));

const mockGoal = {
  id: 1, icon: '📚', details: 'Read 12 books',
  period_: 'yearly', events: 5, goal: 12, completed: 0
};

describe('Goal component', () => {
  it('renders icon and details', () => {
    const { getByText } = render(<Goal goal={mockGoal} token="tok" />);
    expect(getByText('📚')).toBeInTheDocument();
    expect(getByText('Read 12 books')).toBeInTheDocument();
  });

  it('shows correct progress percentage', () => {
    const { getByRole } = render(<Goal goal={mockGoal} token="tok" />);
    const bar = getByRole('progressbar');
    // 5/12 ≈ 41%
    expect(bar).toHaveStyle('width: 41%');
  });

  it('completed button calls UpdateGoal', async () => {
    const { getByText } = render(<Goal goal={mockGoal} token="tok" />);
    fireEvent.click(getByText('Completed'));
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'update' })
    );
  });
});
```

**`src/components/private/new/__tests__/Details.test.tsx`**

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Details from '../Details';

describe('Details form', () => {
  it('disables submit when details is too short', () => {
    render(<MemoryRouter><Details /></MemoryRouter>);
    const input = screen.getByLabelText(/details/i);
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(screen.getByText(/save/i)).toBeDisabled();
  });

  it('enables submit when form is valid', () => {
    render(<MemoryRouter><Details /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/details/i), {
      target: { value: 'Read more books' }
    });
    fireEvent.change(screen.getByLabelText(/period/i), {
      target: { value: 'monthly' }
    });
    expect(screen.getByText(/save/i)).not.toBeDisabled();
  });
});
```

---

### 6.2 Tests Unitarios — Backend

#### Setup

```bash
cd backend
npm install --save-dev jest supertest @types/jest @types/supertest
```

**`backend/package.json`** — agregar:
```json
{
  "scripts": {
    "test": "jest --testEnvironment node"
  },
  "jest": {
    "testMatch": ["**/__tests__/**/*.test.js"]
  }
}
```

#### Tests de Rutas de Auth

**`backend/routes/__tests__/accounts.test.js`**

```javascript
const request = require('supertest');
const app = require('../../app');

// Mock de la base de datos
jest.mock('../../db/config', () => ({
  one: jest.fn(),
  none: jest.fn(),
  any: jest.fn()
}));
const db = require('../../db/config');

describe('POST /api/signup', () => {
  it('returns 400 when email is invalid', async () => {
    const res = await request(app)
      .post('/api/signup')
      .send({ username: 'notanemail', password: 'password123' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when password is too short', async () => {
    const res = await request(app)
      .post('/api/signup')
      .send({ username: 'test@test.com', password: '123' });
    expect(res.status).toBe(400);
  });

  it('returns token on successful signup', async () => {
    db.one.mockResolvedValue({ id: 1, username: 'test@test.com' });
    const res = await request(app)
      .post('/api/signup')
      .send({ username: 'test@test.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});

describe('POST /api/login', () => {
  it('returns 401 on wrong password', async () => {
    const bcrypt = require('bcrypt');
    db.one.mockResolvedValue({
      id: 1,
      hash: await bcrypt.hash('correctpassword', 12)
    });
    const res = await request(app)
      .post('/api/login')
      .send({ username: 'test@test.com', password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });
});
```

#### Tests de Rutas de Goals

**`backend/routes/__tests__/goals.test.js`**

```javascript
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');

jest.mock('../../db/config');
const db = require('../../db/config');

const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h' });
const authHeader = { Authorization: `Bearer ${token}` };

describe('GET /api/goals', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/goals');
    expect(res.status).toBe(401);
  });

  it('returns goals for authenticated user', async () => {
    db.any.mockResolvedValue([{ id: 1, details: 'Test goal', user_id: 1 }]);
    const res = await request(app).get('/api/goals').set(authHeader);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe('POST /api/goals', () => {
  it('returns 400 when details is too short', async () => {
    const res = await request(app)
      .post('/api/goals')
      .set(authHeader)
      .send({ details: 'abc', period_: 'monthly' });
    expect(res.status).toBe(400);
  });

  it('returns created goal', async () => {
    const goal = { id: 1, details: 'Read 12 books', period_: 'yearly', user_id: 1 };
    db.one.mockResolvedValue(goal);
    const res = await request(app)
      .post('/api/goals')
      .set(authHeader)
      .send({ details: 'Read 12 books', period_: 'yearly', goal: 12, events: 0, icon: '📚' });
    expect(res.status).toBe(201);
    expect(res.body.details).toBe('Read 12 books');
  });
});

describe('DELETE /api/goals/:id', () => {
  it('returns 403 when goal belongs to another user', async () => {
    db.one.mockResolvedValue({ id: 5, user_id: 999 }); // distinto user_id
    const res = await request(app)
      .delete('/api/goals/5')
      .set(authHeader);
    expect(res.status).toBe(403);
  });

  it('returns 204 on successful delete', async () => {
    db.one.mockResolvedValue({ id: 5, user_id: 1 }); // mismo user_id del token
    db.none.mockResolvedValue();
    const res = await request(app)
      .delete('/api/goals/5')
      .set(authHeader);
    expect(res.status).toBe(204);
  });
});
```

---

### 6.3 Tests E2E con Playwright

#### Setup

```bash
cd frontend
npm install --save-dev @playwright/test
npx playwright install chromium
```

**`frontend/playwright.config.ts`**

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

#### Test E2E — Autenticación

**`frontend/e2e/auth.spec.ts`**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('redirects unauthenticated users to /access', async ({ page }) => {
    await page.goto('/list');
    await expect(page).toHaveURL('/access');
  });

  test('shows validation error for invalid email', async ({ page }) => {
    await page.goto('/access');
    await page.fill('[name="username"]', 'notanemail');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page.locator('[role="alert"]')).toBeVisible();
  });

  test('logs in with valid credentials', async ({ page }) => {
    await page.goto('/access');
    await page.fill('[name="username"]', 'example@gmail.com');
    await page.fill('[name="password"]', '12345');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/list');
  });

  test('logs out and redirects to /access', async ({ page }) => {
    // login first
    await page.goto('/access');
    await page.fill('[name="username"]', 'example@gmail.com');
    await page.fill('[name="password"]', '12345');
    await page.click('button[type="submit"]');

    // logout
    await page.click('[aria-label="Logout"]');
    await expect(page).toHaveURL('/access');
  });
});
```

#### Test E2E — Goals CRUD

**`frontend/e2e/goals.spec.ts`**

```typescript
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Login before each test
  await page.goto('/access');
  await page.fill('[name="username"]', 'example@gmail.com');
  await page.fill('[name="password"]', '12345');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/list');
});

test.describe('Goals', () => {
  test('shows empty state when no goals', async ({ page }) => {
    await expect(page.getByText(/no goals yet/i)).toBeVisible();
  });

  test('creates a new goal', async ({ page }) => {
    await page.click('[aria-label="Create goal"]');
    await expect(page).toHaveURL('/create');

    await page.fill('[name="details"]', 'Read 12 books this year');
    await page.selectOption('[name="period_"]', 'yearly');
    await page.fill('[name="goal"]', '12');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/list');
    await expect(page.getByText('Read 12 books this year')).toBeVisible();
  });

  test('opens goal detail on click', async ({ page }) => {
    await page.click('text=Read 12 books this year');
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.getByText('Read 12 books this year')).toBeVisible();
  });

  test('deletes a goal', async ({ page }) => {
    await page.click('text=Read 12 books this year');
    await page.click('button:has-text("Delete")');

    // Confirm deletion if there's a confirmation dialog
    await page.click('button:has-text("Confirm")');

    await expect(page.getByText('Read 12 books this year')).not.toBeVisible();
  });

  test('marks goal as completed increments counter', async ({ page }) => {
    const goal = page.locator('[data-testid="goal-card"]').first();
    const completedBefore = await goal.locator('[data-testid="completed-count"]').textContent();

    await goal.locator('button:has-text("Completed")').click();

    const completedAfter = await goal.locator('[data-testid="completed-count"]').textContent();
    expect(Number(completedAfter)).toBe(Number(completedBefore) + 1);
  });
});
```

#### Test E2E — Registro

**`frontend/e2e/register.spec.ts`**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Registration', () => {
  test('shows error for duplicate email', async ({ page }) => {
    await page.goto('/register');
    await page.fill('[name="username"]', 'example@gmail.com'); // ya existe
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page.locator('[role="alert"]')).toContainText(/already exists|taken/i);
  });

  test('registers successfully and redirects to list', async ({ page }) => {
    const unique = `test_${Date.now()}@test.com`;
    await page.goto('/register');
    await page.fill('[name="username"]', unique);
    await page.fill('[name="password"]', 'StrongPass123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/list');
  });
});
```

---

### 6.4 Scripts de Test Recomendados

**`frontend/package.json`**

```json
{
  "scripts": {
    "test": "jest --watchAll=false",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

**`backend/package.json`**

```json
{
  "scripts": {
    "test": "jest --forceExit",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## Resumen de Prioridades

| Prioridad | Ítem | Área |
|-----------|------|------|
| CRÍTICO | SQL Injection en `db/requests.js` | Seguridad |
| CRÍTICO | JWT Secret hardcodeado `"secret"` | Seguridad |
| ALTO | Sin autorización por `user_id` en goals | Seguridad |
| ALTO | Rate limiting en `/api/login` y `/api/signup` | Seguridad |
| ALTO | Credenciales demo visibles en producción | Seguridad |
| ALTO | Botón "Completed" sin handler | Bug |
| ALTO | `navigate` usado antes de declararse | Bug |
| MEDIO | Sin manejo de errores en Register.jsx | Bug |
| MEDIO | Sin estado de carga ni estado vacío | UI |
| MEDIO | Sin confirmación al borrar goal | UX |
| BAJO | Tipado incompleto en Contexts | Calidad |
| BAJO | Código comentado pendiente de eliminar | Calidad |
| BAJO | Sin paginación en `/api/goals` | Performance |
| BAJO | ESLint desactivado | Calidad |
