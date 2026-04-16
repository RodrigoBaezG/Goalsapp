/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Goal from "./Goal.tsx";
import { MemoryRouter } from 'react-router-dom';

describe("Goal component", () => {
    it("renders the button", () => {
        render(
            <MemoryRouter>
                <Goal
                    id={1}
                    icon="📚"
                    details="Learn React"
                    period="week"
                    events={4}
                    goal={10}
                    completed={3}
                />
            </MemoryRouter>
        );
       const button = screen.getByText('Completed');
       expect(button).toBeInTheDocument();
    });
    it("render the icon", () => {
        render(
            <MemoryRouter>
                <Goal
                    id={1}
                    icon="📚"
                    details="Learn React"
                    period="week"
                    events={4}
                    goal={10}
                    completed={3}
                />
            </MemoryRouter>
        );
       const icon = screen.getByText('📚');
       expect(icon).toBeInTheDocument();
    })
});
