import React, { useState } from 'react';

interface Product {
  name: string;
  link: string;
  notes: string;
  affiliate?: boolean;
}

interface JuiceBoxCodexViewerProps {
  onAddProduct?: (product: Product) => void;
}

function JuiceBoxCodexViewer({ onAddProduct }: JuiceBoxCodexViewerProps) {
  const [activeSection, setActiveSection] = useState<string>('introduction');

  // Define the Juice Box training videos from the provided links
  const trainingVideos = {
    wash: [
      { title: "Best Carwash Technique: 15 Steps + Tools", link: "https://youtu.be/uWmtLSQYbys" }
    ],
    dry: [
      { title: "How to Dry Paint Properly Without Scratches", link: "https://youtu.be/w0hzJImmvNU" },
      { title: "Dry Your Paint Safely | Autoblog Details", link: "https://youtu.be/WJnV6-9qDi8" }
    ],
    glass: [
      { title: "Glass Cleaning Basics", link: "https://youtu.be/q4WwOrkgXlc" }
    ],
    clay: [
      { title: "Clay Bar Basics", link: "https://youtu.be/T7k6AjQvqyg" },
      { title: "Iron Remover Basics", link: "https://youtu.be/NFudV_IgCjU" }
    ],
    interior: [
      { title: "Interior Quick Reset", link: "https://youtu.be/4Bd_IqK5ydU" },
      { title: "Vent and Button Detailing", link: "https://youtu.be/YJAQxQaTlgg" },
      { title: "Leather and Glass Deep Cleaning", link: "https://youtu.be/R0EOb2nEWtk" }
    ],
    correction: [
      { title: "Swirl Removal Intro", link: "https://youtu.be/uKbaXVhvMxE" },
      { title: "Correction Stages Explained", link: "https://youtu.be/0Y-FprmhQA4" },
      { title: "Final Polish Techniques", link: "https://youtu.be/pF9Q2KcsrCE" }
    ],
    wheels: [
      { title: "How to Clean Barrels and Lugs", link: "https://youtu.be/f0pRK0LvZ-Q" }
    ]
  };

  // JuiceBox product categories based on provided content
  const productCategories = [
    {
      category: "Wash & Foam",
      products: [
        { name: "AMMO Foam", link: "https://www.ammonyc.com/shop/hoseless-lift-kit-150/", notes: "Thick, safe, coating-respecting" },
        { name: "GYEON Foam", link: "https://www.gyeonquartzusa.com/", notes: "Deep pull, stays where it sprays" },
        { name: "Turtle Wax Snow Foam", link: "https://www.amazon.com/", notes: "High yield, great for flips" },
        { name: "MTM PF22.2 Foam Cannon", link: "https://www.obsessedgarage.com/products/mtm-pf22-2-foam-cannon", notes: "Consistent laydown, adjustable fan", affiliate: true },
        { name: "4-Bucket System", link: "https://www.obsessedgarage.com/collections/buckets", notes: "Paint, lower panel, soap, wheels – each gets a job", affiliate: true }
      ]
    },
    {
      category: "Wheels, Tires & Rubber",
      products: [
        { name: "AMMO Plum", link: "https://www.ammonyc.com/shop/ammo-plum-wheel-cleaner/", notes: "Foamable, no sling, low scent" },
        { name: "GYEON Tire Cleaner", link: "https://www.gyeonquartzusa.com/", notes: "Strong, safe for rubber" },
        { name: "AMMO Iron Remover", link: "https://www.ammonyc.com/", notes: "Embedded dust dissolver" },
        { name: "RaceGlaze XL", link: "https://www.obsessedgarage.com/products/raceglaze-detailing-brush-xl", notes: "Best reach, safest flex", affiliate: true },
        { name: "Curveball Brush", link: "https://detailersunited.com/", notes: "Ergonomic, soft impact" },
        { name: "Tuf Shine Tire Brush", link: "https://www.tufshine.com/", notes: "Grip + scrub balance" },
        { name: "BigBoi BlowR Pro", link: "https://www.obsessedgarage.com/products/bigboi-blowr-pro", notes: "Spot-free barrels, no towel needed", affiliate: true }
      ]
    },
    {
      category: "Correction & Polish",
      products: [
        { name: "Turtle Wax 1 & Done", link: "https://www.amazon.com/dp/B08P5432LM/", notes: "Great ROI on flips, easy one-step" },
        { name: "Meguiar's D300/D302", link: "https://www.amazon.com/Meguiars-Microfiber-Correction-Compound-Removes/dp/B0051PKGU8/", notes: "Proven stack, safe for most clears" },
        { name: "CarPro Essence Plus", link: "https://www.amazon.com/CarPro-Essence-Plus-500mL/dp/B01MS4LQOV/", notes: "Gloss layer before coating" },
        { name: "Xtreme Solutions Wonder Bundle", link: "https://xtremesolutionsinc.com/", notes: "Reliable, aggressive + refined pairing" }
      ]
    },
    {
      category: "Coatings, Sealants & Toppers",
      products: [
        { name: "CarPro CQuartz UK 3.0", link: "https://www.amazon.com/dp/B00W8APMQM/", notes: "Consistent results, long-term trust" },
        { name: "DLUX", link: "https://www.amazon.com/dp/B00FPUIQWE/", notes: "Temp safe, fade-proof" },
        { name: "FlyBy Forte", link: "https://www.amazon.com/dp/B01C6E6DIA/", notes: "Wiper-safe, hydrophobic" },
        { name: "CarPro Reload", link: "https://www.amazon.com/CarPro-Reload-Inorganic-Spray-Sealant/dp/B00VK9HUMG/", notes: "Flex gloss, safe layer" },
        { name: "AMMO Boost", link: "https://www.ammonyc.com/", notes: "Cold-safe, quick protection" },
        { name: "CarPro Elixir", link: "https://www.carpro-us.com/", notes: "Fast gloss" },
        { name: "HydroSlick", link: "https://www.chemicalguys.com/", notes: "High pop, low price, flip-friendly" }
      ]
    },
    {
      category: "Interior Tools & Cleaners",
      products: [
        { name: "AMMO Mousse", link: "https://www.ammonyc.com/shop/mousse-interior-cleaner/", notes: "Dry touch, no scent, no film" },
        { name: "GYEON Leather Shield", link: "https://www.gyeonquartzusa.com/", notes: "Easy, safe, subtle" },
        { name: "Stoner Invisible Glass", link: "https://www.amazon.com/dp/B0007OWD2M/", notes: "Streak-free, no fog feedback" },
        { name: "Colourlock Leather Shield", link: "https://www.colourlock.com/", notes: "Deep nourishment, dry-to-touch" },
        { name: "Detail Factory Brushes", link: "https://detailfactory.com/", notes: "Never scratch, always finish-ready" }
      ]
    },
    {
      category: "Towels That Work",
      products: [
        { name: "Drying Towel (Obsessed Garage + Griot's PFM)", link: "https://www.amazon.com/dp/B01CJ4NY3C/", notes: "Absorbent drying with minimal friction" },
        { name: "Coating Towel", link: "https://www.obsessedgarage.com/products/wax-removal-detail-spray-towel", notes: "Low pile, laser cut, edge-free", affiliate: true },
        { name: "Interior Towel", link: "https://detail-division.com/", notes: "High absorption, lint-free" },
        { name: "Waffle Weave", link: "https://theragcompany.com/", notes: "Tight pattern, no streaks" },
        { name: "All-Purpose (Costco Kirkland)", link: "https://www.costco.com/kirkland-signature-ultra-plush-microfiber-towel%2c-yellow%2c-16-in-x-16-in%2c-36-count.product.100356999.html", notes: "General utility, budget solution" }
      ]
    },
    {
      category: "Equipment That Moves with You",
      products: [
        { name: "BigBoi BlowR Pro", link: "https://www.obsessedgarage.com/products/bigboi-blowr-pro", notes: "Heat-safe, fast, zero towel swipes", affiliate: true },
        { name: "MetroVac", link: "https://www.obsessedgarage.com/products/metrovac-sidekick-blower", notes: "Corners, edges, trim", affiliate: true },
        { name: "TORQ22D", link: "https://www.amazon.com/dp/B014ONKB6Q/", notes: "5–6\" panel coverage" },
        { name: "Griot's G8 Mini", link: "https://www.griotsgarage.com/", notes: "Tight curves + touch-ups" },
        { name: "Porter Cable 7424XP", link: "https://www.amazon.com/", notes: "Safe DA option, great learner tool" },
        { name: "CR Spotless System", link: "https://www.obsessedgarage.com/", notes: "TDS-safe, perfect for black cars", affiliate: true }
      ]
    }
  ];

  // Juice Box loadout kits
  const juiceBoxLoadouts = [
    { 
      name: "$150 Starter Kit",
      contents: [
        "Foam Gun (entry level)",
        "Chemical Guys Snow Foam Soap",
        "3 Premium Microfiber Towels",
        "1 GYEON Smoothie Wash Mitt",
        "AMMO Frothe Hoseless Lift Kit"
      ],
      purpose: "Entry-level kit for flip cars or basic maintenance washes."
    },
    {
      name: "$500 Builder Kit",
      contents: [
        "MTM PF22.2 Foam Cannon",
        "AMMO Foam",
        "CarPro Reload Sealant",
        "AMMO Boost Maintenance Layer",
        "Griot's PFM Drying Towel",
        "Obsessed Garage Wax Removal Towels",
        "BigBoi BlowR Pro (Optional lower-end model if available)"
      ],
      purpose: "For weekly users, home garages, and semi-pro flip garages."
    },
    {
      name: "$1500+ Pro Kit",
      contents: [
        "Complete 4-Bucket Wash Setup (Paint, Lower, Soap, Wheels)",
        "MTM PF22.2 Foam Cannon + High PSI Pressure Washer",
        "BigBoi BlowR Pro or MetroVac Sidekick Blower",
        "Full Gloss Reset Product Stack (Frothe, Reload, Elixir, Boost)",
        "CQuartz UK 3.0 Ceramic Coating Kit",
        "DLUX Wheel and Trim Coating",
        "FlyBy Forte Glass Coating",
        "Complete Interior Protection Stack (Mousse, Leather Shield)",
        "Obsessed Garage Full Towel Kit",
        "Polisher Setup (Torq22D or Griot's G8 Mini Combo)"
      ],
      purpose: "Workshop-ready detailing kit for client delivery prep, serious resale prepping, and full personal garage sovereignty."
    }
  ];

  // 7-Day Reset Schedule
  const sevenDaySchedule = [
    {
      day: 1,
      title: "Inspect + Journal",
      tasks: [
        "Check Paint - Beading, Sheeting, Grit",
        "Inspect Trim - Fading, Stickiness",
        "Inspect Wheels - Fallout, Brake Dust",
        "Inspect Glass - Water Spots, Wiper Chatter",
        "Inspect Interior - Grease, Dust, Film",
        "Start Gloss Journal - Track now, compare on Day 7"
      ]
    },
    {
      day: 2,
      title: "Decon & Reset",
      tasks: [
        "Apply IronX to lower panels and barrels",
        "Full body pre-wash using AMMO Foam",
        "Clay Mitt surface with Frothe lubrication",
        "Rinse and Blow Dry vehicle",
        "Conduct baggie test for surface smoothness"
      ]
    },
    {
      day: 3,
      title: "Frothe + Topper Pass",
      tasks: [
        "Quick wipe with Frothe to reboost slickness",
        "Apply Reload if water behavior is weak",
        "Optional Elixir gloss bump if flip prepping",
        "Boost maintenance layer if garage storing"
      ]
    },
    {
      day: 4,
      title: "Interior Reset",
      tasks: [
        "Mousse wipe on wheels, console, armrest",
        "Vent and button brushing",
        "Glass streak inspection",
        "Optional DLUX application on dash/console",
        "Leather conditioning with Leather Shield or CQuartz Leather",
        "Re-scent cabin with Diptyque or Culti diffuser"
      ]
    },
    {
      day: 5,
      title: "Wheels + Tires Final Reset",
      tasks: [
        "Deep tire scrub with AMMO Plum",
        "Optional iron fallout cleanup if necessary",
        "Barrel face mitt wash + detail brush",
        "Blow dry wheels and calipers",
        "Apply DLUX if coating wheels",
        "Apply GYEON Tire Dressing or AMMO Mud"
      ]
    },
    {
      day: 6,
      title: "Final Prep Polish (Optional)",
      tasks: [
        "Essence Plus for safe smooth finish polish",
        "1&Done one-step if deeper defects visible",
        "Frothe wipe-down post polish",
        "Apply Reload to lock gloss if needed"
      ]
    },
    {
      day: 7,
      title: "Photos, Packet, Walkthrough",
      tasks: [
        "Final walk-around photos and video",
        "Document product stack used",
        "Journal Gloss Reset results",
        "Prepare Flip Packet if selling",
        "Optional: QR-code product list inclusion",
        "Final handover checklist (Gloss Verified ✅)"
      ]
    }
  ];

  return (
    <div>
      {/* Navigation for Codex sections */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        <button
          onClick={() => setActiveSection('introduction')}
          className={`px-3 py-2 rounded-lg font-orbitron text-sm whitespace-nowrap
            ${activeSection === 'introduction' 
              ? 'bg-green-500 text-black' 
              : 'bg-gray-800 text-white hover:bg-gray-700'}`}
        >
          Juice Box™ Intro
        </button>
        <button
          onClick={() => setActiveSection('products')}
          className={`px-3 py-2 rounded-lg font-orbitron text-sm whitespace-nowrap
            ${activeSection === 'products' 
              ? 'bg-green-500 text-black' 
              : 'bg-gray-800 text-white hover:bg-gray-700'}`}
        >
          Product Codex
        </button>
        <button
          onClick={() => setActiveSection('loadouts')}
          className={`px-3 py-2 rounded-lg font-orbitron text-sm whitespace-nowrap
            ${activeSection === 'loadouts' 
              ? 'bg-green-500 text-black' 
              : 'bg-gray-800 text-white hover:bg-gray-700'}`}
        >
          Juice Box™ Loadouts
        </button>
        <button
          onClick={() => setActiveSection('reset')}
          className={`px-3 py-2 rounded-lg font-orbitron text-sm whitespace-nowrap
            ${activeSection === 'reset' 
              ? 'bg-green-500 text-black' 
              : 'bg-gray-800 text-white hover:bg-gray-700'}`}
        >
          Gloss Reset System™
        </button>
        <button
          onClick={() => setActiveSection('videos')}
          className={`px-3 py-2 rounded-lg font-orbitron text-sm whitespace-nowrap
            ${activeSection === 'videos' 
              ? 'bg-green-500 text-black' 
              : 'bg-gray-800 text-white hover:bg-gray-700'}`}
        >
          Training Videos
        </button>
      </div>

      {/* Introduction Section */}
      {activeSection === 'introduction' && (
        <div className="bg-gradient-to-r from-[#111111] to-[#1a1a1a] p-6 rounded-lg border border-gray-800 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-orbitron text-blue-400 mb-2">🧃 GoTime Juice Box™</h2>
            <p className="text-white text-lg italic mb-4">The curated, real-world-tested, gloss-backed, Gavin-approved detailing arsenal.</p>
            <p className="text-gray-300">No hype. No noise. Just what works—again and again.</p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-orbitron text-blue-400 mb-4">Why This Isn't Just a List</h3>
            <p className="text-gray-300 mb-2">We don't use products because of packaging.</p>
            <p className="text-gray-300 mb-2">We don't pick based on what's trending.</p>
            <p className="text-gray-300 mb-4">Every item here earned its spot through:</p>
            
            <ul className="text-white grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✅</span> Repetition
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✅</span> Results
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✅</span> Resale readiness
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✅</span> Rhythm fit
              </li>
            </ul>
            
            <p className="text-white mb-2">This is not a wishlist.</p>
            <p className="text-white mb-2">This is the GoTime Juice Box™</p>
            <p className="text-white mb-2">Use this as your build map.</p>
            <p className="text-white">For your garage, your rig, or your rinse routine.</p>
          </div>

          <div className="text-center mt-8">
            <p className="text-white mb-2">What would you like to explore next?</p>
            <div className="flex flex-wrap gap-4 justify-center mt-4">
              <button
                onClick={() => setActiveSection('products')}
                className="bg-green-500 hover:bg-green-400 text-black px-4 py-2 rounded-md font-orbitron"
              >
                Product Codex
              </button>
              <button
                onClick={() => setActiveSection('reset')}
                className="bg-green-500 hover:bg-green-400 text-black px-4 py-2 rounded-md font-orbitron"
              >
                Gloss Reset System
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Codex Section */}
      {activeSection === 'products' && (
        <div className="bg-gradient-to-r from-[#111111] to-[#1a1a1a] p-6 rounded-lg border border-gray-800 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-orbitron text-blue-400 mb-2">The Product Codex</h2>
            <p className="text-white italic">What We Use. Why We Use It. How It Got In the Juice Box™.</p>
          </div>

          {productCategories.map((category, index) => (
            <div key={index} className="mb-10">
              <h3 className="text-xl font-orbitron text-blue-400 border-b border-gray-700 pb-2 mb-4">
                {category.category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.products.map((product, idx) => (
                  <div key={idx} className="bg-black p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <a 
                        href={product.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-400 font-orbitron hover:underline"
                      >
                        {product.name}
                      </a>
                      {product.affiliate && (
                        <span className="bg-green-500 text-black text-xs px-2 py-1 rounded">
                          Partner
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 text-sm mb-3">{product.notes}</p>
                    {onAddProduct && (
                      <button
                        onClick={() => onAddProduct(product)}
                        className="bg-green-500 hover:bg-green-400 text-black text-sm px-3 py-1 rounded w-full"
                      >
                        Add to My Juice Box
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loadouts Section */}
      {activeSection === 'loadouts' && (
        <div className="bg-gradient-to-r from-[#111111] to-[#1a1a1a] p-6 rounded-lg border border-gray-800 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-orbitron text-blue-400 mb-2">Juice Box™ Loadouts</h2>
            <p className="text-white italic">Build your arsenal by budget and use case</p>
          </div>

          <div className="space-y-8">
            {juiceBoxLoadouts.map((kit, index) => (
              <div key={index} className="bg-black p-5 rounded-lg">
                <h3 className="text-xl font-orbitron text-blue-400 mb-3">{kit.name}</h3>
                <p className="text-white mb-4">{kit.purpose}</p>
                
                <h4 className="text-green-400 font-orbitron text-md mb-3">Included Items:</h4>
                <ul className="space-y-2 mb-6">
                  {kit.contents.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      <span className="text-white">{item}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="text-right">
                  <button className="bg-green-500 hover:bg-green-400 text-black px-4 py-2 rounded-md">
                    Build This Kit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gloss Reset System Section */}
      {activeSection === 'reset' && (
        <div className="bg-gradient-to-r from-[#111111] to-[#1a1a1a] p-6 rounded-lg border border-gray-800 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-orbitron text-blue-400 mb-2">The Gloss Reset System™</h2>
            <p className="text-white italic mb-4">7 Days to Bring the Finish Back—No Matter the Condition</p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-orbitron text-blue-400 mb-4">Why You Need a Reset System</h3>
            <p className="text-gray-300 mb-2">Not every car needs a full correction.</p>
            <p className="text-gray-300 mb-2">Not every flip gets weeks of prep.</p>
            <p className="text-gray-300 mb-4">But every finish needs a way back from:</p>
            
            <ul className="text-white grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
              <li className="flex items-center">
                <span className="text-red-400 mr-2">❌</span> Missed maintenance
              </li>
              <li className="flex items-center">
                <span className="text-red-400 mr-2">❌</span> Road grime
              </li>
              <li className="flex items-center">
                <span className="text-red-400 mr-2">❌</span> Gloss loss
              </li>
              <li className="flex items-center">
                <span className="text-red-400 mr-2">❌</span> Seasonal shifts
              </li>
              <li className="flex items-center">
                <span className="text-red-400 mr-2">❌</span> Quick-sale urgency
              </li>
            </ul>
          </div>

          <h3 className="text-xl font-orbitron text-blue-400 mb-4">The GoTime 7-Day Gloss Reset™</h3>
          <p className="text-white mb-4">Use this for:</p>
          <ul className="text-white grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
            <li className="flex items-center">
              <span className="text-green-400 mr-2">✅</span> Flip cars
            </li>
            <li className="flex items-center">
              <span className="text-green-400 mr-2">✅</span> Client preps
            </li>
            <li className="flex items-center">
              <span className="text-green-400 mr-2">✅</span> Post-vacation daily drivers
            </li>
            <li className="flex items-center">
              <span className="text-green-400 mr-2">✅</span> Cars that "used to pop"
            </li>
            <li className="flex items-center">
              <span className="text-green-400 mr-2">✅</span> Vehicles going back to lease
            </li>
          </ul>

          <div className="space-y-6 mt-8">
            {sevenDaySchedule.map((day, index) => (
              <div key={index} className="bg-black p-4 rounded-lg">
                <h3 className="text-lg font-orbitron text-blue-400 mb-3">
                  Day {day.day}: {day.title}
                </h3>
                
                <ul className="space-y-2">
                  {day.tasks.map((task, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      <span className="text-white">{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-white italic">
              This system isn't about rushing gloss.<br/>
              It's about respecting it enough to bring it back right.
            </p>
          </div>
        </div>
      )}

      {/* Training Videos Section */}
      {activeSection === 'videos' && (
        <div className="bg-gradient-to-r from-[#111111] to-[#1a1a1a] p-6 rounded-lg border border-gray-800 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-orbitron text-blue-400 mb-2">Training Videos</h2>
            <p className="text-white italic">Gloss Master Academy™ Educational Resources</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
            <div>
              <h3 className="text-xl font-orbitron text-blue-400 mb-4">Wash Technique</h3>
              <div className="space-y-4">
                {trainingVideos.wash.map((video, index) => (
                  <div key={index} className="bg-black p-4 rounded-lg">
                    <h4 className="text-blue-400 font-orbitron text-md mb-2">{video.title}</h4>
                    <div className="relative aspect-video bg-gray-900 mb-3 flex items-center justify-center">
                      <a 
                        href={video.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </a>
                    </div>
                    <a 
                      href={video.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="bg-green-500 hover:bg-green-400 text-black text-sm block text-center py-2 px-4 rounded"
                    >
                      Watch Now
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-orbitron text-blue-400 mb-4">Drying Techniques</h3>
              <div className="space-y-4">
                {trainingVideos.dry.map((video, index) => (
                  <div key={index} className="bg-black p-4 rounded-lg">
                    <h4 className="text-blue-400 font-orbitron text-md mb-2">{video.title}</h4>
                    <div className="relative aspect-video bg-gray-900 mb-3 flex items-center justify-center">
                      <a 
                        href={video.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </a>
                    </div>
                    <a 
                      href={video.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="bg-green-500 hover:bg-green-400 text-black text-sm block text-center py-2 px-4 rounded"
                    >
                      Watch Now
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-orbitron text-blue-400 mb-4">Glass Cleaning</h3>
              <div className="space-y-4">
                {trainingVideos.glass.map((video, index) => (
                  <div key={index} className="bg-black p-4 rounded-lg">
                    <h4 className="text-blue-400 font-orbitron text-md mb-2">{video.title}</h4>
                    <div className="relative aspect-video bg-gray-900 mb-3 flex items-center justify-center">
                      <a 
                        href={video.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </a>
                    </div>
                    <a 
                      href={video.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="bg-green-500 hover:bg-green-400 text-black text-sm block text-center py-2 px-4 rounded"
                    >
                      Watch Now
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-orbitron text-blue-400 mb-4">Interior Detailing</h3>
              <div className="space-y-4">
                {trainingVideos.interior.map((video, index) => (
                  <div key={index} className="bg-black p-4 rounded-lg">
                    <h4 className="text-blue-400 font-orbitron text-md mb-2">{video.title}</h4>
                    <div className="relative aspect-video bg-gray-900 mb-3 flex items-center justify-center">
                      <a 
                        href={video.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </a>
                    </div>
                    <a 
                      href={video.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="bg-green-500 hover:bg-green-400 text-black text-sm block text-center py-2 px-4 rounded"
                    >
                      Watch Now
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-orbitron text-blue-400 mb-4">Swirl Removal & Correction</h3>
              <div className="space-y-4">
                {trainingVideos.correction.map((video, index) => (
                  <div key={index} className="bg-black p-4 rounded-lg">
                    <h4 className="text-blue-400 font-orbitron text-md mb-2">{video.title}</h4>
                    <div className="relative aspect-video bg-gray-900 mb-3 flex items-center justify-center">
                      <a 
                        href={video.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </a>
                    </div>
                    <a 
                      href={video.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="bg-green-500 hover:bg-green-400 text-black text-sm block text-center py-2 px-4 rounded"
                    >
                      Watch Now
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-orbitron text-blue-400 mb-4">Full Video Library</h3>
              <div className="bg-black p-6 rounded-lg flex flex-col items-center justify-center h-full">
                <p className="text-white mb-6 text-center">
                  Access the complete AMMO NYC educational library with detailed guides on every detailing topic
                </p>
                <a 
                  href="https://www.ammonyc.com/videos/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-green-500 hover:bg-green-400 text-black text-md py-3 px-6 rounded-md font-medium"
                >
                  Visit Complete Library
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JuiceBoxCodexViewer;