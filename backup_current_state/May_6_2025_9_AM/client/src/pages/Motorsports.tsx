import React, { useEffect, useState } from 'react';
import F1WeatherDashboard from '@/components/F1WeatherDashboard';
import { WeatherProvider } from '@/contexts/WeatherContext';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Calendar, Trophy, Flag, MapPin } from 'lucide-react';

// Sample data for upcoming races
const upcomingRaces = [
  {
    id: 1,
    name: 'Monaco Grand Prix',
    circuit: 'Circuit de Monaco',
    location: 'Monte Carlo, Monaco',
    date: '2025-05-25',
    time: '14:00',
    trackLength: '3.337 km',
    laps: 78,
    totalDistance: '260.286 km',
    lapRecord: {
      time: '1:12.909',
      driver: 'Lewis Hamilton',
      year: 2021
    },
    coordinates: {
      lat: 43.7347,
      lon: 7.4206
    }
  },
  {
    id: 2,
    name: 'Canadian Grand Prix',
    circuit: 'Circuit Gilles Villeneuve',
    location: 'Montreal, Canada',
    date: '2025-06-08',
    time: '14:00',
    trackLength: '4.361 km',
    laps: 70,
    totalDistance: '305.27 km',
    lapRecord: {
      time: '1:13.078',
      driver: 'Valtteri Bottas',
      year: 2019
    },
    coordinates: {
      lat: 45.5017,
      lon: -73.5673
    }
  },
  {
    id: 3,
    name: 'Spanish Grand Prix',
    circuit: 'Circuit de Barcelona-Catalunya',
    location: 'Barcelona, Spain',
    date: '2025-06-22',
    time: '15:00',
    trackLength: '4.675 km',
    laps: 66,
    totalDistance: '308.424 km',
    lapRecord: {
      time: '1:18.149',
      driver: 'Max Verstappen',
      year: 2021
    },
    coordinates: {
      lat: 41.3851,
      lon: 2.1734
    }
  }
];

function Motorsports() {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Calculate countdown to next race
  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      // Parse next race date
      const [year, month, day] = upcomingRaces[0].date.split('-').map(Number);
      const [hour, minute] = upcomingRaces[0].time.split(':').map(Number);
      
      // Create race date object
      const raceDate = new Date(year, month - 1, day, hour, minute);
      const diff = raceDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      // Calculate remaining time
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setCountdown({ days, hours, minutes, seconds });
    };
    
    // Update countdown every second
    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Format date string
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="px-4 py-8 md:p-10">
      <h1 className="apex-header-green text-3xl mb-6">F1 MOTORSPORTS HUB</h1>
      
      {/* Next Race Countdown */}
      <div className="mb-10">
        <h2 className="apex-header-gray mb-4">NEXT RACE COUNTDOWN</h2>
        <Card className="bg-gray-900 border-gray-800 shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4">
              <div>
                <h3 className="text-2xl font-bold">{upcomingRaces[0].name}</h3>
                <div className="flex items-center mt-2 text-gray-400">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{upcomingRaces[0].circuit}, {upcomingRaces[0].location}</span>
                </div>
                <div className="flex items-center mt-2 text-gray-400">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{formatDate(upcomingRaces[0].date)}</span>
                </div>
                <div className="flex items-center mt-2 text-gray-400">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{upcomingRaces[0].time} UTC</span>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-3 mt-6 md:mt-0 text-center">
                <div className="flex flex-col items-center justify-center bg-gray-800 p-4 rounded-lg">
                  <span className="text-3xl font-bold">{countdown.days}</span>
                  <span className="text-xs text-gray-400">DAYS</span>
                </div>
                <div className="flex flex-col items-center justify-center bg-gray-800 p-4 rounded-lg">
                  <span className="text-3xl font-bold">{countdown.hours}</span>
                  <span className="text-xs text-gray-400">HOURS</span>
                </div>
                <div className="flex flex-col items-center justify-center bg-gray-800 p-4 rounded-lg">
                  <span className="text-3xl font-bold">{countdown.minutes}</span>
                  <span className="text-xs text-gray-400">MIN</span>
                </div>
                <div className="flex flex-col items-center justify-center bg-gray-800 p-4 rounded-lg">
                  <span className="text-3xl font-bold">{countdown.seconds}</span>
                  <span className="text-xs text-gray-400">SEC</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-800 p-3 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">TRACK LENGTH</p>
                <p className="font-bold">{upcomingRaces[0].trackLength}</p>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">LAPS</p>
                <p className="font-bold">{upcomingRaces[0].laps}</p>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">DISTANCE</p>
                <p className="font-bold">{upcomingRaces[0].totalDistance}</p>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">LAP RECORD</p>
                <p className="font-bold">{upcomingRaces[0].lapRecord.time}</p>
                <p className="text-xs text-gray-400">{upcomingRaces[0].lapRecord.driver} ({upcomingRaces[0].lapRecord.year})</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* F1 Style Weather Dashboard */}
      <div className="mb-10">
        <WeatherProvider>
          <F1WeatherDashboard />
        </WeatherProvider>
      </div>
      
      {/* Upcoming Races */}
      <div className="mb-10">
        <h2 className="apex-header-gray mb-4">UPCOMING RACES</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingRaces.slice(1).map(race => (
            <Card key={race.id} className="bg-gray-900 border-gray-800 hover:border-blue-500 transition-all duration-300 shadow-xl">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">{race.name}</h3>
                <div className="flex items-center text-gray-400 mb-2">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{race.circuit}</span>
                </div>
                <div className="flex items-center text-gray-400 mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{formatDate(race.date)}</span>
                </div>
                <div className="flex items-center text-gray-400 mb-4">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{race.time} UTC</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <Flag className="h-4 w-4 mr-1 text-blue-400" />
                    <span>{race.laps} laps</span>
                  </div>
                  <div className="flex items-center">
                    <Trophy className="h-4 w-4 mr-1 text-yellow-400" />
                    <span>{race.lapRecord.time} (record)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-gray-400">More live race data and statistics will be available soon.</p>
      </div>
    </div>
  );
}

export default Motorsports;