import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import ShuffleBar from './ShuffleBar';

describe('Unit | Component | ShuffleBar', () => {
  it('renders the shuffle button', () => {
    render(<ShuffleBar onShuffle={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Chanson au hasard' })).toBeInTheDocument();
  });

  it('calls onShuffle when the button is clicked', () => {
    const onShuffle = jest.fn();
    render(<ShuffleBar onShuffle={onShuffle} />);

    fireEvent.click(screen.getByRole('button', { name: 'Chanson au hasard' }));

    expect(onShuffle).toHaveBeenCalledTimes(1);
  });
});
