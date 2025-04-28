import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine, 
  Area, 
  AreaChart 
} from 'recharts';

/**
 * Interactive Progress Sparkline Component
 * 
 * Displays a small, interactive chart showing progress over time
 * 
 * @param {object} props
 * @param {array} props.data - Array of data points, each with date and value properties
 * @param {string} props.dataKey - The key in the data objects to plot (e.g., 'value')
 * @param {string} props.color - Primary color for the sparkline
 * @param {string} props.fillColor - Fill color for the area below the line
 * @param {boolean} props.showTooltip - Whether to show tooltips on hover
 * @param {string} props.tooltipLabelFormat - Format function for the tooltip label (date)
 * @param {string} props.tooltipValueFormat - Format function for the tooltip value
 * @param {number} props.height - Height of the sparkline component
 * @param {boolean} props.interactive - Whether to show the detailed view on click
 * @param {string} props.type - Type of sparkline: 'line' or 'area'
 * @param {number} props.targetValue - Optional target value to show as reference line
 */
function ProgressSparkline({ 
  data = [],
  dataKey = 'value',
  color = '#22c55e', // GoTime green
  fillColor = 'rgba(34, 197, 94, 0.2)', // GoTime green with opacity
  secondaryColor = '#3b82f6', // Carolina blue
  showTooltip = false,
  tooltipLabelFormat = (value) => value,
  tooltipValueFormat = (value) => value,
  height = 40,
  interactive = false,
  type = 'line',
  targetValue = null,
  title = '',
  subtitle = '',
  className = ''
}) {
  const [expanded, setExpanded] = useState(false);
  
  // Format data if needed
  const chartData = data.map(item => {
    // Ensure the item has at least date and value keys
    if (!item.date) {
      return { ...item, date: new Date().toISOString() };
    }
    
    // Ensure the value exists and is a number
    if (typeof item[dataKey] !== 'number') {
      return { ...item, [dataKey]: 0 };
    }
    
    return item;
  });
  
  // Calculate min and max values
  const values = chartData.map(item => item[dataKey]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  // Calculate domain padding for Y axis (10% padding)
  const yDomainPadding = (max - min) * 0.1;
  const yDomain = [
    Math.max(0, min - yDomainPadding), 
    max + yDomainPadding
  ];
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-md p-2 text-sm">
          <div className="text-gray-300">
            {tooltipLabelFormat(label)}
          </div>
          <div className="text-white font-medium">
            {tooltipValueFormat(payload[0].value)}
          </div>
        </div>
      );
    }
  
    return null;
  };
  
  // Compact sparkline (non-interactive)
  if (!expanded) {
    return (
      <div 
        className={`${className} relative ${interactive ? 'cursor-pointer' : ''}`}
        onClick={() => interactive && setExpanded(true)}
      >
        {title && (
          <div className="flex justify-between items-center mb-1">
            <div className="text-xs text-gray-400">{title}</div>
            {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
          </div>
        )}
        
        <ResponsiveContainer width="100%" height={height}>
          {type === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              {targetValue && <ReferenceLine y={targetValue} stroke="#666" strokeDasharray="3 3" />}
              <Area 
                type="monotone" 
                dataKey={dataKey}
                stroke={color} 
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#colorGradient)"
                animationDuration={750} 
              />
            </AreaChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              {targetValue && <ReferenceLine y={targetValue} stroke="#666" strokeDasharray="3 3" />}
              <Line 
                type="monotone" 
                dataKey={dataKey}
                stroke={color} 
                strokeWidth={1.5}
                dot={false}
                animationDuration={750} 
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  }
  
  // Expanded detailed view (interactive)
  return (
    <div className={`${className} bg-gray-900 rounded-lg p-4 shadow-lg`}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-white font-medium">{title}</h3>
          {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
        </div>
        <button 
          onClick={() => setExpanded(false)}
          className="text-gray-400 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      <ResponsiveContainer width="100%" height={250}>
        {type === 'area' ? (
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="colorGradientDetailed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              axisLine={{ stroke: '#374151' }}
              tickLine={{ stroke: '#374151' }}
            />
            <YAxis 
              domain={yDomain}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              axisLine={{ stroke: '#374151' }}
              tickLine={{ stroke: '#374151' }}
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {targetValue && <ReferenceLine y={targetValue} stroke="#666" strokeDasharray="3 3" label={{ value: 'Target', position: 'right', fill: '#666' }} />}
            <Area 
              type="monotone" 
              dataKey={dataKey}
              name={title}
              stroke={color} 
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorGradientDetailed)"
              activeDot={{ r: 6, fill: color, stroke: '#111', strokeWidth: 2 }}
              animationDuration={750} 
            />
          </AreaChart>
        ) : (
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              axisLine={{ stroke: '#374151' }}
              tickLine={{ stroke: '#374151' }}
            />
            <YAxis 
              domain={yDomain}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              axisLine={{ stroke: '#374151' }}
              tickLine={{ stroke: '#374151' }}
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {targetValue && <ReferenceLine y={targetValue} stroke="#666" strokeDasharray="3 3" label={{ value: 'Target', position: 'right', fill: '#666' }} />}
            <Line 
              type="monotone" 
              dataKey={dataKey}
              name={title}
              stroke={color} 
              strokeWidth={2}
              dot={{ r: 4, fill: color, stroke: '#111', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: color, stroke: '#111', strokeWidth: 2 }}
              animationDuration={750} 
            />
          </LineChart>
        )}
      </ResponsiveContainer>
      
      <div className="text-gray-400 text-sm mt-4">
        <p>Click the chart for more details or statistics</p>
      </div>
    </div>
  );
}

export default ProgressSparkline;