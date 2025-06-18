import React, { forwardRef, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { ContextMenuPosition, ContextMenuItem } from './types';
import { useContextMenu } from './useContextMenu';

interface ContextMenuProps {
  items: ContextMenuItem[];
  position: ContextMenuPosition;
  onClose: () => void;
}

export const ContextMenu = forwardRef<HTMLDivElement, ContextMenuProps>(
  ({ items, position, onClose }, ref) => {
    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      },
      [onClose]
    );

    useEffect(() => {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
      <MenuContainer
        ref={ref}
        style={{
          '--x': `${position.x}px`,
          '--y': `${position.y}px`,
        }}
        role="menu"
        aria-orientation="vertical"
      >
        {items.map((item, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              item.action();
              onClose();
            }}
            role="menuitem"
            tabIndex={0}
            $danger={item.danger}
            disabled={item.disabled}
          >
            {item.icon && <IconWrapper>{item.icon}</IconWrapper>}
            <span>{item.label}</span>
            {item.hotkey && <Hotkey>{item.hotkey}</Hotkey>}
          </MenuItem>
        ))}
      </MenuContainer>
    );
  }
);

const MenuContainer = styled.div`
  position: fixed;
  top: var(--y);
  left: var(--x);
  min-width: 180px;
  background: ${({ theme }) => theme.colors.menuBackground};
  border: 1px solid ${({ theme }) => theme.colors.menuBorder};
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 6px;
  z-index: 1000;
  user-select: none;
`;

const MenuItem = styled.button<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 12px;
  border-radius: 4px;
  background: transparent;
  border: none;
  color: ${({ theme, $danger }) =>
    $danger ? theme.colors.textDanger : theme.colors.textPrimary};
  font-size: 13px;
  gap: 8px;
  cursor: pointer;
  transition: background 0.1s ease;

  &:hover:not(:disabled),
  &:focus:not(:disabled) {
    background: ${({ theme }) => theme.colors.menuHover};
    outline: none;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  width: 16px;
  height: 16px;
`;

const Hotkey = styled.span`
  margin-left: auto;
  opacity: 0.6;
  font-size: 0.9em;
`;