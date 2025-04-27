import WeatherStation from "@/components/WeatherStation";

const WeatherPage = () => {
  return (
    <div className="min-h-screen bg-black max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-orbitron text-blue-400 text-4xl mb-8">☁️ Weather Center</h1>
      <WeatherStation />
    </div>
  );
};

export default WeatherPage;