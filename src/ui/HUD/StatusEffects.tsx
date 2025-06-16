import styled from 'styled-components';

interface StatusEffect {
  id: string;
  icon: string;
  duration?: number;
  description: string;
}

interface StatusEffectsProps {
  effects: StatusEffect[];
}

export const StatusEffects = ({ effects }: StatusEffectsProps) => {
  return (
    <StatusContainer>
      {effects.map((effect) => (
        <StatusEffectIcon key={effect.id} title={effect.description}>
          <EffectIcon src={effect.icon} />
          {effect.duration && (
            <DurationBadge>
              {Math.ceil(effect.duration)}
            </DurationBadge>
          )}
        </StatusEffectIcon>
      ))}
    </StatusContainer>
  );
};

const StatusContainer = styled.div`
  display: flex;
  gap: 6px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 20px;
`;

const StatusEffectIcon = styled.div`
  width: 32px;
  height: 32px;
  position: relative;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
`;

const EffectIcon = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const DurationBadge = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  font-size: 9px;
  padding: 2px 4px;
  border-radius: 3px;
`;