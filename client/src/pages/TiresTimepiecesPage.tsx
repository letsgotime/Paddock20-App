import React from "react";

const TiresTimepiecesPage = () => {
  return (
    <div className="bg-black min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-orbitron text-blue-400 text-4xl mb-8">
        Tires & Timepieces™
      </h1>

      {/* About Section */}
      <section className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg shadow-lg border border-gray-700 p-6 mb-8">
        <h2 className="font-orbitron text-blue-400 text-2xl mb-4">About Tires & Timepieces™</h2>
        <p className="font-openSans text-white text-base leading-relaxed mb-4">
          Tires & Timepieces™ is your private sourcing partner—curating exotic vehicles and collector-grade timepieces with precision, not hype. 
          Built for real enthusiasts who move culture forward—not just followers who chase trends.
        </p>
        <p className="font-openSans text-white text-base leading-relaxed mb-4">
          Powered by GoTime Motorsports™, T&T™ exists to bridge access and ownership—quietly, powerfully, and profitably.
        </p>
      </section>

      {/* Why Section */}
      <section className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg shadow-lg border border-gray-700 p-6 mb-8">
        <h2 className="font-orbitron text-blue-400 text-2xl mb-4">Why Tires & Timepieces™ Exists</h2>
        <p className="font-openSans text-white text-base leading-relaxed mb-4">
          The luxury market forgot the real operators. T&T™ brings it back.
          Whether you're flipping an R8, sourcing a grail Rolex, or trading into your next grail—this is the edge built for you.
        </p>
      </section>

      {/* How It Works Section */}
      <section className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg shadow-lg border border-gray-700 p-6 mb-8">
        <h2 className="font-orbitron text-blue-400 text-2xl mb-4">How It Works</h2>
        <ul className="list-disc ml-8 text-white text-base leading-relaxed space-y-2">
          <li>Intent Intake & Readiness — Goals locked. Funding confirmed.</li>
          <li>Asset Match — Off-market sourcing, wholesale leverage.</li>
          <li>Concierge Structuring — Paperwork, insurance, authentication, upgrades.</li>
          <li>Delivery & Handoff — White-glove reveal, not just shipping.</li>
          <li>Exit & Reinvestment — Flip support, resale prep, next move planning.</li>
        </ul>
      </section>

      {/* Benefits Section */}
      <section className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg shadow-lg border border-gray-700 p-6 mb-8">
        <h2 className="font-orbitron text-blue-400 text-2xl mb-4">What You Get with T&T™</h2>
        <ul className="list-disc ml-8 text-white text-base leading-relaxed space-y-2">
          <li>Concierge sourcing for vehicles and watches</li>
          <li>Flip Forecast™ resale insights</li>
          <li>Vault Brief™ asset dossiers</li>
          <li>Full authentication via Benninson</li>
          <li>Enclosed, insured shipping via IFS</li>
          <li>Priority listing perks through Paddock20™</li>
        </ul>
      </section>

      {/* Our Code Section */}
      <section className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg shadow-lg border border-gray-700 p-6 mb-8">
        <h2 className="font-orbitron text-blue-400 text-2xl mb-4">Our Code: Trusted. Curated. Closed.™</h2>
        <p className="font-openSans text-white text-base leading-relaxed mb-4">
          We don't chase hype. We don't overpromise. We don't flex for likes.
        </p>
        <p className="font-openSans text-white text-base leading-relaxed mb-4">
          We source intentionally. We structure for margin. We deliver with pride.
        </p>
        <p className="font-openSans text-white text-base leading-relaxed mb-4">
          That's Tires & Timepieces™.
        </p>
      </section>

      {/* Connection to GoTime Section */}
      <section className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg shadow-lg border border-gray-700 p-6">
        <h2 className="font-orbitron text-blue-400 text-2xl mb-4">Connected to GoTime Motorsports™ & Paddock20™</h2>
        <p className="font-openSans text-white text-base leading-relaxed mb-4">
          T&T™ is the brokerage and sourcing arm inside the GoTime ecosystem.
          GoTime Motorsports™ brings the events, experiences, and culture.
          Paddock20™ delivers the insider membership access.
          Together—they turn ownership dreams into real, repeatable momentum.
        </p>
      </section>
    </div>
  );
};

export default TiresTimepiecesPage;