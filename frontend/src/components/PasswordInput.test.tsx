import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import PasswordInput from './PasswordInput';

const renderPasswordInput = (overrides: Partial<Parameters<typeof PasswordInput>[0]> = {}) =>
  render(
    <PasswordInput
      id="password"
      value=""
      onChange={jest.fn()}
      {...overrides}
    />,
  );

describe('Unit | Component | PasswordInput', () => {
  it('renders an input of type password by default', () => {
    renderPasswordInput();

    const input = document.querySelector('input');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('renders with the provided value', () => {
    renderPasswordInput({ value: 'secret123' });

    expect(screen.getByDisplayValue('secret123')).toBeInTheDocument();
  });

  it('shows the toggle button with aria-label "Afficher le mot de passe"', () => {
    renderPasswordInput();

    expect(screen.getByRole('button', { name: 'Afficher le mot de passe' })).toBeInTheDocument();
  });

  it('switches input type to text when the toggle button is clicked', () => {
    renderPasswordInput();

    fireEvent.click(screen.getByRole('button', { name: 'Afficher le mot de passe' }));

    const input = document.querySelector('input');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('shows the toggle button with aria-label "Masquer le mot de passe" after reveal', () => {
    renderPasswordInput();

    fireEvent.click(screen.getByRole('button', { name: 'Afficher le mot de passe' }));

    expect(screen.getByRole('button', { name: 'Masquer le mot de passe' })).toBeInTheDocument();
  });

  it('switches input type back to password when the toggle is clicked a second time', () => {
    renderPasswordInput();

    fireEvent.click(screen.getByRole('button', { name: 'Afficher le mot de passe' }));
    fireEvent.click(screen.getByRole('button', { name: 'Masquer le mot de passe' }));

    const input = document.querySelector('input');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('calls onChange when the user types', () => {
    const onChange = jest.fn();
    renderPasswordInput({ onChange });

    const input = document.querySelector('input')!;
    fireEvent.change(input, { target: { value: 'newvalue' } });

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('forwards the required attribute to the input', () => {
    renderPasswordInput({ required: true });

    const input = document.querySelector('input');
    expect(input).toBeRequired();
  });

  it('forwards the autoComplete attribute to the input', () => {
    renderPasswordInput({ autoComplete: 'current-password' });

    const input = document.querySelector('input');
    expect(input).toHaveAttribute('autocomplete', 'current-password');
  });

  it('forwards the className to the input element', () => {
    renderPasswordInput({ className: 'auth-input' });

    const input = document.querySelector('input');
    expect(input).toHaveClass('auth-input');
  });
});
