import React, { useMemo, useEffect } from 'react';
import type { Song } from '../types/song';
import { NAVBAR_HEIGHT_PX } from '../constants/layout';
import './AlphabetNav.scss';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

interface AlphabetNavProps {
  songs: Song[];
}

function computeAvailableLetters(songs: Song[]): Set<string> {
  const letters = new Set<string>();
  for (const song of songs) {
    const letter = song.title?.[0]?.toUpperCase() ?? '';
    if (letter) letters.add(letter);
  }
  return letters;
}

function scrollToLetter(letter: string): void {
  const element = document.querySelector(`[data-song-letter="${letter}"]`);
  if (!element) return;
  const top = element.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT_PX;
  window.scrollTo({ top, behavior: 'smooth' });
}

const AlphabetNav: React.FC<AlphabetNavProps> = ({ songs }) => {
  const availableLetters = useMemo(
    () => computeAvailableLetters(songs),
    [songs],
  );

  useEffect(() => {
    const onScroll = () => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className="alphabet-nav" aria-label="Navigation alphabétique">
      {ALPHABET.map((letter) => {
        const isActive = availableLetters.has(letter);
        return isActive ? (
          <span
            key={letter}
            role="button"
            tabIndex={0}
            className="alphabet-nav__letter alphabet-nav__letter--active"
            onClick={() => scrollToLetter(letter)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollToLetter(letter); } }}
            aria-label={`Aller à la lettre ${letter}`}
          >
            {letter}
          </span>
        ) : (
          <span
            key={letter}
            className="alphabet-nav__letter alphabet-nav__letter--disabled"
            aria-disabled="true"
          >
            {letter}
          </span>
        );
      })}
    </nav>
  );
};

export default AlphabetNav;
