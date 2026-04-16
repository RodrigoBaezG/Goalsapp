/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Goal from '../Goal.tsx';
import { GoalsContext } from '../../../../memory/Context.tsx';
import { AuthContext } from '../../../../memory/Context.tsx';

const mockDispatch = jest.fn();
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockGoal = {
    id: 1,
    icon: '📚',
    details: 'Read 12 books',
    period_: 'yearly',
    events: 5,
    goal: 12,
    completed: 3,
};

const mockGoalState = {
    order: [1],
    objects: { 1: mockGoal },
};

function renderGoal(goalProps = mockGoal) {
    const authValue = [{ authenticate: true, token: { token: 'test-token' } }, jest.fn()];
    const goalsValue = [mockGoalState, mockDispatch];

    return render(
        <AuthContext.Provider value={authValue as any}>
            <GoalsContext.Provider value={goalsValue as any}>
                <MemoryRouter>
                    <Goal {...goalProps} />
                </MemoryRouter>
            </GoalsContext.Provider>
        </AuthContext.Provider>
    );
}

describe('Goal component', () => {
    beforeEach(() => {
        mockDispatch.mockClear();
        mockFetch.mockClear();
    });

    it('renders icon, details, and period', () => {
        renderGoal();
        expect(screen.getByText('📚')).toBeInTheDocument();
        expect(screen.getByText('Read 12 books')).toBeInTheDocument();
        expect(screen.getByText('yearly')).toBeInTheDocument();
    });

    it('renders "Completed" button', () => {
        renderGoal();
        expect(screen.getByRole('button', { name: /completed/i })).toBeInTheDocument();
    });

    it('shows correct completed count', () => {
        renderGoal();
        expect(screen.getByTestId('completed-count')).toHaveTextContent('3/12');
    });

    it('renders progress bar with correct percentage', () => {
        renderGoal();
        // role="progressbar" is on the fill element itself
        const fill = screen.getByRole('progressbar');
        expect(fill).toBeInTheDocument();
        // 3/12 = 25%
        expect(fill).toHaveStyle({ width: '25%' });
    });

    it('clamps progress to 100% when completed exceeds goal', () => {
        renderGoal({ ...mockGoal, completed: 15 });
        const fill = screen.getByRole('progressbar');
        expect(fill).toHaveStyle({ width: '100%' });
    });

    it('calls UpdateGoal and dispatches update on Completed click', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ ...mockGoal, completed: 4 }),
        });

        renderGoal();
        fireEvent.click(screen.getByRole('button', { name: /completed/i }));

        await waitFor(() => {
            expect(mockDispatch).toHaveBeenCalledWith(
                expect.objectContaining({ type: 'update' })
            );
        });
    });

    it('does not navigate when Completed button is clicked', () => {
        renderGoal();
        const button = screen.getByRole('button', { name: /completed/i });
        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
        const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault');
        button.dispatchEvent(clickEvent);
        expect(preventDefaultSpy).toHaveBeenCalled();
    });
});
