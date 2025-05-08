import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  LineChart, Line, AreaChart, Area, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { DrivingProfile } from '../services/vehicleDataService';

// Define interfaces for component props
interface TelemetryPoint {
  distance: number;  // Distance in miles from start
  time: number;      // Time in seconds from start
  speed: number;     // Speed in mph
  acceleration: number; // Acceleration in m/s²
  lateralG: number;  // Lateral G-force
  longitudinalG: number; // Longitudinal G-force
  rpm?: number;      // Engine RPM
  gear?: number;     // Current gear
  throttle: number;  // Throttle position (0-100%)
  brake: number;     // Brake pressure (0-100%)
  altitude: number;  // Altitude in feet
  temperature?: number; // Engine/ambient temperature
  fuelConsumption?: number; // Instantaneous fuel consumption
  lapTime?: number;  // Lap/segment time if applicable
  tireTemp?: {       // Tire temperatures
    frontLeft: number;
    frontRight: number;
    rearLeft: number;
    rearRight: number;
  };
  tirePressure?: {   // Tire pressures
    frontLeft: number;
    frontRight: number;
    rearLeft: number;
    rearRight: number;
  };
  timestamp: string; // Actual timestamp of data point
}

interface CornerPerformance {
  cornerNumber: number;
  entrySpeed: number;
  apexSpeed: number;
  exitSpeed: number;
  entryBraking: number;
  apexThrottle: number;
  exitThrottle: number;
  minRadius: number;
  idealLine: number; // Percentage match to ideal racing line (0-100%)
  timeGain?: number; // Time gained or lost in this corner
}

interface SegmentPerformance {
  segmentName: string;
  segmentType: 'straight' | 'uphill' | 'downhill' | 'technical';
  startDistance: number;
  endDistance: number;
  avgSpeed: number;
  maxSpeed: number;
  avgGForce: number;
  maxGForce: number;
  avgThrottle: number;
  avgBraking: number;
  efficiency: number; // Driving efficiency score (0-100%)
  timeGain?: number; // Time gained or lost in this segment
}

interface WeatherImpact {
  condition: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation?: number;
  performanceImpact: number; // Estimated impact on performance (-10 to +10)
}

interface DrivingStyleAnalysis {
  overallAggression: number; // 1-10
  cornerConsistency: number; // 1-10
  brakeBalance: number; // 1-10
  throttleModulation: number; // 1-10
  lineAccuracy: number; // 1-10
  adaptability: number; // 1-10
  smoothness: number; // 1-10
  efficiencyScore: number; // 1-10
  improvementAreas: string[];
  strengths: string[];
}

interface PerformanceDeltas {
  expectedLapTime?: number;
  actualLapTime?: number;
  timeDelta?: number;
  driverGain?: number; // Time gained due to driver performance
  weatherLoss?: number; // Time lost due to weather
  setupGain?: number; // Time gained due to setup
  cornerDeltas: { [cornerNumber: number]: number };
  segmentDeltas: { [segmentName: string]: number };
}

// Extended Drive Entry interface including real-time telemetry data
interface EnhancedDriveTelemetryProps {
  telemetryData?: TelemetryPoint[];
  cornerAnalysis?: CornerPerformance[];
  segmentAnalysis?: SegmentPerformance[];
  weatherImpact?: WeatherImpact;
  drivingStyle?: DrivingStyleAnalysis;
  performanceDeltas?: PerformanceDeltas;
  vehicleSpecs?: any;
  drivingProfile?: DrivingProfile;
  distanceMiles: number;
  durationMinutes: number;
  isLapTrack?: boolean;
  showFullTelemetry?: boolean;
}

const EnhancedDriveTelemetry: React.FC<EnhancedDriveTelemetryProps> = ({
  telemetryData = [],
  cornerAnalysis = [],
  segmentAnalysis = [],
  weatherImpact,
  drivingStyle,
  performanceDeltas,
  vehicleSpecs,
  drivingProfile,
  distanceMiles,
  durationMinutes,
  isLapTrack = false,
  showFullTelemetry = false
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  // Generate mock telemetry data if none is provided
  const generateMockTelemetryData = (): TelemetryPoint[] => {
    if (telemetryData && telemetryData.length > 0) return telemetryData;
    
    const mockData: TelemetryPoint[] = [];
    const totalPoints = Math.min(Math.max(100, distanceMiles * 10), 500); // 10 points per mile, max 500
    
    for (let i = 0; i < totalPoints; i++) {
      const distance = (i / totalPoints) * distanceMiles;
      const time = (i / totalPoints) * (durationMinutes * 60);
      
      // Create some variation in the data
      const speedBase = 45 + Math.sin(i / 10) * 30;
      const speedVariation = Math.random() * 10 - 5;
      const speed = Math.max(20, Math.min(120, speedBase + speedVariation));
      
      const accelBase = Math.cos(i / 8) * 3;
      const accelVariation = Math.random() * 1 - 0.5;
      const acceleration = accelBase + accelVariation;
      
      const lateralGBase = Math.sin(i / 5) * 0.7;
      const lateralGVariation = Math.random() * 0.3 - 0.15;
      const lateralG = lateralGBase + lateralGVariation;
      
      const longGBase = Math.cos(i / 7) * 0.5;
      const longGVariation = Math.random() * 0.2 - 0.1;
      const longitudinalG = longGBase + longGVariation;
      
      const throttleBase = 70 + Math.sin(i / 12) * 30;
      const throttleVariation = Math.random() * 15 - 7.5;
      const throttle = Math.min(100, Math.max(0, throttleBase + throttleVariation));
      
      const brakeBase = Math.max(0, 50 - throttleBase / 2 + Math.cos(i / 9) * 40);
      const brakeVariation = Math.random() * 10 - 5;
      const brake = Math.min(100, Math.max(0, brakeBase + brakeVariation));
      
      // Create a sine wave pattern for altitude to simulate hills
      const altitudeBase = 1000 + Math.sin(i / 20) * 500;
      const altitudeVariation = Math.random() * 50 - 25;
      const altitude = altitudeBase + altitudeVariation;
      
      const timestamp = new Date(Date.now() - (totalPoints - i) * 1000).toISOString();
      
      mockData.push({
        distance,
        time,
        speed,
        acceleration,
        lateralG,
        longitudinalG,
        throttle,
        brake,
        altitude,
        rpm: 2000 + (speed * 35),
        gear: Math.min(7, Math.max(1, Math.floor(speed / 18))),
        timestamp,
        temperature: 195 + Math.random() * 10,
        fuelConsumption: 0.2 + (speed / 50) * 0.3 + Math.random() * 0.1,
        lapTime: isLapTrack ? time % (10 * 60) : undefined,
        tireTemp: {
          frontLeft: 150 + Math.random() * 30 + (lateralG > 0 ? lateralG * 10 : 0),
          frontRight: 150 + Math.random() * 30 + (lateralG < 0 ? -lateralG * 10 : 0),
          rearLeft: 145 + Math.random() * 25 + (lateralG > 0 ? lateralG * 8 : 0),
          rearRight: 145 + Math.random() * 25 + (lateralG < 0 ? -lateralG * 8 : 0)
        },
        tirePressure: {
          frontLeft: 32 + Math.random() * 2 + (lateralG > 0 ? lateralG * 0.5 : 0),
          frontRight: 32 + Math.random() * 2 + (lateralG < 0 ? -lateralG * 0.5 : 0),
          rearLeft: 34 + Math.random() * 2 + (lateralG > 0 ? lateralG * 0.4 : 0),
          rearRight: 34 + Math.random() * 2 + (lateralG < 0 ? -lateralG * 0.4 : 0)
        }
      });
    }
    
    return mockData;
  };
  
  // Generate mock corner analysis if none is provided
  const generateMockCornerAnalysis = (): CornerPerformance[] => {
    if (cornerAnalysis && cornerAnalysis.length > 0) return cornerAnalysis;
    
    const mockCorners: CornerPerformance[] = [];
    const numCorners = Math.floor(distanceMiles / 3) + 5; // Rough estimate
    
    for (let i = 1; i <= numCorners; i++) {
      const entrySpeed = 60 + Math.random() * 40;
      const apexSpeed = entrySpeed * (0.6 + Math.random() * 0.2);
      const exitSpeed = apexSpeed * (1.1 + Math.random() * 0.3);
      
      mockCorners.push({
        cornerNumber: i,
        entrySpeed,
        apexSpeed,
        exitSpeed,
        entryBraking: 60 + Math.random() * 40,
        apexThrottle: 10 + Math.random() * 30,
        exitThrottle: 80 + Math.random() * 20,
        minRadius: 30 + Math.random() * 100,
        idealLine: 70 + Math.random() * 25,
        timeGain: (Math.random() * 2 - 1) * 0.5
      });
    }
    
    return mockCorners;
  };
  
  // Generate mock segment analysis if none is provided
  const generateMockSegmentAnalysis = (): SegmentPerformance[] => {
    if (segmentAnalysis && segmentAnalysis.length > 0) return segmentAnalysis;
    
    const mockSegments: SegmentPerformance[] = [];
    const segmentTypes: ('straight' | 'uphill' | 'downhill' | 'technical')[] = [
      'straight', 'uphill', 'downhill', 'technical'
    ];
    
    let currentDistance = 0;
    while (currentDistance < distanceMiles) {
      const segmentLength = 0.5 + Math.random() * 3; // 0.5 to 3.5 miles
      const endDistance = Math.min(distanceMiles, currentDistance + segmentLength);
      const segmentType = segmentTypes[Math.floor(Math.random() * segmentTypes.length)];
      
      let avgSpeed, maxSpeed;
      switch (segmentType) {
        case 'straight':
          avgSpeed = 65 + Math.random() * 25;
          maxSpeed = avgSpeed + 10 + Math.random() * 15;
          break;
        case 'uphill':
          avgSpeed = 45 + Math.random() * 20;
          maxSpeed = avgSpeed + 5 + Math.random() * 10;
          break;
        case 'downhill':
          avgSpeed = 55 + Math.random() * 25;
          maxSpeed = avgSpeed + 15 + Math.random() * 20;
          break;
        case 'technical':
          avgSpeed = 35 + Math.random() * 20;
          maxSpeed = avgSpeed + 10 + Math.random() * 15;
          break;
        default:
          avgSpeed = 50 + Math.random() * 20;
          maxSpeed = avgSpeed + 10 + Math.random() * 15;
      }
      
      mockSegments.push({
        segmentName: `Segment ${mockSegments.length + 1}`,
        segmentType,
        startDistance: currentDistance,
        endDistance,
        avgSpeed,
        maxSpeed,
        avgGForce: 0.5 + Math.random() * (segmentType === 'technical' ? 0.8 : 0.4),
        maxGForce: 1.0 + Math.random() * (segmentType === 'technical' ? 1.2 : 0.5),
        avgThrottle: 50 + Math.random() * 40,
        avgBraking: 20 + Math.random() * (segmentType === 'technical' ? 40 : 20),
        efficiency: 70 + Math.random() * 25,
        timeGain: (Math.random() * 2 - 1) * 0.8
      });
      
      currentDistance = endDistance;
    }
    
    return mockSegments;
  };
  
  // Generate mock driving style analysis if none is provided
  const generateMockDrivingStyle = (): DrivingStyleAnalysis => {
    if (drivingStyle) return drivingStyle;
    
    return {
      overallAggression: 6 + Math.random() * 3,
      cornerConsistency: 5 + Math.random() * 4,
      brakeBalance: 6 + Math.random() * 3,
      throttleModulation: 7 + Math.random() * 2,
      lineAccuracy: 6 + Math.random() * 3,
      adaptability: 5 + Math.random() * 4,
      smoothness: 6 + Math.random() * 3,
      efficiencyScore: 7 + Math.random() * 2,
      improvementAreas: [
        'Late apex in tight corners',
        'Brake release could be smoother',
        'More progressive throttle application'
      ],
      strengths: [
        'Excellent corner exit speed',
        'Consistent racing line',
        'Good use of available grip'
      ]
    };
  };
  
  // Use the mocked data if real data isn't available
  const data = {
    telemetry: generateMockTelemetryData(),
    corners: generateMockCornerAnalysis(),
    segments: generateMockSegmentAnalysis(),
    drivingStyle: generateMockDrivingStyle()
  };
  
  // Helper to convert telemetry data to a format suitable for charts
  const formatTelemetryForCharts = (telemetry: TelemetryPoint[]) => {
    return telemetry.map(point => ({
      distance: point.distance.toFixed(1),
      speed: point.speed,
      acceleration: point.acceleration,
      lateralG: point.lateralG,
      longitudinalG: point.longitudinalG,
      throttle: point.throttle,
      brake: point.brake,
      altitude: point.altitude,
      gear: point.gear,
      rpm: point.rpm,
      lapTime: point.lapTime,
      time: point.time / 60, // Convert seconds to minutes
      fuelConsumption: point.fuelConsumption,
      tireTempFL: point.tireTemp?.frontLeft,
      tireTempFR: point.tireTemp?.frontRight,
      tireTempRL: point.tireTemp?.rearLeft,
      tireTempRR: point.tireTemp?.rearRight,
      tirePressureFL: point.tirePressure?.frontLeft,
      tirePressureFR: point.tirePressure?.frontRight,
      tirePressureRL: point.tirePressure?.rearLeft,
      tirePressureRR: point.tirePressure?.rearRight,
    }));
  };
  
  const chartData = formatTelemetryForCharts(data.telemetry);
  
  // Render the overview panel with key metrics
  const renderOverviewPanel = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 p-4 rounded-lg text-center">
          <div className="text-blue-400 text-sm mb-1">Avg Speed</div>
          <div className="text-white text-2xl font-bold">
            {(data.telemetry.reduce((sum, point) => sum + point.speed, 0) / data.telemetry.length).toFixed(1)} mph
          </div>
        </div>
        
        <div className="bg-gray-900 p-4 rounded-lg text-center">
          <div className="text-blue-400 text-sm mb-1">Max Speed</div>
          <div className="text-white text-2xl font-bold">
            {Math.max(...data.telemetry.map(point => point.speed)).toFixed(1)} mph
          </div>
        </div>
        
        <div className="bg-gray-900 p-4 rounded-lg text-center">
          <div className="text-blue-400 text-sm mb-1">Max G-Force</div>
          <div className="text-white text-2xl font-bold">
            {Math.max(...data.telemetry.map(point => Math.max(Math.abs(point.lateralG), Math.abs(point.longitudinalG)))).toFixed(2)} G
          </div>
        </div>
        
        <div className="bg-gray-900 p-4 rounded-lg text-center">
          <div className="text-blue-400 text-sm mb-1">Efficiency</div>
          <div className="text-white text-2xl font-bold">
            {data.drivingStyle.efficiencyScore.toFixed(1)}/10
          </div>
        </div>
      </div>
      
      <div className="bg-gray-900 p-4 rounded-lg">
        <h3 className="text-blue-400 font-medium mb-3">Speed Profile</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData} 
            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="distance" stroke="#888" label={{ value: 'Distance (miles)', position: 'insideBottom', offset: -5, fill: '#888' }} />
            <YAxis stroke="#888" label={{ value: 'Speed (mph)', angle: -90, position: 'insideLeft', fill: '#888' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#222', borderColor: '#444' }}
              itemStyle={{ color: '#00BFFF' }}
              labelStyle={{ color: 'white' }}
            />
            <Line type="monotone" dataKey="speed" stroke="#00BFFF" dot={false} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 p-4 rounded-lg">
          <h3 className="text-blue-400 font-medium mb-3">Driving Style Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
              { subject: 'Aggression', score: data.drivingStyle.overallAggression, fullMark: 10 },
              { subject: 'Consistency', score: data.drivingStyle.cornerConsistency, fullMark: 10 },
              { subject: 'Braking', score: data.drivingStyle.brakeBalance, fullMark: 10 },
              { subject: 'Throttle', score: data.drivingStyle.throttleModulation, fullMark: 10 },
              { subject: 'Line', score: data.drivingStyle.lineAccuracy, fullMark: 10 },
              { subject: 'Adaptability', score: data.drivingStyle.adaptability, fullMark: 10 },
              { subject: 'Smoothness', score: data.drivingStyle.smoothness, fullMark: 10 },
            ]}>
              <PolarGrid stroke="#444" />
              <PolarAngleAxis dataKey="subject" stroke="#888" />
              <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="#888" />
              <Radar name="Driver" dataKey="score" stroke="#FF00FF" fill="#FF00FF" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-gray-900 p-4 rounded-lg">
          <h3 className="text-blue-400 font-medium mb-3">Throttle & Brake Profile</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData.filter((_, i) => i % 5 === 0)} // Sample to reduce points
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="distance" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#222', borderColor: '#444' }}
                itemStyle={{ color: 'white' }}
                labelStyle={{ color: 'white' }}
              />
              <Area type="monotone" dataKey="throttle" stackId="1" stroke="#00FF00" fill="#00FF00" fillOpacity={0.5} />
              <Area type="monotone" dataKey="brake" stackId="2" stroke="#FF0000" fill="#FF0000" fillOpacity={0.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-gray-900 p-4 rounded-lg">
        <h3 className="text-blue-400 font-medium mb-3">Segment Performance</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="uppercase bg-gray-800 text-gray-400">
              <tr>
                <th className="px-6 py-3">Segment</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Distance</th>
                <th className="px-6 py-3">Avg Speed</th>
                <th className="px-6 py-3">Max Speed</th>
                <th className="px-6 py-3">Efficiency</th>
              </tr>
            </thead>
            <tbody>
              {data.segments.map((segment, idx) => (
                <tr key={idx} className="border-b border-gray-700 bg-gray-800 hover:bg-gray-700">
                  <td className="px-6 py-4 text-white">{segment.segmentName}</td>
                  <td className="px-6 py-4 text-white capitalize">{segment.segmentType}</td>
                  <td className="px-6 py-4 text-white">{segment.startDistance.toFixed(1)} - {segment.endDistance.toFixed(1)} mi</td>
                  <td className="px-6 py-4 text-white">{segment.avgSpeed.toFixed(1)} mph</td>
                  <td className="px-6 py-4 text-white">{segment.maxSpeed.toFixed(1)} mph</td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-gray-600 rounded-full h-2.5">
                      <div className="bg-blue-400 h-2.5 rounded-full" style={{ width: `${segment.efficiency}%` }}></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  
  // Render the detailed speed analysis panel
  const renderSpeedAnalysisPanel = () => (
    <div className="space-y-6">
      <div className="bg-gray-900 p-4 rounded-lg">
        <h3 className="text-blue-400 font-medium mb-3">Speed vs. Distance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}
            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="distance" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#222', borderColor: '#444' }}
              itemStyle={{ color: '#00BFFF' }}
              labelStyle={{ color: 'white' }}
            />
            <Line type="monotone" dataKey="speed" stroke="#00BFFF" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="bg-gray-900 p-4 rounded-lg">
        <h3 className="text-blue-400 font-medium mb-3">Speed vs. Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}
            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="time" stroke="#888" label={{ value: 'Time (minutes)', position: 'insideBottom', offset: -5, fill: '#888' }} />
            <YAxis stroke="#888" label={{ value: 'Speed (mph)', angle: -90, position: 'insideLeft', fill: '#888' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#222', borderColor: '#444' }}
              itemStyle={{ color: '#FF00FF' }}
              labelStyle={{ color: 'white' }}
            />
            <Line type="monotone" dataKey="speed" stroke="#FF00FF" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="bg-gray-900 p-4 rounded-lg">
        <h3 className="text-blue-400 font-medium mb-3">Acceleration Profile</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}
            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="distance" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#222', borderColor: '#444' }}
              itemStyle={{ color: '#00FF00' }}
              labelStyle={{ color: 'white' }}
            />
            <Line type="monotone" dataKey="acceleration" stroke="#00FF00" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="bg-gray-900 p-4 rounded-lg">
        <h3 className="text-blue-400 font-medium mb-3">Corner Entry/Exit Speeds</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="uppercase bg-gray-800 text-gray-400">
              <tr>
                <th className="px-6 py-3">Corner</th>
                <th className="px-6 py-3">Entry Speed</th>
                <th className="px-6 py-3">Apex Speed</th>
                <th className="px-6 py-3">Exit Speed</th>
                <th className="px-6 py-3">Min Radius</th>
                <th className="px-6 py-3">Ideal Line %</th>
              </tr>
            </thead>
            <tbody>
              {data.corners.map((corner, idx) => (
                <tr key={idx} className="border-b border-gray-700 bg-gray-800 hover:bg-gray-700">
                  <td className="px-6 py-4 text-white">Corner {corner.cornerNumber}</td>
                  <td className="px-6 py-4 text-white">{corner.entrySpeed.toFixed(1)} mph</td>
                  <td className="px-6 py-4 text-white">{corner.apexSpeed.toFixed(1)} mph</td>
                  <td className="px-6 py-4 text-white">{corner.exitSpeed.toFixed(1)} mph</td>
                  <td className="px-6 py-4 text-white">{corner.minRadius.toFixed(1)} ft</td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-gray-600 rounded-full h-2.5">
                      <div className="bg-blue-400 h-2.5 rounded-full" style={{ width: `${corner.idealLine}%` }}></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  
  // Render the G-force analysis panel
  const renderGForceAnalysisPanel = () => (
    <div className="space-y-6">
      <div className="bg-gray-900 p-4 rounded-lg">
        <h3 className="text-blue-400 font-medium mb-3">G-Force vs. Distance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}
            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="distance" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#222', borderColor: '#444' }}
              itemStyle={{ color: 'white' }}
              labelStyle={{ color: 'white' }}
            />
            <Line type="monotone" dataKey="lateralG" name="Lateral G" stroke="#FFA500" dot={false} />
            <Line type="monotone" dataKey="longitudinalG" name="Longitudinal G" stroke="#FF00FF" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="bg-gray-900 p-4 rounded-lg">
        <h3 className="text-blue-400 font-medium mb-3">G-Force Plot</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid stroke="#444" />
            <XAxis 
              type="number" 
              dataKey="lateralG" 
              name="Lateral G" 
              stroke="#888"
              domain={[-2, 2]}
              label={{ value: 'Lateral G (left to right)', position: 'insideBottom', offset: -5, fill: '#888' }}
            />
            <YAxis 
              type="number" 
              dataKey="longitudinalG" 
              name="Longitudinal G" 
              stroke="#888"
              domain={[-2, 2]}
              label={{ value: 'Longitudinal G (accel to brake)', angle: -90, position: 'insideLeft', fill: '#888' }}
            />
            <ZAxis type="number" range={[50, 400]} />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ backgroundColor: '#222', borderColor: '#444' }}
              itemStyle={{ color: 'white' }}
              labelStyle={{ color: 'white' }}
            />
            <Scatter 
              name="G-Force" 
              data={chartData.map(point => ({
                lateralG: point.lateralG,
                longitudinalG: point.longitudinalG, 
                speed: point.speed
              }))} 
              fill="#00BFFF"
              shape="circle"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 p-4 rounded-lg">
          <h3 className="text-blue-400 font-medium mb-3">Maximum G-Force by Segment</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.segments}
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="segmentName" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#222', borderColor: '#444' }}
                itemStyle={{ color: 'white' }}
                labelStyle={{ color: 'white' }}
              />
              <Bar dataKey="maxGForce" name="Max G-Force" fill="#FF00FF" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-gray-900 p-4 rounded-lg">
          <h3 className="text-blue-400 font-medium mb-3">G-Force Frequency Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={(() => {
              // Create histogram of G-force values
              const gForces = data.telemetry.map(point => 
                Math.sqrt(Math.pow(point.lateralG, 2) + Math.pow(point.longitudinalG, 2)));
              
              const bins = Array(10).fill(0);
              const maxG = Math.max(...gForces);
              const binSize = maxG / bins.length;
              
              gForces.forEach(g => {
                const binIndex = Math.min(Math.floor(g / binSize), bins.length - 1);
                bins[binIndex]++;
              });
              
              return bins.map((count, i) => ({
                range: `${(i * binSize).toFixed(1)}-${((i + 1) * binSize).toFixed(1)}`,
                count
              }));
            })()}
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="range" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#222', borderColor: '#444' }}
                itemStyle={{ color: 'white' }}
                labelStyle={{ color: 'white' }}
              />
              <Bar dataKey="count" name="Frequency" fill="#00BFFF" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
  
  // Render the throttle/brake analysis panel
  const renderThrottleBrakePanel = () => (
    <div className="space-y-6">
      <div className="bg-gray-900 p-4 rounded-lg">
        <h3 className="text-blue-400 font-medium mb-3">Throttle & Brake vs. Distance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData.filter((_, i) => i % 3 === 0)} // Sample to reduce points
            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="distance" stroke="#888" />
            <YAxis stroke="#888" domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#222', borderColor: '#444' }}
              itemStyle={{ color: 'white' }}
              labelStyle={{ color: 'white' }}
            />
            <Line type="monotone" dataKey="throttle" name="Throttle %" stroke="#00FF00" dot={false} />
            <Line type="monotone" dataKey="brake" name="Brake %" stroke="#FF0000" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 p-4 rounded-lg">
          <h3 className="text-blue-400 font-medium mb-3">Throttle Usage Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={(() => {
              // Create histogram of throttle values
              const throttles = data.telemetry.map(point => point.throttle);
              
              const bins = Array(10).fill(0);
              const binSize = 100 / bins.length;
              
              throttles.forEach(throttle => {
                const binIndex = Math.min(Math.floor(throttle / binSize), bins.length - 1);
                bins[binIndex]++;
              });
              
              return bins.map((count, i) => ({
                range: `${(i * binSize).toFixed(0)}-${((i + 1) * binSize).toFixed(0)}`,
                count
              }));
            })()}
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="range" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#222', borderColor: '#444' }}
                itemStyle={{ color: 'white' }}
                labelStyle={{ color: 'white' }}
              />
              <Bar dataKey="count" name="Frequency" fill="#00FF00" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-gray-900 p-4 rounded-lg">
          <h3 className="text-blue-400 font-medium mb-3">Brake Usage Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={(() => {
              // Create histogram of brake values
              const brakes = data.telemetry.map(point => point.brake);
              
              const bins = Array(10).fill(0);
              const binSize = 100 / bins.length;
              
              brakes.forEach(brake => {
                const binIndex = Math.min(Math.floor(brake / binSize), bins.length - 1);
                bins[binIndex]++;
              });
              
              return bins.map((count, i) => ({
                range: `${(i * binSize).toFixed(0)}-${((i + 1) * binSize).toFixed(0)}`,
                count
              }));
            })()}
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="range" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#222', borderColor: '#444' }}
                itemStyle={{ color: 'white' }}
                labelStyle={{ color: 'white' }}
              />
              <Bar dataKey="count" name="Frequency" fill="#FF0000" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-gray-900 p-4 rounded-lg">
        <h3 className="text-blue-400 font-medium mb-3">Throttle/Brake Balance by Corner</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="uppercase bg-gray-800 text-gray-400">
              <tr>
                <th className="px-6 py-3">Corner</th>
                <th className="px-6 py-3">Entry Braking</th>
                <th className="px-6 py-3">Apex Throttle</th>
                <th className="px-6 py-3">Exit Throttle</th>
                <th className="px-6 py-3">Brake-to-Throttle Transition</th>
              </tr>
            </thead>
            <tbody>
              {data.corners.map((corner, idx) => (
                <tr key={idx} className="border-b border-gray-700 bg-gray-800 hover:bg-gray-700">
                  <td className="px-6 py-4 text-white">Corner {corner.cornerNumber}</td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-gray-600 rounded-full h-2.5">
                      <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${corner.entryBraking}%` }}></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-gray-600 rounded-full h-2.5">
                      <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${corner.apexThrottle}%` }}></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-gray-600 rounded-full h-2.5">
                      <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${corner.exitThrottle}%` }}></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white">
                    {corner.entryBraking > 70 && corner.exitThrottle > 70 ? "Aggressive" : 
                     corner.entryBraking > 50 && corner.exitThrottle > 50 ? "Balanced" : "Conservative"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  
  // Render the vehicle data panel
  const renderVehicleDataPanel = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 p-4 rounded-lg">
          <h3 className="text-blue-400 font-medium mb-3">Engine Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.filter((_, i) => i % 3 === 0)} // Sample to reduce points
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="distance" stroke="#888" />
              <YAxis yAxisId="left" stroke="#888" />
              <YAxis yAxisId="right" orientation="right" stroke="#888" domain={[0, 8]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#222', borderColor: '#444' }}
                itemStyle={{ color: 'white' }}
                labelStyle={{ color: 'white' }}
              />
              <Line yAxisId="left" type="monotone" dataKey="rpm" name="RPM" stroke="#FFA500" dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="gear" name="Gear" stroke="#00FFFF" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-gray-900 p-4 rounded-lg">
          <h3 className="text-blue-400 font-medium mb-3">Tire Temperature</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.filter((_, i) => i % 5 === 0)} // Sample to reduce points
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="distance" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#222', borderColor: '#444' }}
                itemStyle={{ color: 'white' }}
                labelStyle={{ color: 'white' }}
              />
              <Line type="monotone" dataKey="tireTempFL" name="Front Left" stroke="#FF0000" dot={false} />
              <Line type="monotone" dataKey="tireTempFR" name="Front Right" stroke="#00FF00" dot={false} />
              <Line type="monotone" dataKey="tireTempRL" name="Rear Left" stroke="#0000FF" dot={false} />
              <Line type="monotone" dataKey="tireTempRR" name="Rear Right" stroke="#FFFF00" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 p-4 rounded-lg">
          <h3 className="text-blue-400 font-medium mb-3">Tire Pressure</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.filter((_, i) => i % 5 === 0)} // Sample to reduce points
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="distance" stroke="#888" />
              <YAxis stroke="#888" domain={[28, 40]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#222', borderColor: '#444' }}
                itemStyle={{ color: 'white' }}
                labelStyle={{ color: 'white' }}
              />
              <Line type="monotone" dataKey="tirePressureFL" name="Front Left" stroke="#FF0000" dot={false} />
              <Line type="monotone" dataKey="tirePressureFR" name="Front Right" stroke="#00FF00" dot={false} />
              <Line type="monotone" dataKey="tirePressureRL" name="Rear Left" stroke="#0000FF" dot={false} />
              <Line type="monotone" dataKey="tirePressureRR" name="Rear Right" stroke="#FFFF00" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-gray-900 p-4 rounded-lg">
          <h3 className="text-blue-400 font-medium mb-3">Fuel Consumption</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData.filter((_, i) => i % 5 === 0)} // Sample to reduce points
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="distance" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#222', borderColor: '#444' }}
                itemStyle={{ color: 'white' }}
                labelStyle={{ color: 'white' }}
              />
              <Area type="monotone" dataKey="fuelConsumption" stroke="#FFA500" fill="#FFA500" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {drivingProfile && (
        <div className="bg-gray-900 p-4 rounded-lg">
          <h3 className="text-blue-400 font-medium mb-3">Vehicle Drive Mode: {drivingProfile.mode}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Throttle Response</label>
              <div className="flex items-center">
                <div className="h-2 w-full bg-gray-700 rounded overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${(drivingProfile.throttleResponse / 10) * 100}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-white font-medium">{drivingProfile.throttleResponse}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-1">Suspension</label>
              <div className="flex items-center">
                <div className="h-2 w-full bg-gray-700 rounded overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${(drivingProfile.suspensionStiffness / 10) * 100}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-white font-medium">{drivingProfile.suspensionStiffness}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-1">Steering</label>
              <div className="flex items-center">
                <div className="h-2 w-full bg-gray-700 rounded overflow-hidden">
                  <div
                    className="h-full bg-yellow-500"
                    style={{ width: `${(drivingProfile.steeringWeight / 10) * 100}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-white font-medium">{drivingProfile.steeringWeight}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-1">Transmission</label>
              <div className="text-white font-medium">{drivingProfile.transmissionSettings}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Traction Control</label>
              <div className="flex items-center">
                <div className="h-2 w-full bg-gray-700 rounded overflow-hidden">
                  <div
                    className="h-full bg-red-500"
                    style={{ width: `${(drivingProfile.tractionControl / 10) * 100}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-white font-medium">{drivingProfile.tractionControl}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-1">Stability Control</label>
              <div className="flex items-center">
                <div className="h-2 w-full bg-gray-700 rounded overflow-hidden">
                  <div
                    className="h-full bg-purple-500"
                    style={{ width: `${(drivingProfile.stabilityControl / 10) * 100}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-white font-medium">{drivingProfile.stabilityControl}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-1">Exhaust</label>
              <div className="text-white font-medium">{drivingProfile.exhaustSettings || "Standard"}</div>
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-1">Features</label>
              <div className="text-white text-sm">
                {drivingProfile.launchControl ? "Launch Control " : ""}
                {drivingProfile.autoBlip ? "Auto-Blip " : ""}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
  // Render the elevation analysis panel
  const renderElevationAnalysisPanel = () => (
    <div className="space-y-6">
      <div className="bg-gray-900 p-4 rounded-lg">
        <h3 className="text-blue-400 font-medium mb-3">Elevation Profile</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}
            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="distance" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#222', borderColor: '#444' }}
              itemStyle={{ color: 'white' }}
              labelStyle={{ color: 'white' }}
            />
            <Area type="monotone" dataKey="altitude" stroke="#47C1FF" fill="#47C1FF" fillOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 p-4 rounded-lg">
          <h3 className="text-blue-400 font-medium mb-3">Speed vs. Elevation</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid stroke="#444" />
              <XAxis 
                type="number" 
                dataKey="altitude" 
                name="Altitude" 
                stroke="#888"
                label={{ value: 'Altitude (feet)', position: 'insideBottom', offset: -5, fill: '#888' }}
              />
              <YAxis 
                type="number" 
                dataKey="speed" 
                name="Speed" 
                stroke="#888"
                label={{ value: 'Speed (mph)', angle: -90, position: 'insideLeft', fill: '#888' }}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ backgroundColor: '#222', borderColor: '#444' }}
                itemStyle={{ color: 'white' }}
                labelStyle={{ color: 'white' }}
              />
              <Scatter 
                name="Speed vs Elevation" 
                data={chartData.filter((_, i) => i % 5 === 0).map(point => ({
                  altitude: point.altitude,
                  speed: point.speed
                }))} 
                fill="#47C1FF"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-gray-900 p-4 rounded-lg">
          <h3 className="text-blue-400 font-medium mb-3">Elevation Change Rate</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.map((point, i, arr) => {
              if (i === 0) return { ...point, elevationRate: 0 };
              const prevPoint = arr[i - 1];
              const distanceDiff = parseFloat(point.distance) - parseFloat(prevPoint.distance);
              const altitudeDiff = point.altitude - prevPoint.altitude;
              const elevationRate = distanceDiff > 0 ? altitudeDiff / distanceDiff : 0;
              return { ...point, elevationRate };
            }).filter((_, i) => i % 3 === 0)} // Sample to reduce points
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="distance" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#222', borderColor: '#444' }}
                itemStyle={{ color: 'white' }}
                labelStyle={{ color: 'white' }}
              />
              <Line type="monotone" dataKey="elevationRate" name="Grade (%)" stroke="#FF00FF" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-gray-900 p-4 rounded-lg">
        <h3 className="text-blue-400 font-medium mb-3">Elevation Segments</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="uppercase bg-gray-800 text-gray-400">
              <tr>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Count</th>
                <th className="px-6 py-3">Max Grade</th>
                <th className="px-6 py-3">Avg Speed</th>
                <th className="px-6 py-3">Avg Power</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-700 bg-gray-800 hover:bg-gray-700">
                <td className="px-6 py-4 text-white">Climbs</td>
                <td className="px-6 py-4 text-white">
                  {data.segments.filter(segment => segment.segmentType === 'uphill').length}
                </td>
                <td className="px-6 py-4 text-white">
                  {Math.max(...chartData.map((point, i, arr) => {
                    if (i === 0) return 0;
                    const prevPoint = arr[i - 1];
                    const distanceDiff = parseFloat(point.distance) - parseFloat(prevPoint.distance);
                    const altitudeDiff = point.altitude - prevPoint.altitude;
                    return distanceDiff > 0 && altitudeDiff > 0 ? (altitudeDiff / distanceDiff) * 100 : 0;
                  })).toFixed(1)}%
                </td>
                <td className="px-6 py-4 text-white">
                  {(data.segments
                    .filter(segment => segment.segmentType === 'uphill')
                    .reduce((sum, segment) => sum + segment.avgSpeed, 0) / 
                    Math.max(1, data.segments.filter(segment => segment.segmentType === 'uphill').length)
                  ).toFixed(1)} mph
                </td>
                <td className="px-6 py-4 text-white">
                  High
                </td>
              </tr>
              <tr className="border-b border-gray-700 bg-gray-800 hover:bg-gray-700">
                <td className="px-6 py-4 text-white">Descents</td>
                <td className="px-6 py-4 text-white">
                  {data.segments.filter(segment => segment.segmentType === 'downhill').length}
                </td>
                <td className="px-6 py-4 text-white">
                  {Math.min(...chartData.map((point, i, arr) => {
                    if (i === 0) return 0;
                    const prevPoint = arr[i - 1];
                    const distanceDiff = parseFloat(point.distance) - parseFloat(prevPoint.distance);
                    const altitudeDiff = point.altitude - prevPoint.altitude;
                    return distanceDiff > 0 && altitudeDiff < 0 ? (altitudeDiff / distanceDiff) * 100 : 0;
                  }).filter(val => val !== 0)).toFixed(1)}%
                </td>
                <td className="px-6 py-4 text-white">
                  {(data.segments
                    .filter(segment => segment.segmentType === 'downhill')
                    .reduce((sum, segment) => sum + segment.avgSpeed, 0) / 
                    Math.max(1, data.segments.filter(segment => segment.segmentType === 'downhill').length)
                  ).toFixed(1)} mph
                </td>
                <td className="px-6 py-4 text-white">
                  Low
                </td>
              </tr>
              <tr className="border-b border-gray-700 bg-gray-800 hover:bg-gray-700">
                <td className="px-6 py-4 text-white">Flats</td>
                <td className="px-6 py-4 text-white">
                  {data.segments.filter(segment => segment.segmentType === 'straight').length}
                </td>
                <td className="px-6 py-4 text-white">
                  &lt;1%
                </td>
                <td className="px-6 py-4 text-white">
                  {(data.segments
                    .filter(segment => segment.segmentType === 'straight')
                    .reduce((sum, segment) => sum + segment.avgSpeed, 0) / 
                    Math.max(1, data.segments.filter(segment => segment.segmentType === 'straight').length)
                  ).toFixed(1)} mph
                </td>
                <td className="px-6 py-4 text-white">
                  Medium
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  
  // Render the driver improvement panel
  const renderDriverImprovementPanel = () => (
    <div className="space-y-6">
      <div className="bg-gray-900 p-4 rounded-lg">
        <h3 className="text-blue-400 font-medium mb-3">Driver Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-gray-300 mb-2">Strengths</h4>
            <ul className="list-disc pl-5 space-y-1">
              {data.drivingStyle.strengths.map((strength, idx) => (
                <li key={idx} className="text-green-400">{strength}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-gray-300 mb-2">Areas for Improvement</h4>
            <ul className="list-disc pl-5 space-y-1">
              {data.drivingStyle.improvementAreas.map((area, idx) => (
                <li key={idx} className="text-yellow-400">{area}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-900 p-4 rounded-lg">
        <h3 className="text-blue-400 font-medium mb-3">Performance by Corner Type</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={[
            { type: 'Hairpin', performance: 65 + Math.random() * 20 },
            { type: 'Fast Sweeper', performance: 75 + Math.random() * 20 },
            { type: 'Chicane', performance: 70 + Math.random() * 20 },
            { type: 'Decreasing Radius', performance: 60 + Math.random() * 20 },
            { type: '90-Degree', performance: 80 + Math.random() * 15 },
          ]}
            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="type" stroke="#888" />
            <YAxis stroke="#888" domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#222', borderColor: '#444' }}
              itemStyle={{ color: 'white' }}
              labelStyle={{ color: 'white' }}
            />
            <Bar dataKey="performance" name="Performance Rating" fill="#00BFFF" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 p-4 rounded-lg">
          <h3 className="text-blue-400 font-medium mb-3">Speed Consistency</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart 
              data={chartData.filter((_, i) => i % 5 === 0).map((point, i, arr) => {
                // Calculate rolling average speed
                const window = arr.slice(Math.max(0, i-5), Math.min(arr.length, i+5));
                const avgSpeed = window.reduce((sum, p) => sum + p.speed, 0) / window.length;
                return {
                  ...point,
                  speed: point.speed,
                  avgSpeed,
                  variation: point.speed - avgSpeed
                };
              })}
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="distance" stroke="#888" />
              <YAxis yAxisId="left" stroke="#888" />
              <YAxis yAxisId="right" orientation="right" domain={[-20, 20]} stroke="#888" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#222', borderColor: '#444' }}
                itemStyle={{ color: 'white' }}
                labelStyle={{ color: 'white' }}
              />
              <Line yAxisId="left" type="monotone" dataKey="speed" name="Speed" stroke="#00BFFF" dot={false} />
              <Line yAxisId="left" type="monotone" dataKey="avgSpeed" name="Avg Speed" stroke="#888" dot={false} strokeDasharray="5 5" />
              <Line yAxisId="right" type="monotone" dataKey="variation" name="Variation" stroke="#FF00FF" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-gray-900 p-4 rounded-lg">
          <h3 className="text-blue-400 font-medium mb-3">Input Smoothness</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart 
              data={chartData.filter((_, i) => i % 2 === 0).map((point, i, arr) => {
                if (i === 0 || i === arr.length - 1) return { ...point, throttleRate: 0, brakeRate: 0 };
                
                const prevPoint = arr[i-1];
                const throttleDiff = point.throttle - prevPoint.throttle;
                const brakeDiff = point.brake - prevPoint.brake;
                
                return {
                  ...point,
                  throttleRate: throttleDiff,
                  brakeRate: brakeDiff
                };
              })}
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="distance" stroke="#888" />
              <YAxis domain={[-20, 20]} stroke="#888" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#222', borderColor: '#444' }}
                itemStyle={{ color: 'white' }}
                labelStyle={{ color: 'white' }}
              />
              <Line type="monotone" dataKey="throttleRate" name="Throttle Change Rate" stroke="#00FF00" dot={false} />
              <Line type="monotone" dataKey="brakeRate" name="Brake Change Rate" stroke="#FF0000" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-gray-900 p-4 rounded-lg">
        <h3 className="text-blue-400 font-medium mb-3">Improvement Opportunities</h3>
        
        <div className="space-y-4">
          {data.corners
            .filter(corner => corner.idealLine < 80)
            .sort((a, b) => a.idealLine - b.idealLine)
            .slice(0, 3)
            .map((corner, idx) => (
              <div key={idx} className="p-3 bg-gray-800 rounded-lg">
                <h4 className="text-white font-medium">Corner {corner.cornerNumber} - {corner.idealLine.toFixed(0)}% Optimal</h4>
                <p className="text-gray-400 mt-1">
                  This {corner.minRadius < 50 ? 'tight' : 'medium'} corner could be improved by 
                  {corner.entrySpeed > corner.apexSpeed * 1.3 ? ' smoother braking on entry' : 
                   corner.exitSpeed < corner.apexSpeed * 1.3 ? ' earlier acceleration on exit' : 
                   ' hitting a more precise apex'}.
                </p>
                <div className="mt-2 flex items-center">
                  <span className="text-gray-500 mr-2">Entry Speed:</span>
                  <span className="text-white">{corner.entrySpeed.toFixed(1)} mph</span>
                  <span className="mx-2 text-gray-600">→</span>
                  <span className="text-gray-500 mr-2">Apex Speed:</span>
                  <span className="text-white">{corner.apexSpeed.toFixed(1)} mph</span>
                  <span className="mx-2 text-gray-600">→</span>
                  <span className="text-gray-500 mr-2">Exit Speed:</span>
                  <span className="text-white">{corner.exitSpeed.toFixed(1)} mph</span>
                </div>
              </div>
            ))}
          
          {/* Add advice based on driving style */}
          <div className="p-3 bg-gray-800 rounded-lg">
            <h4 className="text-white font-medium">Overall Technique Advice</h4>
            <p className="text-gray-400 mt-1">
              {data.drivingStyle.throttleModulation < 7 ? 
                'Work on smoother throttle application to maintain grip through corner exits.' :
               data.drivingStyle.brakeBalance < 7 ?
                'Practice more progressive brake release to maintain vehicle balance on corner entry.' :
               data.drivingStyle.cornerConsistency < 7 ?
                'Focus on hitting the same apex points consistently to build muscle memory.' :
                'Excellent driving technique! Consider pushing corner entry speeds slightly more.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Main component render
  return (
    <div className="space-y-6">
      <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
        <h3 className="text-blue-400 font-semibold mb-3">Enhanced Telemetry Analysis</h3>
        
        {/* Tab navigation */}
        <div className="flex flex-wrap mb-4 border-b border-gray-800">
          <button
            className={`px-4 py-2 mr-2 ${activeTab === 'overview' ? 'bg-blue-900 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`px-4 py-2 mr-2 ${activeTab === 'speed' ? 'bg-blue-900 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            onClick={() => setActiveTab('speed')}
          >
            Speed
          </button>
          <button
            className={`px-4 py-2 mr-2 ${activeTab === 'gforce' ? 'bg-blue-900 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            onClick={() => setActiveTab('gforce')}
          >
            G-Force
          </button>
          <button
            className={`px-4 py-2 mr-2 ${activeTab === 'throttlebrake' ? 'bg-blue-900 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            onClick={() => setActiveTab('throttlebrake')}
          >
            Throttle/Brake
          </button>
          <button
            className={`px-4 py-2 mr-2 ${activeTab === 'vehicle' ? 'bg-blue-900 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            onClick={() => setActiveTab('vehicle')}
          >
            Vehicle
          </button>
          <button
            className={`px-4 py-2 mr-2 ${activeTab === 'elevation' ? 'bg-blue-900 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            onClick={() => setActiveTab('elevation')}
          >
            Elevation
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'improvement' ? 'bg-blue-900 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            onClick={() => setActiveTab('improvement')}
          >
            Improvement
          </button>
        </div>
        
        {/* Tab content */}
        <div className="mt-4">
          {activeTab === 'overview' && renderOverviewPanel()}
          {activeTab === 'speed' && renderSpeedAnalysisPanel()}
          {activeTab === 'gforce' && renderGForceAnalysisPanel()}
          {activeTab === 'throttlebrake' && renderThrottleBrakePanel()}
          {activeTab === 'vehicle' && renderVehicleDataPanel()}
          {activeTab === 'elevation' && renderElevationAnalysisPanel()}
          {activeTab === 'improvement' && renderDriverImprovementPanel()}
        </div>
      </div>
    </div>
  );
};

export default EnhancedDriveTelemetry;