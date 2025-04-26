import React, { useEffect, useState } from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import { 
  AlertCircle, 
  ThermometerSun, 
  Droplets, 
  Wind, 
  CloudLightning
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface WeatherAlert {
  id: string;
  type: 'extreme-temp' | 'heavy-rain' | 'strong-wind' | 'storm' | 'general';
  title: string;
  description: string;
  icon: React.ReactNode;
  severity: 'low' | 'medium' | 'high';
}

const WeatherAlerts: React.FC = () => {
  const { weatherData, forecastData } = useWeather();
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);

  // Generate alerts based on current weather and forecast data
  useEffect(() => {
    if (!weatherData || !forecastData) return;

    const newAlerts: WeatherAlert[] = [];
    
    // Check for extreme temperatures
    if (weatherData.main.temp > 35) { // Hot temperature alert (in C)
      newAlerts.push({
        id: 'extreme-heat-' + Date.now(),
        type: 'extreme-temp',
        title: 'Extreme Heat Warning',
        description: `High temperature of ${Math.round(weatherData.main.temp)}°C detected. Stay hydrated and avoid prolonged sun exposure.`,
        icon: <ThermometerSun className="h-5 w-5" />,
        severity: 'high'
      });
    } else if (weatherData.main.temp < 0) { // Cold temperature alert (in C)
      newAlerts.push({
        id: 'extreme-cold-' + Date.now(),
        type: 'extreme-temp',
        title: 'Freezing Temperature Alert',
        description: `Temperature below freezing: ${Math.round(weatherData.main.temp)}°C. Watch for ice and dress warmly.`,
        icon: <ThermometerSun className="h-5 w-5" />,
        severity: 'medium'
      });
    }
    
    // Check for heavy rain
    if (weatherData.rain && weatherData.rain['1h'] && weatherData.rain['1h'] > 10) {
      newAlerts.push({
        id: 'heavy-rain-' + Date.now(),
        type: 'heavy-rain',
        title: 'Heavy Rain Alert',
        description: `Heavy rainfall detected: ${weatherData.rain['1h']}mm in the last hour. Possible flooding in low-lying areas.`,
        icon: <Droplets className="h-5 w-5" />,
        severity: 'medium'
      });
    }
    
    // Check for strong winds
    if (weatherData.wind.speed > 10) { // Strong wind in m/s
      newAlerts.push({
        id: 'strong-wind-' + Date.now(),
        type: 'strong-wind',
        title: 'Strong Wind Advisory',
        description: `Strong winds of ${weatherData.wind.speed} m/s detected. Secure loose objects outdoors.`,
        icon: <Wind className="h-5 w-5" />,
        severity: 'medium'
      });
    }
    
    // Check for thunderstorms
    const hasThunderstorm = weatherData.weather.some(w => w.id >= 200 && w.id < 300);
    if (hasThunderstorm) {
      newAlerts.push({
        id: 'thunderstorm-' + Date.now(),
        type: 'storm',
        title: 'Thunderstorm Warning',
        description: 'Thunderstorms in your area. Seek shelter indoors and avoid open areas.',
        icon: <CloudLightning className="h-5 w-5" />,
        severity: 'high'
      });
    }
    
    // Check upcoming forecast for severe weather
    let stormInForecast = false;
    let heavyRainInForecast = false;
    
    // Check next 24 hours (8 entries in 3-hour forecast)
    forecastData.list.slice(0, 8).forEach(item => {
      const hasStorm = item.weather.some(w => w.id >= 200 && w.id < 300);
      const hasHeavyRain = item.weather.some(w => w.id >= 500 && w.id < 600) && 
                          item.rain && item.rain['3h'] && item.rain['3h'] > 10;
      
      if (hasStorm) stormInForecast = true;
      if (hasHeavyRain) heavyRainInForecast = true;
    });
    
    if (stormInForecast && !hasThunderstorm) { // Only add if not already alerted for current storm
      newAlerts.push({
        id: 'upcoming-storm-' + Date.now(),
        type: 'storm',
        title: 'Upcoming Storm Alert',
        description: 'Thunderstorms forecasted in the next 24 hours. Plan accordingly.',
        icon: <CloudLightning className="h-5 w-5" />,
        severity: 'medium'
      });
    }
    
    if (heavyRainInForecast && (!weatherData.rain || !weatherData.rain['1h'] || weatherData.rain['1h'] < 10)) {
      newAlerts.push({
        id: 'upcoming-rain-' + Date.now(),
        type: 'heavy-rain',
        title: 'Heavy Rain Forecast',
        description: 'Heavy rainfall expected in the next 24 hours. Be prepared for wet conditions.',
        icon: <Droplets className="h-5 w-5" />,
        severity: 'low'
      });
    }
    
    setAlerts(newAlerts);
  }, [weatherData, forecastData]);

  if (alerts.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4 flex items-center">
        <AlertCircle className="mr-2 h-6 w-6 text-amber-500" />
        Weather Alerts
      </h2>
      <div className="space-y-3">
        {alerts.map(alert => (
          <Alert 
            key={alert.id} 
            variant={
              alert.severity === 'high' ? 'destructive' : 
              alert.severity === 'medium' ? 'default' : 
              'outline'
            }
            className={
              alert.severity === 'high' ? 'bg-red-900/20 border-red-800' : 
              alert.severity === 'medium' ? 'bg-amber-900/20 border-amber-800' : 
              'bg-blue-900/20 border-blue-800'
            }
          >
            <div className="flex items-start">
              <div className="mr-2 mt-0.5">
                {alert.icon}
              </div>
              <div>
                <AlertTitle className="font-semibold">
                  {alert.title}
                </AlertTitle>
                <AlertDescription>
                  {alert.description}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        ))}
      </div>
    </div>
  );
};

export default WeatherAlerts;