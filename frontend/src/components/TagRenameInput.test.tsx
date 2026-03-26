import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TagRenameInput from './TagRenameInput';
import type { Tag } from '../api/tags';

const tag: Tag = { id: 'tag-1', name: 'rock' };

describe('TagRenameInput', () => {
  it('renders an input pre-filled with the tag name', () => {
    render(<TagRenameInput tag={tag} onConfirm={jest.fn()} onCancel={jest.fn()} disabled={false} />);
    expect(screen.getByRole('textbox', { name: 'Nouveau nom du tag' })).toHaveValue('rock');
  });

  it('renders validate and cancel buttons', () => {
    render(<TagRenameInput tag={tag} onConfirm={jest.fn()} onCancel={jest.fn()} disabled={false} />);
    expect(screen.getByRole('button', { name: 'Valider' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = jest.fn();
    render(<TagRenameInput tag={tag} onConfirm={jest.fn()} onCancel={onCancel} disabled={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm with new name when validate is clicked', async () => {
    const onConfirm = jest.fn().mockResolvedValue(undefined);
    render(<TagRenameInput tag={tag} onConfirm={onConfirm} onCancel={jest.fn()} disabled={false} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'metal' } });
    fireEvent.click(screen.getByRole('button', { name: 'Valider' }));

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith('tag-1', 'metal');
    });
  });

  it('calls onCancel instead of onConfirm when name has not changed', async () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    render(<TagRenameInput tag={tag} onConfirm={onConfirm} onCancel={onCancel} disabled={false} />);

    fireEvent.click(screen.getByRole('button', { name: 'Valider' }));

    await waitFor(() => {
      expect(onCancel).toHaveBeenCalled();
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  it('disables the validate button when the input is empty', () => {
    render(<TagRenameInput tag={tag} onConfirm={jest.fn()} onCancel={jest.fn()} disabled={false} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '' } });
    expect(screen.getByRole('button', { name: 'Valider' })).toBeDisabled();
  });

  it('disables input and buttons when disabled prop is true', () => {
    render(<TagRenameInput tag={tag} onConfirm={jest.fn()} onCancel={jest.fn()} disabled={true} />);
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeDisabled();
  });
});
