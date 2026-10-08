import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders HealthTech Portal login view when unauthenticated', () => {
  render(<App />);
  const titleElement = screen.getByText(/HealthTech Portal/i);
  expect(titleElement).toBeInTheDocument();
});

