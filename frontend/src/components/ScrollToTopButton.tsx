import React, { useEffect, useState } from 'react';
import './ScrollToTopButton.scss';

const SCROLL_THRESHOLD = 200;

const ScrollToTopButton: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > SCROLL_THRESHOLD);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      className="scroll-to-top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Retour en haut de la page"
    >
      <span className="material-icons">keyboard_arrow_up</span>
    </button>
  );
};

export default ScrollToTopButton;
