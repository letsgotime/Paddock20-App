/**
 * Mock Weather Data Service
 * 
 * Provides realistic placeholder weather data when the real API is unavailable
 * This allows the UI to be fully functional with realistic but simulated data
 */

// Mock current weather data
export const mockCurrentWeather = {
  "coord": {
    "lon": -80.8431,
    "lat": 35.2271
  },
  "weather": [
    {
      "id": 800,
      "main": "Clear",
      "description": "clear sky",
      "icon": "01d"
    }
  ],
  "base": "stations",
  "main": {
    "temp": 72.1,
    "feels_like": 71.8,
    "temp_min": 68.3,
    "temp_max": 74.2,
    "pressure": 1018,
    "humidity": 52
  },
  "visibility": 10000,
  "wind": {
    "speed": 6.91,
    "deg": 230,
    "gust": 12.5
  },
  "clouds": {
    "all": 5
  },
  "dt": 1683212184,
  "sys": {
    "type": 2,
    "id": 2009228,
    "country": "US",
    "sunrise": 1683194192,
    "sunset": 1683243981
  },
  "timezone": -14400,
  "id": 4460243,
  "name": "Charlotte",
  "cod": 200
};

// Mock forecast data
export const mockForecast = {
  "cod": "200",
  "message": 0,
  "cnt": 40,
  "list": [
    {
      "dt": 1683223200,
      "main": {
        "temp": 72.9,
        "feels_like": 72.1,
        "temp_min": 71.1,
        "temp_max": 72.9,
        "pressure": 1017,
        "sea_level": 1017,
        "grnd_level": 988,
        "humidity": 48,
        "temp_kf": 1
      },
      "weather": [
        {
          "id": 802,
          "main": "Clouds",
          "description": "scattered clouds",
          "icon": "03d"
        }
      ],
      "clouds": {
        "all": 30
      },
      "wind": {
        "speed": 7.9,
        "deg": 240,
        "gust": 13.6
      },
      "visibility": 10000,
      "pop": 0,
      "sys": {
        "pod": "d"
      },
      "dt_txt": "2023-05-04 18:00:00"
    },
    {
      "dt": 1683234000,
      "main": {
        "temp": 70.3,
        "feels_like": 69.6,
        "temp_min": 67.1,
        "temp_max": 70.3,
        "pressure": 1016,
        "sea_level": 1016,
        "grnd_level": 987,
        "humidity": 54,
        "temp_kf": 1.8
      },
      "weather": [
        {
          "id": 803,
          "main": "Clouds",
          "description": "broken clouds",
          "icon": "04d"
        }
      ],
      "clouds": {
        "all": 75
      },
      "wind": {
        "speed": 6.4,
        "deg": 225,
        "gust": 11.4
      },
      "visibility": 10000,
      "pop": 0,
      "sys": {
        "pod": "d"
      },
      "dt_txt": "2023-05-04 21:00:00"
    }
  ],
  "city": {
    "id": 4460243,
    "name": "Charlotte",
    "coord": {
      "lat": 35.2271,
      "lon": -80.8431
    },
    "country": "US",
    "population": 731424,
    "timezone": -14400,
    "sunrise": 1683194192,
    "sunset": 1683243981
  }
};

// Mock OneCall API data (most detailed)
export const mockOneCallData = {
  "lat": 35.2271,
  "lon": -80.8431,
  "timezone": "America/New_York",
  "timezone_offset": -14400,
  "current": {
    "dt": 1683212184,
    "sunrise": 1683194192,
    "sunset": 1683243981,
    "temp": 72.1,
    "feels_like": 71.8,
    "pressure": 1018,
    "humidity": 52,
    "dew_point": 52.9,
    "uvi": 8.6,
    "clouds": 5,
    "visibility": 10000,
    "wind_speed": 6.91,
    "wind_deg": 230,
    "wind_gust": 12.5,
    "weather": [
      {
        "id": 800,
        "main": "Clear",
        "description": "clear sky",
        "icon": "01d"
      }
    ]
  },
  "minutely": [
    {
      "dt": 1683212220,
      "precipitation": 0
    }
  ],
  "hourly": [
    {
      "dt": 1683208800,
      "temp": 72.1,
      "feels_like": 71.8,
      "pressure": 1018,
      "humidity": 52,
      "dew_point": 52.9,
      "uvi": 8.6,
      "clouds": 5,
      "visibility": 10000,
      "wind_speed": 6.91,
      "wind_deg": 230,
      "wind_gust": 12.5,
      "weather": [
        {
          "id": 800,
          "main": "Clear",
          "description": "clear sky",
          "icon": "01d"
        }
      ],
      "pop": 0
    }
  ],
  "daily": [
    {
      "dt": 1683212184,
      "sunrise": 1683194192,
      "sunset": 1683243981,
      "moonrise": 1683178740,
      "moonset": 1683219180,
      "moon_phase": 0.42,
      "temp": {
        "day": 72.1,
        "min": 52.3,
        "max": 74.2,
        "night": 61.3,
        "eve": 70.3,
        "morn": 53.1
      },
      "feels_like": {
        "day": 71.8,
        "night": 60.8,
        "eve": 69.6,
        "morn": 52.9
      },
      "pressure": 1018,
      "humidity": 52,
      "dew_point": 52.9,
      "wind_speed": 6.91,
      "wind_deg": 230,
      "wind_gust": 12.5,
      "weather": [
        {
          "id": 800,
          "main": "Clear",
          "description": "clear sky",
          "icon": "01d"
        }
      ],
      "clouds": 5,
      "pop": 0,
      "uvi": 8.6
    }
  ],
  "alerts": [
    {
      "sender_name": "NWS Charlotte - Piedmont (North Carolina)",
      "event": "Heat Advisory",
      "start": 1683219180,
      "end": 1683230040,
      "description": "A period of hot temperatures is expected...",
      "tags": ["Extreme temperature value"]
    }
  ]
};

// Mock automotive weather data
export const mockAutomotiveWeather = {
  "lat": 35.2271,
  "lon": -80.8431,
  "timezone": "America/New_York",
  "current": {
    "temp": 72.1,
    "feels_like": 71.8,
    "humidity": 52,
    "wind_speed": 6.91,
    "weather_condition": "Clear",
    "weather_icon": "01d"
  },
  "automotive": {
    "surface_temp": 81.5,
    "asphalt_temp": 85.2,
    "concrete_temp": 79.8,
    "surface_condition": "Dry",
    "grip_level": "Excellent",
    "tire_warmup_time": 5,
    "cooling_efficiency": "Optimal",
    "braking_efficiency": 92,
    "aero_efficiency": 96,
    "downforce_adjustment": 0,
    "power_adjustment": 2,
    "torque_adjustment": 1.5,
    "visibility_level": "Excellent",
    "risk_level": "Low",
    "traction_level": "High",
    "air_density_factor": 1.01,
    "dew_point": 52.9,
    "braking_distance_adjustment": -2,
    "heat_dissipation": "Excellent"
  },
  "recommendations": [
    "Ideal conditions for high-performance driving",
    "Tire pressures can be set to recommended levels",
    "No need for cooling system adjustments",
    "Excellent visibility - full speed recommended on straights",
    "Road surface provides optimal grip"
  ],
  "alerts": []
};