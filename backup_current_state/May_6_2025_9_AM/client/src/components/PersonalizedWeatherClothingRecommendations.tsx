import React, { useState, useEffect } from 'react';
import { useWeather } from '../contexts/WeatherContext';
import { Sun, CloudRain, CloudSnow, Wind, Thermometer, Droplets, Shirt, ShieldCheck } from 'lucide-react';

const PersonalizedWeatherClothingRecommendations: React.FC = () => {
  const { weatherData, forecastData, unit } = useWeather();
  const [activityLevel, setActivityLevel] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [timePeriod, setTimePeriod] = useState<'current' | 'next6' | 'next12' | 'next24'>('current');
  const [clothingRecommendations, setClothingRecommendations] = useState<{
    topLayer: string;
    midLayer: string;
    baseLayer: string;
    accessories: string[];
    protection: string[];
    footwear: string;
    icon: React.ReactNode;
  } | null>(null);
  
  // Generate clothing recommendations based on weather conditions
  useEffect(() => {
    if (weatherData) {
      const recommendations = generateClothingRecommendations();
      setClothingRecommendations(recommendations);
    }
  }, [weatherData, timePeriod, activityLevel]);
  
  // Function to determine weather conditions for selected time period
  const getWeatherForTimePeriod = () => {
    // Current weather conditions
    if (timePeriod === 'current' || !forecastData) {
      if (!weatherData) return null;
      
      return {
        temp: weatherData.main.temp,
        feelsLike: weatherData.main.feels_like,
        weatherId: weatherData.weather[0].id,
        humidity: weatherData.main.humidity,
        windSpeed: weatherData.wind.speed,
        rain: weatherData.rain ? weatherData.rain['1h'] || 0 : 0,
        snow: weatherData.snow ? weatherData.snow['1h'] || 0 : 0,
        description: weatherData.weather[0].description
      };
    }
    
    // Future forecast conditions - get relevant forecast range
    let forecastRange: any[] = [];
    const now = new Date();
    let hoursAhead = 0;
    
    switch (timePeriod) {
      case 'next6':
        hoursAhead = 6;
        break;
      case 'next12':
        hoursAhead = 12;
        break;
      case 'next24':
        hoursAhead = 24;
        break;
    }
    
    const futureTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
    
    if (forecastData && forecastData.list && forecastData.list.length > 0) {
      forecastRange = forecastData.list.filter(item => {
        const itemTime = new Date(item.dt * 1000);
        return itemTime <= futureTime && itemTime >= now;
      });
    }
    
    if (forecastRange.length === 0 && forecastData?.list) {
      // If no forecast items found in range (can happen for short ranges),
      // just take the first available forecast
      forecastRange = [forecastData.list[0]];
    }
    
    // Calculate averages for the forecast range
    if (forecastRange.length > 0) {
      const avgTemp = forecastRange.reduce((sum, item) => sum + item.main.temp, 0) / forecastRange.length;
      const avgFeelsLike = forecastRange.reduce((sum, item) => sum + item.main.feels_like, 0) / forecastRange.length;
      const avgHumidity = forecastRange.reduce((sum, item) => sum + item.main.humidity, 0) / forecastRange.length;
      const avgWindSpeed = forecastRange.reduce((sum, item) => sum + item.wind.speed, 0) / forecastRange.length;
      
      // Find the most severe weather condition in the range
      const weatherIds = forecastRange.map(item => item.weather[0].id);
      const mostSevereWeatherId = weatherIds.sort((a, b) => {
        // Sort by severity (thunderstorms < rain/snow < drizzle < atmosphere < clouds < clear)
        if (a < 300 && b >= 300) return -1; // Thunderstorms most severe
        if (a >= 300 && a < 600 && b >= 600) return -1; // Rain more severe than snow
        if (a >= 300 && a < 600 && b >= 800) return -1; // Rain more severe than clouds/clear
        if (a >= 600 && a < 700 && b >= 800) return -1; // Snow more severe than clouds/clear
        if (a >= 700 && a < 800 && b >= 800) return -1; // Atmospheric more severe than clouds/clear
        return b - a; // Otherwise sort numerically
      })[0];
      
      // Find precipitation amounts (rain or snow)
      const rainValues = forecastRange.map(item => item.rain ? item.rain['3h'] || 0 : 0);
      const snowValues = forecastRange.map(item => item.snow ? item.snow['3h'] || 0 : 0);
      const maxRain = Math.max(...rainValues);
      const maxSnow = Math.max(...snowValues);
      
      // Get the description from the most severe weather
      const severeWeatherItem = forecastRange.find(item => item.weather[0].id === mostSevereWeatherId);
      const description = severeWeatherItem ? severeWeatherItem.weather[0].description : 'unknown';
      
      return {
        temp: avgTemp,
        feelsLike: avgFeelsLike,
        weatherId: mostSevereWeatherId,
        humidity: avgHumidity,
        windSpeed: avgWindSpeed,
        rain: maxRain,
        snow: maxSnow,
        description: description
      };
    }
    
    return null;
  };
  
  // Generate clothing recommendations based on current weather and user preferences
  const generateClothingRecommendations = () => {
    const conditions = getWeatherForTimePeriod();
    if (!conditions) return null;
    
    // Temperature adjustments based on activity level
    let adjustedTemp = conditions.feelsLike;
    switch (activityLevel) {
      case 'low':
        // No adjustment needed for low activity
        break;
      case 'moderate':
        // Moderate activity makes you feel warmer
        adjustedTemp += unit === 'imperial' ? 5 : 2.8;
        break;
      case 'high':
        // High activity makes you feel much warmer
        adjustedTemp += unit === 'imperial' ? 10 : 5.6;
        break;
    }
    
    // Base clothing recommendations based on temperature ranges
    let recommendations = {
      topLayer: '',
      midLayer: '',
      baseLayer: '',
      accessories: [] as string[],
      protection: [] as string[],
      footwear: '',
      icon: <Shirt className="h-5 w-5" />
    };
    
    // Temperature-based recommendations (using imperial units for logic, convert if needed)
    const tempF = unit === 'imperial' ? adjustedTemp : (adjustedTemp * 9/5) + 32;
    
    // Base and mid layers based on temperature
    if (tempF < 32) {
      recommendations.baseLayer = 'Thermal base layer';
      recommendations.midLayer = 'Heavy insulating layer';
      recommendations.topLayer = 'Insulated winter coat';
      recommendations.footwear = 'Insulated winter boots';
      recommendations.accessories.push('Warm hat', 'Insulated gloves');
      recommendations.icon = <CloudSnow className="h-5 w-5" />;
    } else if (tempF < 45) {
      recommendations.baseLayer = 'Light thermal layer';
      recommendations.midLayer = 'Fleece or wool sweater';
      recommendations.topLayer = 'Warm jacket';
      recommendations.footwear = 'Closed shoes or boots';
      recommendations.accessories.push('Light hat', 'Gloves');
      recommendations.icon = <Thermometer className="h-5 w-5" />;
    } else if (tempF < 60) {
      recommendations.baseLayer = 'Long sleeve shirt';
      recommendations.midLayer = 'Light sweater or hoodie';
      recommendations.topLayer = 'Light jacket or vest';
      recommendations.footwear = 'Comfortable closed shoes';
      recommendations.icon = <Shirt className="h-5 w-5" />;
    } else if (tempF < 75) {
      recommendations.baseLayer = 'T-shirt or light shirt';
      recommendations.midLayer = 'Optional light cardigan or long sleeve';
      recommendations.topLayer = 'None or light jacket for evening';
      recommendations.footwear = 'Sneakers or casual shoes';
      recommendations.icon = <Sun className="h-5 w-5" />;
    } else {
      recommendations.baseLayer = 'Light breathable t-shirt';
      recommendations.midLayer = 'None';
      recommendations.topLayer = 'None';
      recommendations.footwear = 'Breathable shoes or sandals';
      recommendations.accessories.push('Hat with brim');
      recommendations.protection.push('Sunscreen');
      recommendations.icon = <Sun className="h-5 w-5" />;
    }
    
    // Weather condition specific adjustments
    const weatherId = conditions.weatherId;
    
    // Rain protection
    if ((weatherId >= 300 && weatherId < 600) || conditions.rain > 0) {
      recommendations.topLayer = 'Waterproof jacket';
      recommendations.protection.push('Umbrella');
      
      if (conditions.rain > 2.5) { // Heavy rain
        recommendations.footwear = 'Waterproof boots';
        recommendations.protection.push('Rain pants');
      }
      
      if (!recommendations.accessories.includes('Hat with brim')) {
        recommendations.accessories.push('Waterproof hat');
      }
      
      recommendations.icon = <CloudRain className="h-5 w-5" />;
    }
    
    // Snow protection
    if ((weatherId >= 600 && weatherId < 700) || conditions.snow > 0) {
      recommendations.topLayer = 'Insulated waterproof jacket';
      recommendations.footwear = 'Waterproof winter boots';
      recommendations.accessories.push('Warm hat', 'Insulated gloves', 'Scarf');
      recommendations.protection.push('Extra socks');
      recommendations.icon = <CloudSnow className="h-5 w-5" />;
    }
    
    // Wind protection
    if (conditions.windSpeed > (unit === 'imperial' ? 15 : 24)) {
      recommendations.protection.push('Windproof outer layer');
      
      if (!recommendations.accessories.includes('Hat with brim') && 
          !recommendations.accessories.includes('Warm hat') &&
          !recommendations.accessories.includes('Waterproof hat')) {
        recommendations.accessories.push('Wind-resistant hat');
      }
      
      recommendations.icon = <Wind className="h-5 w-5" />;
    }
    
    // Humidity adjustments
    if (conditions.humidity > 80 && tempF > 75) {
      recommendations.baseLayer = 'Moisture-wicking t-shirt';
      recommendations.protection.push('Antiperspirant');
      recommendations.icon = <Droplets className="h-5 w-5" />;
    }
    
    // Sun protection
    if ((weatherId >= 800) && tempF > 75) {
      recommendations.protection.push('Sunscreen', 'Sunglasses');
      if (!recommendations.accessories.includes('Hat with brim')) {
        recommendations.accessories.push('Hat with brim');
      }
      recommendations.icon = <Sun className="h-5 w-5" />;
    }
    
    return recommendations;
  };
  
  // Get time period display text
  const getTimePeriodText = () => {
    switch (timePeriod) {
      case 'current':
        return 'Current conditions';
      case 'next6':
        return 'Next 6 hours';
      case 'next12':
        return 'Next 12 hours';
      case 'next24':
        return 'Next 24 hours';
      default:
        return 'Current conditions';
    }
  };
  
  // Get activity level display text
  const getActivityLevelText = () => {
    switch (activityLevel) {
      case 'low':
        return 'Low activity (casual walking, sitting outside)';
      case 'moderate':
        return 'Moderate activity (brisk walking, light work)';
      case 'high':
        return 'High activity (running, sports, physical work)';
      default:
        return 'Moderate activity';
    }
  };
  
  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg overflow-hidden">
      <div className="bg-blue-900/20 px-4 py-2 flex justify-between items-center">
        <h3 className="text-blue-400 font-semibold flex items-center">
          <Shirt className="h-4 w-4 mr-2" />
          <span>Weather Clothing Recommendations</span>
        </h3>
        <span className="text-xs text-gray-400">Personalized comfort</span>
      </div>
      
      <div className="p-4">
        {/* User Preferences Controls */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-3 md:space-y-0 mb-5">
          <div className="w-full md:w-auto">
            <label className="block text-xs text-gray-400 mb-1">Time Period</label>
            <div className="inline-flex bg-black/40 border border-gray-800 rounded-md overflow-hidden">
              <button 
                className={`px-2 py-1 text-xs ${timePeriod === 'current' ? 'bg-blue-900/30 text-blue-400' : 'text-gray-400'}`}
                onClick={() => setTimePeriod('current')}
              >
                Current
              </button>
              <button 
                className={`px-2 py-1 text-xs ${timePeriod === 'next6' ? 'bg-blue-900/30 text-blue-400' : 'text-gray-400'}`}
                onClick={() => setTimePeriod('next6')}
              >
                Next 6h
              </button>
              <button 
                className={`px-2 py-1 text-xs ${timePeriod === 'next12' ? 'bg-blue-900/30 text-blue-400' : 'text-gray-400'}`}
                onClick={() => setTimePeriod('next12')}
              >
                Next 12h
              </button>
              <button 
                className={`px-2 py-1 text-xs ${timePeriod === 'next24' ? 'bg-blue-900/30 text-blue-400' : 'text-gray-400'}`}
                onClick={() => setTimePeriod('next24')}
              >
                Next 24h
              </button>
            </div>
          </div>
          
          <div className="w-full md:w-auto">
            <label className="block text-xs text-gray-400 mb-1">Activity Level</label>
            <div className="inline-flex bg-black/40 border border-gray-800 rounded-md overflow-hidden">
              <button 
                className={`px-3 py-1 text-xs ${activityLevel === 'low' ? 'bg-blue-900/30 text-blue-400' : 'text-gray-400'}`}
                onClick={() => setActivityLevel('low')}
              >
                Low
              </button>
              <button 
                className={`px-3 py-1 text-xs ${activityLevel === 'moderate' ? 'bg-blue-900/30 text-blue-400' : 'text-gray-400'}`}
                onClick={() => setActivityLevel('moderate')}
              >
                Moderate
              </button>
              <button 
                className={`px-3 py-1 text-xs ${activityLevel === 'high' ? 'bg-blue-900/30 text-blue-400' : 'text-gray-400'}`}
                onClick={() => setActivityLevel('high')}
              >
                High
              </button>
            </div>
          </div>
        </div>
        
        {/* Weather Context */}
        <div className="mb-4 p-3 bg-blue-900/10 rounded-lg border border-blue-900/30 text-sm text-gray-300">
          <p>
            <strong className="text-blue-400">{getTimePeriodText()}</strong>: Recommendations for {getActivityLevelText()}.
          </p>
          {weatherData && weatherData.weather && (
            <p className="text-xs mt-1">
              Base conditions: {Math.round(weatherData.main.temp)}°{unit === 'imperial' ? 'F' : 'C'}, {weatherData.weather[0].description}
            </p>
          )}
        </div>
        
        {/* Clothing Recommendations */}
        {clothingRecommendations ? (
          <div className="animate-fadein">
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400 mr-3">
                {clothingRecommendations.icon}
              </div>
              <p className="text-white">Personalized clothing recommendations based on the forecast</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Layers */}
              <div className="bg-black/30 p-3 rounded-lg border border-gray-800">
                <h4 className="text-blue-400 text-sm font-semibold mb-2">Recommended Layers</h4>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <span className="w-4 h-4 mr-2 flex-shrink-0 rounded-full bg-blue-900/30 flex items-center justify-center text-xs text-blue-400">1</span>
                    <span className="text-gray-300">Base: {clothingRecommendations.baseLayer}</span>
                  </li>
                  {clothingRecommendations.midLayer && (
                    <li className="flex items-center text-sm">
                      <span className="w-4 h-4 mr-2 flex-shrink-0 rounded-full bg-blue-900/30 flex items-center justify-center text-xs text-blue-400">2</span>
                      <span className="text-gray-300">Mid: {clothingRecommendations.midLayer}</span>
                    </li>
                  )}
                  {clothingRecommendations.topLayer && (
                    <li className="flex items-center text-sm">
                      <span className="w-4 h-4 mr-2 flex-shrink-0 rounded-full bg-blue-900/30 flex items-center justify-center text-xs text-blue-400">3</span>
                      <span className="text-gray-300">Outer: {clothingRecommendations.topLayer}</span>
                    </li>
                  )}
                  <li className="flex items-center text-sm">
                    <span className="w-4 h-4 mr-2 flex-shrink-0 rounded-full bg-blue-900/30 flex items-center justify-center text-xs text-blue-400">F</span>
                    <span className="text-gray-300">Feet: {clothingRecommendations.footwear}</span>
                  </li>
                </ul>
              </div>
              
              {/* Accessories & Protection */}
              <div className="bg-black/30 p-3 rounded-lg border border-gray-800">
                <h4 className="text-blue-400 text-sm font-semibold mb-2">Accessories & Protection</h4>
                {clothingRecommendations.accessories.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs text-gray-400">Accessories:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {clothingRecommendations.accessories.map((item, index) => (
                        <span 
                          key={index} 
                          className="px-2 py-0.5 text-xs bg-blue-900/20 text-blue-300 rounded-full"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {clothingRecommendations.protection.length > 0 && (
                  <div>
                    <span className="text-xs text-gray-400">Protection:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {clothingRecommendations.protection.map((item, index) => (
                        <span 
                          key={index} 
                          className="flex items-center px-2 py-0.5 text-xs bg-blue-900/20 text-blue-300 rounded-full"
                        >
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Comfort Tips */}
            <div className="text-xs text-gray-400 mt-3 p-2 border-t border-gray-800">
              <p className="mb-1">Comfort Tips:</p>
              <ul className="space-y-1">
                <li>• Layering allows for adjustment as conditions change throughout your journey.</li>
                <li>• Weather can vary - check forecasts before departure.</li>
                <li>• Keep a lightweight waterproof layer handy for unexpected showers.</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 text-gray-400">
            <p>Loading clothing recommendations...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalizedWeatherClothingRecommendations;