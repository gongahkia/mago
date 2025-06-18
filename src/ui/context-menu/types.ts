export interface ContextMenuItem {
  label: string;
  action: () => void;
  icon?: React.ReactNode;
  hotkey?: string;
  danger?: boolean;
  disabled?: boolean;
}

export interface ContextMenuPosition {
  x: number;
  y: number;
}