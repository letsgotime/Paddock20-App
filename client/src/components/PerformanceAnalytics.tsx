import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  LineChart as LineChartIcon, 
  Gauge, 
  Zap, 
  Clock, 
  Wind, 
  Fuel, 
  Scale,
  Download,
  RotateCcw,
  Settings,
  ChevronDown,
  Plus,
  Minus,
  Info,
  BarChart2,
  BarChart4,
  Share2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  trim: string;
  vin: string;
  engine_type: string;
  transmission: string;
  drivetrain: string;
  horsepower?: number;
  torque?: number;
  weight?: number;
  zero_to_sixty?: number;
  top_speed?: number;
  quarter_mile?: number;
}

interface PerformanceData {
  rpm: number[];
  speed: number[];
  torque: number[];
  horsepower: number[];
  fuel_consumption: number[];
  acceleration: number[];
  temperature: number[];
  surface_temperature: number[];
  boost?: number[];
  airflow?: number[];
}

interface PerformanceAnalyticsProps {
  vehicle: Vehicle;
  comparableVehicles?: Vehicle[];
  onClose: () => void;
}

const BENCHMARK_CATEGORIES = [
  "Acceleration",
  "Top Speed",
  "Handling",
  "Braking",
  "Efficiency",
  "Overall"
];

const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({ 
  vehicle, 
  comparableVehicles,
  onClose 
}) => {
  // State
  const [activeTab, setActiveTab] = useState<string>('dyno');
  const [selectedMetric, setSelectedMetric] = useState<string>('horsepower');
  const [selectedComparison, setSelectedComparison] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState<boolean>(true);
  const [showDataPoints, setShowDataPoints] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [benchmarkScores, setBenchmarkScores] = useState<Record<string, number>>({
    "Acceleration": 0,
    "Top Speed": 0,
    "Handling": 0,
    "Braking": 0,
    "Efficiency": 0,
    "Overall": 0
  });
  
  // Mock benchmark scores based on vehicle specs
  useEffect(() => {
    // Generate somewhat realistic benchmark scores based on vehicle specs
    const generateBenchmarks = () => {
      const horsepower = vehicle.horsepower || Math.floor(Math.random() * 400) + 200;
      const zeroToSixty = vehicle.zero_to_sixty || Math.random() * 3 + 3;
      const topSpeed = vehicle.top_speed || Math.floor(Math.random() * 100) + 150;
      const weight = vehicle.weight || Math.floor(Math.random() * 1000) + 1500;
      
      // Calculate scores (higher is better)
      const accelerationScore = Math.min(100, Math.max(0, 100 - (zeroToSixty - 2) * 20));
      const topSpeedScore = Math.min(100, Math.max(0, 40 + (topSpeed - 150) / 2));
      const handlingScore = Math.min(100, Math.max(0, 100 - (weight - 1300) / 30));
      const brakingScore = Math.min(100, Math.max(0, 60 + Math.random() * 40));
      const efficiencyScore = Math.min(100, Math.max(0, 100 - horsepower / 10));
      
      // Overall score is weighted average
      const overallScore = (
        accelerationScore * 0.3 + 
        topSpeedScore * 0.15 + 
        handlingScore * 0.25 + 
        brakingScore * 0.15 + 
        efficiencyScore * 0.15
      );
      
      setBenchmarkScores({
        "Acceleration": Math.round(accelerationScore),
        "Top Speed": Math.round(topSpeedScore),
        "Handling": Math.round(handlingScore),
        "Braking": Math.round(brakingScore),
        "Efficiency": Math.round(efficiencyScore),
        "Overall": Math.round(overallScore)
      });
    };
    
    generateBenchmarks();
  }, [vehicle]);

  // Generate mock performance data
  useEffect(() => {
    const generatePerformanceData = () => {
      setIsLoading(true);
      
      // Create x-axis values (RPM from 1000 to 8000)
      const rpmValues = Array.from({ length: 71 }, (_, i) => 1000 + i * 100);
      
      // Generate somewhat realistic horsepower curve peaking at ~5500-6500 RPM
      const generateHorsepower = () => {
        const maxHp = vehicle.horsepower || Math.floor(Math.random() * 400) + 200;
        const peakRpm = Math.floor(Math.random() * 1000) + 5500;
        
        return rpmValues.map(rpm => {
          // Create a curve that rises, peaks, then falls slightly
          if (rpm < 2000) {
            return (rpm / 2000) * maxHp * 0.3;
          } else if (rpm < peakRpm) {
            const progress = (rpm - 2000) / (peakRpm - 2000);
            return (maxHp * 0.3) + progress * (maxHp - (maxHp * 0.3));
          } else {
            const falloff = (rpm - peakRpm) / 2500;
            return Math.max(maxHp - (falloff * maxHp * 0.15), maxHp * 0.85);
          }
        });
      };
      
      // Generate torque curve peaking earlier than horsepower
      const generateTorque = () => {
        const maxTorque = vehicle.torque || Math.floor(Math.random() * 300) + 200;
        const peakRpm = Math.floor(Math.random() * 1000) + 3500;
        
        return rpmValues.map(rpm => {
          // Create a curve that rises, peaks, then falls gradually
          if (rpm < 1500) {
            return (rpm / 1500) * maxTorque * 0.7;
          } else if (rpm < peakRpm) {
            const progress = (rpm - 1500) / (peakRpm - 1500);
            return (maxTorque * 0.7) + progress * (maxTorque - (maxTorque * 0.7));
          } else {
            const falloff = (rpm - peakRpm) / 3000;
            return Math.max(maxTorque - (falloff * maxTorque * 0.3), maxTorque * 0.6);
          }
        });
      };
      
      // Generate fuel consumption curve
      const generateFuelConsumption = () => {
        return rpmValues.map(rpm => {
          // Fuel consumption generally increases with RPM
          const base = 3 + (rpm / 1000) * 1.5;
          // Add some noise
          return base + (Math.random() * 0.5);
        });
      };
      
      // Generate speed values based on gear ratios and RPM
      const generateSpeed = () => {
        const topSpeed = vehicle.top_speed || Math.floor(Math.random() * 100) + 150;
        const maxRpm = 8000;
        
        return rpmValues.map(rpm => {
          // Simple approximation - actual calculation would use gear ratios
          return (rpm / maxRpm) * topSpeed;
        });
      };
      
      // Generate acceleration values
      const generateAcceleration = () => {
        return rpmValues.map((rpm, i, arr) => {
          if (i === 0) return 0;
          // Calculate rate of change of speed
          const prevRpm = arr[i - 1];
          return 0.1 * ((rpm - prevRpm) / 100);
        });
      };
      
      // Generate temperature values
      const generateTemperature = () => {
        return rpmValues.map(rpm => {
          // Temperature increases with RPM
          return 180 + (rpm / 8000) * 40;
        });
      };
      
      // Generate boost pressure for forced induction engines
      const generateBoost = () => {
        // Only generate boost data for forced induction engines
        if (vehicle.engine_type?.toLowerCase().includes('turbo') || 
            vehicle.engine_type?.toLowerCase().includes('supercharged')) {
          const maxBoost = Math.random() * 15 + 10; // 10-25 psi
          
          return rpmValues.map(rpm => {
            if (rpm < 2000) {
              return (rpm / 2000) * 3; // Spooling up
            } else if (rpm < 3000) {
              const progress = (rpm - 2000) / 1000;
              return 3 + progress * (maxBoost - 3);
            } else {
              return maxBoost;
            }
          });
        }
        return undefined;
      };
      
      // Generate airflow data
      const generateAirflow = () => {
        return rpmValues.map(rpm => {
          // Airflow generally increases with RPM
          return (rpm / 1000) * 15 + Math.random() * 5;
        });
      };
      
      // Combine all data
      const data: PerformanceData = {
        rpm: rpmValues,
        horsepower: generateHorsepower(),
        torque: generateTorque(),
        fuel_consumption: generateFuelConsumption(),
        speed: generateSpeed(),
        acceleration: generateAcceleration(),
        temperature: generateTemperature(),
        boost: generateBoost(),
        airflow: generateAirflow()
      };
      
      // Simulate network delay
      setTimeout(() => {
        setPerformanceData(data);
        setIsLoading(false);
      }, 1500);
    };
    
    generatePerformanceData();
  }, [vehicle]);

  // Format number with proper units
  const formatMetricValue = (value: number, metric: string): string => {
    switch(metric) {
      case 'horsepower':
        return `${Math.round(value)} hp`;
      case 'torque':
        return `${Math.round(value)} lb-ft`;
      case 'speed':
        return `${Math.round(value)} mph`;
      case 'fuel_consumption':
        return `${value.toFixed(1)} gal/h`;
      case 'acceleration':
        return `${value.toFixed(2)} g`;
      case 'temperature':
        return `${Math.round(value)}°F`;
      case 'boost':
        return `${value.toFixed(1)} psi`;
      case 'airflow':
        return `${Math.round(value)} lb/min`;
      default:
        return `${value}`;
    }
  };

  // Get proper label for metrics
  const getMetricLabel = (metric: string): string => {
    switch(metric) {
      case 'horsepower':
        return 'Horsepower (hp)';
      case 'torque':
        return 'Torque (lb-ft)';
      case 'speed':
        return 'Speed (mph)';
      case 'fuel_consumption':
        return 'Fuel Consumption (gal/h)';
      case 'acceleration':
        return 'Acceleration (g)';
      case 'temperature':
        return 'Temperature (°F)';
      case 'boost':
        return 'Boost Pressure (psi)';
      case 'airflow':
        return 'Airflow (lb/min)';
      default:
        return metric;
    }
  };

  // Get icon for metric
  const getMetricIcon = (metric: string) => {
    switch(metric) {
      case 'horsepower':
        return <Zap className="h-4 w-4" />;
      case 'torque':
        return <BarChart2 className="h-4 w-4" />;
      case 'speed':
        return <Gauge className="h-4 w-4" />;
      case 'fuel_consumption':
        return <Fuel className="h-4 w-4" />;
      case 'acceleration':
        return <Clock className="h-4 w-4" />;
      case 'temperature':
        return <Zap className="h-4 w-4" />;
      case 'boost':
        return <Wind className="h-4 w-4" />;
      case 'airflow':
        return <Wind className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  // Available metrics for dropdown
  const availableMetrics = [
    'horsepower',
    'torque',
    'speed',
    'fuel_consumption',
    'acceleration',
    'temperature',
  ];
  
  // Add boost if vehicle has forced induction
  if (vehicle.engine_type?.toLowerCase().includes('turbo') || 
      vehicle.engine_type?.toLowerCase().includes('supercharged')) {
    availableMetrics.push('boost');
  }
  
  // Add airflow
  availableMetrics.push('airflow');

  // Handle export of data
  const handleExportData = () => {
    toast({
      title: "Data Exported",
      description: "Performance data has been exported to CSV"
    });
  };

  // Render a visual chart based on the performance data
  const renderChart = () => {
    if (!performanceData || !performanceData[selectedMetric as keyof PerformanceData]) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <BarChart3 className="h-12 w-12 mb-2" />
          <p>No data available for this metric</p>
        </div>
      );
    }
    
    const metricData = performanceData[selectedMetric as keyof PerformanceData] as number[];
    const rpmData = performanceData.rpm;
    
    // Find min and max for scaling
    const min = Math.min(...metricData) * 0.9;
    const max = Math.max(...metricData) * 1.1;
    const range = max - min;
    
    // Calculate dimensions based on zoom
    const height = 300 * zoomLevel;
    const width = 800 * zoomLevel;
    const paddingX = 50;
    const paddingY = 30;
    const chartHeight = height - (paddingY * 2);
    const chartWidth = width - (paddingX * 2);
    
    // Create points for line chart
    const points = metricData.map((value, index) => {
      const x = paddingX + (index / (metricData.length - 1)) * chartWidth;
      const y = height - (paddingY + ((value - min) / range) * chartHeight);
      return `${x},${y}`;
    }).join(' ');
    
    // Generate bars for bar chart
    const bars = metricData.map((value, index) => {
      const barWidth = chartWidth / metricData.length * 0.8;
      const x = paddingX + (index / (metricData.length - 1)) * chartWidth - (barWidth / 2);
      const barHeight = ((value - min) / range) * chartHeight;
      const y = height - (paddingY + barHeight);
      
      return (
        <rect
          key={index}
          x={x}
          y={y}
          width={barWidth}
          height={barHeight}
          fill="#7FC844"
          opacity={0.8}
        />
      );
    });
    
    // Generate grid lines (horizontal)
    const gridLines = showGrid ? Array.from({ length: 5 }, (_, i) => {
      const y = paddingY + (i / 4) * chartHeight;
      return (
        <line
          key={`grid-h-${i}`}
          x1={paddingX}
          y1={height - y}
          x2={width - paddingX}
          y2={height - y}
          stroke="#333"
          strokeWidth="1"
          strokeDasharray="5,5"
        />
      );
    }) : null;
    
    // Generate grid lines (vertical)
    const verticalGridLines = showGrid ? Array.from({ length: 6 }, (_, i) => {
      const x = paddingX + (i / 5) * chartWidth;
      return (
        <line
          key={`grid-v-${i}`}
          x1={x}
          y1={paddingY}
          x2={x}
          y2={height - paddingY}
          stroke="#333"
          strokeWidth="1"
          strokeDasharray="5,5"
        />
      );
    }) : null;
    
    // Generate data points markers
    const dataPoints = showDataPoints ? metricData.map((value, index) => {
      const x = paddingX + (index / (metricData.length - 1)) * chartWidth;
      const y = height - (paddingY + ((value - min) / range) * chartHeight);
      return (
        <circle
          key={`point-${index}`}
          cx={x}
          cy={y}
          r={3}
          fill="#fff"
          stroke="#7FC844"
          strokeWidth="2"
        />
      );
    }) : null;
    
    // Generate axis labels (x-axis - RPM)
    const xAxisLabels = Array.from({ length: 6 }, (_, i) => {
      const rpmValue = Math.round(rpmData[Math.floor((i / 5) * (rpmData.length - 1))]);
      const x = paddingX + (i / 5) * chartWidth;
      return (
        <text
          key={`x-label-${i}`}
          x={x}
          y={height - 5}
          textAnchor="middle"
          fontSize="12"
          fill="#aaa"
        >
          {rpmValue}
        </text>
      );
    });
    
    // Generate axis labels (y-axis - Metric value)
    const yAxisLabels = Array.from({ length: 5 }, (_, i) => {
      const value = min + (i / 4) * range;
      const y = height - (paddingY + (i / 4) * chartHeight);
      return (
        <text
          key={`y-label-${i}`}
          x={paddingX - 10}
          y={y}
          textAnchor="end"
          dominantBaseline="middle"
          fontSize="12"
          fill="#aaa"
        >
          {formatMetricValue(value, selectedMetric)}
        </text>
      );
    });
    
    return (
      <div className="overflow-auto relative">
        <svg 
          width={width} 
          height={height} 
          viewBox={`0 0 ${width} ${height}`}
          className="bg-zinc-900"
        >
          {/* Grid lines */}
          {gridLines}
          {verticalGridLines}
          
          {/* Axes */}
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="#555"
            strokeWidth="2"
          />
          <line
            x1={paddingX}
            y1={paddingY}
            x2={paddingX}
            y2={height - paddingY}
            stroke="#555"
            strokeWidth="2"
          />
          
          {/* Axis labels */}
          {xAxisLabels}
          {yAxisLabels}
          <text
            x={width / 2}
            y={height - 5}
            textAnchor="middle"
            fontSize="14"
            fill="#aaa"
            transform={`translate(0, 15)`}
          >
            RPM
          </text>
          <text
            x={15}
            y={height / 2}
            textAnchor="middle"
            fontSize="14"
            fill="#aaa"
            transform={`rotate(-90, 15, ${height / 2}) translate(0, -5)`}
          >
            {getMetricLabel(selectedMetric)}
          </text>
          
          {/* Chart */}
          {chartType === 'line' ? (
            <>
              {/* Line chart */}
              <polyline
                points={points}
                fill="none"
                stroke="#7FC844"
                strokeWidth="3"
              />
              {dataPoints}
            </>
          ) : (
            <>
              {/* Bar chart */}
              {bars}
            </>
          )}
          
          {/* Legend */}
          {showLegend && (
            <g transform={`translate(${paddingX + 20}, ${paddingY + 20})`}>
              <rect width="160" height="30" rx="5" fill="#111" fillOpacity="0.7" />
              <line x1="10" y1="15" x2="30" y2="15" stroke="#7FC844" strokeWidth="3" />
              <text x="40" y="20" fontSize="14" fill="#fff">
                {`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
              </text>
            </g>
          )}
        </svg>
      </div>
    );
  };

  // Render the benchmark comparison panel
  const renderBenchmarkPanel = () => {
    return (
      <div className="bg-zinc-900 rounded-lg p-4">
        <h3 className="text-lg font-bold mb-4">Performance Benchmarks</h3>
        
        <div className="space-y-4">
          {BENCHMARK_CATEGORIES.map(category => (
            <div key={category} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{category}</span>
                <span className="font-semibold">{benchmarkScores[category]}/100</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress 
                  value={benchmarkScores[category]} 
                  className="h-2" 
                />
                <span className="text-xs text-gray-400 min-w-[40px]">
                  {getBenchmarkRating(benchmarkScores[category])}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-3 bg-zinc-800 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Vehicle Class Ranking</span>
            <span className="text-xs bg-[#7FC844] text-black px-2 py-0.5 rounded">Top 15%</span>
          </div>
          <p className="text-sm text-gray-400">
            Based on comparison with {vehicle.make} {vehicle.model} competitors and similar vehicles in its class.
          </p>
        </div>
      </div>
    );
  };

  // Get benchmark rating text
  const getBenchmarkRating = (score: number): string => {
    if (score >= 90) return "Elite";
    if (score >= 80) return "Great";
    if (score >= 70) return "Good";
    if (score >= 50) return "Average";
    if (score >= 30) return "Fair";
    return "Poor";
  };

  return (
    <div className="bg-black text-white">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <LineChartIcon className="h-6 w-6 text-[#7FC844]" />
            <span className="bg-gradient-to-r from-[#7FC844] to-blue-500 bg-clip-text text-transparent">
              Performance Analytics
            </span>
          </h2>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportData}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button onClick={onClose} variant="ghost" size="sm">
              Close
            </Button>
          </div>
        </div>
        
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div>
              <h3 className="text-lg font-bold">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
              <p className="text-gray-400">{vehicle.engine_type || 'Engine'} • {vehicle.transmission || 'Transmission'} • {vehicle.drivetrain || 'Drivetrain'}</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <div className="bg-zinc-800 rounded-lg px-3 py-2 flex items-center">
                <Zap className="h-4 w-4 text-[#7FC844] mr-2" />
                <div>
                  <div className="text-xs text-gray-400">Horsepower</div>
                  <div className="font-medium">{vehicle.horsepower || '---'} hp</div>
                </div>
              </div>
              
              <div className="bg-zinc-800 rounded-lg px-3 py-2 flex items-center">
                <BarChart2 className="h-4 w-4 text-[#7FC844] mr-2" />
                <div>
                  <div className="text-xs text-gray-400">Torque</div>
                  <div className="font-medium">{vehicle.torque || '---'} lb-ft</div>
                </div>
              </div>
              
              <div className="bg-zinc-800 rounded-lg px-3 py-2 flex items-center">
                <Clock className="h-4 w-4 text-[#7FC844] mr-2" />
                <div>
                  <div className="text-xs text-gray-400">0-60 mph</div>
                  <div className="font-medium">{vehicle.zero_to_sixty?.toFixed(1) || '---'} sec</div>
                </div>
              </div>
              
              <div className="bg-zinc-800 rounded-lg px-3 py-2 flex items-center">
                <Gauge className="h-4 w-4 text-[#7FC844] mr-2" />
                <div>
                  <div className="text-xs text-gray-400">Top Speed</div>
                  <div className="font-medium">{vehicle.top_speed || '---'} mph</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Chart Area */}
          <div className="lg:w-2/3">
            <Tabs defaultValue="dyno" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-6">
                <TabsTrigger 
                  value="dyno" 
                  className="data-[state=active]:bg-[#7FC844]/20 data-[state=active]:text-[#7FC844]"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dyno Chart
                </TabsTrigger>
                <TabsTrigger 
                  value="benchmarks" 
                  className="data-[state=active]:bg-[#7FC844]/20 data-[state=active]:text-[#7FC844]"
                >
                  <BarChart4 className="h-4 w-4 mr-2" />
                  Benchmarks
                </TabsTrigger>
                <TabsTrigger 
                  value="compare" 
                  className="data-[state=active]:bg-[#7FC844]/20 data-[state=active]:text-[#7FC844]"
                >
                  <Scale className="h-4 w-4 mr-2" />
                  Compare
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="dyno" className="mt-0">
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
                    <div className="flex gap-2 items-center">
                      <Select
                        value={selectedMetric}
                        onValueChange={setSelectedMetric}
                      >
                        <SelectTrigger className="w-[200px] bg-zinc-800 border-zinc-700">
                          <SelectValue placeholder="Select metric" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableMetrics.map(metric => (
                            <SelectItem key={metric} value={metric}>
                              <div className="flex items-center gap-2">
                                {getMetricIcon(metric)}
                                {getMetricLabel(metric)}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="border-zinc-700">
                            <Settings className="h-4 w-4 mr-2" />
                            Chart Options
                            <ChevronDown className="h-4 w-4 ml-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-zinc-800 border-zinc-700">
                          <div className="p-2">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm">Chart Type</span>
                              <div className="flex gap-1">
                                <Button 
                                  size="sm"
                                  variant={chartType === 'line' ? 'default' : 'outline'}
                                  className={chartType === 'line' ? 'bg-[#7FC844] text-black' : 'border-zinc-700'}
                                  onClick={() => setChartType('line')}
                                >
                                  <LineChartIcon className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm"
                                  variant={chartType === 'bar' ? 'default' : 'outline'}
                                  className={chartType === 'bar' ? 'bg-[#7FC844] text-black' : 'border-zinc-700'}
                                  onClick={() => setChartType('bar')}
                                >
                                  <BarChart3 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm">Show Legend</span>
                              <Switch 
                                checked={showLegend}
                                onCheckedChange={setShowLegend}
                                className="data-[state=checked]:bg-[#7FC844]"
                              />
                            </div>
                            
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm">Show Data Points</span>
                              <Switch 
                                checked={showDataPoints}
                                onCheckedChange={setShowDataPoints}
                                className="data-[state=checked]:bg-[#7FC844]"
                              />
                            </div>
                            
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm">Show Grid</span>
                              <Switch 
                                checked={showGrid}
                                onCheckedChange={setShowGrid}
                                className="data-[state=checked]:bg-[#7FC844]"
                              />
                            </div>
                            
                            <div className="pt-2 border-t border-zinc-700 mt-2">
                              <span className="text-sm">Zoom Level</span>
                              <div className="flex items-center mt-1">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="border-zinc-700 px-2"
                                  onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <div className="flex-grow mx-2 text-center text-sm">
                                  {(zoomLevel * 100).toFixed(0)}%
                                </div>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="border-zinc-700 px-2"
                                  onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="pt-2 border-t border-zinc-700 mt-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-zinc-700 w-full"
                                onClick={() => {
                                  setChartType('line');
                                  setShowLegend(true);
                                  setShowDataPoints(false);
                                  setShowGrid(true);
                                  setZoomLevel(1);
                                }}
                              >
                                <RotateCcw className="h-3 w-3 mr-2" />
                                Reset to Defaults
                              </Button>
                            </div>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <Button variant="link" size="sm" className="text-[#7FC844]">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share Chart
                    </Button>
                  </div>
                  
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-auto">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-80">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#7FC844]"></div>
                      </div>
                    ) : (
                      renderChart()
                    )}
                  </div>
                  
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                    <h3 className="text-lg font-bold mb-3">Performance Insights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-zinc-800 rounded-lg p-3">
                        <div className="flex items-start">
                          <div className="h-8 w-8 rounded-full bg-[#7FC844]/20 flex items-center justify-center mr-3 mt-0.5">
                            <Zap className="h-4 w-4 text-[#7FC844]" />
                          </div>
                          <div>
                            <div className="font-medium">Peak Power</div>
                            <div className="text-lg">
                              {performanceData && Math.max(...(performanceData.horsepower || [])).toFixed(0)} hp
                              <span className="text-sm text-gray-400 ml-2">@ 5500 RPM</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-zinc-800 rounded-lg p-3">
                        <div className="flex items-start">
                          <div className="h-8 w-8 rounded-full bg-[#7FC844]/20 flex items-center justify-center mr-3 mt-0.5">
                            <BarChart2 className="h-4 w-4 text-[#7FC844]" />
                          </div>
                          <div>
                            <div className="font-medium">Peak Torque</div>
                            <div className="text-lg">
                              {performanceData && Math.max(...(performanceData.torque || [])).toFixed(0)} lb-ft
                              <span className="text-sm text-gray-400 ml-2">@ 3800 RPM</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-zinc-800 rounded-lg p-3">
                        <div className="flex items-start">
                          <div className="h-8 w-8 rounded-full bg-[#7FC844]/20 flex items-center justify-center mr-3 mt-0.5">
                            <Scale className="h-4 w-4 text-[#7FC844]" />
                          </div>
                          <div>
                            <div className="font-medium">Power-to-Weight</div>
                            <div className="text-lg">
                              {vehicle.horsepower && vehicle.weight 
                                ? (vehicle.horsepower / vehicle.weight * 1000).toFixed(1) 
                                : '---'} hp/ton
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="benchmarks" className="mt-0">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="lg:w-2/3">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
                      <h3 className="text-xl font-bold mb-4">Performance Radar</h3>
                      <div className="aspect-square relative p-4 mx-auto max-w-md">
                        {/* This would be a radar chart in a real implementation */}
                        <div className="flex items-center justify-center h-full">
                          <svg width="300" height="300" viewBox="0 0 300 300">
                            {/* Background circles */}
                            <circle cx="150" cy="150" r="120" fill="none" stroke="#333" strokeWidth="1" />
                            <circle cx="150" cy="150" r="90" fill="none" stroke="#333" strokeWidth="1" />
                            <circle cx="150" cy="150" r="60" fill="none" stroke="#333" strokeWidth="1" />
                            <circle cx="150" cy="150" r="30" fill="none" stroke="#333" strokeWidth="1" />
                            
                            {/* Axis lines */}
                            <line x1="150" y1="30" x2="150" y2="270" stroke="#444" strokeWidth="1" />
                            <line x1="30" y1="150" x2="270" y2="150" stroke="#444" strokeWidth="1" />
                            <line x1="65.1" y1="65.1" x2="234.9" y2="234.9" stroke="#444" strokeWidth="1" />
                            <line x1="234.9" y1="65.1" x2="65.1" y2="234.9" stroke="#444" strokeWidth="1" />
                            
                            {/* Axis labels */}
                            <text x="150" y="15" textAnchor="middle" fill="#aaa" fontSize="12">Acceleration</text>
                            <text x="150" y="295" textAnchor="middle" fill="#aaa" fontSize="12">Braking</text>
                            <text x="295" y="150" textAnchor="middle" fill="#aaa" fontSize="12">Top Speed</text>
                            <text x="5" y="150" textAnchor="middle" fill="#aaa" fontSize="12">Efficiency</text>
                            <text x="45" y="45" textAnchor="middle" fill="#aaa" fontSize="12">Handling</text>
                            <text x="255" y="45" textAnchor="middle" fill="#aaa" fontSize="12">Power</text>
                            
                            {/* Performance polygon */}
                            <polygon 
                              points={`
                                ${150 + (benchmarkScores["Acceleration"] / 100 * 120) * Math.sin(0)},
                                ${150 - (benchmarkScores["Acceleration"] / 100 * 120) * Math.cos(0)}
                                ${150 + (benchmarkScores["Top Speed"] / 100 * 120) * Math.sin(Math.PI / 3)},
                                ${150 - (benchmarkScores["Top Speed"] / 100 * 120) * Math.cos(Math.PI / 3)}
                                ${150 + (benchmarkScores["Power"] / 100 * 120) * Math.sin(2 * Math.PI / 3)},
                                ${150 - (benchmarkScores["Power"] / 100 * 120) * Math.cos(2 * Math.PI / 3)}
                                ${150 + (benchmarkScores["Braking"] / 100 * 120) * Math.sin(Math.PI)},
                                ${150 - (benchmarkScores["Braking"] / 100 * 120) * Math.cos(Math.PI)}
                                ${150 + (benchmarkScores["Efficiency"] / 100 * 120) * Math.sin(4 * Math.PI / 3)},
                                ${150 - (benchmarkScores["Efficiency"] / 100 * 120) * Math.cos(4 * Math.PI / 3)}
                                ${150 + (benchmarkScores["Handling"] / 100 * 120) * Math.sin(5 * Math.PI / 3)},
                                ${150 - (benchmarkScores["Handling"] / 100 * 120) * Math.cos(5 * Math.PI / 3)}
                              `}
                              fill="#7FC844"
                              fillOpacity="0.3"
                              stroke="#7FC844"
                              strokeWidth="2"
                            />
                            
                            {/* Data points */}
                            <circle 
                              cx={150 + (benchmarkScores["Acceleration"] / 100 * 120) * Math.sin(0)}
                              cy={150 - (benchmarkScores["Acceleration"] / 100 * 120) * Math.cos(0)}
                              r="4" fill="#7FC844"
                            />
                            <circle 
                              cx={150 + (benchmarkScores["Top Speed"] / 100 * 120) * Math.sin(Math.PI / 3)}
                              cy={150 - (benchmarkScores["Top Speed"] / 100 * 120) * Math.cos(Math.PI / 3)}
                              r="4" fill="#7FC844"
                            />
                            <circle 
                              cx={150 + (benchmarkScores["Power"] / 100 * 120) * Math.sin(2 * Math.PI / 3)}
                              cy={150 - (benchmarkScores["Power"] / 100 * 120) * Math.cos(2 * Math.PI / 3)}
                              r="4" fill="#7FC844"
                            />
                            <circle 
                              cx={150 + (benchmarkScores["Braking"] / 100 * 120) * Math.sin(Math.PI)}
                              cy={150 - (benchmarkScores["Braking"] / 100 * 120) * Math.cos(Math.PI)}
                              r="4" fill="#7FC844"
                            />
                            <circle 
                              cx={150 + (benchmarkScores["Efficiency"] / 100 * 120) * Math.sin(4 * Math.PI / 3)}
                              cy={150 - (benchmarkScores["Efficiency"] / 100 * 120) * Math.cos(4 * Math.PI / 3)}
                              r="4" fill="#7FC844"
                            />
                            <circle 
                              cx={150 + (benchmarkScores["Handling"] / 100 * 120) * Math.sin(5 * Math.PI / 3)}
                              cy={150 - (benchmarkScores["Handling"] / 100 * 120) * Math.cos(5 * Math.PI / 3)}
                              r="4" fill="#7FC844"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 mt-6">
                      <h3 className="text-xl font-bold mb-4">Key Performance Metrics</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-zinc-800 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-[#7FC844]" />
                            <h4 className="font-medium">Acceleration Times</h4>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm">
                                <span>0-60 mph</span>
                                <span className="font-semibold">{vehicle.zero_to_sixty?.toFixed(1) || '4.2'} sec</span>
                              </div>
                              <Progress value={80} className="h-1.5" />
                            </div>
                            
                            <div>
                              <div className="flex justify-between text-sm">
                                <span>0-100 mph</span>
                                <span className="font-semibold">9.5 sec</span>
                              </div>
                              <Progress value={75} className="h-1.5" />
                            </div>
                            
                            <div>
                              <div className="flex justify-between text-sm">
                                <span>Quarter Mile</span>
                                <span className="font-semibold">{vehicle.quarter_mile?.toFixed(1) || '12.3'} sec</span>
                              </div>
                              <Progress value={85} className="h-1.5" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-zinc-800 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Gauge className="h-4 w-4 text-[#7FC844]" />
                            <h4 className="font-medium">Speed & Handling</h4>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm">
                                <span>Top Speed</span>
                                <span className="font-semibold">{vehicle.top_speed || '186'} mph</span>
                              </div>
                              <Progress value={88} className="h-1.5" />
                            </div>
                            
                            <div>
                              <div className="flex justify-between text-sm">
                                <span>60-0 Braking</span>
                                <span className="font-semibold">104 ft</span>
                              </div>
                              <Progress value={92} className="h-1.5" />
                            </div>
                            
                            <div>
                              <div className="flex justify-between text-sm">
                                <span>Skidpad (g)</span>
                                <span className="font-semibold">1.05 g</span>
                              </div>
                              <Progress value={82} className="h-1.5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:w-1/3">
                    {renderBenchmarkPanel()}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="compare" className="mt-0">
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
                  <h3 className="text-xl font-bold mb-4">Compare Vehicles</h3>
                  
                  <div className="mb-4">
                    <Select
                      value={selectedComparison || ''}
                      onValueChange={setSelectedComparison}
                    >
                      <SelectTrigger className="w-full bg-zinc-800 border-zinc-700">
                        <SelectValue placeholder="Select a vehicle to compare" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vehicle1">2023 Porsche 911 Turbo S</SelectItem>
                        <SelectItem value="vehicle2">2023 Lamborghini Huracán Evo</SelectItem>
                        <SelectItem value="vehicle3">2023 Audi R8 V10 Performance</SelectItem>
                        <SelectItem value="vehicle4">2023 McLaren 720S</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {!selectedComparison && (
                      <div className="mt-8 text-center">
                        <div className="bg-zinc-800 rounded-lg p-6 inline-block">
                          <Scale className="h-12 w-12 mx-auto mb-3 text-gray-500" />
                          <h4 className="text-lg font-medium mb-2">No Comparison Selected</h4>
                          <p className="text-gray-400 mb-4">
                            Select a vehicle above to see a detailed comparison.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {selectedComparison && (
                      <div className="mt-6">
                        <h4 className="text-lg font-bold mb-4 flex items-center">
                          <BarChart3 className="h-4 w-4 text-[#7FC844] mr-2" />
                          Comparison: {vehicle.year} {vehicle.make} {vehicle.model} vs. 
                          {selectedComparison === 'vehicle1' ? ' 2023 Porsche 911 Turbo S' : 
                           selectedComparison === 'vehicle2' ? ' 2023 Lamborghini Huracán Evo' :
                           selectedComparison === 'vehicle3' ? ' 2023 Audi R8 V10 Performance' : ' 2023 McLaren 720S'}
                        </h4>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-4 items-center">
                            <div className="text-right font-medium">
                              {vehicle.horsepower || 562} hp
                            </div>
                            <div className="text-center text-gray-400 text-sm">Horsepower</div>
                            <div className="font-medium">
                              {selectedComparison === 'vehicle1' ? '640 hp' : 
                               selectedComparison === 'vehicle2' ? '631 hp' :
                               selectedComparison === 'vehicle3' ? '602 hp' : '710 hp'}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 items-center">
                            <div className="text-right font-medium">
                              {vehicle.torque || 470} lb-ft
                            </div>
                            <div className="text-center text-gray-400 text-sm">Torque</div>
                            <div className="font-medium">
                              {selectedComparison === 'vehicle1' ? '590 lb-ft' : 
                               selectedComparison === 'vehicle2' ? '443 lb-ft' :
                               selectedComparison === 'vehicle3' ? '413 lb-ft' : '568 lb-ft'}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 items-center">
                            <div className="text-right font-medium">
                              {vehicle.zero_to_sixty?.toFixed(1) || '3.2'} sec
                            </div>
                            <div className="text-center text-gray-400 text-sm">0-60 mph</div>
                            <div className="font-medium">
                              {selectedComparison === 'vehicle1' ? '2.6 sec' : 
                               selectedComparison === 'vehicle2' ? '2.9 sec' :
                               selectedComparison === 'vehicle3' ? '3.2 sec' : '2.8 sec'}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 items-center">
                            <div className="text-right font-medium">
                              {vehicle.top_speed || 199} mph
                            </div>
                            <div className="text-center text-gray-400 text-sm">Top Speed</div>
                            <div className="font-medium">
                              {selectedComparison === 'vehicle1' ? '205 mph' : 
                               selectedComparison === 'vehicle2' ? '202 mph' :
                               selectedComparison === 'vehicle3' ? '205 mph' : '212 mph'}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 items-center">
                            <div className="text-right font-medium">
                              {vehicle.quarter_mile?.toFixed(1) || '11.2'} sec
                            </div>
                            <div className="text-center text-gray-400 text-sm">Quarter Mile</div>
                            <div className="font-medium">
                              {selectedComparison === 'vehicle1' ? '10.5 sec' : 
                               selectedComparison === 'vehicle2' ? '10.6 sec' :
                               selectedComparison === 'vehicle3' ? '10.8 sec' : '10.3 sec'}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 items-center">
                            <div className="text-right font-medium">
                              {vehicle.weight || 3400} lbs
                            </div>
                            <div className="text-center text-gray-400 text-sm">Weight</div>
                            <div className="font-medium">
                              {selectedComparison === 'vehicle1' ? '3,635 lbs' : 
                               selectedComparison === 'vehicle2' ? '3,135 lbs' :
                               selectedComparison === 'vehicle3' ? '3,637 lbs' : '3,128 lbs'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-8 p-4 bg-zinc-800 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-full bg-[#7FC844]/20 flex-shrink-0">
                              <Info className="h-5 w-5 text-[#7FC844]" />
                            </div>
                            <div>
                              <h5 className="font-medium mb-1">Comparison Summary</h5>
                              <p className="text-sm text-gray-400">
                                The {selectedComparison === 'vehicle1' ? 'Porsche 911 Turbo S' : 
                                selectedComparison === 'vehicle2' ? 'Lamborghini Huracán Evo' :
                                selectedComparison === 'vehicle3' ? 'Audi R8 V10 Performance' : 'McLaren 720S'} offers {' '}
                                {selectedComparison === 'vehicle1' ? '78 more horsepower' : 
                                selectedComparison === 'vehicle2' ? '69 more horsepower' :
                                selectedComparison === 'vehicle3' ? '40 more horsepower' : '148 more horsepower'} and{' '}
                                {selectedComparison === 'vehicle1' ? 'superior acceleration' : 
                                selectedComparison === 'vehicle2' ? 'better handling' :
                                selectedComparison === 'vehicle3' ? 'similar performance' : 'higher top speed'}, but the {vehicle.year} {vehicle.make} {vehicle.model} {' '}
                                {selectedComparison === 'vehicle1' ? 'is lighter and more agile' : 
                                selectedComparison === 'vehicle2' ? 'offers better value' :
                                selectedComparison === 'vehicle3' ? 'has more usable torque' : 'is more comfortable for daily use'}.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar */}
          <div className="lg:w-1/3">
            {renderBenchmarkPanel()}
            
            <div className="bg-zinc-900 rounded-lg p-4 mt-6">
              <h3 className="text-lg font-bold mb-3 flex items-center">
                <Info className="h-4 w-4 text-[#7FC844] mr-2" />
                Performance Notes
              </h3>
              
              <div className="space-y-3">
                <div className="bg-zinc-800 rounded-lg p-3">
                  <p className="text-sm">
                    Vehicle shows excellent power delivery across the RPM band with peak torque available from 3,800 RPM.
                  </p>
                </div>
                
                <div className="bg-zinc-800 rounded-lg p-3">
                  <p className="text-sm">
                    Performance is above average for its class, with acceleration benchmarks in the top 15% of comparable vehicles.
                  </p>
                </div>
                
                <div className="bg-zinc-800 rounded-lg p-3">
                  <p className="text-sm">
                    Consider performance upgrades for air intake and exhaust to improve horsepower by an estimated 5-8%.
                  </p>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                className="w-full mt-3 border-zinc-700"
                onClick={() => toast({
                  title: "Feature Coming Soon",
                  description: "Add performance notes feature will be available soon."
                })}
              >
                <Plus className="h-3 w-3 mr-2" />
                Add Note
              </Button>
            </div>
            
            <div className="bg-zinc-900 rounded-lg p-4 mt-6">
              <h3 className="text-lg font-bold mb-3 flex items-center">
                <Gauge className="h-4 w-4 text-[#7FC844] mr-2" />
                Suggested Upgrades
              </h3>
              
              <div className="space-y-3">
                <div className="bg-zinc-800 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <div className="font-medium">High-Flow Air Intake</div>
                    <div className="text-xs text-gray-400">+15 hp / +12 lb-ft</div>
                  </div>
                  <Badge className="bg-[#7FC844] text-black">Recommended</Badge>
                </div>
                
                <div className="bg-zinc-800 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <div className="font-medium">Performance Exhaust</div>
                    <div className="text-xs text-gray-400">+12 hp / +10 lb-ft</div>
                  </div>
                  <Badge className="bg-zinc-700">Optional</Badge>
                </div>
                
                <div className="bg-zinc-800 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <div className="font-medium">ECU Tune</div>
                    <div className="text-xs text-gray-400">+25 hp / +35 lb-ft</div>
                  </div>
                  <Badge className="bg-[#7FC844] text-black">Recommended</Badge>
                </div>
                
                <div className="bg-zinc-800 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <div className="font-medium">Lightweight Wheels</div>
                    <div className="text-xs text-gray-400">-35 lbs total weight</div>
                  </div>
                  <Badge className="bg-zinc-700">Optional</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalytics;