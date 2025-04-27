import React, { useState, useEffect } from 'react';

/**
 * DrivingConditionEmoji Component
 * 
 * Analyzes weather data to assess driving conditions and provide
 * safety recommendations with accessible emoji representation.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.weatherData - Weather data object
 */
function DrivingConditionEmoji({ weatherData }) {
  const [condition, setCondition] = useState({
    score: 10,
    emoji: '🚗',
    color: 'text-green-500',
    recommendation: 'Excellent driving conditions.',
    ariaLabel: 'Excellent driving conditions'
  });

  useEffect(() => {
    if (!weatherData) return;

    // Calculate driving condition score (10 = best, 1 = worst)
    let score = 10;
    let factors = [];
    
    // Rain impact (heavier rain = worse conditions)
    if (weatherData.rain) {
      const rainVolume = weatherData.rain['1h'] || 0;
      if (rainVolume > 5) {
        score -= 4;
        factors.push('Heavy rain');
      } else if (rainVolume > 1) {
        score -= 2;
        factors.push('Moderate rain');
      } else if (rainVolume > 0) {
        score -= 1;
        factors.push('Light rain');
      }
    }
    
    // Snow impact (any snow significantly affects driving)
    if (weatherData.snow) {
      const snowVolume = weatherData.snow['1h'] || 0;
      if (snowVolume > 3) {
        score -= 5;
        factors.push('Heavy snow');
      } else if (snowVolume > 0.5) {
        score -= 3;
        factors.push('Moderate snow');
      } else if (snowVolume > 0) {
        score -= 2;
        factors.push('Light snow');
      }
    }
    
    // Wind impact (higher wind = worse conditions)
    if (weatherData.wind && weatherData.wind.speed) {
      if (weatherData.wind.speed > 30) {
        score -= 4;
        factors.push('Strong winds');
      } else if (weatherData.wind.speed > 15) {
        score -= 2;
        factors.push('Moderate winds');
      }
    }
    
    // Visibility impact
    if (weatherData.visibility) {
      const visibilityKm = weatherData.visibility / 1000;
      if (visibilityKm < 1) {
        score -= 5;
        factors.push('Very poor visibility');
      } else if (visibilityKm < 5) {
        score -= 3;
        factors.push('Reduced visibility');
      }
    }
    
    // Temperature impact (extreme temps can affect vehicle/road conditions)
    if (weatherData.main && weatherData.main.temp) {
      if (weatherData.main.temp < 32) {
        score -= 2;
        factors.push('Freezing temperatures');
      } else if (weatherData.main.temp > 95) {
        score -= 1;
        factors.push('Extreme heat');
      }
    }

    // Weather condition impact
    if (weatherData.weather && weatherData.weather.length > 0) {
      const mainCondition = weatherData.weather[0].main.toLowerCase();
      
      if (mainCondition.includes('thunderstorm')) {
        score -= 3;
        factors.push('Thunderstorms');
      } else if (mainCondition.includes('fog') || mainCondition.includes('mist')) {
        score -= 3;
        factors.push('Foggy conditions');
      } else if (mainCondition.includes('sand') || mainCondition.includes('dust')) {
        score -= 4;
        factors.push('Dust or sand storm');
      }
    }
    
    // Ensure score remains in range 1-10
    score = Math.max(1, Math.min(10, score));
    
    // Set appropriate emoji, color and recommendation based on score
    let emoji, color, recommendation, ariaLabel;
    
    if (score >= 9) {
      emoji = '🚗';
      color = 'text-green-500';
      recommendation = 'Excellent driving conditions. Enjoy your drive!';
      ariaLabel = 'Excellent driving conditions';
    } else if (score >= 7) {
      emoji = '🚙';
      color = 'text-green-400';
      recommendation = 'Good driving conditions. Normal precautions advised.';
      ariaLabel = 'Good driving conditions';
    } else if (score >= 5) {
      emoji = '🚦';
      color = 'text-yellow-500';
      recommendation = 'Moderate driving conditions. Increase following distance and reduce speed.';
      ariaLabel = 'Moderate driving conditions';
    } else if (score >= 3) {
      emoji = '⚠️';
      color = 'text-orange-500';
      recommendation = 'Poor driving conditions. Consider postponing non-essential travel.';
      ariaLabel = 'Poor driving conditions';
    } else {
      emoji = '🛑';
      color = 'text-red-500';
      recommendation = 'Dangerous driving conditions. Avoid travel if possible.';
      ariaLabel = 'Dangerous driving conditions';
    }
    
    setCondition({
      score,
      emoji,
      color,
      recommendation,
      factors,
      ariaLabel
    });
  }, [weatherData]);

  if (!weatherData) {
    return null;
  }

  return (
    <div className="mt-8 p-4 rounded-lg bg-gray-900" role="region" aria-label="Driving conditions assessment">
      <h3 className="apex-header-green mb-4">Driving Conditions</h3>
      
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-4xl mr-4" role="img" aria-hidden="true">{condition.emoji}</span>
          <span className={`font-bold text-lg ${condition.color}`} aria-hidden="true">
            Score: {condition.score}/10
          </span>
        </div>
        
        {/* Visually hidden text for screen readers */}
        <span className="sr-only">
          {condition.ariaLabel} with a score of {condition.score} out of 10
        </span>
      </div>
      
      <p className="text-white mb-2">{condition.recommendation}</p>
      
      {condition.factors && condition.factors.length > 0 && (
        <div className="mt-4" aria-label="Factors affecting driving conditions">
          <h4 className="text-sm text-gray-400 uppercase mb-2">Factors to Consider:</h4>
          <ul className="list-disc list-inside text-gray-200">
            {condition.factors.map((factor, index) => (
              <li key={index}>{factor}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default DrivingConditionEmoji;