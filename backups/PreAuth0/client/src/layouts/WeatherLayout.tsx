import React, { ReactNode } from "react";
import WorldClockPanel from "../components/WorldClockPanel";

type WeatherLayoutProps = {
  children: ReactNode;
  showCircuitTimes?: boolean;
};

/**
 * WeatherLayout - A layout component that includes the WorldClockPanel
 * This allows us to include the circuit times and weather anywhere in the application
 */
const WeatherLayout: React.FC<WeatherLayoutProps> = ({ 
  children, 
  showCircuitTimes = true 
}) => {
  return (
    <div className="weather-layout">
      {showCircuitTimes && <WorldClockPanel />}
      {children}
    </div>
  );
};

export default WeatherLayout;