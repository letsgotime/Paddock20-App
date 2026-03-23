import React, { useState } from "react";

interface ConciergeRequest {
  id: number;
  requestType: string;
  description: string;
  budget: number;
  urgency: string;
}

const ConciergePage = () => {
  const [requests, setRequests] = useState<ConciergeRequest[]>([]);
  const [newRequest, setNewRequest] = useState<ConciergeRequest>({
    id: Date.now(),
    requestType: "",
    description: "",
    budget: 0,
    urgency: "",
  });

  const handleAddRequest = () => {
    if (!newRequest.requestType || !newRequest.description) {
      alert("Please complete all required fields.");
      return;
    }
    setRequests([...requests, { ...newRequest, id: Date.now() }]);
    setNewRequest({
      id: Date.now(),
      requestType: "",
      description: "",
      budget: 0,
      urgency: "",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-black min-h-screen">
      <h1 className="text-blue-400 font-orbitron text-4xl mb-8">🛞 Tires & Timepieces™ Concierge</h1>

      {/* Concierge Request Form */}
      <section className="bg-gray-900 rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-blue-400 font-orbitron text-2xl mb-4">New Concierge Request</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            type="text"
            placeholder="Request Type (Car, Watch, Collectible)"
            value={newRequest.requestType}
            onChange={(e) => setNewRequest({ ...newRequest, requestType: e.target.value })}
            className="bg-gray-800 text-white p-3 rounded"
          />
          <input
            type="number"
            placeholder="Target Budget ($)"
            value={newRequest.budget}
            onChange={(e) => setNewRequest({ ...newRequest, budget: parseInt(e.target.value) })}
            className="bg-gray-800 text-white p-3 rounded"
          />
          <input
            type="text"
            placeholder="Urgency (Low, Medium, High)"
            value={newRequest.urgency}
            onChange={(e) => setNewRequest({ ...newRequest, urgency: e.target.value })}
            className="bg-gray-800 text-white p-3 rounded"
          />
          <textarea
            placeholder="Asset Description / Specifics"
            value={newRequest.description}
            onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
            className="bg-gray-800 text-white p-3 rounded col-span-1 md:col-span-2"
          />
        </div>
        <button onClick={handleAddRequest} className="mt-6 bg-green-500 hover:bg-green-400 text-black font-montserrat px-6 py-3 rounded">
          ✉️ Submit Request
        </button>
      </section>

      {/* List of Requests */}
      <section className="bg-gray-900 rounded-lg shadow-lg p-6">
        <h2 className="text-blue-400 font-orbitron text-2xl mb-6">Your Concierge Requests</h2>
        {requests.length === 0 ? (
          <p className="text-gray-300">No requests submitted yet. Let's source your next asset.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {requests.map((req) => (
              <div key={req.id} className="bg-gray-800 rounded-lg p-5 shadow-lg">
                <h3 className="text-blue-400 font-orbitron text-xl mb-2">{req.requestType}</h3>
                <p className="text-white text-sm mb-2">💵 Budget: ${req.budget.toLocaleString()}</p>
                <p className="text-white text-sm mb-2">🚦 Urgency: {req.urgency}</p>
                <p className="text-gray-300 text-sm">{req.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ConciergePage;