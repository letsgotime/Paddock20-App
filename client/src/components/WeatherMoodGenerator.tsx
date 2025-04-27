import React, { useState, useEffect } from 'react';
import { useWeather } from '../contexts/WeatherContext';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Wind, Droplets, Thermometer } from 'lucide-react';

interface WeatherActivity {
  activity: string;
  reason: string;
}

interface WeatherMoodMap {
  [key: string]: {
    icon: React.ReactNode;
    title: string;
    activities: WeatherActivity[];
    drivingTip: string;
    carTip: string;
  };
}

function WeatherMoodGenerator() {
  const { weatherData, forecastData, isLoading, error } = useWeather();
  const [suggestedActivities, setSuggestedActivities] = useState<WeatherActivity[]>([]);
  const [weatherMood, setWeatherMood] = useState<string>('clear');
  const [drivingTip, setDrivingTip] = useState<string>('');
  const [carTip, setCarTip] = useState<string>('');
  
  // Define weather moods and associated activities
  const weatherMoods: WeatherMoodMap = {
    clear: {
      icon: <Sun className="h-10 w-10 text-yellow-400" />,
      title: 'Perfect Day',
      activities: [
        { activity: 'Detail your car', reason: 'Perfect conditions for a complete exterior detail' },
        { activity: 'High-speed track day', reason: 'Excellent visibility and dry conditions' },
        { activity: 'Canyon driving', reason: 'Maximum grip on dry roads' },
        { activity: 'Convertible cruise', reason: 'Enjoy the sun with your top down' },
        { activity: 'Car show visit', reason: 'Great weather for outdoor exhibitions' }
      ],
      drivingTip: 'Perfect driving conditions. Consider a longer scenic route today.',
      carTip: 'Great day to apply a fresh coat of wax or ceramic coating.'
    },
    clouds: {
      icon: <Cloud className="h-10 w-10 text-gray-400" />,
      title: 'Overcast Conditions',
      activities: [
        { activity: 'Interior detailing', reason: 'Focus on your interior while it\'s not too hot outside' },
        { activity: 'Photo shoot', reason: 'Diffused lighting is perfect for car photography' },
        { activity: 'Maintenance check', reason: 'Good time to inspect systems without heat interference' },
        { activity: 'Paint correction', reason: 'Cooler temperatures are ideal for compound work' },
        { activity: 'Highway cruise', reason: 'Comfortable temperature for extended drives' }
      ],
      drivingTip: 'Good driving conditions with reduced glare. Check your lights are visible.',
      carTip: 'Ideal conditions for paint correction work with less risk of product drying too quickly.'
    },
    rain: {
      icon: <CloudRain className="h-10 w-10 text-blue-400" />,
      title: 'Rainy Day',
      activities: [
        { activity: 'Undercarriage cleaning', reason: 'Rain can help rinse off tough dirt' },
        { activity: 'Wiper blade check', reason: 'Test performance in actual rain' },
        { activity: 'Tire inspection', reason: 'Check tread depth for water evacuation' },
        { activity: 'Garage organization', reason: 'Stay dry while organizing your tools and products' },
        { activity: 'Rain sealant application', reason: 'Apply hydrophobic products to test in real conditions' }
      ],
      drivingTip: 'Reduce speed and increase following distance. Test brakes gently after driving through deep water.',
      carTip: 'Check that your windshield hydrophobic coating is working properly.'
    },
    snow: {
      icon: <CloudSnow className="h-10 w-10 text-white" />,
      title: 'Snowy Conditions',
      activities: [
        { activity: 'Snow driving practice', reason: 'Empty lot practice for winter handling' },
        { activity: 'Winter preparation', reason: 'Check antifreeze and winter systems' },
        { activity: 'Undercarriage protection', reason: 'Apply salt guards and protective coatings' },
        { activity: 'Heated garage maintenance', reason: 'Work on projects in your heated space' },
        { activity: 'Winter tire installation', reason: 'Ensure proper winter rubber is mounted' }
      ],
      drivingTip: 'Drive smoothly with gentle inputs. Avoid sudden acceleration, braking or steering.',
      carTip: 'Wash your car soon after driving to remove salt and road chemicals.'
    },
    thunderstorm: {
      icon: <CloudLightning className="h-10 w-10 text-purple-400" />,
      title: 'Stormy Weather',
      activities: [
        { activity: 'Stay home - garage inspection', reason: 'Check for leaks or drainage issues' },
        { activity: 'Review maintenance records', reason: 'Plan future service while waiting out the storm' },
        { activity: 'Online parts shopping', reason: 'Research and order parts for your next project' },
        { activity: 'Backup electronic systems', reason: 'Ensure your car\'s electronic modules are protected' },
        { activity: 'Watch automotive documentaries', reason: 'Expand your knowledge while staying safe' }
      ],
      drivingTip: 'Avoid driving if possible. If caught in a thunderstorm, stay in your vehicle.',
      carTip: 'Park away from trees and in a covered area if available to avoid hail damage.'
    },
    windy: {
      icon: <Wind className="h-10 w-10 text-gray-500" />,
      title: 'Windy Conditions',
      activities: [
        { activity: 'Quick exterior wash', reason: 'Wash off dust that\'s being blown around' },
        { activity: 'Aerodynamic assessment', reason: 'Feel how wind affects your car\'s handling' },
        { activity: 'Secure loose items', reason: 'Check for loose trim or accessories' },
        { activity: 'Air filter replacement', reason: 'More airborne particles may clog filters' },
        { activity: 'TPMS checking', reason: 'Wind can affect tire pressures on longer drives' }
      ],
      drivingTip: 'Keep both hands on the wheel. Be prepared for sudden gusts, especially when passing large vehicles.',
      carTip: 'Consider parking away from trees or loose objects that could be blown onto your vehicle.'
    },
    mist: {
      icon: <Droplets className="h-10 w-10 text-blue-300" />,
      title: 'Misty Conditions',
      activities: [
        { activity: 'Foglight checking', reason: 'Test visibility equipment in actual conditions' },
        { activity: 'Glass treatment', reason: 'Apply anti-fog treatments to windows' },
        { activity: 'Practice low-visibility techniques', reason: 'Improve your driving in limited visibility' },
        { activity: 'Headlight restoration', reason: 'Maximize lighting output for safety' },
        { activity: 'HVAC testing', reason: 'Check defogger and climate control performance' }
      ],
      drivingTip: 'Use low beams, not high beams. Fog lights if equipped. Reduce speed and focus on road markings.',
      carTip: 'Check that all your lights are clean and functioning properly.'
    },
    hot: {
      icon: <Thermometer className="h-10 w-10 text-red-500" />,
      title: 'Extreme Heat',
      activities: [
        { activity: 'Early morning wash', reason: 'Avoid water spots from fast evaporation' },
        { activity: 'Cooling system check', reason: 'Inspect radiator, coolant and fans' },
        { activity: 'Interior UV protection', reason: 'Apply protectants to prevent dashboard cracking' },
        { activity: 'Air conditioning service', reason: 'Ensure optimal cooling performance' },
        { activity: 'Window tint inspection', reason: 'Check for bubbles or issues from heat' }
      ],
      drivingTip: 'Be aware of potential engine overheating. Keep an eye on temperature gauge.',
      carTip: 'Use a sunshade and park in the shade to protect your interior from UV damage.'
    }
  };

  useEffect(() => {
    if (weatherData) {
      // Determine weather mood based on current conditions
      const weatherId = weatherData?.weather?.[0]?.id;
      const temp = weatherData?.main?.temp;

      let mood = 'clear';

      if (weatherId) {
        if (weatherId >= 200 && weatherId < 300) mood = 'thunderstorm';
        else if (weatherId >= 300 && weatherId < 600) mood = 'rain';
        else if (weatherId >= 600 && weatherId < 700) mood = 'snow';
        else if (weatherId >= 700 && weatherId < 800) mood = 'mist';
        else if (weatherId === 800) mood = 'clear';
        else if (weatherId > 800) mood = 'clouds';
      }

      // Special case for high winds
      if (weatherData?.wind?.speed > 20) {
        mood = 'windy';
      }

      // Special case for extreme heat (over 90°F / ~32°C)
      if (temp > 90) {
        mood = 'hot';
      }

      setWeatherMood(mood);
      
      // Set suggested activities from the selected mood
      if (weatherMoods[mood]) {
        setSuggestedActivities(weatherMoods[mood].activities);
        setDrivingTip(weatherMoods[mood].drivingTip);
        setCarTip(weatherMoods[mood].carTip);
      }
    }
  }, [weatherData, forecastData]);

  if (isLoading) {
    return (
      <div className="apex-card p-6">
        <h2 className="apex-header-green mb-4">Weather Mood Loading</h2>
        <div className="text-white text-center">Getting the latest weather data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="apex-card p-6">
        <h2 className="apex-header-green mb-4">Weather Mood</h2>
        <div className="text-red-500">Error loading weather data. Please try again later.</div>
      </div>
    );
  }

  return (
    <div className="apex-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="apex-header-green">Weather Mood</h2>
        {weatherMoods[weatherMood]?.icon}
      </div>

      <div className="mb-6">
        <h3 className="text-blue-400 font-orbitron text-xl mb-2">{weatherMoods[weatherMood]?.title}</h3>
        <p className="text-gray-300">
          {weatherData?.weather?.[0]?.description} • {weatherData?.main?.temp ? Math.round(weatherData.main.temp) : '--'}°F
        </p>
      </div>

      <div className="mb-6">
        <h4 className="text-green-400 font-orbitron text-lg mb-3">Suggested Activities</h4>
        <ul className="space-y-3">
          {suggestedActivities.map((item, index) => (
            <li key={index} className="bg-black p-3 rounded-lg">
              <p className="text-white font-semibold">{item.activity}</p>
              <p className="text-gray-400 text-sm">{item.reason}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
        <div className="bg-gray-900 p-4 rounded-lg">
          <h4 className="text-blue-400 font-orbitron mb-2">Driving Tip</h4>
          <p className="text-gray-300">{drivingTip}</p>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg">
          <h4 className="text-blue-400 font-orbitron mb-2">Car Care Tip</h4>
          <p className="text-gray-300">{carTip}</p>
        </div>
      </div>
    </div>
  );
}

export default WeatherMoodGenerator;