import React, { useState, useEffect } from 'react';

/**
 * WeatherMoodEmoji Component
 * 
 * Translates weather conditions into mood-based emojis with animations
 * to provide an intuitive and accessible representation of weather.
 * 
 * @param {Object} props - Component props
 * @param {string} props.weatherCondition - Weather condition
 * @param {boolean} props.isNight - Whether it's night time
 */
function WeatherMoodEmoji({ weatherCondition, isNight }) {
  const [mood, setMood] = useState({
    emoji: '🌤️',
    description: 'Partly cloudy',
    animation: '',
    color: 'text-blue-300',
    ariaLabel: 'Partly cloudy weather',
    activities: ['Test drive with moderate acceleration', 'Ideal for photography sessions']
  });

  useEffect(() => {
    if (!weatherCondition) {
      return;
    }

    const condition = weatherCondition.toLowerCase();
    
    let emoji, description, animation, color, ariaLabel, activities = [];

    // Determine emoji and activities based on weather condition
    if (condition.includes('thunderstorm')) {
      emoji = '⛈️';
      description = 'Stormy';
      animation = 'animate-bounce';
      color = 'text-purple-400';
      ariaLabel = 'Thunderstorm weather';
      activities = [
        'Avoid driving if possible',
        'Check windshield wipers',
        'Perfect time for garage organization',
        'Review emergency kit contents'
      ];
    } else if (condition.includes('drizzle') || (condition.includes('rain') && condition.includes('light'))) {
      emoji = '🌦️';
      description = 'Light rain';
      animation = 'animate-pulse';
      color = 'text-blue-300';
      ariaLabel = 'Light rain weather';
      activities = [
        'Test wipers and lights',
        'Check tire tread depth',
        'Perfect for testing water beading on wax',
        'Light interior detailing'
      ];
    } else if (condition.includes('rain')) {
      if (condition.includes('heavy')) {
        emoji = '🌧️';
        description = 'Heavy rain';
        animation = 'animate-bounce';
        color = 'text-blue-600';
        ariaLabel = 'Heavy rain weather';
        activities = [
          'Avoid driving if possible',
          'Check for any leaks',
          'Clean and treat interior fabrics',
          'Plan maintenance schedule'
        ];
      } else {
        emoji = '🌧️';
        description = 'Rainy';
        animation = 'animate-pulse';
        color = 'text-blue-400';
        ariaLabel = 'Rainy weather';
        activities = [
          'Check brakes and tire pressure',
          'Detail the interior',
          'Apply rain repellent on windshield',
          'Inspect weatherstripping'
        ];
      }
    } else if (condition.includes('snow')) {
      emoji = '❄️';
      description = 'Snowy';
      animation = 'animate-spin-slow';
      color = 'text-blue-100';
      ariaLabel = 'Snowy weather';
      activities = [
        'Test your winter tires',
        'Check antifreeze levels',
        'Inspect battery and charging system',
        'Practice winter driving techniques in empty lot'
      ];
    } else if (condition.includes('mist') || condition.includes('fog')) {
      emoji = '🌫️';
      description = 'Foggy';
      animation = 'animate-pulse';
      color = 'text-gray-400';
      ariaLabel = 'Foggy weather';
      activities = [
        'Check all lights',
        'Test fog lamps if equipped',
        'Great weather for finding paint imperfections',
        'Practice defensive driving'
      ];
    } else if (condition.includes('clear')) {
      if (!isNight) {
        emoji = '☀️';
        description = 'Sunny';
        animation = 'animate-spin-slow';
        color = 'text-yellow-400';
        ariaLabel = 'Sunny weather';
        activities = [
          'Perfect for a full exterior detail',
          'Take photos of your vehicle',
          'Enjoy a scenic drive',
          'Check for paint damage and UV exposure'
        ];
      } else {
        emoji = '🌙';
        description = 'Clear night';
        animation = 'animate-pulse';
        color = 'text-blue-200';
        ariaLabel = 'Clear night weather';
        activities = [
          'Test headlights and fog lamps',
          'Assess visibility in low-light conditions',
          'Practice defensive night driving techniques',
          'Look for road reflectors and markings'
        ];
      }
    } else if (condition.includes('cloud')) {
      if (condition.includes('few') || condition.includes('scattered')) {
        emoji = '🌤️';
        description = 'Partly cloudy';
        animation = '';
        color = 'text-blue-300';
        ariaLabel = 'Partly cloudy weather';
        activities = [
          'Ideal exterior detailing weather',
          'Perfect for test drives',
          'Good lighting for paint inspection',
          'Great day for engine bay cleaning'
        ];
      } else {
        emoji = '☁️';
        description = 'Cloudy';
        animation = '';
        color = 'text-gray-400';
        ariaLabel = 'Cloudy weather';
        activities = [
          'Good day for mechanical maintenance',
          'Diffused light helps spot paint imperfections',
          'Ideal for polishing and paint correction',
          'Interior cleaning and organization'
        ];
      }
    } else if (condition.includes('dust') || condition.includes('sand')) {
      emoji = '🌪️';
      description = 'Dusty';
      animation = 'animate-spin';
      color = 'text-yellow-600';
      ariaLabel = 'Dusty or sandy weather';
      activities = [
        'Check and clean air filters',
        'Cover vehicle if possible',
        'Inspect intake systems',
        'Clean interior vents'
      ];
    } else if (condition.includes('tornado')) {
      emoji = '🌪️';
      description = 'Tornado';
      animation = 'animate-spin';
      color = 'text-red-500';
      ariaLabel = 'Tornado warning';
      activities = [
        'Seek shelter immediately',
        'Park vehicle in garage if possible',
        'Move away from windows',
        'Follow emergency protocols'
      ];
    } else if (condition.includes('smoke')) {
      emoji = '🔥';
      description = 'Smoky';
      animation = 'animate-pulse';
      color = 'text-orange-500';
      ariaLabel = 'Smoky conditions';
      activities = [
        'Check cabin air filter',
        'Limit driving if possible',
        'Review evacuation routes',
        'Keep windows closed'
      ];
    } else {
      emoji = '🌡️';
      description = 'Weather available';
      animation = '';
      color = 'text-gray-400';
      ariaLabel = 'Weather information available';
      activities = [
        'General vehicle maintenance',
        'Check fluid levels',
        'Review maintenance schedule',
        'Plan next detailing session'
      ];
    }

    // Set the determined weather mood
    setMood({
      emoji,
      description,
      animation,
      color,
      ariaLabel,
      activities
    });

  }, [weatherCondition, isNight]);

  if (!weatherCondition) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center mb-8" role="img" aria-label={mood.ariaLabel}>
      <span className={`text-7xl ${mood.animation} ${mood.color}`} aria-hidden="true">
        {mood.emoji}
      </span>
      <p className={`mt-2 text-xl font-orbitron font-semibold ${mood.color}`} aria-hidden="true">
        {mood.description}
      </p>
      
      {/* Suggested Activities */}
      <div className="mt-6 w-full max-w-lg">
        <h3 className="text-green-500 font-orbitron text-lg mb-3">SUGGESTED ACTIVITIES</h3>
        <ul className="bg-gray-800 rounded-lg p-4 text-left">
          {mood.activities.map((activity, index) => (
            <li key={index} className="text-gray-300 mb-2 flex items-start">
              <span className="text-green-400 mr-2">→</span>
              {activity}
            </li>
          ))}
        </ul>
      </div>
      
      {/* Hidden text for screen readers */}
      <span className="sr-only">Current weather mood: {mood.description} with suggested activities for this weather</span>
    </div>
  );
}

export default WeatherMoodEmoji;