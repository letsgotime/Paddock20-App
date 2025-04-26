export const vehicleProfile = {
  make: "Ferrari",
  model: "F8 Tributo",
  year: 2022,
  vin: "ZFFMJ65M4N0321456",
  color: "Rosso Corsa",
  purchaseDate: "2022-07-15",
  mileage: 8500,
  lastService: "2024-02-10",
  nextService: "2024-08-10",
  engineType: "3.9L Twin-Turbo V8",
  transmission: "7-Speed Dual-Clutch",
  horsepower: 710,
  torque: "568 lb-ft",
  driveType: "RWD",
  fuel: "Premium Unleaded",
  tire: {
    brand: "Pirelli",
    model: "P Zero Corsa",
    mileageLifeTarget: 15000,
    currentMileage: 4500, 
    purchaseDate: "2023-06-01",
    lastTreadDepthCheck: "2024-04-25"
  },
  glossTracking: {
    lastGlossBoost: "2024-04-12",
    lastFullDecon: "2024-03-01",
    lastSealantRefresh: "2024-03-10",
    lastPaintCorrection: "2023-11-15",
    lastCeramicTopCoat: "2022-09-01",
    glossGrowthLog: [
      {
        date: "2024-03-01",
        action: "Full Decon + Frothe Boost Applied",
        notes: "Post-winter reset before canyon season."
      },
      {
        date: "2024-04-12",
        action: "Gloss Reload Applied After Spring Drive",
        notes: "Maintaining water beading before seasonal pollen rise."
      }
    ]
  },
  maintenance: [
    {
      date: "2023-12-01",
      type: "Oil Change",
      mileage: 5000,
      notes: "Full synthetic oil change with filter replacement"
    },
    {
      date: "2024-02-10",
      type: "Major Service",
      mileage: 7500,
      notes: "Annual service including brake fluid flush, air filters"
    }
  ]
};

export const garageVehicles = [
  {
    id: 1,
    make: "Ferrari",
    model: "F8 Tributo",
    year: 2022,
    image: "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?auto=format&fit=crop&q=80&w=2787&ixlib=rb-4.0.3"
  },
  {
    id: 2,
    make: "Porsche",
    model: "911 GT3",
    year: 2023,
    image: "https://images.unsplash.com/photo-1614161439765-a4bfb1462e7b?auto=format&fit=crop&q=80&w=2787&ixlib=rb-4.0.3"
  }
];

export const maintenanceSchedule = [
  {
    id: 1,
    vehicleId: 1,
    service: "Oil Change",
    interval: "6 months or 5,000 miles",
    lastPerformed: "2023-12-01",
    mileage: 5000,
    nextDue: "2024-06-01"
  },
  {
    id: 2,
    vehicleId: 1,
    service: "Brake Fluid Flush",
    interval: "2 years",
    lastPerformed: "2024-02-10",
    mileage: 7500,
    nextDue: "2026-02-10"
  },
  {
    id: 3,
    vehicleId: 1,
    service: "Transmission Service",
    interval: "30,000 miles",
    lastPerformed: "Factory New",
    mileage: 0,
    nextDue: "30,000 miles"
  }
];