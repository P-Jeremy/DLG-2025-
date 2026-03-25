import React, { useEffect, useRef } from 'react';
import './AppBackground.scss';

interface AppBackgroundProps {
  children: React.ReactNode;
}

const AppBackground: React.FC<AppBackgroundProps> = ({ children }) => {
  const parallaxBgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number;
    const handleScroll = () => {
      window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(() => {
        if (parallaxBgRef.current) {
          const offset = window.scrollY * 0.2;
          parallaxBgRef.current.style.backgroundPositionY = `calc(50% + ${offset}px)`;
        }
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="app-bg">
      <div className="app-parallax-bg" ref={parallaxBgRef} />
      {children}
    </div>
  );
};

export default AppBackground;
