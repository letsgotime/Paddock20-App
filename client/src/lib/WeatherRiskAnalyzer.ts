export interface WeatherTelemetry {
  temp: number;
  feels_like: number;
  dew_point: number;
  humidity: number;
  wind_speed: number;
  uvi: number;
  pressure: number;
  visibility: number;
  weather: { main: string; description: string }[];
}

export interface WeatherRiskReport {
  gripRisk: 'Low' | 'Moderate' | 'High';
  detailRisk: 'Good' | 'Caution' | 'Bad';
  visibility: 'Clear' | 'Limited';
  overall: 'Ideal' | 'Watch Conditions' | 'Unsafe';
  notes: string[];
}

/**
 * Analyzes weather data to determine driving risks.
 * 
 * @param data - Weather telemetry data
 * @returns Risk assessment report
 */
export function analyzeWeatherRisk(data: WeatherTelemetry): WeatherRiskReport {
  const notes: string[] = [];
  
  // Extract main weather condition
  const mainCondition = data.weather[0]?.main?.toLowerCase() || '';
  const description = data.weather[0]?.description?.toLowerCase() || '';
  
  // Default values for risk analysis
  let gripRisk: 'Low' | 'Moderate' | 'High' = 'Low';
  let detailRisk: 'Good' | 'Caution' | 'Bad' = 'Good';
  let visibilityRating: 'Clear' | 'Limited' = 'Clear';
  let overall: 'Ideal' | 'Watch Conditions' | 'Unsafe' = 'Ideal';
  
  // Analyze grip risk based on weather conditions
  if (
    mainCondition.includes('rain') || 
    mainCondition.includes('drizzle') || 
    mainCondition.includes('shower')
  ) {
    gripRisk = 'High';
    notes.push('Wet conditions significantly reduce tire grip. Increase following distance and brake earlier.');
  } else if (
    mainCondition.includes('snow') || 
    mainCondition.includes('sleet') || 
    mainCondition.includes('ice')
  ) {
    gripRisk = 'High';
    notes.push('Freezing conditions create hazardous road surfaces. Winter tires recommended. Avoid sudden maneuvers.');
  } else if (
    mainCondition.includes('fog') || 
    mainCondition.includes('mist') || 
    mainCondition.includes('haze') ||
    data.humidity > 90
  ) {
    gripRisk = 'Moderate';
    notes.push('High humidity and condensation may create damp surfaces, particularly in shaded areas.');
  } else if (data.humidity > 80 && data.temp < 50) {
    gripRisk = 'Moderate';
    notes.push('Cold, damp conditions may reduce tire temperature and grip.');
  }
  
  // Analyze visibility risk
  if (
    mainCondition.includes('fog') || 
    mainCondition.includes('mist') || 
    data.visibility < 5000
  ) {
    visibilityRating = 'Limited';
    notes.push('Reduced visibility requires headlight use and reduced speed.');
  } else if (
    mainCondition.includes('rain') && 
    (description.includes('heavy') || description.includes('intense'))
  ) {
    visibilityRating = 'Limited';
    notes.push('Heavy precipitation reduces visibility. Use wipers at appropriate speed and ensure adequate defrosting.');
  } else if (
    mainCondition.includes('snow') && 
    (description.includes('heavy') || description.includes('intense'))
  ) {
    visibilityRating = 'Limited';
    notes.push('Heavy snowfall severely impacts visibility. Consider postponing travel if possible.');
  }
  
  // Analyze detailing risk (exterior car care considerations)
  if (
    mainCondition.includes('rain') || 
    mainCondition.includes('drizzle') || 
    mainCondition.includes('snow')
  ) {
    detailRisk = 'Bad';
    notes.push('Exterior detailing not recommended in current precipitation conditions.');
  } else if (
    mainCondition.includes('dust') || 
    mainCondition.includes('sand') || 
    data.wind_speed > 15
  ) {
    detailRisk = 'Caution';
    notes.push('Wind may carry particles that can mar finishes. Consider indoor detailing only.');
  } else if (data.uvi > 8) {
    detailRisk = 'Caution';
    notes.push('High UV index can accelerate product drying. Work in shaded areas to prevent product from drying too quickly.');
  }
  
  // Add wind-specific notes
  if (data.wind_speed > 25) {
    notes.push('Strong winds can affect vehicle stability, particularly for high-profile vehicles.');
  }
  
  // Add temperature-specific notes
  if (data.temp < 32) {
    notes.push('Freezing temperatures may affect fluid viscosity and battery performance.');
  } else if (data.temp > 90) {
    notes.push('High temperatures increase risk of overheating. Monitor coolant temperature during extended drives.');
  }
  
  // Determine overall risk assessment
  if (
    gripRisk === 'High' || 
    (visibilityRating === 'Limited' && gripRisk === 'Moderate') ||
    mainCondition.includes('thunder') ||
    mainCondition.includes('tornado') ||
    mainCondition.includes('hurricane')
  ) {
    overall = 'Unsafe';
  } else if (
    gripRisk === 'Moderate' || 
    visibilityRating === 'Limited' ||
    data.wind_speed > 20
  ) {
    overall = 'Watch Conditions';
  }
  
  // Add severe weather warning if applicable
  if (
    mainCondition.includes('thunder') || 
    mainCondition.includes('storm')
  ) {
    notes.push('Thunderstorm activity detected. Be alert for lightning, heavy rain, and possible flash flooding.');
  }
  
  return {
    gripRisk,
    detailRisk,
    visibility: visibilityRating,
    overall,
    notes
  };
}