import React, { useState } from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format } from 'date-fns';

const WeatherStats: React.FC = () => {
  const { forecastData, unit } = useWeather();
  const [activeTab, setActiveTab] = useState('temperature');

  if (!forecastData) return null;

  // Process forecast data for charts
  const processChartData = () => {
    return forecastData.list.slice(0, 16).map(item => {
      const date = new Date(item.dt * 1000);
      return {
        time: format(date, 'HH:mm'),
        date: format(date, 'MM/dd'),
        fullTime: format(date, 'MMM dd, HH:mm'),
        temperature: Math.round(item.main.temp),
        feelsLike: Math.round(item.main.feels_like),
        humidity: item.main.humidity,
        pressure: item.main.pressure,
        windSpeed: item.wind.speed,
        windDeg: item.wind.deg,
        precipitation: item.pop * 100, // Probability of precipitation as percentage
        clouds: item.clouds.all,
        weatherMain: item.weather[0].main,
        weatherDesc: item.weather[0].description,
        weatherIcon: item.weather[0].icon
      };
    });
  };

  const chartData = processChartData();
  const tempUnit = unit === 'metric' ? '°C' : '°F';
  const speedUnit = unit === 'metric' ? 'm/s' : 'mph';

  // Get max and min values for chart domains
  const maxTemp = Math.max(...chartData.map(d => d.temperature)) + 2;
  const minTemp = Math.min(...chartData.map(d => d.temperature)) - 2;
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-gray-900 p-3 border border-gray-800 rounded-md shadow-lg">
          <p className="font-medium text-blue-400">{data.fullTime}</p>
          {activeTab === 'temperature' && (
            <>
              <p className="text-sm">Temperature: <span className="font-medium">{data.temperature}{tempUnit}</span></p>
              <p className="text-sm">Feels Like: <span className="font-medium">{data.feelsLike}{tempUnit}</span></p>
              <p className="text-sm">Weather: <span className="font-medium capitalize">{data.weatherDesc}</span></p>
            </>
          )}
          {activeTab === 'humidity' && (
            <>
              <p className="text-sm">Humidity: <span className="font-medium">{data.humidity}%</span></p>
              <p className="text-sm">Clouds: <span className="font-medium">{data.clouds}%</span></p>
              <p className="text-sm">Precipitation Chance: <span className="font-medium">{data.precipitation}%</span></p>
            </>
          )}
          {activeTab === 'wind' && (
            <>
              <p className="text-sm">Wind Speed: <span className="font-medium">{data.windSpeed} {speedUnit}</span></p>
              <p className="text-sm">Wind Direction: <span className="font-medium">{data.windDeg}°</span></p>
            </>
          )}
          {activeTab === 'pressure' && (
            <>
              <p className="text-sm">Pressure: <span className="font-medium">{data.pressure} hPa</span></p>
            </>
          )}
        </div>
      );
    }
  
    return null;
  };

  return (
    <Card className="mt-8 bg-gray-900 border-gray-800 shadow-xl overflow-hidden">
      <CardHeader>
        <CardTitle className="text-2xl">Weather Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="temperature" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="temperature">Temperature</TabsTrigger>
            <TabsTrigger value="humidity">Humidity</TabsTrigger>
            <TabsTrigger value="wind">Wind</TabsTrigger>
            <TabsTrigger value="pressure">Pressure</TabsTrigger>
          </TabsList>
          
          <TabsContent value="temperature" className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="time" stroke="#888" />
                <YAxis domain={[minTemp, maxTemp]} stroke="#888" />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.3} 
                  activeDot={{ r: 6 }} 
                  name={`Temperature (${tempUnit})`}
                />
                <Area 
                  type="monotone" 
                  dataKey="feelsLike" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.2} 
                  activeDot={{ r: 4 }} 
                  name={`Feels Like (${tempUnit})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="humidity" className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="time" stroke="#888" />
                <YAxis domain={[0, 100]} stroke="#888" />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="humidity" 
                  stroke="#8b5cf6" 
                  fill="#8b5cf6" 
                  fillOpacity={0.3} 
                  activeDot={{ r: 6 }} 
                  name="Humidity (%)"
                />
                <Area 
                  type="monotone" 
                  dataKey="clouds" 
                  stroke="#6b7280" 
                  fill="#6b7280" 
                  fillOpacity={0.2} 
                  activeDot={{ r: 4 }} 
                  name="Cloud Cover (%)"
                />
                <Area 
                  type="monotone" 
                  dataKey="precipitation" 
                  stroke="#0ea5e9" 
                  fill="#0ea5e9" 
                  fillOpacity={0.1} 
                  activeDot={{ r: 4 }} 
                  name="Precipitation (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="wind" className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="time" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="windSpeed" 
                  fill="#22d3ee" 
                  name={`Wind Speed (${speedUnit})`}
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="pressure" className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="time" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="pressure" 
                  stroke="#f97316" 
                  fill="#f97316" 
                  fillOpacity={0.3} 
                  activeDot={{ r: 6 }} 
                  name="Pressure (hPa)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 text-sm text-gray-400">
          <p>This chart shows detailed weather statistics for the next 48 hours. Switch between tabs to view different weather metrics.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherStats;