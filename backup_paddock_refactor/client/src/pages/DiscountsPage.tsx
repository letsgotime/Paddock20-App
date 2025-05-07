import React from "react";

const DiscountsPage = () => {
  return (
    <div className="min-h-screen bg-black max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-orbitron text-blue-400 text-4xl mb-8">💸 Discounts & Promotions</h1>

      {/* Featured Announcements */}
      <section className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg shadow-lg p-6 mb-8 border border-gray-700">
        <h2 className="font-orbitron text-blue-400 text-2xl mb-4">📚 Featured Promotions</h2>
        <ul className="list-disc ml-8 text-white space-y-4">
          <li><strong>The Detailing Discipline</strong> — Our new eBook launching soon. Master gloss, resale, and legacy.</li>
          <li><strong>GoTime Grid Series</strong> — High-velocity networking and car culture events.</li>
          <li><strong>F1 Movie Event Weekend</strong> — ApexVault member access events during premiere weekends.</li>
        </ul>
      </section>

      {/* Membership Discount Perks */}
      <section className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg shadow-lg p-6 mb-8 border border-gray-700">
        <h2 className="font-orbitron text-blue-400 text-2xl mb-4">🏁 Membership Discount Perks</h2>
        <p className="font-openSans text-white text-lg mb-6">
          As a Paddock20 member, you unlock lifetime priority access and discounts across all ApexVault platforms and partners.
        </p>

        {/* Perk Breakdown */}
        <div className="space-y-6">
          <div>
            <h3 className="text-blue-400 text-xl font-orbitron mb-2">GoTime Digital Discounts</h3>
            <ul className="list-disc ml-8 text-white">
              <li>✅ 1x MRC on all referred sales. Rebates paid monthly on qualified services.</li>
              <li>✅ 15% off qualified accessories.</li>
              <li>✅ Discounts on technology hardware purchases.</li>
              <li>✅ Discounts on software and SaaS subscriptions.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-blue-400 text-xl font-orbitron mb-2">StyleMe Discounts</h3>
            <ul className="list-disc ml-8 text-white">
              <li>✅ Percentage discounts across all styling services (varies by service type).</li>
            </ul>
          </div>

          <div>
            <h3 className="text-blue-400 text-xl font-orbitron mb-2">VA Company Discounts</h3>
            <ul className="list-disc ml-8 text-white">
              <li>✅ Priority and discounted rates for Virtual Assistant services (discount varies).</li>
            </ul>
          </div>

          <div>
            <h3 className="text-blue-400 text-xl font-orbitron mb-2">WordFuel Discounts</h3>
            <ul className="list-disc ml-8 text-white">
              <li>✅ Custom journals, flip packets, resale materials and more, all discounted for members.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-blue-400 text-xl font-orbitron mb-2">Insurance Discounts</h3>
            <ul className="list-disc ml-8 text-white">
              <li>✅ Automotive, lifestyle, and personal insurance discounts coming soon through ApexVault partners.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DiscountsPage;