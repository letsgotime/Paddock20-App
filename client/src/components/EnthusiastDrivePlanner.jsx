import React, { useState, useEffect } from 'react';
import { useWeather } from '../contexts/WeatherContext';
import { extractWeatherAlerts } from '../services/openWeatherService';

function EnthusiastDrivePlanner({ weatherData, savedLocations = [] }) {
  const [activeTab, setActiveTab] = useState('weekend');
  const [selectedDay, setSelectedDay] = useState(0);
  const [weatherAlerts, setWeatherAlerts] = useState(null);
  const { isMetric } = useWeather();
  
  useEffect(() => {
    if (weatherData) {
      try {
        const alerts = extractWeatherAlerts(weatherData);
        setWeatherAlerts(alerts);
      } catch (error) {
        console.error("Error extracting weather alerts:", error);
      }
    }
  }, [weatherData]);
  
  // Get upcoming weekend days
  const getWeekendDays = () => {
    const days = [];
    const today = new Date();
    let currentDay = new Date();
    
    // Find the next 3 weekend days (Saturday or Sunday)
    while (days.length < 3) {
      const dayOfWeek = currentDay.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) { // 0 = Sunday, 6 = Saturday
        days.push({
          date: new Date(currentDay),
          dayName: currentDay.toLocaleDateString('en-US', { weekday: 'long' }),
          dateFull: currentDay.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
          })
        });
      }
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };
  
  // Get upcoming work week days (Monday-Friday)
  const getWorkDays = () => {
    const days = [];
    const today = new Date();
    let currentDay = new Date();
    
    // Start with today
    days.push({
      date: new Date(currentDay),
      dayName: 'Today',
      dateFull: currentDay.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      })
    });
    
    // Add next 4 weekdays
    currentDay.setDate(currentDay.getDate() + 1);
    let added = 0;
    
    while (added < 4) {
      const dayOfWeek = currentDay.getDay();
      if (dayOfWeek > 0 && dayOfWeek < 6) { // 1-5 = Monday-Friday
        days.push({
          date: new Date(currentDay),
          dayName: currentDay.toLocaleDateString('en-US', { weekday: 'long' }),
          dateFull: currentDay.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
          })
        });
        added++;
      }
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };
  
  // Get daily forecast from weather data
  const getDailyForecast = (date) => {
    if (!weatherData || !weatherData.daily) return null;
    
    // Format both dates to YYYY-MM-DD for comparison
    const targetDate = new Date(date).toISOString().split('T')[0];
    
    // Find the forecast for the given date
    const forecast = weatherData.daily.find(day => {
      const forecastDate = new Date(day.dt * 1000).toISOString().split('T')[0];
      return forecastDate === targetDate;
    });
    
    return forecast;
  };
  
  // Get route recommendations based on forecast
  const getRouteRecommendations = (forecast) => {
    if (!forecast) return [];
    
    const recommendations = [];
    
    // Check weather conditions
    const mainWeather = forecast.weather[0].main.toLowerCase();
    const description = forecast.weather[0].description.toLowerCase();
    
    // Analyze forecast for different driving scenarios
    if (activeTab === 'weekend') {
      // Weekend fun driving recommendations
      if (mainWeather.includes('clear') || mainWeather.includes('sun')) {
        recommendations.push({
          type: 'great',
          title: 'Perfect Driving Day!',
          description: 'Clear skies and good visibility make this an excellent day for a spirited drive. Bring sunglasses!'
        });
        
        // Mountain roads recommendation
        if (forecast.temp.max > 65 && forecast.temp.max < 85) {
          recommendations.push({
            type: 'recommended',
            title: 'Mountain Roads',
            description: 'Ideal temperatures for tackling mountain passes and enjoying scenic views.'
          });
        }
        
        // Coastal drive recommendation
        if (forecast.wind_speed < 15) {
          recommendations.push({
            type: 'recommended',
            title: 'Coastal Routes',
            description: 'Low winds make coastal driving pleasant with great visibility for ocean views.'
          });
        }
      } 
      else if (mainWeather.includes('cloud') && !mainWeather.includes('rain')) {
        recommendations.push({
          type: 'good',
          title: 'Good Driving Day',
          description: 'Overcast conditions offer even lighting and comfortable temperatures for driving.'
        });
        
        // Photography recommendation
        recommendations.push({
          type: 'recommended',
          title: 'Car Photography',
          description: 'Diffused lighting from cloud cover creates ideal conditions for car photography stops.'
        });
      }
      else if (mainWeather.includes('rain') || mainWeather.includes('drizzle')) {
        if (forecast.pop < 0.4 || forecast.rain < 1) {
          recommendations.push({
            type: 'moderate',
            title: 'Light Rain Expected',
            description: 'Minor precipitation may create slick roads. Great opportunity to practice wet-weather driving skills.'
          });
        } else {
          recommendations.push({
            type: 'challenging',
            title: 'Significant Rain Expected',
            description: 'Heavy rain will reduce visibility and grip. Consider a rain-check or plan indoor activities.'
          });
        }
      }
      else if (mainWeather.includes('snow')) {
        if (forecast.snow < 1) {
          recommendations.push({
            type: 'challenging',
            title: 'Light Snow Conditions',
            description: 'Snow may create slippery conditions. If driving, stick to well-maintained roads and reduce speed.'
          });
        } else {
          recommendations.push({
            type: 'not_recommended',
            title: 'Heavy Snow Expected',
            description: 'Significant snowfall will make driving hazardous. Best to save your drive for another day or seek plowed routes only.'
          });
        }
      }
      
      // Temperature-based recommendations
      if (forecast.temp.max > 90) {
        recommendations.push({
          type: 'caution',
          title: 'High-Temperature Alert',
          description: 'Very hot conditions may affect vehicle cooling systems. Monitor temperatures and plan for shade stops.'
        });
      } else if (forecast.temp.max < 32) {
        recommendations.push({
          type: 'caution',
          title: 'Freezing Conditions',
          description: 'Temperatures below freezing may affect tire grip and fluid viscosity. Allow for extended warm-up time.'
        });
      }
      
      // Wind considerations
      if (forecast.wind_speed > 20) {
        recommendations.push({
          type: 'caution',
          title: 'High Wind Alert',
          description: 'Strong winds may affect vehicle stability, especially on exposed roads and bridges.'
        });
      }
    } else {
      // Workweek commuting recommendations
      if (mainWeather.includes('clear') || mainWeather.includes('sun') || 
          (mainWeather.includes('cloud') && !mainWeather.includes('rain'))) {
        recommendations.push({
          type: 'great',
          title: 'Smooth Commute Expected',
          description: 'Good weather conditions should provide a routine commute with no weather-related delays.'
        });
      }
      else if (mainWeather.includes('rain') || mainWeather.includes('drizzle')) {
        if (forecast.pop > 0.5 && (forecast.rain > 3 || forecast.snow > 3)) {
          recommendations.push({
            type: 'challenging',
            title: 'Heavy Rain - Expect Delays',
            description: 'Significant rain will likely slow traffic. Consider leaving earlier than usual.'
          });
        } else {
          recommendations.push({
            type: 'moderate',
            title: 'Light Rain - Minor Delays',
            description: 'Some precipitation may create slightly longer commute times. Allow a few extra minutes.'
          });
        }
      }
      else if (mainWeather.includes('snow') || description.includes('ice')) {
        recommendations.push({
          type: 'challenging',
          title: 'Snow/Ice Conditions - Major Delays Likely',
          description: 'Winter conditions will significantly impact commute times. Consider remote work if possible or allow substantial extra time.'
        });
      }
      else if (mainWeather.includes('fog') || mainWeather.includes('mist')) {
        recommendations.push({
          type: 'caution',
          title: 'Reduced Visibility Conditions',
          description: 'Fog or mist will reduce visibility. Use proper lighting and increase following distance.'
        });
      }
      
      // Rush hour adjustment based on forecast
      const rushHourImpact = mainWeather.includes('rain') || mainWeather.includes('snow') || mainWeather.includes('fog');
      
      if (rushHourImpact) {
        // Calculate adjusted time based on weather severity
        let additionalMinutes = 10; // Base additional time
        
        if (mainWeather.includes('snow') || forecast.pop > 0.7) {
          additionalMinutes = 25;
        } else if (mainWeather.includes('rain') && forecast.pop > 0.5) {
          additionalMinutes = 15;
        }
        
        recommendations.push({
          type: 'plan',
          title: 'Rush Hour Planning',
          description: `Weather conditions may extend rush hour delays. Consider adjusting departure time by approximately ${additionalMinutes} minutes.`
        });
      }
      
      // Alternative routes recommendation if saved locations exist
      if (savedLocations.length > 1) {
        recommendations.push({
          type: 'plan',
          title: 'Route Optimization',
          description: 'Check your selected routes in the Drive Time Analysis panel for weather-specific traffic estimates.'
        });
      }
    }
    
    // Common recommendations for all modes
    if (forecast.uvi > 7) {
      recommendations.push({
        type: 'note',
        title: 'High UV Index',
        description: 'Strong UV radiation. Consider window tinting check and use sunscreen for convertibles.'
      });
    }
    
    return recommendations;
  };
  
  // Get icon for recommendation type
  const getRecommendationIcon = (type) => {
    switch(type) {
      case 'great': return '🏆';
      case 'good': return '👍';
      case 'moderate': return '👌';
      case 'challenging': return '⚠️';
      case 'not_recommended': return '❌';
      case 'caution': return '🚧';
      case 'recommended': return '🌟';
      case 'plan': return '🗓️';
      case 'note': return 'ℹ️';
      default: return '•';
    }
  };
  
  // Get color for recommendation type
  const getRecommendationColor = (type) => {
    switch(type) {
      case 'great': return 'text-green-500';
      case 'good': return 'text-green-400';
      case 'moderate': return 'text-blue-400';
      case 'challenging': return 'text-yellow-500';
      case 'not_recommended': return 'text-red-500';
      case 'caution': return 'text-amber-500';
      case 'recommended': return 'text-purple-400';
      case 'plan': return 'text-indigo-400';
      case 'note': return 'text-gray-400';
      default: return 'text-gray-300';
    }
  };
  
  // Get weekend or work days based on active tab
  const daysToShow = activeTab === 'weekend' ? getWeekendDays() : getWorkDays();
  
  // Get forecast for selected day
  const selectedDayData = daysToShow[selectedDay];
  const forecast = getDailyForecast(selectedDayData?.date);
  
  // Get recommendations based on forecast
  const recommendations = getRouteRecommendations(forecast);
  
  return (
    <div className="bg-gray-800/80 rounded-lg border border-gray-700 p-4">
      <h3 className="text-sm font-semibold text-gray-300 flex items-center mb-3">
        <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
        DRIVE PLANNER
      </h3>
      
      {/* Tab Navigation */}
      <div className="flex mb-4">
        <button 
          className={`flex-1 py-2 text-xs font-medium rounded-l-md ${
            activeTab === 'weekend' 
              ? 'bg-green-900/30 text-green-400 border border-green-900/40' 
              : 'bg-gray-900/60 text-gray-400 border border-gray-700 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('weekend')}
        >
          Weekend Fun
        </button>
        <button 
          className={`flex-1 py-2 text-xs font-medium rounded-r-md ${
            activeTab === 'work' 
              ? 'bg-blue-900/30 text-blue-400 border border-blue-900/40' 
              : 'bg-gray-900/60 text-gray-400 border border-gray-700 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('work')}
        >
          Work Commute
        </button>
      </div>
      
      {/* Day Selection */}
      <div className="flex space-x-2 mb-4 overflow-x-auto">
        {daysToShow.map((day, index) => (
          <button
            key={index}
            className={`flex-shrink-0 py-2 px-3 rounded-md text-xs ${
              selectedDay === index
                ? activeTab === 'weekend' 
                  ? 'bg-green-900/30 text-green-400 border border-green-900/50' 
                  : 'bg-blue-900/30 text-blue-400 border border-blue-900/50'
                : 'bg-gray-900/60 text-gray-400 border border-gray-700 hover:text-gray-300'
            }`}
            onClick={() => setSelectedDay(index)}
          >
            {day.dayName}
          </button>
        ))}
      </div>
      
      {/* Selected Day Details */}
      {forecast ? (
        <div className="bg-gray-900/60 rounded-md p-3 mb-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="text-sm font-medium">{selectedDayData.dateFull}</div>
              <div className="text-xs text-gray-400 capitalize">{forecast.weather[0].description}</div>
            </div>
            <div className="text-right">
              <div className="text-sm">
                {Math.round(forecast.temp.max)}° / {Math.round(forecast.temp.min)}°{isMetric ? 'C' : 'F'}
              </div>
              <div className="text-xs text-gray-400">
                {forecast.wind_speed} {isMetric ? 'km/h' : 'mph'} wind
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-2 mb-3">
            <div className="bg-gray-800/80 p-2 rounded text-center">
              <div className="text-2xl">{forecast.weather[0].main === "Clear" ? "☀️" :
                 forecast.weather[0].main === "Clouds" ? "☁️" :
                 forecast.weather[0].main === "Rain" ? "🌧️" :
                 forecast.weather[0].main === "Snow" ? "❄️" :
                 forecast.weather[0].main === "Thunderstorm" ? "⚡" :
                 forecast.weather[0].main === "Drizzle" ? "🌦️" :
                 forecast.weather[0].main === "Fog" || 
                 forecast.weather[0].main === "Mist" ? "🌫️" : "🌤️"}
               </div>
              <div className="text-xs text-gray-400">Conditions</div>
            </div>
            <div className="bg-gray-800/80 p-2 rounded text-center">
              <div className="text-lg font-medium">{Math.round(forecast.pop * 100)}%</div>
              <div className="text-xs text-gray-400">Precip. Chance</div>
            </div>
            <div className="bg-gray-800/80 p-2 rounded text-center">
              <div className="text-lg font-medium">{forecast.uvi.toFixed(1)}</div>
              <div className="text-xs text-gray-400">UV Index</div>
            </div>
            <div className="bg-gray-800/80 p-2 rounded text-center">
              <div className="text-lg font-medium">{forecast.humidity}%</div>
              <div className="text-xs text-gray-400">Humidity</div>
            </div>
          </div>
          
          {/* Weather-specific alerts */}
          {weatherAlerts?.has_alerts && (
            <div className="bg-red-900/20 border border-red-900/30 rounded-md p-2 mb-3 text-xs">
              <div className="text-red-400 font-semibold">WEATHER ALERTS IN EFFECT:</div>
              <div className="mt-1 text-gray-300">
                {weatherAlerts.alerts.map((alert, index) => (
                  <div key={index} className="mb-1 last:mb-0">
                    <span className="text-red-400 font-medium">{alert.event}: </span>
                    <span>{alert.description.slice(0, 100)}...</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-900/60 rounded-md p-4 mb-4 text-center text-gray-400 text-sm">
          No detailed forecast available for this date
        </div>
      )}
      
      {/* Drive Recommendations */}
      <div>
        <h4 className="text-xs font-medium text-gray-400 mb-2">
          {activeTab === 'weekend' ? 'ENTHUSIAST DRIVE RECOMMENDATIONS' : 'COMMUTE RECOMMENDATIONS'}
        </h4>
        
        {recommendations.length > 0 ? (
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div 
                key={index} 
                className={`p-2 rounded-md border ${
                  rec.type === 'great' || rec.type === 'good' ? 'border-green-900/30 bg-green-900/10' :
                  rec.type === 'moderate' ? 'border-blue-900/30 bg-blue-900/10' :
                  rec.type === 'challenging' ? 'border-yellow-900/30 bg-yellow-900/10' :
                  rec.type === 'not_recommended' ? 'border-red-900/30 bg-red-900/10' :
                  rec.type === 'caution' ? 'border-amber-900/30 bg-amber-900/10' :
                  rec.type === 'recommended' ? 'border-purple-900/30 bg-purple-900/10' :
                  rec.type === 'plan' ? 'border-indigo-900/30 bg-indigo-900/10' :
                  'border-gray-800 bg-gray-900/50'
                }`}
              >
                <div className="flex items-start">
                  <div className="text-xl mr-2 mt-0.5">
                    {getRecommendationIcon(rec.type)}
                  </div>
                  <div>
                    <div className={`text-sm font-medium ${getRecommendationColor(rec.type)}`}>
                      {rec.title}
                    </div>
                    <div className="text-xs text-gray-300 mt-0.5">
                      {rec.description}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-900/60 p-3 rounded-md text-center text-gray-400 text-sm">
            No specific recommendations available
          </div>
        )}
        
        {/* F1-inspired recommendations footer */}
        <div className="mt-4 bg-gray-900/60 rounded-md p-3 text-xs">
          <div className={`font-semibold mb-1 ${activeTab === 'weekend' ? 'text-green-400' : 'text-blue-400'}`}>
            {activeTab === 'weekend' 
              ? 'PADDOCK20 TRACK ASSESSMENT'
              : 'PADDOCK20 COMMUTE EFFICIENCY'
            }
          </div>
          <div className="text-gray-300">
            {activeTab === 'weekend' 
              ? forecast 
                ? forecast.weather[0].main === 'Clear' || forecast.weather[0].main === 'Clouds' && forecast.pop < 0.3
                  ? "Perfect conditions for spirited driving. Optimal grip levels expected with excellent visibility. Take advantage of these prime conditions for peak performance."
                  : forecast.weather[0].main === 'Rain' || forecast.pop > 0.5
                  ? "Wet conditions will demand precise inputs and careful weight transfer. Approach corners with extra caution and expect reduced grip at turn-in."
                  : "Mixed conditions possible. Be prepared for varying grip levels across different road segments. Maintain focus on consistent inputs."
                : "Insufficient data for a comprehensive track assessment."
              : forecast
                ? forecast.weather[0].main === 'Clear' || forecast.weather[0].main === 'Clouds' && forecast.pop < 0.3
                  ? "Standard commute protocols recommended. No weather-related delays expected. Maintain normal cruise with standard following distances."
                  : forecast.weather[0].main === 'Rain' || forecast.pop > 0.5
                  ? "Wet commute protocols advised. Increase following distance by 50% and anticipate 15-25% longer travel times during peak hours."
                  : "Variable conditions possible. Monitor in-car systems for real-time traffic and weather updates. Be prepared for changing conditions."
                : "Insufficient data for a comprehensive commute assessment."
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnthusiastDrivePlanner;