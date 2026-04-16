process.env.JWT_SECRET = 'test-secret-for-jest';

const request = require('supertest');
const bcrypt = require('bcrypt');

// Mock db before requiring app
jest.mock('../db/config', () => {
    const mockDb = {
        any: jest.fn(),
        one: jest.fn(),
        none: jest.fn(),
    };
    return { db: mockDb, pgp: { helpers: { ColumnSet: jest.fn(), insert: jest.fn(), update: jest.fn() }, as: { format: jest.fn((q) => q), name: jest.fn((n) => `"${n}"`) } } };
});

jest.mock('../db/requests', () => ({
    requestAccount: jest.fn(),
    create: jest.fn(),
    requestAllGoals: jest.fn(),
    request: jest.fn(),
    requestGoalByUser: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
}));

const app = require('../app');
const { requestAccount, create } = require('../db/requests');

describe('POST /api/signup', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns 400 when email is invalid', async () => {
        const res = await request(app)
            .post('/api/signup')
            .send({ username: 'notanemail', password: 'password123' });
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('errors');
    });

    it('returns 400 when password is too short', async () => {
        const res = await request(app)
            .post('/api/signup')
            .send({ username: 'test@test.com', password: '123' });
        expect(res.status).toBe(400);
    });

    it('returns 201 with token on valid signup', async () => {
        create.mockImplementation((table, data, cb) =>
            cb(null, { id: 1, username: data.username })
        );

        const res = await request(app)
            .post('/api/signup')
            .send({ username: 'new@test.com', password: 'password123' });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('token');
    });

    it('returns 409 when email is already taken', async () => {
        create.mockImplementation((table, data, cb) => {
            const err = new Error('duplicate key');
            err.code = '23505';
            cb(err, null);
        });

        const res = await request(app)
            .post('/api/signup')
            .send({ username: 'dup@test.com', password: 'password123' });

        expect(res.status).toBe(409);
        expect(res.body.error).toMatch(/already in use/i);
    });
});

describe('POST /api/login', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns 400 when email is invalid', async () => {
        const res = await request(app)
            .post('/api/login')
            .send({ username: 'bad', password: 'password123' });
        expect(res.status).toBe(400);
    });

    it('returns 401 when account does not exist', async () => {
        requestAccount.mockImplementation((username, cb) => cb(null, []));

        const res = await request(app)
            .post('/api/login')
            .send({ username: 'none@test.com', password: 'password123' });
        expect(res.status).toBe(401);
    });

    it('returns 401 on wrong password', async () => {
        const hash = await bcrypt.hash('correctpass', 12);
        requestAccount.mockImplementation((username, cb) =>
            cb(null, [{ id: 1, username: 'user@test.com', hash }])
        );

        const res = await request(app)
            .post('/api/login')
            .send({ username: 'user@test.com', password: 'wrongpass' });
        expect(res.status).toBe(401);
    });

    it('returns 200 with token on valid credentials', async () => {
        const hash = await bcrypt.hash('password123', 12);
        requestAccount.mockImplementation((username, cb) =>
            cb(null, [{ id: 1, username: 'user@test.com', hash }])
        );

        const res = await request(app)
            .post('/api/login')
            .send({ username: 'user@test.com', password: 'password123' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
    });
});
