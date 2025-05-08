import React from 'react';

interface HagertyEvent {
  name: string;
  startDate: string;
  endDate: string;
  venueName: string;
  city: string;
  region: string;
  registrationUrl?: string;
}

interface HagertyEventCardProps {
  event: HagertyEvent;
}

function HagertyEventCard({ event }: HagertyEventCardProps) {
  return (
    <div className="bg-gray-900 p-6 rounded-lg mb-6 shadow-md">
      <h3 className="text-blue-400 font-orbitron text-xl">{event.name}</h3>
      <p className="text-white mt-2">
        {new Date(event.startDate).toLocaleDateString()} → {new Date(event.endDate).toLocaleDateString()}
      </p>
      <p className="text-gray-400">{event.venueName}, {event.city}, {event.region}</p>
      {event.registrationUrl && (
        <a 
          href={event.registrationUrl}
          className="inline-block mt-4 bg-green-500 hover:bg-green-400 text-black font-montserrat rounded px-6 py-2"
        >
          Register
        </a>
      )}
    </div>
  );
}

export default HagertyEventCard;