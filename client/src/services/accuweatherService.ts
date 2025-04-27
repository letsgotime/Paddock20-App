const API_KEY = import.meta.env.VITE_ACCUWEATHER_API_KEY;
const BASE_URL = "https://dataservice.accuweather.com";

export async function getLocationKey(lat: number, lon: number) {
  try {
    const response = await fetch(
      `${BASE_URL}/locations/v1/cities/geoposition/search?apikey=${API_KEY}&q=${lat},${lon}`
    );
    const data = await response.json();
    return data.Key; // Location Key
  } catch (error) {
    console.error("Error fetching location key:", error);
    throw error;
  }
}

export async function fetchCurrentConditions(locationKey: string) {
  try {
    const response = await fetch(
      `${BASE_URL}/currentconditions/v1/${locationKey}?apikey=${API_KEY}&details=true`
    );
    const data = await response.json();
    return data[0];
  } catch (error) {
    console.error("Error fetching current conditions:", error);
    throw error;
  }
}

export async function fetchDailyForecast(locationKey: string) {
  try {
    const response = await fetch(
      `${BASE_URL}/forecasts/v1/daily/1day/${locationKey}?apikey=${API_KEY}&details=true`
    );
    const data = await response.json();
    return data.DailyForecasts[0];
  } catch (error) {
    console.error("Error fetching daily forecast:", error);
    throw error;
  }
}

export async function fetchMinuteCast(locationKey: string) {
  try {
    const response = await fetch(
      `${BASE_URL}/forecasts/v1/minute/1hour/${locationKey}?apikey=${API_KEY}&details=true`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching minute cast:", error);
    // MinuteCast might not be available for all locations
    return { Summary: "Minute forecast not available for your location" };
  }
}