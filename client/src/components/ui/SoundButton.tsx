import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { useSoundContext } from '@/contexts/SoundContext';
import { SoundType } from '@/services/soundService';

interface SoundButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The sound to play when clicked
   * @default 'ui_click'
   */
  sound?: SoundType;
  
  /**
   * Sound to play on hover
   * @default undefined - no hover sound
   */
  hoverSound?: SoundType;
  
  /**
   * Optional class name for styling
   */
  className?: string;
  
  /**
   * Button children
   */
  children: React.ReactNode;
}

/**
 * A button component that plays sound effects on interaction
 */
export const SoundButton: React.FC<SoundButtonProps> = ({
  sound = 'ui_click',
  hoverSound,
  className,
  children,
  onClick,
  onMouseEnter,
  disabled = false,
  ...props
}) => {
  const { playSound, isEnabled } = useSoundContext();
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && isEnabled && sound) {
      playSound(sound);
    }
    
    if (onClick) {
      onClick(e);
    }
  };
  
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && isEnabled && hoverSound) {
      playSound(hoverSound);
    }
    
    if (onMouseEnter) {
      onMouseEnter(e);
    }
  };
  
  return (
    <button
      className={cn(
        'transition-colors duration-200',
        disabled && 'opacity-60 cursor-not-allowed',
        className
      )}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      disabled={disabled}
      type="button" 
      {...props}
    >
      {children}
    </button>
  );
};

export default SoundButton;