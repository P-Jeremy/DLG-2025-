import React from 'react';
import './VinylLoader.scss';

const VinylLoader: React.FC = () => (
  <div className="vinyl-loader-container">
    <img src="/vinyl.png" className="vinyl-loader" alt="Chargement..." />
  </div>
);

export default VinylLoader;
