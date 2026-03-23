import React from "react";
import SocialShareButtons from "../components/ui/social-share-buttons";

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-black max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-orbitron text-blue-400 text-4xl mb-8">📩 Contact Us</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg shadow-lg p-6 border border-gray-700 lg:col-span-2">
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
              rows={5}
            ></textarea>
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-400 text-black font-montserrat px-8 py-4 rounded col-span-1 md:col-span-2"
            >
              ✉️ Send Message
            </button>
          </form>
        </section>

        {/* Social Media Profiles Section */}
        <section className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg shadow-lg p-6 border border-gray-700">
          <div className="mb-8">
            <h2 className="font-orbitron text-white text-3xl mb-2">Social Media</h2>
            <p className="text-gray-400 text-sm mb-6">
              Click the link provided or the icon to access our Social Media accounts
            </p>
            
            {/* Instagram */}
            <div className="flex items-center mb-6 group">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center mr-4 group-hover:scale-105 transition-transform">
                <a href="https://www.instagram.com/gotimemotorsports/" target="_blank" rel="noopener noreferrer" className="block w-full h-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
              <div>
                <a href="https://www.instagram.com/gotimemotorsports/" target="_blank" rel="noopener noreferrer" className="text-white text-lg hover:text-blue-400 transition-colors">
                  @gotimemotorsports
                </a>
              </div>
            </div>
            
            {/* YouTube */}
            <div className="flex items-center mb-6 group">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center mr-4 group-hover:scale-105 transition-transform">
                <a href="https://www.youtube.com/gotimemotorsports" target="_blank" rel="noopener noreferrer" className="block w-full h-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                  </svg>
                </a>
              </div>
              <div>
                <a href="https://www.youtube.com/gotimemotorsports" target="_blank" rel="noopener noreferrer" className="text-white text-lg hover:text-blue-400 transition-colors">
                  @gotimemotorsports
                </a>
              </div>
            </div>
            
            {/* Facebook */}
            <div className="flex items-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mr-4 group-hover:scale-105 transition-transform">
                <a href="https://www.facebook.com/gotimemotorsports" target="_blank" rel="noopener noreferrer" className="block w-full h-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                  </svg>
                </a>
              </div>
              <div>
                <a href="https://www.facebook.com/gotimemotorsports" target="_blank" rel="noopener noreferrer" className="text-white text-lg hover:text-blue-400 transition-colors">
                  Click Here or the Icon
                </a>
              </div>
            </div>
          </div>
          
          {/* Share This Page */}
          <div className="mt-10 pt-6 border-t border-gray-700">
            <h3 className="text-white text-lg mb-3">Share This Page</h3>
            <SocialShareButtons 
              url={window.location.href}
              title="Contact GoTime Motorsports"
              description="Get in touch with the GoTime Motorsports team - the premier automotive lifestyle platform for car enthusiasts."
              showLabels={false}
              size="md"
              className="justify-start"
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default ContactPage;