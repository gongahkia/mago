import { useState, useCallback, useRef, useEffect } from 'react';
import { ContextMenuPosition } from './types';

export const useContextMenu = () => {
  const [position, setPosition] = useState<ContextMenuPosition>({ x: -1000, y: -1000 });
  const [isVisible, setIsVisible] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const { pageX, pageY } = e;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const menuWidth = 180;
    const menuHeight = 200;
    
    setPosition({
      x: pageX + menuWidth > viewportWidth ? pageX - menuWidth : pageX,
      y: pageY + menuHeight > viewportHeight ? pageY - menuHeight : pageY,
    });
    setIsVisible(true);
  }, []);

  const closeMenu = useCallback(() => {
    setIsVisible(false);
    setPosition({ x: -1000, y: -1000 });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };

    if (isVisible) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('contextmenu', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('contextmenu', handleClickOutside);
    };
  }, [isVisible, closeMenu]);

  return {
    handleContextMenu,
    menuProps: {
      ref: menuRef,
      position,
      isVisible,
      closeMenu,
    },
  };
};