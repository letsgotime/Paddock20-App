import React from 'react';
import { 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudFog, 
  CloudLightning, 
  Sun, 
  CloudSun,
  Wind,
  Droplets
} from 'lucide-react';

interface WeatherIconProps {
  iconCode: string;
  description?: string;
  size?: number;
  className?: string;
}

/**
 * Weather icon component that maps OpenWeatherMap icon codes to Lucide icons
 * See: https://openweathermap.org/weather-conditions
 */
const WeatherIcon: React.FC<WeatherIconProps> = ({ 
  iconCode, 
  description, 
  size = 24, 
  className = ""
}) => {
  // Map OpenWeatherMap icon codes to Lucide icons
  const getIconComponent = () => {
    // Extract the first two characters of the icon code (ignoring day/night indicator)
    const code = iconCode.substring(0, 2);
    
    switch (code) {
      case '01': // clear sky
        return <Sun size={size} className={className} />;
      case '02': // few clouds
        return <CloudSun size={size} className={className} />;
      case '03': // scattered clouds
      case '04': // broken clouds
        return <Cloud size={size} className={className} />;
      case '09': // shower rain
        return <CloudRain size={size} className={className} />;
      case '10': // rain
        return <CloudRain size={size} className={className} />;
      case '11': // thunderstorm
        return <CloudLightning size={size} className={className} />;
      case '13': // snow
        return <CloudSnow size={size} className={className} />;
      case '50': // mist, fog, etc.
        return <CloudFog size={size} className={className} />;
      default:
        // Default icon if code is not recognized
        return <Cloud size={size} className={className} />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {getIconComponent()}
      {description && <span className="text-xs mt-1 text-center">{description}</span>}
    </div>
  );
};

export default WeatherIcon;