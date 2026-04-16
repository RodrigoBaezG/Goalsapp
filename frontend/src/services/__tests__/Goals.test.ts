/**
 * @jest-environment jsdom
 */

import { RequestGoals, CreateGoal, UpdateGoal, DeleteGoal } from '../Goals';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const TOKEN = 'test-token';
const mockGoal = {
    id: 1,
    icon: '📚',
    details: 'Read 12 books',
    period_: 'yearly',
    events: 5,
    goal: 12,
    completed: 0,
};

function mockResponse(status: number, body?: object) {
    return Promise.resolve({
        ok: status >= 200 && status < 300,
        status,
        json: async () => body ?? {},
    } as Response);
}

describe('Goals service', () => {
    beforeEach(() => mockFetch.mockClear());

    describe('RequestGoals', () => {
        it('sends GET /api/goals with auth header', async () => {
            mockFetch.mockReturnValueOnce(mockResponse(200, [mockGoal]));
            await RequestGoals(TOKEN);
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/goals'),
                expect.objectContaining({
                    method: 'GET',
                    headers: expect.objectContaining({ Authorization: `Bearer ${TOKEN}` }),
                })
            );
        });

        it('returns array of goals', async () => {
            mockFetch.mockReturnValueOnce(mockResponse(200, [mockGoal]));
            const goals = await RequestGoals(TOKEN);
            expect(goals).toHaveLength(1);
            expect(goals[0].id).toBe(1);
        });

        it('returns empty array on 401', async () => {
            mockFetch.mockReturnValueOnce(mockResponse(401, {}));
            const goals = await RequestGoals(TOKEN);
            expect(goals).toEqual([]);
        });

        it('throws when no token is provided', async () => {
            await expect(RequestGoals('')).rejects.toThrow();
        });
    });

    describe('CreateGoal', () => {
        it('sends POST /api/goals with auth header and body', async () => {
            mockFetch.mockReturnValueOnce(mockResponse(201, mockGoal));
            await CreateGoal(mockGoal as any, TOKEN);
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/goals'),
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({ Authorization: `Bearer ${TOKEN}` }),
                })
            );
        });

        it('returns the created goal', async () => {
            mockFetch.mockReturnValueOnce(mockResponse(201, mockGoal));
            const result = await CreateGoal(mockGoal as any, TOKEN);
            expect(result).toEqual(mockGoal);
        });

        it('throws on error response', async () => {
            mockFetch.mockReturnValueOnce(mockResponse(400, { error: 'Validation failed' }));
            await expect(CreateGoal(mockGoal as any, TOKEN)).rejects.toThrow();
        });
    });

    describe('UpdateGoal', () => {
        it('sends PUT /api/goals/:id with auth header', async () => {
            mockFetch.mockReturnValueOnce(mockResponse(200, mockGoal));
            await UpdateGoal(mockGoal as any, TOKEN);
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/goals/1'),
                expect.objectContaining({ method: 'PUT' })
            );
        });
    });

    describe('DeleteGoal', () => {
        it('sends DELETE /api/goals/:id with auth header', async () => {
            mockFetch.mockReturnValueOnce(mockResponse(204));
            await DeleteGoal(1, TOKEN);
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/goals/1'),
                expect.objectContaining({
                    method: 'DELETE',
                    headers: expect.objectContaining({ Authorization: `Bearer ${TOKEN}` }),
                })
            );
        });
    });
});
