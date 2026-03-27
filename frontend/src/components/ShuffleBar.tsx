import React from 'react';
import './ShuffleBar.scss';

interface ShuffleBarProps {
  onShuffle: () => void;
}

const ShuffleBar: React.FC<ShuffleBarProps> = ({ onShuffle }) => (
  <div className="shuffle-bar">
    <button
      className="shuffle-bar__button"
      onClick={onShuffle}
      aria-label="Chanson au hasard"
    >
      <span className="material-icons" aria-hidden="true">shuffle</span>
    </button>
  </div>
);

export default ShuffleBar;
