/**
 * Input validation utilities with explicit naming.
 * Replace inline !value.trim() checks with these functions for clarity.
 */

export function isInputEmpty(input: string): boolean {
  return !input.trim();
}

export function isInputNotEmpty(input: string): boolean {
  return input.trim().length > 0;
}

export function getTrimmedInput(input: string): string {
  return input.trim();
}

export function isSearchQueryValid(query: string): boolean {
  return isInputNotEmpty(query);
}

export function isPlaylistNameNotEmpty(name: string): boolean {
  return isInputNotEmpty(name);
}

export function isSongTitleValid(title: string): boolean {
  return isInputNotEmpty(title);
}
