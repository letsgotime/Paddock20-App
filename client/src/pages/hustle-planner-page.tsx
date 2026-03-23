import React, { useState } from "react";

interface HustleGoal {
  id: number;
  title: string;
  description: string;
  targetProfit: number;
  deadline: string;
  progress: number;
}

const HustlePlannerPage = () => {
  const [goals, setGoals] = useState<HustleGoal[]>([]);
  const [newGoal, setNewGoal] = useState<HustleGoal>({
    id: Date.now(),
    title: "",
    description: "",
    targetProfit: 0,
    deadline: "",
    progress: 0,
  });

  const handleAddGoal = () => {
    if (!newGoal.title) {
      alert("Please enter a flip/margin goal title.");
      return;
    }
    setGoals([...goals, { ...newGoal, id: Date.now() }]);
    setNewGoal({
      id: Date.now(),
      title: "",
      description: "",
      targetProfit: 0,
      deadline: "",
      progress: 0,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-black min-h-screen">
      <h1 className="text-blue-400 font-orbitron text-4xl mb-8">🧠 Hustle Planner™</h1>

      {/* Add New Hustle Goal */}
      <section className="bg-gray-900 rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-blue-400 font-orbitron text-2xl mb-4">Add New Margin Goal</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            type="text"
            placeholder="Goal Title (e.g., Flip Cayman GT4)"
            value={newGoal.title}
            onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
            className="bg-gray-800 text-white p-3 rounded"
          />
          <input
            type="number"
            placeholder="Target Profit ($)"
            value={newGoal.targetProfit}
            onChange={(e) => setNewGoal({ ...newGoal, targetProfit: parseInt(e.target.value) })}
            className="bg-gray-800 text-white p-3 rounded"
          />
          <input
            type="date"
            value={newGoal.deadline}
            onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
            className="bg-gray-800 text-white p-3 rounded"
          />
          <input
            type="number"
            placeholder="Progress (%)"
            value={newGoal.progress}
            onChange={(e) => setNewGoal({ ...newGoal, progress: parseInt(e.target.value) })}
            className="bg-gray-800 text-white p-3 rounded"
          />
          <textarea
            placeholder="Strategy / Plan Description"
            value={newGoal.description}
            onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
            className="bg-gray-800 text-white p-3 rounded col-span-1 md:col-span-2"
          />
        </div>
        <button onClick={handleAddGoal} className="mt-6 bg-green-500 hover:bg-green-400 text-black font-montserrat px-6 py-3 rounded">
          ➕ Save Hustle Goal
        </button>
      </section>

      {/* List of Hustle Goals */}
      <section className="bg-gray-900 rounded-lg shadow-lg p-6">
        <h2 className="text-blue-400 font-orbitron text-2xl mb-6">Your Margin Targets</h2>
        {goals.length === 0 ? (
          <p className="text-gray-300">No hustle goals yet. Create and track your margin moves.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((goal) => (
              <div key={goal.id} className="bg-gray-800 rounded-lg p-5 shadow-lg">
                <h3 className="text-blue-400 font-orbitron text-xl mb-2">{goal.title}</h3>
                <p className="text-white text-sm mb-2">💵 Target Profit: ${goal.targetProfit.toLocaleString()}</p>
                <p className="text-white text-sm mb-2">📅 Deadline: {goal.deadline}</p>
                <p className="text-white text-sm mb-2">🔥 Progress: {goal.progress}%</p>
                <p className="text-gray-300 text-sm">{goal.description}</p>
                <div className="mt-4 bg-gray-700 h-3 w-full rounded-full">
                  <div
                    style={{ width: `${goal.progress}%` }}
                    className="bg-green-500 h-3 rounded-full"
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HustlePlannerPage;