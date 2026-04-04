import React from 'react';
import './AppBackground.scss';

interface AppBackgroundProps {
  children: React.ReactNode;
}

const AppBackground: React.FC<AppBackgroundProps> = ({ children }) => (
  <div className="app-bg">
    <div className="app-bg__pattern" />
    {children}
  </div>
);

export default AppBackground;
