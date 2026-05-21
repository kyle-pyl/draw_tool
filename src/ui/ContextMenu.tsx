import { useRef, useEffect, useState, useCallback } from 'react';

export interface MenuItem {
  label: string;
  action?: () => void;
  disabled?: boolean;
  shortcut?: string;
  separator?: boolean;
  children?: MenuItem[];
}

export interface ContextMenuState {
  x: number;
  y: number;
  items: MenuItem[];
}

interface ContextMenuProps {
  state: ContextMenuState | null;
  onClose: () => void;
}

export function ContextMenu({ state, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [openSubmenuIndex, setOpenSubmenuIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!state) return;

    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [state, onClose]);

  useEffect(() => {
    setOpenSubmenuIndex(null);
  }, [state]);

  const handleItemClick = useCallback(
    (item: MenuItem) => {
      if (item.disabled || item.children) return;
      item.action?.();
      onClose();
    },
    [onClose],
  );

  const handleSubmenuHover = useCallback(
    (index: number, item: MenuItem) => {
      if (item.disabled) return;
      if (item.children && item.children.length > 0) {
        setOpenSubmenuIndex(index);
      } else {
        setOpenSubmenuIndex(null);
      }
    },
    [],
  );

  if (!state) return null;

  const adjustPosition = (x: number, y: number): { x: number; y: number } => {
    const windowW = window.innerWidth;
    const windowH = window.innerHeight;
    const menuW = 220;
    const submenuW = 200;
    let adjX = x;
    let adjY = y;

    if (adjX + menuW + submenuW > windowW) {
      adjX = x - menuW;
    }
    if (adjY + 400 > windowH) {
      adjY = windowH - 420;
    }
    if (adjX < 0) adjX = 4;
    if (adjY < 0) adjY = 4;

    return { x: adjX, y: adjY };
  };

  const pos = adjustPosition(state.x, state.y);

  const renderSubmenu = (items: MenuItem[], parentIndex: number): React.ReactNode => {
    if (openSubmenuIndex !== parentIndex) return null;
    if (!items || items.length === 0) return null;

    return (
      <div className="context-submenu">
        {items.map((subItem, i) => {
          if (subItem.separator) {
            return <div key={`sep-${i}`} className="context-menu-separator" />;
          }
          return (
            <div
              key={i}
              className={`context-menu-item${subItem.disabled ? ' disabled' : ''}`}
              onClick={() => handleItemClick(subItem)}
            >
              <span className="context-menu-label">{subItem.label}</span>
              {subItem.shortcut && (
                <span className="context-menu-shortcut">{subItem.shortcut}</span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        zIndex: 1000,
      }}
    >
      {state.items.map((item, i) => {
        if (item.separator) {
          return <div key={`sep-${i}`} className="context-menu-separator" />;
        }
        return (
          <div
            key={i}
            className={`context-menu-item${item.disabled ? ' disabled' : ''}`}
            onClick={() => handleItemClick(item)}
            onMouseEnter={() => handleSubmenuHover(i, item)}
          >
            <span className="context-menu-label">{item.label}</span>
            {item.shortcut && (
              <span className="context-menu-shortcut">{item.shortcut}</span>
            )}
            {item.children && item.children.length > 0 && (
              <span className="context-menu-arrow">&#9656;</span>
            )}
            {item.children && renderSubmenu(item.children, i)}
          </div>
        );
      })}
    </div>
  );
}
