import React from 'react';
import SongList from '../components/SongList';
import AppBackground from '../components/AppBackground';
import Navbar from '../components/Navbar';
import './MainLayout.scss';

const MainLayout: React.FC = () => {
  return (
    <AppBackground>
      <Navbar />
      <main className="app-content">
        <SongList />
      </main>
    </AppBackground>
  );
};

export default MainLayout;
