import SimpleWeatherStation from "@/components/SimpleWeatherStation";
import { WeatherProvider } from "@/contexts/WeatherContext";

const WeatherPage = () => {
  return (
    <div className="min-h-screen bg-black max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <WeatherProvider>
        <SimpleWeatherStation />
      </WeatherProvider>
    </div>
  );
};

export default WeatherPage;