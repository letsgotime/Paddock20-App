import React from 'react';
import { Wind, MapPin, Car, Settings } from 'lucide-react';

// Dashboard configuration for the Weather Paddock
const WeatherPaddockConfig = {
  // Dashboard sections
  sections: [
    {
      id: 'location',
      title: 'My Locations',
      description: 'Manage and view weather for saved locations',
      order: 10,
      icon: <MapPin className="h-6 w-6 text-blue-400" />
    },
    {
      id: 'drive-time',
      title: 'Drive Time Analysis',
      description: 'Weather impact on journey times and driving conditions',
      order: 20,
      icon: <Car className="h-6 w-6 text-blue-400" />
    },
    {
      id: 'weather-metrics',
      title: 'Weather Metrics',
      description: 'Detailed weather data and forecasts',
      order: 30,
      icon: <Wind className="h-6 w-6 text-blue-400" />
    }
  ],
  
  // Dashboard components
  components: {
    'search': {
      id: 'search',
      name: 'Location Search',
      sectionId: 'location',
      order: 10,
      span: 'full'
    },
    'location-manager': {
      id: 'location-manager',
      name: 'Location Manager',
      sectionId: 'location',
      order: 11,
      span: 'full'
    },
    'drive-mode': {
      id: 'drive-mode',
      name: 'Drive Mode Recommendations',
      sectionId: 'drive-time',
      order: 21
    },
    'commute-time': {
      id: 'commute-time',
      name: 'Commute Time Estimator',
      sectionId: 'drive-time',
      order: 20,
      span: 'full'
    },
    'tire-strategy': {
      id: 'tire-strategy',
      name: 'Tire Strategy',
      sectionId: 'drive-time',
      order: 32,
      description: 'Recommended tire setup based on weather conditions'
    },
    'weather-alerts': {
      id: 'weather-alerts',
      name: 'Weather Alerts',
      sectionId: 'weather-metrics',
      order: 30,
      span: 'full'
    },
    'current-conditions': {
      id: 'current-conditions',
      name: 'Current Conditions',
      sectionId: 'weather-metrics',
      order: 32
    },
    'forecast': {
      id: 'forecast',
      name: 'Daily Forecast',
      sectionId: 'weather-metrics',
      order: 33
    },
    'hourly-forecast': {
      id: 'hourly-forecast',
      name: 'Hourly Forecast',
      sectionId: 'weather-metrics',
      order: 34,
      span: 'full'
    },
    'air-quality': {
      id: 'air-quality',
      name: 'Air Quality',
      sectionId: 'weather-metrics',
      order: 35
    },
    'solar-elevation': {
      id: 'solar-elevation',
      name: 'Sunlight Analysis',
      sectionId: 'weather-metrics',
      order: 36
    }
  }
};

export default WeatherPaddockConfig;