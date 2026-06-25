import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

test('affiche la connexion puis ouvre le tableau de bord SIEM', () => {
  render(<App />);

  expect(screen.getByText(/SIEM Intelligent/i)).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText(/Mot de passe/i), { target: { value: 'demo-password' } });
  fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));

  expect(screen.getByRole('button', { name: /Alertes de sécurité/i })).toBeInTheDocument();
  expect(screen.getByText(/Journaux traités/i)).toBeInTheDocument();
});
