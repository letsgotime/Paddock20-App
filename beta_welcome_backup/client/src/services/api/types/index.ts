/**
 * API Data Warehouse Types Index
 * 
 * Exports all type definitions used in the API Data Warehouse system
 */

// Export core types
export * from './core';

// Export domain-specific types
export * from './domain';

// Re-export for backward compatibility with existing code
export type {
  WeatherData,
  AutomotiveWeatherMetrics,
  GeocodingResult,
  TimeData,
  OBDData,
  TireData,
  MusicTrack,
  AviationWeatherData
} from './domain';