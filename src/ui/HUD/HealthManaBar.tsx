import styled from 'styled-components';

interface ResourceBarProps {
  current: number;
  max: number;
  label: string;
  color: string;
  height?: number;
  showNumbers?: boolean;
}

export const HealthManaBar = ({
  current,
  max,
  label,
  color,
  height = 20,
  showNumbers = true,
}: ResourceBarProps) => {
  const percentage = Math.max(0, (current / max) * 100);

  return (
    <BarContainer $height={height}>
      <BarLabel>{label}</BarLabel>
      <BarTrack>
        <BarFill $color={color} $width={percentage} />
      </BarTrack>
      {showNumbers && (
        <BarNumbers>
          {Math.floor(current)} / {Math.floor(max)}
        </BarNumbers>
      )}
    </BarContainer>
  );
};

const BarContainer = styled.div<{ $height: number }>`
  width: 220px;
  margin: 6px 0;
`;

const BarLabel = styled.div`
  font-size: 12px;
  margin-bottom: 2px;
  color: #fff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
`;

const BarTrack = styled.div`
  background: rgba(0, 0, 0, 0.4);
  border-radius: 4px;
  height: ${({ theme }) => theme.barHeight};
  overflow: hidden;
  position: relative;
`;

const BarFill = styled.div<{ $color: string; $width: number }>`
  width: ${({ $width }) => $width}%;
  height: 100%;
  background: ${({ $color }) => $color};
  transition: width 0.3s ease-out;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2));
  }
`;

const BarNumbers = styled.div`
  font-size: 11px;
  margin-top: 2px;
  color: rgba(255, 255, 255, 0.8);
`;