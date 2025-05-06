import React from 'react';

interface Paddock20Event {
  title: string;
  date: string;
  location: string;
  link: string;
}

interface Paddock20EventCardProps {
  event: Paddock20Event;
}

function Paddock20EventCard({ event }: Paddock20EventCardProps) {
  return (
    <div className="bg-gray-900 p-6 rounded-lg mb-6 shadow-md">
      <h3 className="text-blue-400 font-orbitron text-xl">{event.title}</h3>
      <p className="text-white mt-2">{event.date}</p>
      <p className="text-gray-400">{event.location}</p>
      <a 
        href={event.link}
        className="inline-block mt-4 bg-green-500 hover:bg-green-400 text-black font-montserrat rounded px-6 py-2"
      >
        View Details
      </a>
    </div>
  );
}

export default Paddock20EventCard;