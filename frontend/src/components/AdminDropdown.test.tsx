import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminDropdown from './AdminDropdown';

const renderComponent = (onNavigate = jest.fn(), mobileExpanded = false) =>
  render(
    <MemoryRouter>
      <AdminDropdown onNavigate={onNavigate} mobileExpanded={mobileExpanded} />
    </MemoryRouter>,
  );

describe('Unit | Component | AdminDropdown', () => {
  it('renders the trigger button with the label Administration', () => {
    renderComponent();

    expect(screen.getByRole('button', { name: /Administration/i })).toBeInTheDocument();
  });

  it('does not show the menu as open by default', () => {
    renderComponent();

    const menu = screen.getByRole('menu');
    expect(menu).not.toHaveClass('admin-dropdown__menu--open');
  });

  it('opens the menu when the trigger button is clicked', () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /Administration/i }));

    expect(screen.getByRole('menu')).toHaveClass('admin-dropdown__menu--open');
  });

  it('closes the menu on a second click of the trigger button', () => {
    renderComponent();
    const trigger = screen.getByRole('button', { name: /Administration/i });

    fireEvent.click(trigger);
    fireEvent.click(trigger);

    expect(screen.getByRole('menu')).not.toHaveClass('admin-dropdown__menu--open');
  });

  it('closes the menu when a click occurs outside the component', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /Administration/i }));
    expect(screen.getByRole('menu')).toHaveClass('admin-dropdown__menu--open');

    fireEvent.mouseDown(document.body);

    expect(screen.getByRole('menu')).not.toHaveClass('admin-dropdown__menu--open');
  });

  it('marks the trigger as open when mobileExpanded is true', () => {
    renderComponent(jest.fn(), true);

    const trigger = screen.getByRole('button', { name: /Administration/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveClass('is-open');
  });

  it('renders navigation links for each admin section', () => {
    renderComponent();

    expect(screen.getByRole('menuitem', { name: 'Ajouter une chanson' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Gérer les playlists' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Gérer les utilisateurs' })).toBeInTheDocument();
  });

  it('calls onNavigate and closes the menu when a menu link is clicked', () => {
    const onNavigate = jest.fn();
    renderComponent(onNavigate);

    fireEvent.click(screen.getByRole('button', { name: /Administration/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Ajouter une chanson' }));

    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('menu')).not.toHaveClass('admin-dropdown__menu--open');
  });

  it('points the Add Song link to the correct route', () => {
    renderComponent();

    const link = screen.getByRole('menuitem', { name: 'Ajouter une chanson' });
    expect(link).toHaveAttribute('href', '/songs/add');
  });

  it('points the Manage Playlists link to the correct route', () => {
    renderComponent();

    const link = screen.getByRole('menuitem', { name: 'Gérer les playlists' });
    expect(link).toHaveAttribute('href', '/admin/playlists');
  });

  it('points the Manage Users link to the correct route', () => {
    renderComponent();

    const link = screen.getByRole('menuitem', { name: 'Gérer les utilisateurs' });
    expect(link).toHaveAttribute('href', '/admin/users');
  });
});
