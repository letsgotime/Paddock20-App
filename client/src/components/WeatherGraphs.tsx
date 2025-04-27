import React, { useState } from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, ComposedChart, Scatter
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudRain, Droplets, Thermometer, Wind, Clock, Sun } from 'lucide-react';

interface WeatherPoint {
  time: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  uvIndex: number;
  label: string;
  dt: number;
}

const formatTime = (dt: number): string => {
  const date = new Date(dt * 1000);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDay = (dt: number): string => {
  const date = new Date(dt * 1000);
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
};

const WeatherGraphs: React.FC = () => {
  const { forecastData, oneCallData, unit } = useWeather();
  const [chartType, setChartType] = useState('temperature');
  
  if (!forecastData || !oneCallData) {
    return (
      <div className="p-6 bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-xl animate-pulse">
        <div className="h-8 w-40 bg-gray-800 rounded mb-4"></div>
        <div className="h-64 bg-gray-800 rounded"></div>
      </div>
    );
  }
  
  // Process hourly forecast data for charts
  const hourlyData: WeatherPoint[] = forecastData.list.slice(0, 24).map(item => ({
    time: formatTime(item.dt),
    temp: Math.round(item.main.temp),
    feelsLike: Math.round(item.main.feels_like),
    humidity: item.main.humidity,
    windSpeed: Math.round(item.wind.speed),
    precipitation: item.pop * 100,
    uvIndex: 0, // Not available in forecast data
    label: item.weather[0].main,
    dt: item.dt
  }));
  
  // Process daily forecast data for charts
  const dailyData = oneCallData.daily.map(item => ({
    day: formatDay(item.dt),
    maxTemp: Math.round(item.temp.max),
    minTemp: Math.round(item.temp.min),
    humidity: item.humidity,
    windSpeed: Math.round(item.wind_speed),
    precipitation: item.pop * 100,
    uvIndex: Math.round(item.uvi),
    label: item.weather[0].main,
    dt: item.dt
  }));
  
  // Hourly temperature graph
  const TempGraph = () => (
    <Card className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] border-gray-800">
      <CardHeader className="pb-2">
        <div className="flex items-center">
          <Thermometer className="h-5 w-5 text-blue-400 mr-2" />
          <CardTitle className="text-blue-400">Temperature Forecast</CardTitle>
        </div>
        <CardDescription>24-hour temperature and feels like data</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart
            data={hourlyData}
            margin={{ top: 10, right: 10, left: 0, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="time" 
              tick={{ fill: '#9ca3af' }} 
              axisLine={{ stroke: '#374151' }} 
              tickLine={{ stroke: '#374151' }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tick={{ fill: '#9ca3af' }} 
              axisLine={{ stroke: '#374151' }} 
              tickLine={{ stroke: '#374151' }}
              label={{ value: `Temperature (°${unit === 'metric' ? 'C' : 'F'})`, angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#111111', borderColor: '#374151', borderRadius: '0.5rem' }}
              itemStyle={{ color: '#e5e7eb' }}
              formatter={(value) => [`${value}°${unit === 'metric' ? 'C' : 'F'}`, '']}
              labelFormatter={(value) => `Time: ${value}`}
            />
            <Legend wrapperStyle={{ color: '#e5e7eb', paddingTop: '10px' }} />
            <Area 
              type="monotone" 
              dataKey="temp" 
              stroke="#3b82f6" 
              fillOpacity={0.3}
              fill="url(#colorTemp)" 
              name="Temperature"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="feelsLike" 
              stroke="#10b981" 
              name="Feels Like"
              strokeWidth={2}
              dot={{ fill: '#10b981', strokeWidth: 1 }}
            />
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
  
  // Precipitation & Humidity Graph
  const PrecipGraph = () => (
    <Card className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] border-gray-800">
      <CardHeader className="pb-2">
        <div className="flex items-center">
          <CloudRain className="h-5 w-5 text-blue-400 mr-2" />
          <CardTitle className="text-blue-400">Precipitation & Humidity</CardTitle>
        </div>
        <CardDescription>24-hour precipitation and humidity forecast</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart
            data={hourlyData}
            margin={{ top: 10, right: 10, left: 0, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="time" 
              tick={{ fill: '#9ca3af' }} 
              axisLine={{ stroke: '#374151' }} 
              tickLine={{ stroke: '#374151' }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fill: '#9ca3af' }} 
              axisLine={{ stroke: '#374151' }} 
              tickLine={{ stroke: '#374151' }}
              label={{ value: 'Precipitation (%)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              tick={{ fill: '#9ca3af' }} 
              axisLine={{ stroke: '#374151' }} 
              tickLine={{ stroke: '#374151' }}
              label={{ value: 'Humidity (%)', angle: 90, position: 'insideRight', fill: '#9ca3af' }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#111111', borderColor: '#374151', borderRadius: '0.5rem' }}
              itemStyle={{ color: '#e5e7eb' }}
              formatter={(value, name) => [`${value}%`, name]}
              labelFormatter={(value) => `Time: ${value}`}
            />
            <Legend wrapperStyle={{ color: '#e5e7eb', paddingTop: '10px' }} />
            <Bar 
              yAxisId="left" 
              dataKey="precipitation" 
              fill="#3b82f6" 
              name="Precipitation %" 
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="humidity" 
              stroke="#8884d8" 
              name="Humidity %"
              strokeWidth={2}
              dot={{ fill: '#8884d8', strokeWidth: 1 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
  
  // Weekly High/Low Temperature
  const WeeklyTempGraph = () => (
    <Card className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] border-gray-800">
      <CardHeader className="pb-2">
        <div className="flex items-center">
          <Sun className="h-5 w-5 text-yellow-400 mr-2" />
          <CardTitle className="text-yellow-400">7-Day Temperature Forecast</CardTitle>
        </div>
        <CardDescription>Daily high and low temperatures</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart
            data={dailyData}
            margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="day" 
              tick={{ fill: '#9ca3af' }} 
              axisLine={{ stroke: '#374151' }} 
              tickLine={{ stroke: '#374151' }}
            />
            <YAxis 
              tick={{ fill: '#9ca3af' }} 
              axisLine={{ stroke: '#374151' }} 
              tickLine={{ stroke: '#374151' }}
              label={{ value: `Temperature (°${unit === 'metric' ? 'C' : 'F'})`, angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#111111', borderColor: '#374151', borderRadius: '0.5rem' }}
              itemStyle={{ color: '#e5e7eb' }}
              formatter={(value) => [`${value}°${unit === 'metric' ? 'C' : 'F'}`, '']}
              labelFormatter={(value) => `${value}`}
            />
            <Legend wrapperStyle={{ color: '#e5e7eb', paddingTop: '10px' }} />
            <Bar 
              dataKey="maxTemp" 
              name="High" 
              fill="#ef4444" 
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Bar 
              dataKey="minTemp" 
              name="Low" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
  
  // UV Index Chart
  const UVIndexGraph = () => (
    <Card className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] border-gray-800">
      <CardHeader className="pb-2">
        <div className="flex items-center">
          <Sun className="h-5 w-5 text-yellow-400 mr-2" />
          <CardTitle className="text-yellow-400">UV Index Forecast</CardTitle>
        </div>
        <CardDescription>Weekly UV radiation levels</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={dailyData}
            margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="day" 
              tick={{ fill: '#9ca3af' }} 
              axisLine={{ stroke: '#374151' }} 
              tickLine={{ stroke: '#374151' }}
            />
            <YAxis 
              tick={{ fill: '#9ca3af' }} 
              axisLine={{ stroke: '#374151' }} 
              tickLine={{ stroke: '#374151' }}
              label={{ value: 'UV Index', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#111111', borderColor: '#374151', borderRadius: '0.5rem' }}
              itemStyle={{ color: '#e5e7eb' }}
              formatter={(value) => [value, 'UV Index']}
              labelFormatter={(value) => `${value}`}
            />
            <Area 
              type="monotone" 
              dataKey="uvIndex" 
              stroke="#f59e0b" 
              fill="url(#colorUV)" 
              name="UV Index"
              strokeWidth={2}
            />
            <defs>
              <linearGradient id="colorUV" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
  
  return (
    <div className="space-y-8">
      <h2 className="font-orbitron text-2xl text-blue-500 mb-4">Advanced Weather Analytics</h2>
      
      <Tabs defaultValue="hourly" className="w-full">
        <TabsList className="bg-gray-900 border border-gray-800">
          <TabsTrigger value="hourly" className="data-[state=active]:bg-blue-900 text-white">
            <Clock className="h-4 w-4 mr-2 inline" />
            Hourly Forecast
          </TabsTrigger>
          <TabsTrigger value="weekly" className="data-[state=active]:bg-blue-900 text-white">
            <Calendar className="h-4 w-4 mr-2 inline" />
            7-Day Forecast
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="hourly" className="mt-4 space-y-6">
          <TempGraph />
          <PrecipGraph />
        </TabsContent>
        
        <TabsContent value="weekly" className="mt-4 space-y-6">
          <WeeklyTempGraph />
          <UVIndexGraph />
        </TabsContent>
      </Tabs>
      
      <div className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-xl p-6 border border-gray-800">
        <h3 className="font-orbitron text-lg text-green-500 mb-4">Track-Day Weather Analysis</h3>
        <p className="text-gray-300 mb-4">
          Current conditions are <span className={`font-semibold ${determineConditionColor(hourlyData[0])}`}>
            {determineConditionText(hourlyData[0])}
          </span> for performance driving.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-blue-400 font-medium mb-2 flex items-center">
              <Thermometer className="h-4 w-4 mr-2" />
              Tire Performance
            </h4>
            <p className="text-sm text-gray-300">
              {getTirePerformanceText(hourlyData[0].temp, unit)}
            </p>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-blue-400 font-medium mb-2 flex items-center">
              <CloudRain className="h-4 w-4 mr-2" />
              Track Conditions
            </h4>
            <p className="text-sm text-gray-300">
              {getTrackConditionText(hourlyData[0])}
            </p>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-blue-400 font-medium mb-2 flex items-center">
              <Wind className="h-4 w-4 mr-2" />
              Wind Impact
            </h4>
            <p className="text-sm text-gray-300">
              {getWindImpactText(hourlyData[0].windSpeed, unit)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions for track-day analysis
function determineConditionColor(data: WeatherPoint): string {
  if (data.precipitation > 30 || data.windSpeed > 15) {
    return "text-red-500";
  } else if (data.precipitation > 10 || data.windSpeed > 10) {
    return "text-yellow-500";
  } else {
    return "text-green-500";
  }
}

function determineConditionText(data: WeatherPoint): string {
  if (data.precipitation > 30 || data.windSpeed > 15) {
    return "High Risk";
  } else if (data.precipitation > 10 || data.windSpeed > 10) {
    return "Moderate Risk";
  } else {
    return "Optimal";
  }
}

function getTirePerformanceText(temp: number, unit: string): string {
  const tempC = unit === 'metric' ? temp : (temp - 32) * 5/9;
  
  if (tempC < 10) {
    return "Cold temperatures may reduce tire grip. Consider tire warmers or gentle warm-up laps.";
  } else if (tempC >= 10 && tempC < 25) {
    return "Good temperature range for most compounds. Optimal grip after 1-2 warm-up laps.";
  } else {
    return "Warm temperatures may cause faster tire degradation. Monitor pressures closely.";
  }
}

function getTrackConditionText(data: WeatherPoint): string {
  if (data.precipitation > 30) {
    return "Wet track conditions likely. Wet-weather tires recommended, reduced speeds necessary.";
  } else if (data.precipitation > 10) {
    return "Potentially damp track. Mixed conditions possible, monitor surface closely.";
  } else {
    return "Dry track expected. Optimal for consistent lap times and maximum mechanical grip.";
  }
}

function getWindImpactText(windSpeed: number, unit: string): string {
  const windMS = unit === 'metric' ? windSpeed : windSpeed * 0.44704;
  
  if (windMS > 8) {
    return "Strong winds may affect vehicle stability in high-speed sections and braking zones.";
  } else if (windMS > 4) {
    return "Moderate winds might be noticeable on longer straights or exposed sections.";
  } else {
    return "Light winds with minimal impact on vehicle aerodynamics or stability.";
  }
}

// Mock Calendar component since we're using the import but it's not defined
const Calendar = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
    <line x1="16" x2="16" y1="2" y2="6"></line>
    <line x1="8" x2="8" y1="2" y2="6"></line>
    <line x1="3" x2="21" y1="10" y2="10"></line>
  </svg>
);

export default WeatherGraphs;