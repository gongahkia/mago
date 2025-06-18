import styled from 'styled-components';

interface InventoryItem {
  id: string;
  icon: string;
  count?: number;
  hotkey?: string;
}

interface InventoryProps {
  items: InventoryItem[];
  slots?: number;
}

export const Inventory = ({ items, slots = 8 }: InventoryProps) => {
  return (
    <InventoryContainer>
      {Array.from({ length: slots }).map((_, index) => {
        const item = items[index];
        return (
          <InventorySlot key={index}>
            {item ? (
              <>
                <ItemIcon src={item.icon} alt={item.id} />
                {item.count && <ItemCount>{item.count}</ItemCount>}
                {item.hotkey && <HotkeyBadge>{item.hotkey}</HotkeyBadge>}
              </>
            ) : (
              <EmptySlot />
            )}
          </InventorySlot>
        );
      })}
    </InventoryContainer>
  );
};

const InventoryContainer = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 8px;
  backdrop-filter: blur(4px);
`;

const InventorySlot = styled.div`
  width: 48px;
  height: 48px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  position: relative;
  background: rgba(0, 0, 0, 0.3);
`;

const ItemIcon = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 4px;
`;

const ItemCount = styled.div`
  position: absolute;
  bottom: 2px;
  right: 2px;
  background: rgba(0, 0, 0, 0.7);
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 10px;
`;

const HotkeyBadge = styled.div`
  position: absolute;
  top: 2px;
  left: 2px;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 10px;
`;

const EmptySlot = styled.div`
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 5px,
    rgba(255, 255, 255, 0.05) 5px,
    rgba(255, 255, 255, 0.05) 10px
  );
`;