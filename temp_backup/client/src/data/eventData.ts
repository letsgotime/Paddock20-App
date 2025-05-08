export interface Event {
  id: number;
  week: number;
  date: string;
  city: string;
  eventType: string;
  venue: string;
  theme: string;
  charity: string;
  estimatedCost: string;
  sponsors: {
    p1: string;
    p2: string;
    p3: string;
    p4: string;
    p5: string;
  };
}

export const events: Event[] = [
  // Weeks 1-12
  {
    id: 1,
    week: 1,
    date: "Mar 1, 2025",
    city: "Scottsdale, AZ",
    eventType: "Detail Day #1",
    venue: "Shine Haus™ Bay",
    theme: "Gloss Season Launch",
    charity: "PCH Foundation",
    estimatedCost: "$8,500",
    sponsors: {
      p1: "Michelin",
      p2: "Chemical Guys",
      p3: "KW Suspension",
      p4: "Persol",
      p5: "Zoom"
    }
  },
  {
    id: 2,
    week: 2,
    date: "Mar 8, 2025",
    city: "Scottsdale, AZ",
    eventType: "Tires & Timepieces™",
    venue: "Experience Haus Rooftop",
    theme: "Spring Opener",
    charity: "Phoenix Children's",
    estimatedCost: "$12,000",
    sponsors: {
      p1: "BFGoodrich",
      p2: "TAG Heuer",
      p3: "Brembo",
      p4: "Oakley",
      p5: "Verizon"
    }
  },
  {
    id: 3,
    week: 3,
    date: "Mar 15, 2025",
    city: "Los Angeles, CA",
    eventType: "Rally Drive #1",
    venue: "Malibu Loop",
    theme: "West Coast Warm-Up",
    charity: "Inner-City Arts",
    estimatedCost: "$15,000",
    sponsors: {
      p1: "Pirelli",
      p2: "WatchBox",
      p3: "Vorsteiner",
      p4: "Richard Mille",
      p5: "Advantix"
    }
  },
  {
    id: 4,
    week: 4,
    date: "Mar 22, 2025",
    city: "Los Angeles, CA",
    eventType: "Timepiece Meetup #1",
    venue: "Hublot Beverly Hills",
    theme: "Flip Fundamentals",
    charity: "BBBS LA",
    estimatedCost: "$6,000",
    sponsors: {
      p1: "Hublot",
      p2: "Nico Leonard",
      p3: "Tissot",
      p4: "Tumi",
      p5: "Blue Team Alpha"
    }
  },
  {
    id: 5,
    week: 5,
    date: "Mar 29, 2025",
    city: "Miami, FL",
    eventType: "Track Day #1",
    venue: "Homestead-Miami GP",
    theme: "Flex Control",
    charity: "BBBS Miami",
    estimatedCost: "$20,000",
    sponsors: {
      p1: "Red Bull Racing",
      p2: "Alpinestars",
      p3: "HRE Wheels",
      p4: "PUMA Motorsports",
      p5: "8x8"
    }
  },
  {
    id: 6,
    week: 6,
    date: "Apr 5, 2025",
    city: "Miami, FL",
    eventType: "Detail Day #2",
    venue: "Wynwood Detail Lounge",
    theme: "Pre-Summer Shine",
    charity: "The Just One Project",
    estimatedCost: "$8,000",
    sponsors: {
      p1: "Continental",
      p2: "Griot's Garage",
      p3: "XPEL",
      p4: "Montblanc",
      p5: "Data Canopy"
    }
  },
  {
    id: 7,
    week: 7,
    date: "Apr 12, 2025",
    city: "Dallas, TX",
    eventType: "Tires & Timepieces™",
    venue: "Deep Ellum Show Lot",
    theme: "Texas Torque",
    charity: "CIS North Texas",
    estimatedCost: "$11,500",
    sponsors: {
      p1: "Michelin",
      p2: "TAG Heuer",
      p3: "KW Suspension",
      p4: "Persol",
      p5: "Equinix"
    }
  },
  {
    id: 8,
    week: 8,
    date: "Apr 19, 2025",
    city: "Dallas, TX",
    eventType: "Timepiece Meetup #2",
    venue: "Omega Boutique",
    theme: "Grail Math Live",
    charity: "CIS North Texas",
    estimatedCost: "$6,500",
    sponsors: {
      p1: "Omega",
      p2: "Teddy Baldassarre",
      p3: "Watch Eric",
      p4: "TUMI",
      p5: "AWS"
    }
  },
  {
    id: 9,
    week: 9,
    date: "Apr 26, 2025",
    city: "Charlotte, NC",
    eventType: "Rally Drive #2",
    venue: "Blue Ridge Loop",
    theme: "Appalachian Flex",
    charity: "Dream On 3",
    estimatedCost: "$14,000",
    sponsors: {
      p1: "Yokohama",
      p2: "WatchBox",
      p3: "Vorsteiner",
      p4: "Richard Mille",
      p5: "Google"
    }
  },
  {
    id: 10,
    week: 10,
    date: "May 3, 2025",
    city: "Atlanta, GA",
    eventType: "Track Day #2",
    venue: "Atlanta Motorsports Park",
    theme: "Paddock Precision",
    charity: "Next Gen ATL",
    estimatedCost: "$20,000",
    sponsors: {
      p1: "Ferrari F1",
      p2: "Bell Helmets",
      p3: "BBS Wheels",
      p4: "Oakley",
      p5: "Verizon"
    }
  },
  {
    id: 11,
    week: 11,
    date: "May 10, 2025",
    city: "Charlotte, NC",
    eventType: "Timepiece Meetup #3",
    venue: "Collectors Lounge ATL",
    theme: "Time Over Torque",
    charity: "Dream On 3",
    estimatedCost: "$6,000",
    sponsors: {
      p1: "TAG Heuer",
      p2: "Watch Eric",
      p3: "Jomashop",
      p4: "Persol",
      p5: "Zoom"
    }
  },
  {
    id: 12,
    week: 12,
    date: "May 17, 2025",
    city: "Nashville, TN",
    eventType: "Detail Day #3",
    venue: "Music City Mod Garage",
    theme: "Rally Ready Gloss",
    charity: "Drive On 3",
    estimatedCost: "$8,000",
    sponsors: {
      p1: "Toyo Tires",
      p2: "AMMO NYC",
      p3: "Ceramic Pro",
      p4: "TAG Heuer",
      p5: "Blue Team Alpha"
    }
  },
  
  // Weeks 13-24
  {
    id: 13,
    week: 13,
    date: "May 24, 2025",
    city: "Dallas, TX",
    eventType: "Haute Auction #1",
    venue: "Private Estate | Park Cities",
    theme: "Modern Grails",
    charity: "CIS North Texas",
    estimatedCost: "$18,000",
    sponsors: {
      p1: "Haute Asset Brokers",
      p2: "Patek Philippe",
      p3: "HRE Wheels",
      p4: "Moët & Chandon",
      p5: "AWS"
    }
  },
  {
    id: 14,
    week: 14,
    date: "May 31, 2025",
    city: "Miami, FL",
    eventType: "Timepiece Meetup #4",
    venue: "TAG Lounge",
    theme: "Grail Logic | Collector Panel",
    charity: "BBBS Miami",
    estimatedCost: "$6,500",
    sponsors: {
      p1: "TAG Heuer",
      p2: "Hodinkee",
      p3: "WatchBox",
      p4: "TUMI",
      p5: "Google"
    }
  },
  {
    id: 15,
    week: 15,
    date: "Jun 7, 2025",
    city: "Philadelphia, PA",
    eventType: "Rally Drive #3",
    venue: "Poconos Loop",
    theme: "Summer Sprint",
    charity: "Year Up Philly",
    estimatedCost: "$14,000",
    sponsors: {
      p1: "Michelin",
      p2: "Tissot",
      p3: "Vorsteiner",
      p4: "Montblanc",
      p5: "Data Canopy"
    }
  },
  {
    id: 16,
    week: 16,
    date: "Jun 14, 2025",
    city: "Chicago, IL",
    eventType: "Tires & Timepieces™",
    venue: "Navy Pier Auto Deck",
    theme: "Midwest Moves",
    charity: "MBMHMC",
    estimatedCost: "$12,000",
    sponsors: {
      p1: "BFGoodrich",
      p2: "TAG Heuer",
      p3: "Brembo",
      p4: "Richard Mille",
      p5: "Equinix"
    }
  },
  {
    id: 17,
    week: 17,
    date: "Jun 21, 2025",
    city: "Chicago, IL",
    eventType: "Track Day #3",
    venue: "Autobahn Country Club",
    theme: "Great Lakes Apex",
    charity: "MBMHMC",
    estimatedCost: "$20,000",
    sponsors: {
      p1: "AMG Petronas",
      p2: "XPEL",
      p3: "KW Suspension",
      p4: "Oakley",
      p5: "8x8"
    }
  },
  {
    id: 18,
    week: 18,
    date: "Jun 28, 2025",
    city: "All F1 Cities",
    eventType: "F1 Mega Weekend",
    venue: "National Theater Circuit",
    theme: "Fast Lines & Fine Times",
    charity: "Redline x Local Orgs",
    estimatedCost: "$25,000",
    sponsors: {
      p1: "Ferrari",
      p2: "TAG Heuer",
      p3: "Moët",
      p4: "Zoom",
      p5: "AWS"
    }
  },
  {
    id: 19,
    week: 19,
    date: "Jul 5, 2025",
    city: "Detroit, MI",
    eventType: "Timepiece Meetup #5",
    venue: "M1 Collectors Lounge",
    theme: "Motor City Mechanics",
    charity: "Detroit Rescue Mission",
    estimatedCost: "$6,500",
    sponsors: {
      p1: "Patek Philippe",
      p2: "Watch Eric",
      p3: "Carl F. Bucherer",
      p4: "Persol",
      p5: "Verizon"
    }
  },
  {
    id: 20,
    week: 20,
    date: "Jul 12, 2025",
    city: "Detroit, MI",
    eventType: "Detail Day #4",
    venue: "Woodward Studio Gloss",
    theme: "Rubber Meets Road",
    charity: "Detroit Rescue Mission",
    estimatedCost: "$8,000",
    sponsors: {
      p1: "Griot's Garage",
      p2: "Chemical Guys",
      p3: "XPEL",
      p4: "TAG Heuer",
      p5: "Digital Realty"
    }
  },
  {
    id: 21,
    week: 21,
    date: "Jul 19, 2025",
    city: "Seattle, WA",
    eventType: "Rally Drive #4",
    venue: "Rainier Loop | Coastal Reverb",
    theme: "Pacific Rally",
    charity: "BBBS Seattle",
    estimatedCost: "$14,000",
    sponsors: {
      p1: "Pirelli",
      p2: "TAG Heuer",
      p3: "BBS Wheels",
      p4: "Persol",
      p5: "Equinix"
    }
  },
  {
    id: 22,
    week: 22,
    date: "Jul 26, 2025",
    city: "Seattle, WA",
    eventType: "Tires & Timepieces™",
    venue: "Pike Place Scenic Deck",
    theme: "NW Collector Circuit",
    charity: "BBBS Seattle",
    estimatedCost: "$12,000",
    sponsors: {
      p1: "Continental",
      p2: "Hublot",
      p3: "KW Suspension",
      p4: "Oakley",
      p5: "Zoom"
    }
  },
  {
    id: 23,
    week: 23,
    date: "Aug 2, 2025",
    city: "Portland, OR",
    eventType: "Timepiece Meetup #6",
    venue: "Collector Vault | Pearl District",
    theme: "Flex Forecast",
    charity: "Elevate Oregon",
    estimatedCost: "$6,500",
    sponsors: {
      p1: "Rolex",
      p2: "Nico Leonard",
      p3: "Jomashop",
      p4: "TUMI",
      p5: "Google"
    }
  },
  {
    id: 24,
    week: 24,
    date: "Aug 9, 2025",
    city: "Denver, CO",
    eventType: "Track Day #4",
    venue: "Highlands Ranch Autoplex",
    theme: "Elevation Apex",
    charity: "Denver Kids Inc",
    estimatedCost: "$20,000",
    sponsors: {
      p1: "McLaren Racing",
      p2: "Alpinestars",
      p3: "HRE Wheels",
      p4: "PUMA",
      p5: "Microsoft Azure"
    }
  },
  
  // Weeks 25-36
  {
    id: 25,
    week: 25,
    date: "Aug 16, 2025",
    city: "Las Vegas, NV",
    eventType: "Track Day #2",
    venue: "LVMS",
    theme: "Redline Basics",
    charity: "The Just One Project",
    estimatedCost: "$22,000",
    sponsors: {
      p1: "Mercedes-AMG F1",
      p2: "Chemical Guys",
      p3: "BBS Wheels",
      p4: "PUMA Motorsports",
      p5: "Verizon"
    }
  },
  {
    id: 26,
    week: 26,
    date: "Aug 23, 2025",
    city: "Los Angeles, CA",
    eventType: "Haute Auction #2",
    venue: "Montage Beverly Hills",
    theme: "Heritage Grails",
    charity: "Inner-City Arts",
    estimatedCost: "$20,000",
    sponsors: {
      p1: "Haute Asset Brokers",
      p2: "Rolex",
      p3: "Brembo",
      p4: "Moët & Chandon",
      p5: "Zoom"
    }
  },
  {
    id: 27,
    week: 27,
    date: "Aug 30, 2025",
    city: "Nashville, TN",
    eventType: "Rally Drive #4",
    venue: "Scenic River Cruise",
    theme: "Vol Line Drive",
    charity: "Dream On 3",
    estimatedCost: "$14,000",
    sponsors: {
      p1: "BFGoodrich",
      p2: "TAG Heuer",
      p3: "Eibach",
      p4: "Montblanc",
      p5: "Equinix"
    }
  },
  {
    id: 28,
    week: 28,
    date: "Sep 6, 2025",
    city: "Atlanta, GA",
    eventType: "Tires & Timepieces™",
    venue: "Porsche Experience Center",
    theme: "Fall Flex",
    charity: "Future Foundation ATL",
    estimatedCost: "$12,000",
    sponsors: {
      p1: "Michelin",
      p2: "Hublot",
      p3: "KW Suspension",
      p4: "Porsche Design",
      p5: "Blue Team Alpha"
    }
  },
  {
    id: 29,
    week: 29,
    date: "Sep 13, 2025",
    city: "Atlanta, GA",
    eventType: "Timepiece Meetup #4",
    venue: "Watch Boutique ATL",
    theme: "Legacy Collectors",
    charity: "Next Gen ATL",
    estimatedCost: "$6,000",
    sponsors: {
      p1: "Watch Eric",
      p2: "Tissot",
      p3: "Carl F. Bucherer",
      p4: "Persol",
      p5: "Five9"
    }
  },
  {
    id: 30,
    week: 30,
    date: "Sep 20, 2025",
    city: "Charlotte, NC",
    eventType: "Detail Day #3",
    venue: "Motorsport Warehouse",
    theme: "Prep-to-Pro",
    charity: "Drive On 3",
    estimatedCost: "$8,000",
    sponsors: {
      p1: "Toyo Tires",
      p2: "Adam's Polishes",
      p3: "XPEL",
      p4: "Oakley",
      p5: "Dialpad"
    }
  },
  {
    id: 31,
    week: 31,
    date: "Sep 27, 2025",
    city: "Charlotte, NC",
    eventType: "Rally Drive #5",
    venue: "Blue Ridge Route",
    theme: "Appalachian Push",
    charity: "Drive On 3",
    estimatedCost: "$14,000",
    sponsors: {
      p1: "Pirelli",
      p2: "Omega",
      p3: "Vorsteiner",
      p4: "TUMI",
      p5: "Google"
    }
  },
  {
    id: 32,
    week: 32,
    date: "Oct 4, 2025",
    city: "Charlotte, NC",
    eventType: "Track Day #3",
    venue: "CMP or AMP",
    theme: "Flex & Learn",
    charity: "Future Foundation ATL",
    estimatedCost: "$20,000",
    sponsors: {
      p1: "Red Bull Racing",
      p2: "Alpinestars",
      p3: "Brembo",
      p4: "AMG Gear",
      p5: "Verizon"
    }
  },
  {
    id: 33,
    week: 33,
    date: "Oct 11, 2025",
    city: "Chicago, IL",
    eventType: "Haute Auction #3",
    venue: "Lakefront Venue",
    theme: "Chicago Grail Drop",
    charity: "MBMHMC",
    estimatedCost: "$18,000",
    sponsors: {
      p1: "Haute Asset Brokers",
      p2: "Patek Philippe",
      p3: "HRE Wheels",
      p4: "Dom Pérignon",
      p5: "8x8"
    }
  },
  {
    id: 34,
    week: 34,
    date: "Oct 18, 2025",
    city: "New York, NY",
    eventType: "Timepiece Meetup #5",
    venue: "WatchBox Lounge NYC",
    theme: "Gotham Flips",
    charity: "BBBS NYC",
    estimatedCost: "$6,500",
    sponsors: {
      p1: "WatchBox",
      p2: "Hodinkee",
      p3: "Carl F. Bucherer",
      p4: "TAG Heuer",
      p5: "AWS"
    }
  },
  {
    id: 35,
    week: 35,
    date: "Oct 25, 2025",
    city: "Denver, CO",
    eventType: "Tires & Timepieces™",
    venue: "Civic Center Lot",
    theme: "High Altitude Cars",
    charity: "Denver Rescue Mission",
    estimatedCost: "$11,500",
    sponsors: {
      p1: "Continental Tires",
      p2: "TAG Heuer",
      p3: "BBS Wheels",
      p4: "Persol",
      p5: "Google Cloud"
    }
  },
  {
    id: 36,
    week: 36,
    date: "Nov 1, 2025",
    city: "Denver, CO",
    eventType: "Rally Drive #6",
    venue: "Mountain Loop Rally",
    theme: "Elevation Drop",
    charity: "Denver Kids Inc.",
    estimatedCost: "$14,000",
    sponsors: {
      p1: "Pirelli",
      p2: "Omega",
      p3: "KW Suspension",
      p4: "Montblanc",
      p5: "Zoom"
    }
  },
  
  // Weeks 37-48
  {
    id: 37,
    week: 37,
    date: "Nov 8, 2025",
    city: "Dallas, TX",
    eventType: "Detail Day #4",
    venue: "Mod Garage",
    theme: "Finish Strong",
    charity: "Girls Empowerment Network",
    estimatedCost: "$8,000",
    sponsors: {
      p1: "Toyo Tires",
      p2: "Griot's Garage",
      p3: "XPEL",
      p4: "Richard Mille",
      p5: "Advantix"
    }
  },
  {
    id: 38,
    week: 38,
    date: "Nov 15, 2025",
    city: "Miami, FL",
    eventType: "Track Day #4",
    venue: "Homestead-Miami",
    theme: "Full-Throttle Flex",
    charity: "BBBS Miami",
    estimatedCost: "$20,000",
    sponsors: {
      p1: "Red Bull Racing",
      p2: "Alpinestars",
      p3: "BBS Wheels",
      p4: "Oakley",
      p5: "Zoom"
    }
  },
  {
    id: 39,
    week: 39,
    date: "Nov 22, 2025",
    city: "Miami, FL",
    eventType: "Timepiece Meetup #6",
    venue: "TAG Heuer Lounge",
    theme: "Grail Season",
    charity: "BBBS Miami",
    estimatedCost: "$6,500",
    sponsors: {
      p1: "TAG Heuer",
      p2: "Watch Eric",
      p3: "Carl F. Bucherer",
      p4: "Persol",
      p5: "Blue Team Alpha"
    }
  },
  {
    id: 40,
    week: 40,
    date: "Nov 29, 2025",
    city: "Phoenix, AZ",
    eventType: "Haute Auction #4",
    venue: "Highline Scottsdale",
    theme: "Exotics for Equity",
    charity: "PCH Foundation",
    estimatedCost: "$18,000",
    sponsors: {
      p1: "Haute Asset Brokers",
      p2: "Rolex",
      p3: "HRE Wheels",
      p4: "Moët & Chandon",
      p5: "AWS"
    }
  },
  {
    id: 41,
    week: 41,
    date: "Dec 6, 2025",
    city: "Scottsdale, AZ",
    eventType: "Tires & Timepieces™",
    venue: "Experience Haus Rooftop",
    theme: "Holiday Drop",
    charity: "PCH Foundation",
    estimatedCost: "$12,000",
    sponsors: {
      p1: "Michelin",
      p2: "Hublot",
      p3: "KW Suspension",
      p4: "TUMI",
      p5: "Data Canopy"
    }
  },
  {
    id: 42,
    week: 42,
    date: "Dec 13, 2025",
    city: "Las Vegas, NV",
    eventType: "Rally Drive #7",
    venue: "Red Rock Scenic Loop",
    theme: "Year-End Flex",
    charity: "The Just One Project",
    estimatedCost: "$14,000",
    sponsors: {
      p1: "Pirelli",
      p2: "Omega",
      p3: "Vorsteiner",
      p4: "Oakley",
      p5: "Google Cloud"
    }
  },
  {
    id: 43,
    week: 43,
    date: "Dec 20, 2025",
    city: "Las Vegas, NV",
    eventType: "Timepiece Meetup #7",
    venue: "Cosmopolitan / Aria Lounge",
    theme: "Watches & Whispers",
    charity: "Just One Project",
    estimatedCost: "$6,000",
    sponsors: {
      p1: "WatchBox",
      p2: "Hodinkee",
      p3: "Tissot",
      p4: "Montblanc",
      p5: "Equinix"
    }
  },
  {
    id: 44,
    week: 44,
    date: "Dec 27, 2025",
    city: "Miami, FL",
    eventType: "Detail Day #5",
    venue: "Wynwood PPF Lounge",
    theme: "Deep Winter Gloss",
    charity: "BBBS Miami",
    estimatedCost: "$8,000",
    sponsors: {
      p1: "Chemical Guys",
      p2: "Ceramic Pro",
      p3: "XPEL",
      p4: "TAG Heuer",
      p5: "Five9"
    }
  },
  {
    id: 45,
    week: 45,
    date: "Jan 3, 2026",
    city: "Houston, TX",
    eventType: "Track Day #5",
    venue: "MSR Houston",
    theme: "Winter Grip",
    charity: "Future Front Texas",
    estimatedCost: "$20,000",
    sponsors: {
      p1: "Ferrari F1",
      p2: "Alpinestars",
      p3: "Brembo",
      p4: "PUMA",
      p5: "Digital Realty"
    }
  },
  {
    id: 46,
    week: 46,
    date: "Jan 10, 2026",
    city: "Los Angeles, CA",
    eventType: "Rally Drive #8",
    venue: "Malibu Loop",
    theme: "Southern Sunset",
    charity: "Inner-City Arts LA",
    estimatedCost: "$14,000",
    sponsors: {
      p1: "Michelin",
      p2: "Patek Philippe",
      p3: "KW Suspension",
      p4: "TUMI",
      p5: "Verizon"
    }
  },
  {
    id: 47,
    week: 47,
    date: "Jan 17, 2026",
    city: "Los Angeles, CA",
    eventType: "Timepiece Meetup #8",
    venue: "Hublot LA",
    theme: "Redline Time Talks",
    charity: "BBBS LA",
    estimatedCost: "$6,500",
    sponsors: {
      p1: "Hublot",
      p2: "Nico Leonard",
      p3: "Carl F. Bucherer",
      p4: "Oakley",
      p5: "Zoom"
    }
  },
  {
    id: 48,
    week: 48,
    date: "Jan 24, 2026",
    city: "Scottsdale, AZ",
    eventType: "Tires & Timepieces™",
    venue: "Experience Haus™",
    theme: "Collector Start | Season Reset",
    charity: "PCH Foundation",
    estimatedCost: "$11,500",
    sponsors: {
      p1: "Yokohama",
      p2: "TAG Heuer",
      p3: "KW Suspension",
      p4: "Tumi",
      p5: "Equinix"
    }
  },
  
  // Weeks 49-60
  {
    id: 49,
    week: 49,
    date: "Jan 31, 2026",
    city: "Dallas, TX",
    eventType: "Tires & Timepieces™",
    venue: "Flex Showground",
    theme: "Summer Start",
    charity: "CIS North Texas",
    estimatedCost: "$12,000",
    sponsors: {
      p1: "Michelin",
      p2: "TAG Heuer",
      p3: "HRE Wheels",
      p4: "Oakley",
      p5: "Zoom"
    }
  },
  {
    id: 50,
    week: 50,
    date: "Feb 7, 2026",
    city: "Miami, FL",
    eventType: "Detail Day #6",
    venue: "Wynwood Co-Op",
    theme: "Gloss in the Heat",
    charity: "BBBS Miami",
    estimatedCost: "$8,000",
    sponsors: {
      p1: "Pirelli",
      p2: "Chemical Guys",
      p3: "XPEL",
      p4: "Tumi",
      p5: "Blue Team Alpha"
    }
  },
  {
    id: 51,
    week: 51,
    date: "Feb 14, 2026",
    city: "All Mega Cities",
    eventType: "F1 Movie National Event",
    venue: "See F1 City Matrix",
    theme: "Fast Lines & Fine Times",
    charity: "Local 501(c)(3)s",
    estimatedCost: "$25,000",
    sponsors: {
      p1: "Ferrari",
      p2: "TAG Heuer",
      p3: "Moët",
      p4: "Brembo",
      p5: "Google"
    }
  },
  {
    id: 52,
    week: 52,
    date: "Feb 21, 2026",
    city: "Chicago, IL",
    eventType: "Track Day #6",
    venue: "Autobahn Country Club",
    theme: "Midwest Momentum",
    charity: "MBMHMC",
    estimatedCost: "$20,000",
    sponsors: {
      p1: "BMW M Motorsport",
      p2: "Alpinestars",
      p3: "KW Suspension",
      p4: "Montblanc",
      p5: "Equinix"
    }
  },
  {
    id: 53,
    week: 53,
    date: "Feb 28, 2026",
    city: "Detroit, MI",
    eventType: "Rally Drive #9",
    venue: "M1 to Belle Isle",
    theme: "Motor City Drive",
    charity: "Detroit Rescue Mission",
    estimatedCost: "$14,000",
    sponsors: {
      p1: "Yokohama",
      p2: "Watch Eric",
      p3: "Brembo",
      p4: "PUMA Motorsports",
      p5: "Verizon"
    }
  },
  {
    id: 54,
    week: 54,
    date: "Mar 7, 2026",
    city: "Boston, MA",
    eventType: "Tires & Timepieces™",
    venue: "Harbor Garage",
    theme: "Grail Summer Pop-Up",
    charity: "BBBS Boston",
    estimatedCost: "$11,500",
    sponsors: {
      p1: "Toyo Tires",
      p2: "TAG Heuer",
      p3: "BBS Wheels",
      p4: "Persol",
      p5: "AWS"
    }
  },
  {
    id: 55,
    week: 55,
    date: "Mar 14, 2026",
    city: "New York, NY",
    eventType: "Timepiece Meetup #9",
    venue: "WatchBox NYC",
    theme: "Time Over Time",
    charity: "BBBS NYC",
    estimatedCost: "$6,500",
    sponsors: {
      p1: "WatchBox",
      p2: "Hodinkee",
      p3: "Carl F. Bucherer",
      p4: "Montblanc",
      p5: "Data Canopy"
    }
  },
  {
    id: 56,
    week: 56,
    date: "Mar 21, 2026",
    city: "Denver, CO",
    eventType: "Detail Day #7",
    venue: "Mod Garage – Highlands",
    theme: "Altitude Gloss",
    charity: "Denver Kids Inc",
    estimatedCost: "$8,000",
    sponsors: {
      p1: "BFGoodrich",
      p2: "Griot's Garage",
      p3: "XPEL",
      p4: "TAG Heuer",
      p5: "Zoom"
    }
  },
  {
    id: 57,
    week: 57,
    date: "Mar 28, 2026",
    city: "Seattle, WA",
    eventType: "Rally Drive #10",
    venue: "Rainier Loop",
    theme: "Pacific Northwest Flex",
    charity: "BBBS Seattle",
    estimatedCost: "$14,000",
    sponsors: {
      p1: "Continental",
      p2: "Teddy Baldassarre",
      p3: "Vorsteiner",
      p4: "TUMI",
      p5: "Equinix"
    }
  },
  {
    id: 58,
    week: 58,
    date: "Apr 4, 2026",
    city: "Portland, OR",
    eventType: "Tires & Timepieces™",
    venue: "Waterfront Collector Lot",
    theme: "Rain & Reflections",
    charity: "Elevate Oregon",
    estimatedCost: "$12,000",
    sponsors: {
      p1: "Pirelli",
      p2: "Hublot",
      p3: "KW Suspension",
      p4: "Persol",
      p5: "8x8"
    }
  },
  {
    id: 59,
    week: 59,
    date: "Apr 11, 2026",
    city: "Scottsdale, AZ",
    eventType: "Haute Auction #5",
    venue: "Indoor Collector Vault",
    theme: "Grail Reset",
    charity: "PCH Foundation",
    estimatedCost: "$18,000",
    sponsors: {
      p1: "Haute Asset Brokers",
      p2: "Patek Philippe",
      p3: "HRE Wheels",
      p4: "Dom Pérignon",
      p5: "Five9"
    }
  },
  {
    id: 60,
    week: 60,
    date: "Apr 18, 2026",
    city: "Scottsdale, AZ",
    eventType: "Timepiece Meetup #10",
    venue: "Experience Haus™",
    theme: "Fall Flips & Strategy",
    charity: "PCH Foundation",
    estimatedCost: "$6,000",
    sponsors: {
      p1: "Rolex",
      p2: "TAG Heuer",
      p3: "Jomashop",
      p4: "TUMI",
      p5: "Google"
    }
  }
];

// Event categories for filtering
export const eventTypes = [
  "Detail Day",
  "Tires & Timepieces™",
  "Rally Drive",
  "Timepiece Meetup",
  "Track Day",
  "Haute Auction",
  "F1 Mega Weekend"
];

// Cities for filtering
export const eventCities = [
  "Scottsdale, AZ",
  "Phoenix, AZ",
  "Los Angeles, CA",
  "Miami, FL",
  "Dallas, TX",
  "Charlotte, NC",
  "Atlanta, GA",
  "Nashville, TN",
  "Philadelphia, PA",
  "Chicago, IL",
  "Detroit, MI",
  "Seattle, WA",
  "Portland, OR",
  "Denver, CO",
  "Las Vegas, NV",
  "New York, NY",
  "Houston, TX",
  "Boston, MA"
];

// Color coding for event types
export const eventTypeColors = {
  "Detail Day": "bg-cyan-600",
  "Tires & Timepieces™": "bg-purple-600",
  "Rally Drive": "bg-green-600",
  "Timepiece Meetup": "bg-yellow-600",
  "Track Day": "bg-red-600",
  "Haute Auction": "bg-indigo-600",
  "F1 Mega Weekend": "bg-orange-600"
};