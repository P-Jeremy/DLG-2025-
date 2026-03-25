import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import TagDeleteConfirm from './TagDeleteConfirm';

describe('TagDeleteConfirm', () => {
  it('renders the confirm and cancel buttons', () => {
    render(<TagDeleteConfirm onConfirm={jest.fn()} onCancel={jest.fn()} disabled={false} />);
    expect(screen.getByRole('button', { name: 'Confirmer ?' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = jest.fn();
    render(<TagDeleteConfirm onConfirm={onConfirm} onCancel={jest.fn()} disabled={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer ?' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = jest.fn();
    render(<TagDeleteConfirm onConfirm={jest.fn()} onCancel={onCancel} disabled={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('disables both buttons when disabled prop is true', () => {
    render(<TagDeleteConfirm onConfirm={jest.fn()} onCancel={jest.fn()} disabled={true} />);
    expect(screen.getByRole('button', { name: 'Confirmer ?' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeDisabled();
  });
});
