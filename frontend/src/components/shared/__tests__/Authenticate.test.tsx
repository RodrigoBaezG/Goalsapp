/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Authenticate from '../Authenticate.jsx';
import { AuthContext } from '../../../memory/Context.tsx';

function renderWithAuth(authenticated: boolean) {
    const authValue = [
        { authenticate: authenticated, token: authenticated ? { token: 'tok' } : null },
        jest.fn(),
    ];

    return render(
        <AuthContext.Provider value={authValue as any}>
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route path="/access" element={<div>Login page</div>} />
                    <Route element={<Authenticate />}>
                        <Route path="/protected" element={<div>Protected content</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        </AuthContext.Provider>
    );
}

describe('Authenticate guard', () => {
    it('renders protected content when authenticated', () => {
        renderWithAuth(true);
        expect(screen.getByText('Protected content')).toBeInTheDocument();
    });

    it('redirects to /access when not authenticated', () => {
        renderWithAuth(false);
        expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
        expect(screen.getByText('Login page')).toBeInTheDocument();
    });
});
