import React from 'react';
import SongList from './components/SongList';

const App: React.FC = () => {
  return (
    <div className="app-bg">
      <div className="app-header">
        <h1>DLG</h1>
      </div>
      <SongList />
    </div>
  );
};

export default App;
