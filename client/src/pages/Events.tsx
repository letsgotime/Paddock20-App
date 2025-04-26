import React, { useEffect, useState } from 'react';
import Paddock20EventCard from '@/components/Paddock20EventCard';
import HagertyEventCard from '@/components/HagertyEventCard';
import axios from 'axios';

interface HagertyEvent {
  name: string;
  startDate: string;
  endDate: string;
  venueName: string;
  city: string;
  region: string;
  registrationUrl?: string;
}

interface Paddock20Event {
  title: string;
  date: string;
  location: string;
  link: string;
}

function Events() {
  const [hagertyEvents, setHagertyEvents] = useState<HagertyEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHagertyEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          'https://api.motorsportreg.com/rest/calendars/organization/24F99508-0CD3-9918-88E0596342103A64.json',
          {
            headers: {
              'X-Organization-Id': '24F99508-0CD3-9918-88E0596342103A64',
              'Authorization': 'Basic ' + btoa('your-username:your-password')
            }
          }
        );
        setHagertyEvents(response.data.events || []);
        setError(null);
      } catch (error) {
        console.error('Error fetching Hagerty events:', error);
        setError('Failed to load Hagerty events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchHagertyEvents();
  }, []);

  // Mock Paddock20 event data for now
  const paddock20Events = [
    {
      title: "Paddock20 | Global Meet Los Angeles",
      date: "June 22, 2025",
      location: "Santa Monica Airport, CA",
      link: "#"
    },
    {
      title: "Paddock20 | Nürburgring Summer Sprint",
      date: "July 15, 2025",
      location: "Nürburgring, Germany",
      link: "#"
    }
  ];

  return (
    <div className="p-10">
      <h1 className="text-blue-400 font-orbitron text-3xl mb-6">Events & Meetups</h1>

      {/* Paddock20 Global Events */}
      <section className="mb-12">
        <h2 className="text-green-400 font-orbitron text-xl uppercase mb-4">Paddock20 Global Events</h2>
        {paddock20Events.map((event, index) => (
          <Paddock20EventCard key={index} event={event} />
        ))}
      </section>

      <hr className="border-gray-700 my-10" />

      {/* Hagerty Events */}
      <section>
        <h2 className="text-green-400 font-orbitron text-xl uppercase mb-4">Hagerty Registered Events</h2>
        {loading ? (
          <p className="text-gray-400">Loading Hagerty events...</p>
        ) : error ? (
          <div className="bg-gray-900 p-6 rounded-lg border border-red-900">
            <p className="text-red-400">{error}</p>
            <p className="text-gray-400 mt-2">Please check your API credentials and try again.</p>
          </div>
        ) : hagertyEvents.length > 0 ? (
          hagertyEvents.map((event, index) => (
            <HagertyEventCard key={index} event={event} />
          ))
        ) : (
          <p className="text-gray-400">No events found. Check back later for updates.</p>
        )}
      </section>
    </div>
  );
}

export default Events;