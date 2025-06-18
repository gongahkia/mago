import styled from 'styled-components';
import { HealthManaBar } from './HealthManaBar';
import { Inventory } from './Inventory';
import { StatusEffects } from './StatusEffects';

interface HUDProps {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  inventoryItems: Array<any>;
  statusEffects: Array<any>;
}

export const HUD = ({
  health,
  maxHealth,
  mana,
  maxMana,
  inventoryItems,
  statusEffects,
}: HUDProps) => {
  return (
    <HUDContainer>
      {/* Top Left Section */}
      <CornerSection $position="top-left">
        <HealthManaBar
          current={health}
          max={maxHealth}
          label="HEALTH"
          color="#e74c3c"
        />
        <HealthManaBar
          current={mana}
          max={maxMana}
          label="MANA"
          color="#3498db"
        />
        <StatusEffects effects={statusEffects} />
      </CornerSection>

      {/* Bottom Center Inventory */}
      <InventorySection>
        <Inventory items={inventoryItems} />
      </InventorySection>

      {/* Mini-map Placeholder */}
      <CornerSection $position="top-right">
        <MiniMapPlaceholder />
      </CornerSection>
    </HUDContainer>
  );
};

const HUDContainer = styled.div`
  pointer-events: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const CornerSection = styled.div<{ $position: 'top-left' | 'top-right' }>`
  position: absolute;
  top: 20px;
  ${({ $position }) => ($position === 'top-left' ? 'left: 20px' : 'right: 20px')};
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InventorySection = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
`;

const MiniMapPlaceholder = styled.div`
  width: 120px;
  height: 120px;
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
`;