import React from 'react';

const EventsMeetupsPage = () => {
  const upcomingEvents = [
    {
      id: 1,
      title: "Track Day at Circuit of the Americas",
      date: "May 15, 2025",
      location: "Austin, TX",
      description: "Experience the thrill of driving on one of America's premier race tracks.",
      category: "Track Day"
    },
    {
      id: 2,
      title: "Cars & Coffee - Miami Edition",
      date: "May 21, 2025",
      location: "Miami, FL",
      description: "Join fellow enthusiasts for coffee and conversation surrounded by exceptional cars.",
      category: "Meetup"
    },
    {
      id: 3,
      title: "Mountain Drive - Tail of the Dragon",
      date: "June 5, 2025",
      location: "Deals Gap, NC",
      description: "Navigate the famous 318 curves in 11 miles of America's most exciting road.",
      category: "Group Drive"
    },
    {
      id: 4,
      title: "Supercar Sunday",
      date: "June 12, 2025",
      location: "Los Angeles, CA",
      description: "Weekly gathering of exotic and rare automobiles in Southern California.",
      category: "Meetup"
    },
    {
      id: 5,
      title: "Autocross Championship Qualifier",
      date: "July 8, 2025",
      location: "Phoenix, AZ",
      description: "Test your skills on our challenging autocross course. Open to all skill levels.",
      category: "Competition"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-orbitron text-blue-500 mb-6">Events & Meetups</h1>
        <p className="text-gray-300 mb-10">Connect with the Paddock20 community at these exclusive gatherings.</p>
        
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-orbitron text-green-500">Upcoming Events</h2>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">Filter</button>
              <button className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-sm">Add to Calendar</button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map(event => (
              <div key={event.id} className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg border border-gray-800 overflow-hidden">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-blue-400">{event.title}</h3>
                    <span className="bg-green-900 text-green-300 text-xs px-2 py-1 rounded">{event.category}</span>
                  </div>
                  <div className="mb-4">
                    <div className="flex items-center text-gray-400 mb-1">
                      <span className="mr-2">📅</span>
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <span className="mr-2">📍</span>
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-4">{event.description}</p>
                  <div className="flex justify-between">
                    <button className="text-green-500 hover:text-green-400 text-sm">View Details</button>
                    <button className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-sm">RSVP</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-[#111111] to-[#1a1a1a] rounded-lg border border-gray-800 p-6 mb-10">
          <h2 className="text-2xl font-orbitron text-green-500 mb-4">Suggest an Event</h2>
          <p className="text-gray-300 mb-4">Have an idea for a Paddock20 community event? Let us know!</p>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-1">Event Title</label>
                <input type="text" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Location</label>
                <input type="text" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" />
              </div>
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Description</label>
              <textarea rows={4} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"></textarea>
            </div>
            <div className="text-right">
              <button className="bg-green-600 hover:bg-green-500 px-6 py-2 rounded">Submit Suggestion</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventsMeetupsPage;