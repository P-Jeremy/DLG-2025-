import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import TagFilter from './TagFilter';
import type { Tag } from '../api/tags';

const tags: Tag[] = [
  { id: 'tag-1', name: 'rock' },
  { id: 'tag-2', name: 'pop' },
];

describe('TagFilter component', () => {
  it('renders all tag options including the default all-songs option', () => {
    render(<TagFilter tags={tags} selectedTagId={null} onSelect={jest.fn()} />);

    expect(screen.getByRole('option', { name: 'Toutes les chansons' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'rock' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'pop' })).toBeInTheDocument();
  });

  it('shows the default all-songs option selected when selectedTagId is null', () => {
    render(<TagFilter tags={tags} selectedTagId={null} onSelect={jest.fn()} />);

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('');
  });

  it('shows the correct tag selected when selectedTagId is provided', () => {
    render(<TagFilter tags={tags} selectedTagId="tag-1" onSelect={jest.fn()} />);

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('tag-1');
  });

  it('calls onSelect with the tagId when a tag is selected', () => {
    const onSelect = jest.fn();
    render(<TagFilter tags={tags} selectedTagId={null} onSelect={onSelect} />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'tag-2' } });

    expect(onSelect).toHaveBeenCalledWith('tag-2');
  });

  it('calls onSelect with null when the all-songs option is selected', () => {
    const onSelect = jest.fn();
    render(<TagFilter tags={tags} selectedTagId="tag-1" onSelect={onSelect} />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '' } });

    expect(onSelect).toHaveBeenCalledWith(null);
  });
});
