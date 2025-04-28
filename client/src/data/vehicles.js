export const vehicles = [
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
    image: "/assets/ferrari458.png",
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
    make: "Ferrari",
    model: "F8 Tributo",
    year: 2022,
    image: "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?auto=format&fit=crop&q=80&w=2787&ixlib=rb-4.0.3"
  },
  {
    id: 2,
    make: "Ferrari",
    model: "458 Italia",
    year: 2015,
    image: "/assets/ferrari458.png"
  },
  {
    id: 3,
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