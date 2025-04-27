// Product categories and data
export interface Product {
  name: string;
  link: string;
  notes: string;
}

export interface CategoryData {
  category: string;
  products: Product[];
}

export const productCategories: CategoryData[] = [
  {
    category: "Wash & Foam",
    products: [
      {
        name: "Frothe (AMMO NYC)",
        link: "https://www.ammonyc.com/shop/hoseless-lift-kit-150/",
        notes: "Hoseless safe wash, gloss-preserving."
      },
      {
        name: "GYEON Foam",
        link: "https://www.gyeonquartzusa.com/",
        notes: "Heavy foam jobs, deep cleaning."
      },
      {
        name: "MTM PF22.2 Foam Cannon",
        link: "https://www.obsessedgarage.com/products/mtm-pf22-2-foam-cannon",
        notes: "Best-in-class foam application."
      },
      {
        name: "4-Bucket System",
        link: "https://www.obsessedgarage.com/collections/buckets",
        notes: "Ultimate wash safety with paint, lower, wheels, soap split."
      }
    ]
  },
  {
    category: "Correction & Polish",
    products: [
      {
        name: "Turtle Wax 1&Done",
        link: "https://www.amazon.com/dp/B08P5432LM/",
        notes: "Fast one-step correction for flip builds."
      },
      {
        name: "Meguiar's D300 Correction Compound",
        link: "https://www.amazon.com/Meguiars-Microfiber-Correction-Compound-Removes/dp/B0051PKGU8/",
        notes: "Mid-level safe correction for resale."
      },
      {
        name: "CarPro Essence Plus",
        link: "https://www.amazon.com/CarPro-Essence-Plus-500mL/dp/B01MS4LQOV/",
        notes: "Jeweling polish before topcoat."
      }
    ]
  },
  {
    category: "Coatings & Toppers",
    products: [
      {
        name: "CarPro CQuartz UK 3.0",
        link: "https://www.amazon.com/dp/B00W8APMQM/",
        notes: "Ultimate base ceramic coating."
      },
      {
        name: "DLUX Trim and Wheel Coating",
        link: "https://www.amazon.com/dp/B00FPUIQWE/",
        notes: "High temp durable trim and wheel protection."
      },
      {
        name: "FlyBy Forte Glass Coating",
        link: "https://www.amazon.com/dp/B01C6E6DIA/",
        notes: "Wiper safe, glass hydrophobic coating."
      },
      {
        name: "CarPro Reload",
        link: "https://www.amazon.com/CarPro-Reload-Inorganic-Spray-Sealant/dp/B00VK9HUMG/",
        notes: "Topper hybrid sealant for high flex gloss."
      }
    ]
  },
  {
    category: "Wheels, Tires & Rubber",
    products: [
      {
        name: "AMMO Plum Tire Degreaser",
        link: "https://www.ammonyc.com/shop/ammo-plum-wheel-cleaner/",
        notes: "Strong but safe tire degreaser."
      },
      {
        name: "GYEON Tire Cleaner",
        link: "https://www.gyeonquartzusa.com/",
        notes: "Deep rubber cleaning agent."
      },
      {
        name: "RaceGlaze XL Barrel Brush",
        link: "https://www.obsessedgarage.com/products/raceglaze-detailing-brush-xl",
        notes: "Ultimate reach and safe flex for barrels."
      }
    ]
  },
  {
    category: "Interior Care",
    products: [
      {
        name: "AMMO Mousse Interior Cleaner",
        link: "https://www.ammonyc.com/shop/mousse-interior-cleaner/",
        notes: "Dry-touch, gloss-neutral interior cleaning."
      },
      {
        name: "GYEON Leather Shield",
        link: "https://www.gyeonquartzusa.com/",
        notes: "Easy and safe leather protection for dailies."
      },
      {
        name: "Stoner Invisible Glass",
        link: "https://www.amazon.com/dp/B0007OWD2M/",
        notes: "Fog-free glass cleaner."
      }
    ]
  },
  {
    category: "Towels",
    products: [
      {
        name: "Obsessed Garage Wax Removal Towel",
        link: "https://www.obsessedgarage.com/products/wax-removal-detail-spray-towel",
        notes: "Safe removal without risk of micro-marring."
      },
      {
        name: "Griot's PFM Drying Towel",
        link: "https://www.amazon.com/dp/B01CJ4NY3C/",
        notes: "Absorbent drying with minimal friction."
      },
      {
        name: "Kirkland General Towels",
        link: "https://www.costco.com/kirkland-signature-ultra-plush-microfiber-towel%2c-yellow%2c-16-in-x-16-in%2c-36-count.product.100356999.html",
        notes: "General utility, budget solution for interiors, wheels."
      }
    ]
  },
  {
    category: "Tools & Equipment",
    products: [
      {
        name: "BigBoi BlowR Pro",
        link: "https://www.obsessedgarage.com/products/bigboi-blowr-pro",
        notes: "Safe heat drying, zero towel swipes."
      },
      {
        name: "MetroVac Sidekick",
        link: "https://www.obsessedgarage.com/products/metrovac-sidekick-blower",
        notes: "Trim edges, badge zone drying."
      },
      {
        name: "Torq22D Polisher",
        link: "https://www.amazon.com/dp/B014ONKB6Q/",
        notes: "Safe and aggressive 5-6 inch polish work."
      }
    ]
  }
];

// Detailing Loadout Kits
export interface LoadoutKit {
  loadout: string;
  contents: string[];
  purpose: string;
}

export const detailingKits: LoadoutKit[] = [
  {
    loadout: "$150 Starter Kit",
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
    loadout: "$500 Builder Kit",
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
    loadout: "$1500+ Pro Kit",
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
export interface DaySchedule {
  day: number;
  title: string;
  tasks: string[];
}

// Training Video Library
export interface VideoItem {
  title: string;
  link: string;
}

export interface VideoCategory {
  category: string;
  videos: VideoItem[];
}

export const trainingVideos: VideoCategory[] = [
  {
    category: "Wash Technique",
    videos: [
      {
        title: "Best Carwash Technique: 15 Steps + Tools",
        link: "https://youtu.be/uWmtLSQYbys"
      }
    ]
  },
  {
    category: "Drying Techniques",
    videos: [
      {
        title: "How to Dry Paint Properly Without Scratches",
        link: "https://youtu.be/w0hzJImmvNU"
      },
      {
        title: "Dry Your Paint Safely | Autoblog Details",
        link: "https://youtu.be/WJnV6-9qDi8"
      }
    ]
  },
  {
    category: "Glass Cleaning",
    videos: [
      {
        title: "Glass Cleaning Basics",
        link: "https://youtu.be/q4WwOrkgXlc"
      }
    ]
  },
  {
    category: "Clay & Decontamination",
    videos: [
      {
        title: "Clay Bar Basics",
        link: "https://youtu.be/T7k6AjQvqyg"
      },
      {
        title: "Iron Remover Basics",
        link: "https://youtu.be/NFudV_IgCjU"
      }
    ]
  },
  {
    category: "Interior Detailing",
    videos: [
      {
        title: "Interior Quick Reset",
        link: "https://youtu.be/4Bd_IqK5ydU"
      },
      {
        title: "Vent and Button Detailing",
        link: "https://youtu.be/YJAQxQaTlgg"
      },
      {
        title: "Leather and Glass Deep Cleaning",
        link: "https://youtu.be/R0EOb2nEWtk"
      }
    ]
  },
  {
    category: "Swirl Removal & Correction",
    videos: [
      {
        title: "Swirl Removal Intro",
        link: "https://youtu.be/uKbaXVhvMxE"
      },
      {
        title: "Correction Stages Explained",
        link: "https://youtu.be/0Y-FprmhQA4"
      },
      {
        title: "Final Polish Techniques",
        link: "https://youtu.be/pF9Q2KcsrCE"
      }
    ]
  },
  {
    category: "Wheel Cleaning",
    videos: [
      {
        title: "How to Clean Barrels and Lugs",
        link: "https://youtu.be/f0pRK0LvZ-Q"
      }
    ]
  },
  {
    category: "Full Training Library",
    videos: [
      {
        title: "Ammo NYC Full Educational Video Hub",
        link: "https://www.ammonyc.com/videos/"
      }
    ]
  }
];

export const sevenDaySchedule: DaySchedule[] = [
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