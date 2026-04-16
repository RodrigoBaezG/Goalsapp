process.env.JWT_SECRET = 'test-secret-for-jest';

const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../db/config', () => ({
    db: { any: jest.fn(), one: jest.fn(), none: jest.fn() },
    pgp: {
        helpers: { ColumnSet: jest.fn(), insert: jest.fn(), update: jest.fn() },
        as: { format: jest.fn((q) => q), name: jest.fn((n) => `"${n}"`) },
    },
}));

jest.mock('../db/requests', () => ({
    requestAllGoals: jest.fn(),
    request: jest.fn(),
    requestGoalByUser: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    requestAccount: jest.fn(),
}));

const app = require('../app');
const { requestAllGoals, requestGoalByUser, create, update, remove } = require('../db/requests');

const SECRET = 'test-secret-for-jest';
const USER_ID = 42;
const token = jwt.sign({ id: USER_ID }, SECRET, { expiresIn: '1h' });
const authHeader = `Bearer ${token}`;

const mockGoal = {
    id: 1,
    user_id: USER_ID,
    details: 'Read 12 books',
    period_: 'yearly',
    events: 5,
    goal: 12,
    completed: 0,
    icon: '📚',
};

describe('GET /api/goals', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns 401 without token', async () => {
        const res = await request(app).get('/api/goals');
        expect(res.status).toBe(401);
    });

    it('returns goals for authenticated user', async () => {
        requestAllGoals.mockImplementation((table, userId, cb) => cb(null, [mockGoal]));

        const res = await request(app)
            .get('/api/goals')
            .set('Authorization', authHeader);

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(requestAllGoals).toHaveBeenCalledWith('goals', USER_ID, expect.any(Function));
    });
});

describe('GET /api/goals/:id', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns 404 when goal does not belong to user', async () => {
        requestGoalByUser.mockImplementation((id, userId, cb) => cb(null, []));

        const res = await request(app)
            .get('/api/goals/99')
            .set('Authorization', authHeader);

        expect(res.status).toBe(404);
    });

    it('returns goal when it belongs to user', async () => {
        requestGoalByUser.mockImplementation((id, userId, cb) => cb(null, [mockGoal]));

        const res = await request(app)
            .get('/api/goals/1')
            .set('Authorization', authHeader);

        expect(res.status).toBe(200);
        expect(res.body.id).toBe(1);
    });

    it('returns 400 for invalid id', async () => {
        const res = await request(app)
            .get('/api/goals/notanumber')
            .set('Authorization', authHeader);
        expect(res.status).toBe(400);
    });
});

describe('POST /api/goals', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns 400 when details is too short', async () => {
        const res = await request(app)
            .post('/api/goals')
            .set('Authorization', authHeader)
            .send({ details: 'abc', period_: 'weekly' });

        expect(res.status).toBe(400);
    });

    it('returns 400 when period_ is missing', async () => {
        const res = await request(app)
            .post('/api/goals')
            .set('Authorization', authHeader)
            .send({ details: 'Read 12 books' });

        expect(res.status).toBe(400);
    });

    it('creates goal and returns 201', async () => {
        create.mockImplementation((table, data, cb) => cb(null, { ...data, id: 1 }));

        const res = await request(app)
            .post('/api/goals')
            .set('Authorization', authHeader)
            .send({ details: 'Read 12 books', period_: 'yearly', goal: 12, events: 5, icon: '📚' });

        expect(res.status).toBe(201);
        expect(res.body.details).toBe('Read 12 books');
        expect(res.body.user_id).toBe(USER_ID);
    });
});

describe('PUT /api/goals/:id', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns 403 when goal belongs to another user', async () => {
        requestGoalByUser.mockImplementation((id, userId, cb) => cb(null, []));

        const res = await request(app)
            .put('/api/goals/1')
            .set('Authorization', authHeader)
            .send({ id: 1, details: 'Updated goal', period_: 'monthly' });

        expect(res.status).toBe(404);
    });

    it('updates goal and returns 200', async () => {
        requestGoalByUser.mockImplementation((id, userId, cb) => cb(null, [mockGoal]));
        update.mockImplementation((table, id, data, cb) => cb(null, { ...mockGoal, ...data }));

        const res = await request(app)
            .put('/api/goals/1')
            .set('Authorization', authHeader)
            .send({ id: 1, details: 'Updated title', period_: 'monthly' });

        expect(res.status).toBe(200);
    });
});

describe('DELETE /api/goals/:id', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns 404 when goal does not belong to user', async () => {
        requestGoalByUser.mockImplementation((id, userId, cb) => cb(null, []));

        const res = await request(app)
            .delete('/api/goals/99')
            .set('Authorization', authHeader);

        expect(res.status).toBe(404);
    });

    it('returns 204 on successful delete', async () => {
        requestGoalByUser.mockImplementation((id, userId, cb) => cb(null, [mockGoal]));
        remove.mockImplementation((table, id, cb) => cb(null));

        const res = await request(app)
            .delete('/api/goals/1')
            .set('Authorization', authHeader);

        expect(res.status).toBe(204);
    });
});
