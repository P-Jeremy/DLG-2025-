import { render, screen, fireEvent } from '@testing-library/react';
import AlphabetNav from './AlphabetNav';
import type { Song } from '../types/song';

const makeSong = (id: string, title: string, author?: string): Song => ({
  id,
  title,
  author,
});

describe('AlphabetNav', () => {
  it('renders all 26 letters', () => {
    render(<AlphabetNav songs={[]} />);
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((letter) => {
      expect(screen.getByText(letter)).toBeInTheDocument();
    });
  });

  it('marks letters as active when songs start with those letters', () => {
    const songs = [
      makeSong('1', 'Amazing Grace'),
      makeSong('2', 'Bohemian Rhapsody'),
    ];
    render(<AlphabetNav songs={songs} />);

    expect(screen.getByRole('button', { name: /lettre A/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /lettre B/i })).toBeInTheDocument();
  });

  it('marks letters as disabled when no songs start with those letters', () => {
    const songs = [makeSong('1', 'Amazing Grace')];
    render(<AlphabetNav songs={songs} />);

    const disabledLetters = screen.getAllByText(/[B-Z]/);
    disabledLetters.forEach((el) => {
      if (el.tagName.toLowerCase() !== 'button') {
        expect(el.getAttribute('aria-disabled')).toBe('true');
      }
    });
  });

  it('calls window.scrollTo when clicking an active letter', () => {
    const songs = [makeSong('1', 'Cool Song')];
    const mockScrollTo = jest.fn();
    const mockGetBoundingClientRect = jest.fn().mockReturnValue({ top: 200 });

    const mockElement = { getBoundingClientRect: mockGetBoundingClientRect };
    jest.spyOn(document, 'querySelector').mockImplementation((selector) => {
      if (selector === '[data-song-letter="C"]') return mockElement as unknown as Element;
      return null;
    });
    jest.spyOn(window, 'scrollTo').mockImplementation(mockScrollTo);

    render(<AlphabetNav songs={songs} />);
    fireEvent.click(screen.getByRole('button', { name: /lettre C/i }));

    expect(mockScrollTo).toHaveBeenCalledWith({ top: expect.any(Number), behavior: 'smooth' });

    jest.restoreAllMocks();
  });

  it('does not render a button for inactive letters', () => {
    const songs = [makeSong('1', 'Amazing Grace')];
    render(<AlphabetNav songs={songs} />);

    const zEl = screen.getByText('Z');
    expect(zEl.tagName.toLowerCase()).not.toBe('button');
  });

  it('handles uppercase normalization correctly', () => {
    const songs = [makeSong('1', 'amazing grace')];
    render(<AlphabetNav songs={songs} />);

    expect(screen.getByRole('button', { name: /lettre A/i })).toBeInTheDocument();
  });
});
