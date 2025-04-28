export const vehicles = [
  {
    id: "bmw-g80-m3",
    make: "BMW",
    model: "G80 M3 Competition",
    year: 2021,
    vin: "WBS03DJ09MCF42157",
    color: "Brooklyn Grey",
    purchaseDate: "2022-03-10",
    mileage: 18500,
    lastService: "2024-03-05",
    nextService: "2024-09-05",
    engineType: "3.0L Twin-Turbo I6",
    transmission: "8-Speed Automatic",
    horsepower: 503,
    torque: "479 lb-ft",
    driveType: "RWD",
    fuel: "Premium Unleaded",
    image: "/assets/bmw-g80-m3.jpg",
    isModified: true,
    modifications: [
      { name: "KW V4 Coilovers", manufacturer: "KW Suspensions" },
      { name: "Carbon fiber mirrors", manufacturer: "BMW M Performance" },
      { name: "Titanium exhaust", manufacturer: "Akrapovic" }
    ],
    tire: {
      brand: "Michelin",
      model: "Pilot Sport 4S",
      mileageLifeTarget: 25000,
      currentMileage: 10500,
      purchaseDate: "2023-05-15",
      lastTreadDepthCheck: "2024-04-10"
    },
    glossTracking: {
      lastGlossBoost: "2024-04-10",
      lastFullDecon: "2024-02-15",
      lastSealantRefresh: "2024-04-10",
      lastPaintCorrection: "2023-08-12",
      lastCeramicTopCoat: "2023-08-15",
      glossGrowthLog: [
        {
          date: "2024-02-15",
          action: "Full Decon + Ceramic Refresh",
          notes: "Winter protection maintenance before spring."
        },
        {
          date: "2024-04-10",
          action: "Spring Detail + Gloss Boost",
          notes: "Thorough wash, decon, and sealant refresh."
        }
      ]
    },
    maintenance: {
      lastOilChange: "2024-03-05",
      lastAirFilterChange: "2024-03-05",
      lastCabinFilterChange: "2024-03-05",
      lastCoolantFlush: "2023-09-20",
      lastBrakeFluidChange: "2023-09-20",
      lastTransmissionService: "2023-09-20",
      records: [
        {
          date: "2023-09-20",
          type: "Major Service",
          mileage: 15000,
          notes: "Annual maintenance service with fluid flush and brake system check"
        },
        {
          date: "2024-03-05",
          type: "Oil & Filter Service",
          mileage: 18500,
          notes: "Oil change with filter, inspection, and software updates"
        }
      ]
    },
    isOwned: true
  },
  {
    id: "bmw-e93-m3",
    make: "BMW",
    model: "E93 M3",
    year: 2009,
    vin: "WBSWD93519PY52147",
    color: "Jet Black",
    purchaseDate: "2020-05-15",
    mileage: 62500,
    lastService: "2024-02-22",
    nextService: "2024-08-22",
    engineType: "4.0L V8",
    transmission: "7-Speed DCT",
    horsepower: 414,
    torque: "295 lb-ft",
    driveType: "RWD",
    fuel: "Premium Unleaded",
    image: "/assets/bmw-e93-m3.jpg",
    isModified: true,
    modifications: [
      { name: "Performance exhaust", manufacturer: "Akrapovic" },
      { name: "Lowering springs", manufacturer: "H&R" },
      { name: "Carbon fiber trim", manufacturer: "BMW M Performance" }
    ],
    tire: {
      brand: "Michelin",
      model: "Pilot Sport 4S",
      mileageLifeTarget: 25000,
      currentMileage: 15000,
      purchaseDate: "2023-03-10",
      lastTreadDepthCheck: "2024-03-15"
    },
    glossTracking: {
      lastGlossBoost: "2024-03-15",
      lastFullDecon: "2023-11-05",
      lastSealantRefresh: "2024-03-15", 
      lastPaintCorrection: "2023-05-20",
      lastCeramicTopCoat: "2023-05-25",
      glossGrowthLog: [
        {
          date: "2023-11-05",
          action: "Full Decon + Paint Refresh",
          notes: "Winter preparation and protection."
        },
        {
          date: "2024-03-15",
          action: "Sealant Refresh + Gloss Boost",
          notes: "Spring detail after winter storage."
        }
      ]
    },
    maintenance: {
      lastOilChange: "2024-02-22",
      lastAirFilterChange: "2024-02-22",
      lastCabinFilterChange: "2024-02-22",
      lastCoolantFlush: "2023-06-10",
      lastBrakeFluidChange: "2023-06-10",
      lastTransmissionService: "2023-06-10",
      records: [
        {
          date: "2023-06-10",
          type: "Major Service",
          mileage: 60000,
          notes: "Comprehensive service including cooling system, transmission, and brake system"
        },
        {
          date: "2024-02-22",
          type: "Oil & Filter Service",
          mileage: 62500,
          notes: "Regular maintenance with filter replacement and inspection"
        }
      ]
    },
    isOwned: true
  },
  {
    id: "audi-r8-v10",
    make: "Audi",
    model: "R8 V10",
    year: 2014,
    vin: "WUAENAFG5EN001125",
    color: "Ibis White",
    purchaseDate: "2021-09-18",
    mileage: 31200,
    lastService: "2024-01-15",
    nextService: "2024-07-15",
    engineType: "5.2L V10",
    transmission: "7-Speed S-Tronic",
    horsepower: 525,
    torque: "391 lb-ft",
    driveType: "AWD",
    fuel: "Premium Unleaded",
    image: "/assets/audi-r8-v10.jpg",
    isModified: false,
    modifications: [],
    tire: {
      brand: "Pirelli",
      model: "P Zero",
      mileageLifeTarget: 20000,
      currentMileage: 8500,
      purchaseDate: "2023-04-12",
      lastTreadDepthCheck: "2024-02-10"
    },
    glossTracking: {
      lastGlossBoost: "2024-04-05",
      lastFullDecon: "2024-02-10",
      lastSealantRefresh: "2024-02-15",
      lastPaintCorrection: "2023-09-20",
      lastCeramicTopCoat: "2022-10-10",
      glossGrowthLog: [
        {
          date: "2024-02-10",
          action: "Full Decon + Ceramic Refresh",
          notes: "Complete detail with iron remover and clay bar treatment."
        },
        {
          date: "2024-04-05",
          action: "Gloss Boost Detail",
          notes: "Spring preparation with quick detail and protection."
        }
      ]
    },
    maintenance: {
      lastOilChange: "2024-01-15",
      lastAirFilterChange: "2023-08-10",
      lastCabinFilterChange: "2023-08-10",
      lastCoolantFlush: "2022-11-05",
      lastBrakeFluidChange: "2023-08-10",
      lastTransmissionService: "2022-11-05",
      records: [
        {
          date: "2023-08-10",
          type: "Mid-Year Service",
          mileage: 29000,
          notes: "Air filters, brake fluid, and inspection"
        },
        {
          date: "2024-01-15",
          type: "Oil Change",
          mileage: 31200,
          notes: "Regular oil service with OEM filter and multi-point inspection"
        }
      ]
    },
    isOwned: true
  },
  {
    id: "ferrari-458",
    make: "Ferrari",
    model: "458 Italia",
    year: 2015,
    vin: "ZFFBE2ZA7F0212752",
    color: "Rosso Corsa",
    purchaseDate: "2020-03-12",
    mileage: 12750,
    lastService: "2024-03-15",
    nextService: "2024-09-15",
    engineType: "4.5L V8",
    transmission: "7-Speed Dual-Clutch",
    horsepower: 562,
    torque: "398 lb-ft",
    driveType: "RWD",
    fuel: "Premium Unleaded",
    image: "/assets/ferrari-458.png",
    isModified: true,
    modifications: [
      { name: "Custom forged wheels", manufacturer: "HRE" },
      { name: "Carbon fiber aerodynamics kit", manufacturer: "Liberty Walk" },
      { name: "Sport exhaust system", manufacturer: "Capristo" }
    ],
    tire: {
      brand: "Pirelli",
      model: "P Zero Trofeo R",
      mileageLifeTarget: 12000,
      currentMileage: 6200, 
      purchaseDate: "2023-08-15",
      lastTreadDepthCheck: "2024-03-20"
    },
    glossTracking: {
      lastGlossBoost: "2024-03-22",
      lastFullDecon: "2024-02-15",
      lastSealantRefresh: "2024-02-20",
      lastPaintCorrection: "2023-10-05",
      lastCeramicTopCoat: "2021-11-20",
      glossGrowthLog: [
        {
          date: "2024-02-15",
          action: "Full Decon + Gloss Coat Applied",
          notes: "Complete detail before spring drives."
        },
        {
          date: "2024-03-22",
          action: "Gloss Boost After Desert Drive",
          notes: "Removed dust and restored shine after canyon run."
        }
      ]
    },
    maintenance: {
      lastOilChange: "2024-01-10",
      lastAirFilterChange: "2023-10-05",
      lastCabinFilterChange: "2023-10-05",
      lastCoolantFlush: "2022-05-12",
      lastBrakeFluidChange: "2023-12-15",
      lastTransmissionService: "2022-09-20",
      records: [
        {
          date: "2023-12-15",
          type: "Brake System Maintenance",
          mileage: 11800,
          notes: "Brake fluid flush, pad inspection, and caliper cleaning"
        },
        {
          date: "2024-01-10",
          type: "Oil Change",
          mileage: 12000,
          notes: "Full synthetic oil change with OEM filter"
        }
      ]
    }
  },
  {
    id: "ferrari-f8",
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
    image: "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?auto=format&fit=crop&q=80&w=2787&ixlib=rb-4.0.3",
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
    maintenance: {
      lastOilChange: "2023-11-01",
      lastAirFilterChange: "2022-06-01",
      lastCabinFilterChange: "2022-06-01",
      lastCoolantFlush: "2021-09-15",
      lastBrakeFluidChange: "2022-10-10",
      lastTransmissionService: "2021-08-01",
      records: [
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
    }
  }
];

export const vehicleProfile = vehicles[1];

export const garageVehicles = [
  {
    id: 1,
    make: "BMW",
    model: "G80 M3 Competition",
    year: 2021,
    image: "/assets/bmw-g80-m3.jpg",
    status: "owned"
  },
  {
    id: 2,
    make: "BMW",
    model: "E93 M3",
    year: 2009,
    image: "/assets/bmw-e93-m3.jpg",
    status: "owned"
  },
  {
    id: 3,
    make: "Audi",
    model: "R8 V10",
    year: 2014,
    image: "/assets/audi-r8-v10.jpg",
    status: "owned"
  },
  {
    id: 4,
    make: "Ferrari",
    model: "F8 Tributo",
    year: 2022,
    image: "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?auto=format&fit=crop&q=80&w=2787&ixlib=rb-4.0.3",
    status: "dream"
  },
  {
    id: 5,
    make: "Ferrari",
    model: "458 Italia",
    year: 2015,
    image: "/assets/ferrari-458.png",
    status: "dream"
  },
  {
    id: 6,
    make: "Porsche",
    model: "911 GT3",
    year: 2023,
    image: "https://images.unsplash.com/photo-1614161439765-a4bfb1462e7b?auto=format&fit=crop&q=80&w=2787&ixlib=rb-4.0.3",
    status: "dream"
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