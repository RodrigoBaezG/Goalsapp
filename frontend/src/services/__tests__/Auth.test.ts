/**
 * @jest-environment jsdom
 */

import { signup, login } from '../Auth';

const mockFetch = jest.fn();
global.fetch = mockFetch;

function mockResponse(status: number, body: object) {
    return Promise.resolve({
        ok: status >= 200 && status < 300,
        status,
        json: async () => body,
    } as Response);
}

describe('Auth service', () => {
    beforeEach(() => mockFetch.mockClear());

    describe('signup', () => {
        it('sends POST to /api/signup with credentials', async () => {
            mockFetch.mockReturnValueOnce(mockResponse(200, { token: 'abc' }));
            await signup({ username: 'user@test.com', password: 'password123' });

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/signup'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ username: 'user@test.com', password: 'password123' }),
                })
            );
        });

        it('returns the token on success', async () => {
            mockFetch.mockReturnValueOnce(mockResponse(200, { token: 'my-token' }));
            const result = await signup({ username: 'user@test.com', password: 'password123' });
            expect(result).toEqual({ token: 'my-token' });
        });

        it('throws when response is not ok', async () => {
            mockFetch.mockReturnValueOnce(mockResponse(409, { error: 'Email already in use' }));
            await expect(signup({ username: 'dup@test.com', password: 'password123' })).rejects.toThrow();
        });
    });

    describe('login', () => {
        it('sends POST to /api/login with credentials', async () => {
            mockFetch.mockReturnValueOnce(mockResponse(200, { token: 'tok' }));
            await login({ username: 'user@test.com', password: 'password123' });

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/login'),
                expect.objectContaining({ method: 'POST' })
            );
        });

        it('returns the token on success', async () => {
            mockFetch.mockReturnValueOnce(mockResponse(200, { token: 'login-token' }));
            const result = await login({ username: 'user@test.com', password: 'password123' });
            expect(result).toEqual({ token: 'login-token' });
        });

        it('throws on 401', async () => {
            mockFetch.mockReturnValueOnce(mockResponse(401, { error: 'Invalid credentials' }));
            await expect(login({ username: 'bad@test.com', password: 'wrong' })).rejects.toThrow();
        });
    });
});
