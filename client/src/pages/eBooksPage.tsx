import React from "react";

const eBooks = [
  {
    title: "The GoTime Garage Playbook",
    subtitle: "How One Obsession With Clean Cars Built a Culture You Can Join.",
    description:
      "From a cracked driveway to flips that built GoTime, this Playbook codifies real rhythms, real gloss, and real culture. For garage warriors who build pride, not just cars.",
    link: "#", // Replace with actual Amazon link
    cover: "/assets/ebooks/placeholder.svg", // Using placeholder until final covers are ready
  },
  {
    title: "It Was Never About the Wash",
    subtitle: "How Clean Built the Brand Before the Logo Did.",
    description:
      "This is the grit-first memoir of GoTime's DNA — no flex, no fluff. How discipline built momentum, and how clean became a movement before the logo ever existed.",
    link: "#", // Replace with actual Amazon link
    cover: "/assets/ebooks/placeholder.svg", // Using placeholder until final covers are ready
  },
  {
    title: "The Resale Ritual™",
    subtitle: "Asset Resale Manual: Prep → Gloss → Margin Exit.",
    description:
      "Apex-level flip logic, delivery rituals, and margin protection tactics — all built on gloss-first thinking. A system, not a guess. Serious operators only.",
    link: "#", // Replace with actual Amazon link
    cover: "/assets/ebooks/placeholder.svg", // Using placeholder until final covers are ready
  },
  {
    title: "The Delivery Standard™",
    subtitle: "How Discipline Beats Discounts — From Wash Bay to Wire Transfer.",
    description:
      "Learn how to turn delivery into deal flow. From final wipes to first offers, this book shows how true finish creates repeatable resale success.",
    link: "#", // Replace with actual Amazon link
    cover: "/assets/ebooks/placeholder.svg", // Using placeholder until final covers are ready
  },
];

const eBooksPage = () => {
  return (
    <div className="bg-black min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-orbitron text-blue-400 text-4xl mb-8">📚 GoTime eBooks Vault</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {eBooks.map((book, idx) => (
          <div key={idx} className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-700">
            <img
              src={book.cover}
              alt={`Cover of ${book.title}`}
              className="rounded-lg shadow-md mb-6"
            />
            <h2 className="text-blue-400 font-orbitron text-xl mb-2">{book.title}</h2>
            <h3 className="text-gray-300 text-sm mb-4 italic">{book.subtitle}</h3>
            <p className="text-white text-base mb-4">{book.description}</p>
            <a
              href={book.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-500 hover:bg-green-400 text-black font-montserrat px-6 py-3 rounded"
            >
              📥 Buy Now
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default eBooksPage;