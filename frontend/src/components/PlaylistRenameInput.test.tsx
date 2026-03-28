import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import PlaylistRenameInput from './PlaylistRenameInput';
import type { Playlist } from '../api/playlists';

const mockPlaylist: Playlist = { name: 'Rock', songIds: [] };

const renderComponent = (
  onConfirm: (newName: string) => Promise<void> = jest.fn().mockResolvedValue(undefined),
  onCancel: () => void = jest.fn(),
  disabled = false,
) =>
  render(
    <PlaylistRenameInput
      playlist={mockPlaylist}
      onConfirm={onConfirm}
      onCancel={onCancel}
      disabled={disabled}
    />,
  );

describe('Unit | Component | PlaylistRenameInput', () => {
  it('renders the input pre-filled with the current playlist name', () => {
    renderComponent();

    const input = screen.getByRole('textbox', { name: 'Nouveau nom de la playlist' });
    expect(input).toHaveValue('Rock');
  });

  it('renders a validate button and a cancel button', () => {
    renderComponent();

    expect(screen.getByRole('button', { name: 'Valider' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeInTheDocument();
  });

  it('calls onCancel when the cancel button is clicked', () => {
    const onCancel = jest.fn();
    renderComponent(jest.fn(), onCancel);

    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when submitting with the same name as the current playlist', async () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn().mockResolvedValue(undefined);
    renderComponent(onConfirm, onCancel);

    fireEvent.click(screen.getByRole('button', { name: 'Valider' }));

    await waitFor(() => {
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('keeps the validate button disabled when the input contains only whitespace', () => {
    renderComponent();

    fireEvent.change(screen.getByRole('textbox', { name: 'Nouveau nom de la playlist' }), {
      target: { value: '   ' },
    });

    expect(screen.getByRole('button', { name: 'Valider' })).toBeDisabled();
  });

  it('calls onConfirm with the trimmed new name when a valid new name is submitted', async () => {
    const onConfirm = jest.fn().mockResolvedValue(undefined);
    renderComponent(onConfirm);

    fireEvent.change(screen.getByRole('textbox', { name: 'Nouveau nom de la playlist' }), {
      target: { value: '  Jazz  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Valider' }));

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith('Jazz');
    });
  });

  it('disables input and buttons while the submission is in progress', async () => {
    let resolveConfirm!: () => void;
    const onConfirm = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveConfirm = resolve;
        }),
    );
    renderComponent(onConfirm);

    fireEvent.change(screen.getByRole('textbox', { name: 'Nouveau nom de la playlist' }), {
      target: { value: 'Jazz' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Valider' }));

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: 'Nouveau nom de la playlist' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Valider' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Annuler' })).toBeDisabled();
    });

    await act(async () => {
      resolveConfirm();
    });
  });

  it('re-enables input and buttons after the submission resolves', async () => {
    const onConfirm = jest.fn().mockResolvedValue(undefined);
    renderComponent(onConfirm);

    fireEvent.change(screen.getByRole('textbox', { name: 'Nouveau nom de la playlist' }), {
      target: { value: 'Jazz' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Valider' }));

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: 'Nouveau nom de la playlist' })).not.toBeDisabled();
    });
  });

  it('disables all interactive elements when the disabled prop is true', () => {
    renderComponent(jest.fn(), jest.fn(), true);

    expect(screen.getByRole('textbox', { name: 'Nouveau nom de la playlist' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Valider' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeDisabled();
  });
});
