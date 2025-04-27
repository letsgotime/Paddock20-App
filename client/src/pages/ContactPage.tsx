import React from "react";

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-black max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-orbitron text-blue-400 text-4xl mb-8">📩 Contact Us</h1>

      <section className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg shadow-lg p-6 border border-gray-700">
        <p className="font-openSans text-white text-lg mb-6">
          Need help with your Sovereign Garage life? Questions about memberships, flips, mods, or margin moves?
        </p>
        <p className="font-openSans text-white text-lg mb-6">
          Our team is ready to support your next move.
        </p>

        {/* Simple Contact Form (does not submit yet, placeholder) */}
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            type="text"
            placeholder="Full Name"
            className="bg-gray-800 text-white p-3 rounded border border-gray-700"
          />
          <input
            type="email"
            placeholder="Email Address"
            className="bg-gray-800 text-white p-3 rounded border border-gray-700"
          />
          <input
            type="text"
            placeholder="Subject"
            className="bg-gray-800 text-white p-3 rounded border border-gray-700 col-span-1 md:col-span-2"
          />
          <textarea
            placeholder="Message"
            className="bg-gray-800 text-white p-3 rounded border border-gray-700 col-span-1 md:col-span-2"
          ></textarea>
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-400 text-black font-montserrat px-8 py-4 rounded col-span-1 md:col-span-2"
          >
            ✉️ Send Message
          </button>
        </form>
      </section>
    </div>
  );
};

export default ContactPage;