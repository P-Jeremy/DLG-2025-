import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NavbarSearch from './NavbarSearch';
import { SearchProvider } from '../../contexts/SearchContext';

const renderNavbarSearch = () =>
  render(
    <BrowserRouter>
      <SearchProvider>
        <NavbarSearch />
      </SearchProvider>
    </BrowserRouter>,
  );

describe('Unit | Component | NavbarSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the search input with correct placeholder', () => {
    renderNavbarSearch();

    const input = screen.getByRole('searchbox', { name: 'Rechercher une chanson' });
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Rechercher…');
  });

  it('renders the input as type search', () => {
    renderNavbarSearch();

    const input = screen.getByRole('searchbox');
    expect(input).toHaveAttribute('type', 'search');
  });

  it('renders the SortToggle component', () => {
    renderNavbarSearch();

    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('blurs the input when Enter key is pressed', () => {
    renderNavbarSearch();

    const input = screen.getByRole('searchbox') as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(document.activeElement).not.toBe(input);
  });

  it('does not blur the input when other keys are pressed', () => {
    renderNavbarSearch();

    const input = screen.getByRole('searchbox') as HTMLInputElement;
    fireEvent.focus(input);
    const initialActiveElement = document.activeElement;
    fireEvent.keyDown(input, { key: 'a' });

    expect(document.activeElement).toBe(initialActiveElement);
  });

  it('focuses the input when mouse down event is triggered', () => {
    renderNavbarSearch();

    const input = screen.getByRole('searchbox') as HTMLInputElement;
    fireEvent.mouseDown(input);

    expect(document.activeElement).toBe(input);
  });

  it('focuses the input on touch start', () => {
    renderNavbarSearch();

    const input = screen.getByRole('searchbox') as HTMLInputElement;
    fireEvent.touchStart(input);

    expect(document.activeElement).toBe(input);
  });
});
