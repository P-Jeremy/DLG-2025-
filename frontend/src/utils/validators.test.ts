import {
  isInputEmpty,
  isInputNotEmpty,
  getTrimmedInput,
  isSearchQueryValid,
  isPlaylistNameNotEmpty,
  isSongTitleValid,
} from './validators';

describe('Unit | Utils | validators', () => {
  describe('isInputEmpty', () => {
    it('returns true for empty string', () => {
      expect(isInputEmpty('')).toBe(true);
    });

    it('returns true for whitespace-only string', () => {
      expect(isInputEmpty('   ')).toBe(true);
    });

    it('returns false for non-empty string', () => {
      expect(isInputEmpty('Rock')).toBe(false);
    });
  });

  describe('isInputNotEmpty', () => {
    it('returns false for empty string', () => {
      expect(isInputNotEmpty('')).toBe(false);
    });

    it('returns false for whitespace-only string', () => {
      expect(isInputNotEmpty('   ')).toBe(false);
    });

    it('returns true for non-empty string', () => {
      expect(isInputNotEmpty('Rock')).toBe(true);
    });
  });

  describe('getTrimmedInput', () => {
    it('returns trimmed string', () => {
      expect(getTrimmedInput('  Hello  ')).toBe('Hello');
    });

    it('returns empty string for whitespace-only input', () => {
      expect(getTrimmedInput('   ')).toBe('');
    });

    it('returns the same string if already trimmed', () => {
      expect(getTrimmedInput('Jazz')).toBe('Jazz');
    });
  });

  describe('isSearchQueryValid', () => {
    it('returns false for empty query', () => {
      expect(isSearchQueryValid('')).toBe(false);
    });

    it('returns false for whitespace-only query', () => {
      expect(isSearchQueryValid('   ')).toBe(false);
    });

    it('returns true for valid search query', () => {
      expect(isSearchQueryValid('Beatles')).toBe(true);
    });
  });

  describe('isPlaylistNameNotEmpty', () => {
    it('returns false for empty name', () => {
      expect(isPlaylistNameNotEmpty('')).toBe(false);
    });

    it('returns false for whitespace-only name', () => {
      expect(isPlaylistNameNotEmpty('   ')).toBe(false);
    });

    it('returns true for valid new name', () => {
      expect(isPlaylistNameNotEmpty('Jazz')).toBe(true);
    });
  });

  describe('isSongTitleValid', () => {
    it('returns false for empty title', () => {
      expect(isSongTitleValid('')).toBe(false);
    });

    it('returns false for whitespace-only title', () => {
      expect(isSongTitleValid('   ')).toBe(false);
    });

    it('returns true for valid song title', () => {
      expect(isSongTitleValid('Imagine')).toBe(true);
    });
  });
});
