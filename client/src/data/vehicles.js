export const vehicleProfile = {
  make: "Ferrari",
  model: "458 Italia",
  year: "2015",
  tire: {
    brand: "Michelin Pilot Sport 4S",
    model: "275/35ZR20",
    mileageLifeTarget: 20000,
    currentMileage: 4500,
    purchaseDate: "2024-04-15",
    lastTreadDepthCheck: "2024-04-25"
  },
  maintenance: {
    lastOilChange: "2024-02-20",
    lastAirFilterChange: "2023-10-01",
    lastCabinFilterChange: "2023-10-01",
    lastCoolantFlush: "2023-08-15",
    lastBrakeFluidChange: "2023-12-10",
    lastTransmissionService: "2022-07-10",
    lastQuarterlyReset: "2024-03-01",
    lastMonthlyMaintenance: "2024-04-01",
    lastWeeklyQuickCheck: "2024-04-20",
    lastPreDriveCheck: "2024-04-25"
  },
  maintenanceFlags: {
    missedWeekly: false,
    missedMonthly: false,
    missedQuarterly: false,
    missedSeasonal: false
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
  }
};