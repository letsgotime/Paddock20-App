import React, { useEffect, useRef, useState } from 'react';
import { useNavigation } from '../contexts/NavigationContext';
import { useLocations } from '../contexts/LocationContext';
import { useWeather } from '../contexts/WeatherContext';

/**
 * EmbeddedMapView Component
 * 
 * This component embeds a Google Maps view directly into our application.
 * While not fully replicating all features of native navigation apps,
 * it provides a seamless in-app map experience for basic usage.
 * 
 * Note: Requires Google Maps JavaScript API key to be configured.
 */
const EmbeddedMapView = ({
  origin,
  destination,
  waypoints = [],
  showWeatherLayer = true,
  showTrafficLayer = true,
  showControls = true,
  height = '400px',
  onRouteUpdate = null
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const weatherLayerRef = useRef(null);
  const trafficLayerRef = useRef(null);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [routeDetails, setRouteDetails] = useState(null);
  
  const navigation = useNavigation();
  const locations = useLocations();
  const weather = useWeather();
  
  // Load Google Maps API
  useEffect(() => {
    // Check if API is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }
    
    // Create script element
    const googleMapsScript = document.createElement('script');
    googleMapsScript.src = 
      `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'}&libraries=places`;
    googleMapsScript.async = true;
    googleMapsScript.defer = true;
    
    // Handle script load
    googleMapsScript.addEventListener('load', () => {
      setIsLoaded(true);
    });
    
    // Handle script error
    googleMapsScript.addEventListener('error', () => {
      setLoadError('Failed to load Google Maps API');
    });
    
    // Add script to document
    document.head.appendChild(googleMapsScript);
    
    // Cleanup
    return () => {
      // Remove script if it wasn't loaded
      if (!window.google || !window.google.maps) {
        document.head.removeChild(googleMapsScript);
      }
    };
  }, []);
  
  // Initialize map when API is loaded
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;
    
    try {
      const google = window.google;
      
      // Create map instance
      const mapOptions = {
        zoom: 12,
        center: { lat: 37.7749, lng: -122.4194 }, // Default center (will be updated)
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: showControls,
        zoomControl: showControls,
        streetViewControl: showControls,
        fullscreenControl: showControls
      };
      
      mapInstanceRef.current = new google.maps.Map(mapRef.current, mapOptions);
      
      // Create directions service and renderer
      directionsServiceRef.current = new google.maps.DirectionsService();
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        map: mapInstanceRef.current,
        suppressMarkers: false,
        suppressInfoWindows: false
      });
      
      // Add layers if requested
      if (showTrafficLayer) {
        trafficLayerRef.current = new google.maps.TrafficLayer();
        trafficLayerRef.current.setMap(mapInstanceRef.current);
      }
      
      if (showWeatherLayer) {
        // Note: Weather layer requires a paid API plan with Weather Maps enabled
        try {
          weatherLayerRef.current = new google.maps.weather.WeatherLayer({
            temperatureUnits: google.maps.weather.TemperatureUnit.FAHRENHEIT
          });
          weatherLayerRef.current.setMap(mapInstanceRef.current);
        } catch (e) {
          console.warn('Weather layer not available:', e);
        }
      }
      
      // Update route if origin and destination are available
      updateRoute();
    } catch (error) {
      console.error('Error initializing map:', error);
      setLoadError('Failed to initialize map');
    }
  }, [isLoaded]);
  
  // Update route when origin or destination changes
  useEffect(() => {
    if (isLoaded) {
      updateRoute();
    }
  }, [origin, destination, waypoints, isLoaded]);
  
  // Update route based on current locations
  const updateRoute = () => {
    if (!isLoaded || !window.google || !directionsServiceRef.current) return;
    
    // Skip if either origin or destination is missing
    if (!origin || !destination) {
      // Just center map on origin or destination if only one is available
      if (origin && mapInstanceRef.current) {
        mapInstanceRef.current.setCenter({
          lat: origin.coordinates?.lat || 0,
          lng: origin.coordinates?.lon || 0
        });
      } else if (destination && mapInstanceRef.current) {
        mapInstanceRef.current.setCenter({
          lat: destination.coordinates?.lat || 0,
          lng: destination.coordinates?.lon || 0
        });
      }
      return;
    }
    
    const google = window.google;
    
    // Create origin and destination objects
    const originLatLng = new google.maps.LatLng(
      origin.coordinates?.lat,
      origin.coordinates?.lon
    );
    
    const destinationLatLng = new google.maps.LatLng(
      destination.coordinates?.lat,
      destination.coordinates?.lon
    );
    
    // Convert waypoints if present
    const waypointsList = waypoints.map(wp => ({
      location: new google.maps.LatLng(wp.coordinates?.lat, wp.coordinates?.lon),
      stopover: true
    }));
    
    // Create request
    const request = {
      origin: originLatLng,
      destination: destinationLatLng,
      waypoints: waypointsList,
      travelMode: google.maps.TravelMode[navigation.navigationMode.toUpperCase()],
      optimizeWaypoints: true,
      avoidTolls: navigation.avoidOptions.avoidTolls,
      avoidHighways: navigation.avoidOptions.avoidHighways,
      avoidFerries: navigation.avoidOptions.avoidFerries,
      drivingOptions: navigation.departureTime ? {
        departureTime: navigation.departureTime
      } : undefined
    };
    
    // Calculate route
    directionsServiceRef.current.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        // Display result
        directionsRendererRef.current.setDirections(result);
        
        // Extract route details
        const route = result.routes[0];
        const leg = route.legs[0];
        
        // Create route summary
        const routeSummary = {
          distance: leg.distance.text,
          duration: leg.duration.text,
          startAddress: leg.start_address,
          endAddress: leg.end_address,
          steps: leg.steps.map(step => ({
            distance: step.distance.text,
            duration: step.duration.text,
            instructions: step.instructions,
            maneuver: step.maneuver
          })),
          overview: route.summary,
          // Add weather data if available
          weather: weather.weatherData ? {
            conditions: weather.weatherData.currentConditions.weather[0].main,
            temperature: Math.round(weather.weatherData.currentConditions.temp),
            weatherDelay: navigation.getWeatherDelayEstimate({
              originLat: origin.coordinates?.lat,
              originLon: origin.coordinates?.lon,
              destLat: destination.coordinates?.lat,
              destLon: destination.coordinates?.lon
            })
          } : null
        };
        
        // Update state and call callback if provided
        setRouteDetails(routeSummary);
        if (onRouteUpdate) {
          onRouteUpdate(routeSummary);
        }
      } else {
        console.error('Directions request failed:', status);
        setRouteDetails(null);
      }
    });
  };
  
  // Toggle weather layer
  useEffect(() => {
    if (!isLoaded || !window.google || !weatherLayerRef.current) return;
    
    if (showWeatherLayer) {
      weatherLayerRef.current.setMap(mapInstanceRef.current);
    } else {
      weatherLayerRef.current.setMap(null);
    }
  }, [showWeatherLayer, isLoaded]);
  
  // Toggle traffic layer
  useEffect(() => {
    if (!isLoaded || !window.google || !trafficLayerRef.current) return;
    
    if (showTrafficLayer) {
      trafficLayerRef.current.setMap(mapInstanceRef.current);
    } else {
      trafficLayerRef.current.setMap(null);
    }
  }, [showTrafficLayer, isLoaded]);
  
  // Handle map controls toggle
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;
    
    mapInstanceRef.current.setOptions({
      mapTypeControl: showControls,
      zoomControl: showControls,
      streetViewControl: showControls,
      fullscreenControl: showControls
    });
  }, [showControls, isLoaded]);
  
  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-700">
      {loadError && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-2xl mb-2">⚠️</div>
            <p className="text-red-400">{loadError}</p>
            <p className="text-gray-400 text-sm mt-2">
              Check your Google Maps API key configuration.
            </p>
          </div>
        </div>
      )}
      
      {!isLoaded && !loadError && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}
      
      {/* Route summary overlay */}
      {routeDetails && (
        <div className="absolute top-4 left-4 right-4 bg-gray-900/80 backdrop-blur-sm p-3 rounded-lg border border-gray-700 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold">{routeDetails.overview}</h3>
              <p className="text-sm text-gray-300">
                {routeDetails.distance} • {routeDetails.duration}
                {routeDetails.weather?.weatherDelay > 0 && (
                  <span className="text-amber-400 ml-2">
                    +{routeDetails.weather.weatherDelay} min weather delay
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center">
              {routeDetails.weather && (
                <div className="flex items-center mr-3">
                  <div className="text-xl mr-1">
                    {routeDetails.weather.conditions === "Clear" ? "☀️" :
                     routeDetails.weather.conditions === "Clouds" ? "☁️" :
                     routeDetails.weather.conditions === "Rain" ? "🌧️" :
                     routeDetails.weather.conditions === "Snow" ? "❄️" :
                     routeDetails.weather.conditions === "Thunderstorm" ? "⚡" :
                     routeDetails.weather.conditions === "Drizzle" ? "🌦️" : "🌤️"}
                  </div>
                  <span>{routeDetails.weather.temperature}°F</span>
                </div>
              )}
              
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded-md flex items-center"
                onClick={() => {
                  if (navigation && origin && destination) {
                    navigation.openExternalNavigation({
                      originLat: origin.coordinates?.lat,
                      originLon: origin.coordinates?.lon,
                      originName: origin.name,
                      originId: origin.id,
                      destLat: destination.coordinates?.lat,
                      destLon: destination.coordinates?.lon,
                      destName: destination.name,
                      destId: destination.id
                    });
                  }
                }}
              >
                Open GPS
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Map container */}
      <div 
        ref={mapRef} 
        className="w-full"
        style={{ height }}
      />
    </div>
  );
};

export default EmbeddedMapView;