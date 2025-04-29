import React, { useState, useEffect, useRef, memo, Suspense, lazy } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import { 
  Activity, BarChart2, Wind, Thermometer, CornerUpRight, Clock, Calendar, 
  PieChart as PieChartIcon, AlertTriangle, TrendingUp, Droplets, Car, 
  Maximize2, Zap, MapPin, Mountain, Check, RefreshCw, Shield, Wrench,
  Download, Upload, Camera, ExternalLink, Loader
} from 'lucide-react';
import { searchImage } from '../services/unsplashService';
import { useAdaptiveImage, preloadImages, getImageStats } from '../services/adaptiveImageService';

// Lazy load the AdaptiveImage components
const AdaptiveImage = lazy(() => import('./AdaptiveImage'));
const AdaptiveImageGrid = lazy(() => import('./AdaptiveImage').then(module => ({ default: module.AdaptiveImageGrid })));
const AdaptiveHeroImage = lazy(() => import('./AdaptiveImage').then(module => ({ default: module.AdaptiveHeroImage })));

// Vehicle image search terms
const vehicleSearchTerms = [
  "professional automotive photography",
  "exterior front quarter view",
  "wheel and tire detail",
  "engine bay",
  "interior dashboard",
  "exhaust system",
  "suspension closeup",
  "rear angle view",
  "driving action shot",
  "night shot with lights on"
];

// Part image search queries - mapped to maintain consistent imagery
const partSearchQueries = {
  // Brake System
  'brake_disc': 'car brake disc rotor close up',
  'brake_caliper': 'performance brake caliper',
  'brake_pad': 'brake pad closeup',
  'brake_system': 'car brake system diagram',
  
  // Tire System
  'tire_tread': 'tire tread pattern detail',
  'tire_sidewall': 'tire sidewall close up',
  'tire_compound': 'performance tire compound',
  'tire_pressure': 'tire pressure gauge reading',
  'tire_pressure_gauge': 'digital tire pressure gauge professional',
  'tire_thermal_monitor': 'racing tire temperature monitor',
  'wheel_barrel': 'wheel barrel cleaning detail shot',
  
  // Engine & Fluids
  'engine_oil': 'engine oil level check',
  'coolant_system': 'car coolant reservoir',
  'brake_fluid': 'brake fluid reservoir',
  'power_steering': 'power steering fluid check',
  'washer_fluid': 'windshield washer fluid',
  'battery': 'car battery testing',
  'engine_belts': 'engine belt inspection',
  
  // Tools & Equipment
  'torque_wrench': 'digital torque wrench professional',
  'battery_tester': 'professional battery voltage tester',
  'thermal_camera': 'infrared thermal imaging camera automotive',
  'fluid_check': 'car fluid level check',
  'obd_scanner': 'professional OBD diagnostic scanner',
  
  // Gloss & Appearance
  'car_paint': 'car paint finish closeup',
  'iron_remover': 'iron fallout remover car detailing',
  'tar_remover': 'automotive tar spot remover',
  'water_spot_remover': 'water spot remover detailing',
  'sap_remover': 'tree sap removal detailing',
  'bug_remover': 'bug splatter remover car detailing',
  'polish': 'car polish application detailing',
  'paint_correction': 'paint correction before after',
  'glaze': 'car paint glaze application',
  'ceramic_coating': 'ceramic coating application car',
  'sealant': 'paint sealant application detailing',
  'wax': 'car wax application detailing',
  'paint_meter': 'paint thickness gauge meter',
  'paint_analysis': 'professional paint analysis automotive',
  
  // Body Panels
  'hood': 'car hood panel paint correction',
  'roof': 'car roof panel detailing',
  'trunk': 'car trunk lid detailing',
  'front_bumper': 'car front bumper detailing',
  'rear_bumper': 'car rear bumper detailing',
  'fender': 'car fender panel detailing',
  'door': 'car door panel detailing',
  'quarter_panel': 'car quarter panel detailing',
  
  // Documentation & Services
  'documents': 'vehicle documentation folder',
  'vin_decoder': 'VIN decoder report',
  'vehicle_history': 'vehicle history report document',
  'service_history': 'vehicle service history logbook',
  'ownership_records': 'vehicle ownership documentation',
  'authentication': 'vehicle authentication certificate',
  'recall_check': 'vehicle recall check report',
  'title': 'vehicle title document',
  'enclosed_transport': 'enclosed vehicle transport trailer',
  'insurance': 'vehicle insurance document',
  'identity_verification': 'secure identity verification process',
  'market_analysis': 'vehicle market value analysis chart',
  'investment_portfolio': 'automotive investment portfolio',
  
  // Interior & Details
  'racing_harness': 'racing harness seat belt installation',
  'door_seals': 'car door seal treatment',
  'glass_cleaner': 'automotive glass cleaning',
  'interior_detailing': 'car interior detailing',
  'leather_conditioner': 'leather conditioning treatment car',
  'tire_dressing': 'tire dressing application',
  'frothe_spray': 'car detailing spray application',
  'camera': 'professional automotive photography setup',
  
  // Service & Maintenance
  'service_plan': 'vehicle service plan document',
  'service_center': 'premium auto service center',
  'documentation': 'vehicle service documentation',
  'foam_cannon': 'foam cannon car wash',
  'inspection_report': 'vehicle inspection report',
  'engine_detailing': 'engine bay detailing',
  'wheel_installation': 'professional wheel installation',
  'key_fob': 'luxury car key fob',
  'paint_inspection': 'paint inspection detailing',
  'quick_detailer': 'quick detailer spray application',
  'interior_cleaning': 'luxury car interior cleaning',
  'digital_records': 'digital vehicle service records',
  'maintenance_schedule': 'vehicle maintenance schedule chart',
  'photo_documentation': 'vehicle photo documentation',
  
  // Additions
  'aerodynamics': 'car aerodynamic components',
  'brake_inspection': 'professional brake inspection'
};

const F1TelemetryDashboard = ({ vehicle, vehicleData }) => {
  const [activeTab, setActiveTab] = useState('performance');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showFullTelemetry, setShowFullTelemetry] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState('preDrive');
  const [carImages, setCarImages] = useState({});
  const [partImages, setPartImages] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Mock telemetry data (would be real-time in production)
  const [telemetryData, setTelemetryData] = useState({
    performance: {
      accelerationCurve: Array.from({ length: 20 }, (_, i) => ({ 
        time: i * 0.5, 
        speed: Math.min(160, Math.pow(i, 1.7) + 10 + Math.random() * 5),
        optimal: Math.min(165, Math.pow(i, 1.7) + 12)
      })),
      braking: Array.from({ length: 10 }, (_, i) => ({
        pressure: (10 - i) * 10,
        distance: Math.pow(10 - i, 2) * 0.8 + Math.random() * 10,
        ideal: Math.pow(10 - i, 2) * 0.8
      })),
      lateralG: Array.from({ length: 12 }, (_, i) => ({
        angle: i * 30,
        actual: Math.sin(i * 0.5) * 0.85 + Math.random() * 0.15,
        threshold: Math.sin(i * 0.5) * 0.9
      })),
      powerCurve: Array.from({ length: 30 }, (_, i) => ({
        rpm: 1000 + (i * 250),
        power: (Math.pow(i, 1.3) + 20) * (1 + Math.sin(i*0.4)*0.1),
        torque: (Math.pow(30-i, 0.8) + 100) * (1 + Math.sin(i*0.4)*0.1)
      })),
      drivingEfficiency: [
        { name: 'Optimal', value: 70 },
        { name: 'Current', value: 30 }
      ]
    },
    maintenance: {
      brakeWear: [
        { name: 'Front Left', value: 65, part: 'brake_disc' },
        { name: 'Front Right', value: 68, part: 'brake_caliper' },
        { name: 'Rear Left', value: 78, part: 'brake_pad' },
        { name: 'Rear Right', value: 76, part: 'brake_system' }
      ],
      tireWear: [
        { name: 'Front Left', value: 82, part: 'tire_tread' },
        { name: 'Front Right', value: 79, part: 'tire_sidewall' },
        { name: 'Rear Left', value: 88, part: 'tire_compound' },
        { name: 'Rear Right', value: 86, part: 'tire_pressure' }
      ],
      fluids: [
        { name: 'Oil', value: 90, optimal: 100, part: 'engine_oil' },
        { name: 'Coolant', value: 85, optimal: 100, part: 'coolant_system' },
        { name: 'Brake', value: 95, optimal: 100, part: 'brake_fluid' },
        { name: 'Power Steering', value: 88, optimal: 100, part: 'power_steering' },
        { name: 'Washer', value: 75, optimal: 100, part: 'washer_fluid' }
      ],
      battery: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        voltage: 12.6 - (i % 12) * 0.02 + Math.random() * 0.1,
        part: 'battery'
      })),
    },
    gloss: {
      glossIndex: Array.from({ length: 6 }, (_, i) => ({
        month: i,
        index: 95 - i * 5 + Math.random() * 3,
        baseline: 95 - i * 3,
        part: 'car_paint'
      })),
      surfaceContaminants: [
        { name: 'Iron Particles', value: 15, part: 'iron_remover' },
        { name: 'Tar Spots', value: 8, part: 'tar_remover' },
        { name: 'Water Spots', value: 12, part: 'water_spot_remover' },
        { name: 'Tree Sap', value: 5, part: 'sap_remover' },
        { name: 'Bug Residue', value: 10, part: 'bug_remover' }
      ],
      paintThickness: [
        { panel: 'Hood', factory: 110, current: 109, part: 'hood' },
        { panel: 'Roof', factory: 105, current: 104, part: 'roof' },
        { panel: 'Trunk', factory: 108, current: 107, part: 'trunk' },
        { panel: 'Front Bumper', factory: 115, current: 113, part: 'front_bumper' },
        { panel: 'Rear Bumper', factory: 112, current: 110, part: 'rear_bumper' },
        { panel: 'Left Fender', factory: 107, current: 106, part: 'fender' },
        { panel: 'Right Fender', factory: 107, current: 105, part: 'fender' },
        { panel: 'Left Door', factory: 106, current: 105, part: 'door' },
        { panel: 'Right Door', factory: 106, current: 104, part: 'door' },
        { panel: 'Left Quarter', factory: 109, current: 107, part: 'quarter_panel' },
        { panel: 'Right Quarter', factory: 109, current: 108, part: 'quarter_panel' }
      ],
      glossRadar: [
        { subject: 'Gloss', A: 80, B: 95, fullMark: 100, part: 'polish' },
        { subject: 'Clarity', A: 75, B: 90, fullMark: 100, part: 'paint_correction' },
        { subject: 'Depth', A: 70, B: 85, fullMark: 100, part: 'glaze' },
        { subject: 'Slickness', A: 65, B: 95, fullMark: 100, part: 'ceramic_coating' },
        { subject: 'Beading', A: 60, B: 90, fullMark: 100, part: 'sealant' },
        { subject: 'Protection', A: 50, B: 85, fullMark: 100, part: 'wax' },
      ]
    },
    concierge: {
      // We'll populate this with the checklist data
    }
  });

  // Concours d'Elegance Checklists
  const conciergeChecklists = {
    preDrive: {
      title: "Pre-Drive Readiness Concierge Checklist",
      description: "Prepare vehicles to showroom-plus spec before any drive, event, or track day.",
      items: [
        { id: 1, text: "Confirm cold tire pressures match brand-recommended + driver-preference specs", completed: false, part: 'tire_pressure_gauge' },
        { id: 2, text: "Check hot pressure expansion estimates for day's ambient temp", completed: false, part: 'tire_thermal_monitor' },
        { id: 3, text: "Visual barrel check: Brake dust, corrosion, discoloration, no residue allowed", completed: false, part: 'wheel_barrel' },
        { id: 4, text: "Verify torque settings on wheels with digital torque wrench (record session)", completed: false, part: 'torque_wrench' },
        { id: 5, text: "Battery voltage check (document if under 12.6V resting)", completed: false, part: 'battery_tester' },
        { id: 6, text: "Confirm surface temps: Pavement, tires, brake rotors (infrared scan log)", completed: false, part: 'thermal_camera' },
        { id: 7, text: "Check fluid levels: Oil (visual and sniff test), coolant, brake fluid clarity, washer fluid", completed: false, part: 'fluid_check' },
        { id: 8, text: "Check condition of belts, hoses, clamps — even minor cracking = red flag", completed: false, part: 'engine_belts' },
        { id: 9, text: "Inspect torque settings on aftermarket mods (splitters, wings, canards)", completed: false, part: 'aerodynamics' },
        { id: 10, text: "Verify seats, belts, harnesses for tightness, lock integrity", completed: false, part: 'racing_harness' },
        { id: 11, text: "Confirm door seals are treated (no dry seals)", completed: false, part: 'door_seals' },
        { id: 12, text: "Glass: Clean, no streaks, full edge inspection (door glass + mirrors)", completed: false, part: 'glass_cleaner' },
        { id: 13, text: "Remove all lint, debris from cabin", completed: false, part: 'interior_detailing' },
        { id: 14, text: "Confirm no service lights pending or warning codes active", completed: false, part: 'obd_scanner' },
        { id: 15, text: "Leather treated if needed (matte, OEM finish — no silicone gloss)", completed: false, part: 'leather_conditioner' },
        { id: 16, text: "Tire dressing: Double buff method, matte finish", completed: false, part: 'tire_dressing' },
        { id: 17, text: "Final Frothe Top-Up reset (deionized water final wipe optional)", completed: false, part: 'frothe_spray' },
        { id: 18, text: "Photographic documentation of final vehicle state (full walkaround)", completed: false, part: 'camera' }
      ]
    },
    acquisition: {
      title: "Vehicle Acquisition Concierge Checklist",
      description: "Source, validate, and deliver vehicles with zero surprises — asset-grade integrity.",
      items: [
        { id: 1, text: "Confirm Asset Match Form is completed in full (intent, exit timeline, funding plan)", completed: false, part: 'documents' },
        { id: 2, text: "Full VIN decode (OEM build sheet, options code extraction)", completed: false, part: 'vin_decoder' },
        { id: 3, text: "Pull CarFax, AutoCheck, auction results (across multiple providers)", completed: false, part: 'vehicle_history' },
        { id: 4, text: "Confirm all dealer service stamps or receipts", completed: false, part: 'service_history' },
        { id: 5, text: "Request prior ownership log (multi-owner histories must be detailed)", completed: false, part: 'ownership_records' },
        { id: 6, text: "Regional PPI booked: Paint meter reading on all panels, underbody inspection", completed: false, part: 'paint_meter' },
        { id: 7, text: "Verify brake pad thickness, rotor health, tire date codes", completed: false, part: 'brake_inspection' },
        { id: 8, text: "Full gloss index created (measuring clarity, swirl marks, orange peel)", completed: false, part: 'paint_analysis' },
        { id: 9, text: "Check chassis number plaques, badges, authenticity stamps", completed: false, part: 'authentication' },
        { id: 10, text: "Confirm no outstanding recalls or campaigns", completed: false, part: 'recall_check' },
        { id: 11, text: "Validate lien release or title in hand", completed: false, part: 'title' },
        { id: 12, text: "Plan enclosed shipping routing", completed: false, part: 'enclosed_transport' },
        { id: 13, text: "Confirm shipping insurance amount matches full replacement + appreciation buffer", completed: false, part: 'insurance' },
        { id: 14, text: "Seller identity verification + anti-fraud procedures", completed: false, part: 'identity_verification' },
        { id: 15, text: "Flip Forecast™ asset prediction built (90/180/360 day outlook)", completed: false, part: 'market_analysis' },
        { id: 16, text: "Build full Vault Brief™ packet (sourcing logic, ROI, market comps)", completed: false, part: 'investment_portfolio' }
      ]
    },
    service: {
      title: "Vehicle Service & Gloss Concierge Checklist",
      description: "Ensure client vehicles leave services better than new — not 'dealer detailed.'",
      items: [
        { id: 1, text: "Confirm client service goals (mechanical, cosmetic, gloss)", completed: false, part: 'service_plan' },
        { id: 2, text: "Vet service center: Google Reviews, community reviews, insurance carrier inspections", completed: false, part: 'service_center' },
        { id: 3, text: "Secure GoTime Service Intake Sheet (photo documentation pre/post)", completed: false, part: 'documentation' },
        { id: 4, text: "Paint protection protocols: Foam lance wash + 2BM mandatory pre-service", completed: false, part: 'foam_cannon' },
        { id: 5, text: "Document brake pad condition, wheel condition, tire tread at intake", completed: false, part: 'inspection_report' },
        { id: 6, text: "Engine bay wipedown: Degreaser + Frothe Top-Up", completed: false, part: 'engine_detailing' },
        { id: 7, text: "Check bolt torque for wheels post-service", completed: false, part: 'wheel_installation' },
        { id: 8, text: "Confirm key fob battery life", completed: false, part: 'key_fob' },
        { id: 9, text: "Confirm no added swirl marks or damage post-service (paint depth meters if needed)", completed: false, part: 'paint_inspection' },
        { id: 10, text: "Final Frothe Wipe + Boost topper after pickup", completed: false, part: 'quick_detailer' },
        { id: 11, text: "Cabin reset: Wipe plastics, clean glass, matte finish leather", completed: false, part: 'interior_cleaning' },
        { id: 12, text: "Confirm vehicle records updated in Garage Vault", completed: false, part: 'digital_records' },
        { id: 13, text: "Log next maintenance cycle estimate (miles, months)", completed: false, part: 'maintenance_schedule' },
        { id: 14, text: "Capture 5 photos minimum for GoTime service log archive", completed: false, part: 'photo_documentation' }
      ]
    },
    delivery: {
      title: "Delivery Logistics Concierge Checklist",
      description: "Move dreams without compromising an ounce of presentation or security.",
      items: [
        { id: 1, text: "Confirm pickup details: VIN, color, driver name, load time", completed: false, part: 'transport_scheduling' },
        { id: 2, text: "Insured carrier confirmation (IFS + double check FedEx S/N if applicable)", completed: false, part: 'shipping_insurance' },
        { id: 3, text: "Pre-load photo inspection sent to client before pick-up", completed: false, part: 'pre_shipment_inspection' },
        { id: 4, text: "Confirm transport trailer cleanliness (no oil drips, fresh mats)", completed: false, part: 'transport_trailer' },
        { id: 5, text: "Confirm enclosed carrier only (multi-car open trailers forbidden unless client waives)", completed: false, part: 'enclosed_transport' },
        { id: 6, text: "Mid-transport GPS check-in at halfway point", completed: false, part: 'gps_tracking' },
        { id: 7, text: "Destination weather window confirmation", completed: false, part: 'weather_forecast' },
        { id: 8, text: "Pre-delivery PDI checklist prepared (door dings, scuffs, etc.)", completed: false, part: 'delivery_inspection' },
        { id: 9, text: "Confirm package contents: Flip Packet™, Flex Folio™, Vault Entry Card", completed: false, part: 'delivery_package' },
        { id: 10, text: "Handoff walkthrough for timepieces or vehicles", completed: false, part: 'client_handoff' },
        { id: 11, text: "Confirm client signature and photo on delivery", completed: false, part: 'delivery_confirmation' },
        { id: 12, text: "Upload delivery completion to Garage Vault", completed: false, part: 'delivery_records' },
        { id: 13, text: "Send client follow-up survey for rating experience", completed: false, part: 'feedback_survey' },
        { id: 14, text: "Offer immediate concierge service for next dream planning", completed: false, part: 'concierge_service' }
      ]
    }
  };

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Vehicle image search terms
  const vehicleSearchTerms = [
    'luxury sports car front view',
    'exotic supercar rear view', 
    'sports car wheel close up', 
    'luxury car engine bay',
    'high performance brakes', 
    'sports car interior leather', 
    'supercar carbon fiber detail',
    'performance exhaust system',
    'car paint correction detail',
    'ceramic coating application'
  ];

  // Part image search terms
  const partSearchQueries = {
    'brake_disc': 'performance car brake disc rotor closeup',
    'brake_caliper': 'brembo caliper racing brake',
    'brake_pad': 'high performance brake pad close up',
    'brake_system': 'sports car complete brake system',
    'tire_tread': 'performance tire tread pattern closeup',
    'tire_sidewall': 'sports car tire sidewall detail',
    'tire_compound': 'racing tire compound closeup',
    'tire_pressure': 'tire pressure gauge digital',
    'engine_oil': 'synthetic motor oil service',
    'coolant_system': 'performance car coolant reservoir',
    'brake_fluid': 'brake fluid service high performance',
    'power_steering': 'power steering fluid check',
    'washer_fluid': 'windshield washer fluid refill',
    'battery': 'performance car battery installation',
    'car_paint': 'exotic car paint finish detail',
    'iron_remover': 'iron fallout remover car detailing',
    'tar_remover': 'tar spot remover detailing',
    'water_spot_remover': 'water spot treatment car paint',
    'sap_remover': 'tree sap remover detailing',
    'bug_remover': 'bug splatter remover detailing',
    'hood': 'sports car hood carbon fiber',
    'roof': 'sports car roof carbon fiber',
    'trunk': 'supercar trunk lid spoiler',
    'front_bumper': 'exotic car front bumper closeup',
    'rear_bumper': 'sports car rear diffuser',
    'fender': 'widebody fender sports car',
    'door': 'sports car door detail',
    'quarter_panel': 'sports car quarter panel detail',
    'polish': 'car paint polish application',
    'paint_correction': 'paint correction machine polishing',
    'glaze': 'car paint glaze application',
    'ceramic_coating': 'ceramic coating application car',
    'sealant': 'paint sealant application car',
    'wax': 'carnauba wax application',
    'tire_pressure_gauge': 'digital tire pressure gauge professional',
    'tire_thermal_monitor': 'racing tire temperature monitoring',
    'wheel_barrel': 'sports wheel barrel cleaning',
    'torque_wrench': 'digital torque wrench wheel installation',
    'battery_tester': 'car battery voltage tester',
    'thermal_camera': 'brake rotor thermal imaging',
    'fluid_check': 'engine fluid level inspection',
    'engine_belts': 'engine belt inspection service',
    'aerodynamics': 'sports car carbon fiber splitter',
    'racing_harness': 'racing harness installation car',
    'door_seals': 'door seal treatment car detailing',
    'glass_cleaner': 'automotive glass polish application',
    'interior_detailing': 'luxury car interior detailing',
    'obd_scanner': 'professional obd scanner diagnostic',
    'leather_conditioner': 'leather conditioning car seats',
    'tire_dressing': 'tire dressing application',
    'frothe_spray': 'detailing spray final touch',
    'camera': 'car photoshoot professional',
    'documents': 'vehicle documentation folder',
    'vin_decoder': 'vin inspection professional',
    'vehicle_history': 'vehicle history report carfax',
    'service_history': 'vehicle service history documentation',
    'ownership_records': 'vehicle ownership documentation',
    'paint_meter': 'paint thickness gauge measurement',
    'brake_inspection': 'brake pad thickness measurement',
    'paint_analysis': 'paint surface analysis professional',
    'authentication': 'vehicle authentication plaque',
    'recall_check': 'vehicle recall inspection',
    'title': 'vehicle clean title document',
    'enclosed_transport': 'enclosed auto transport trailer',
    'insurance': 'exotic car insurance document',
    'identity_verification': 'identity verification document check',
    'market_analysis': 'exotic car market value analysis',
    'investment_portfolio': 'car collection investment portfolio',
    'service_plan': 'vehicle service plan documentation',
    'service_center': 'luxury auto service center',
    'documentation': 'vehicle service documentation',
    'foam_cannon': 'foam cannon car wash',
    'inspection_report': 'vehicle inspection report',
    'engine_detailing': 'engine bay detailing',
    'wheel_installation': 'wheel installation torque check',
    'key_fob': 'luxury car key fob',
    'paint_inspection': 'paint inspection after service',
    'quick_detailer': 'quick detailer spray application',
    'interior_cleaning': 'luxury car interior cleaning',
    'digital_records': 'digital vehicle service records',
    'maintenance_schedule': 'vehicle maintenance schedule',
    'photo_documentation': 'vehicle condition photo documentation',
    'transport_scheduling': 'exotic car transport scheduling',
    'shipping_insurance': 'vehicle transport insurance',
    'pre_shipment_inspection': 'pre-shipment vehicle inspection',
    'transport_trailer': 'enclosed car transport interior',
    'gps_tracking': 'vehicle transport gps tracking',
    'weather_forecast': 'weather forecast transport planning',
    'delivery_inspection': 'vehicle delivery inspection',
    'delivery_package': 'vehicle delivery welcome package',
    'client_handoff': 'exotic car client delivery',
    'delivery_confirmation': 'vehicle delivery confirmation',
    'delivery_records': 'vehicle delivery documentation',
    'feedback_survey': 'customer satisfaction survey',
    'concierge_service': 'automotive concierge service'
  };

  // Toggle full telemetry view
  const toggleFullTelemetry = () => {
    setShowFullTelemetry(!showFullTelemetry);
  };

  // Handle checklist item toggle
  const toggleChecklistItem = (itemId) => {
    setTelemetryData(prevData => {
      const updatedChecklists = {...prevData.concierge};
      
      if (!updatedChecklists[selectedChecklist]) {
        updatedChecklists[selectedChecklist] = {
          items: [...conciergeChecklists[selectedChecklist].items]
        };
      }
      
      const updatedItems = updatedChecklists[selectedChecklist].items.map(item => 
        item.id === itemId ? {...item, completed: !item.completed} : item
      );
      
      updatedChecklists[selectedChecklist] = {
        ...updatedChecklists[selectedChecklist],
        items: updatedItems
      };
      
      return {
        ...prevData,
        concierge: updatedChecklists
      };
    });
  };

  // Check if checklist item is completed
  const isChecklistItemCompleted = (itemId) => {
    if (!telemetryData.concierge[selectedChecklist]) {
      return false;
    }
    
    const item = telemetryData.concierge[selectedChecklist].items?.find(item => item.id === itemId);
    return item?.completed || false;
  };

  // Calculate completion percentage for a checklist
  const calculateCompletionPercentage = (checklistKey) => {
    if (!telemetryData.concierge[checklistKey] || !telemetryData.concierge[checklistKey].items) {
      return 0;
    }
    
    const items = telemetryData.concierge[checklistKey].items;
    const completedItems = items.filter(item => item.completed).length;
    return Math.round((completedItems / items.length) * 100);
  };

  // Toggle expanded section
  const toggleExpandedSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  // Import our AdaptiveImage components
  const AdaptiveImage = React.lazy(() => import('./AdaptiveImage'));
  const { AdaptiveHeroImage, AdaptiveImageGrid } = React.lazy(() => import('./AdaptiveImage'));
  
  // Fallback component for lazy loading
  const ImageFallback = () => (
    <div className="bg-gray-800 animate-pulse w-full h-full flex items-center justify-center">
      <Loader className="h-6 w-6 text-blue-400 animate-spin" />
    </div>
  );
  

  
  // Get query string for a part image
  const getPartQuery = (partKey, vehicleInfo = '') => {
    const baseQuery = partSearchQueries[partKey] || partKey;
    return vehicleInfo ? `${vehicleInfo} ${baseQuery}` : baseQuery;
  };

  // Get query string for a vehicle image
  const getVehicleQuery = (index = 0) => {
    const searchTerm = vehicleSearchTerms[index] || vehicleSearchTerms[0];
    return vehicle ? 
      `${vehicle.year} ${vehicle.make} ${vehicle.model} ${searchTerm}` : 
      searchTerm;
  };

  // Load images using adaptive loading with preloading
  useEffect(() => {
    const loadImagesAdaptively = async () => {
      try {
        console.log('Initializing adaptive image loading for F1 Telemetry Dashboard...');
        
        // Build vehicle search queries
        const vehicleQueries = vehicleSearchTerms.map(term => {
          return vehicle ? 
            `${vehicle.year} ${vehicle.make} ${vehicle.model} ${term}` : 
            term;
        });
        
        // Preload high-priority vehicle images (first 4) immediately
        const highPriorityVehicleQueries = vehicleQueries.slice(0, 4);
        console.log(`Preloading ${highPriorityVehicleQueries.length} high-priority vehicle images...`);
        await preloadImages(highPriorityVehicleQueries, { priority: 'high' });
        
        // Preload high-priority part images based on current active tab
        let highPriorityPartKeys = [];
        if (activeTab === 'maintenance') {
          highPriorityPartKeys = ['brake_disc', 'brake_caliper', 'brake_pad', 'tire_tread', 'tire_sidewall', 'engine_oil', 'battery'];
        } else if (activeTab === 'gloss') {
          highPriorityPartKeys = ['car_paint', 'polish', 'ceramic_coating', 'paint_correction'];
        } else if (activeTab === 'concierge') {
          highPriorityPartKeys = telemetryData.concierge?.[selectedChecklist]?.items
            ?.slice(0, 5)
            ?.map(item => item.part) || [];
        } else { // Performance tab
          highPriorityPartKeys = ['engine_oil', 'tire_tread', 'brake_disc'];
        }
        
        // Preload high-priority part images
        const highPriorityPartQueries = highPriorityPartKeys.map(key => getPartQuery(key));
        if (highPriorityPartQueries.length > 0) {
          console.log(`Preloading ${highPriorityPartQueries.length} high-priority part images...`);
          await preloadImages(highPriorityPartQueries, { priority: 'high' });
        }
        
        // Preload remaining vehicle images with medium priority
        const mediumPriorityVehicleQueries = vehicleQueries.slice(4);
        if (mediumPriorityVehicleQueries.length > 0) {
          console.log(`Preloading ${mediumPriorityVehicleQueries.length} medium-priority vehicle images...`);
          preloadImages(mediumPriorityVehicleQueries, { priority: 'medium' });
        }
        
        // Prepare remaining part keys for low-priority preloading
        const remainingPartKeys = Object.keys(partSearchQueries).filter(key => !highPriorityPartKeys.includes(key));
        
        // Only preload the most relevant remaining parts (first 20) to avoid overwhelming the system
        const lowPriorityPartQueries = remainingPartKeys.slice(0, 20).map(key => getPartQuery(key));
        if (lowPriorityPartQueries.length > 0) {
          console.log(`Preloading ${lowPriorityPartQueries.length} low-priority part images...`);
          preloadImages(lowPriorityPartQueries, { priority: 'low' });
        }
        
        // Log stats after preloading
        console.log('Image loading statistics:', getImageStats());
        
        // Set loading state to false after high-priority images are loaded
        setLoading(false);
      } catch (error) {
        console.error('Error in adaptive image loading:', error);
        setLoading(false);
      }
    };
    
    loadImagesAdaptively();
  }, [vehicle, activeTab, selectedChecklist]);

  // Initialize concierge checklists data
  useEffect(() => {
    setTelemetryData(prevData => ({
      ...prevData,
      concierge: {
        preDrive: { items: [...conciergeChecklists.preDrive.items] },
        acquisition: { items: [...conciergeChecklists.acquisition.items] },
        service: { items: [...conciergeChecklists.service.items] },
        delivery: { items: [...conciergeChecklists.delivery.items] }
      }
    }));
  }, []);

  return (
    <div className="f1-telemetry bg-gray-900 rounded-lg border border-green-500/20 p-4">
      {/* Hero Vehicle Image Banner */}
      <div className="vehicle-hero-image mb-6 overflow-hidden rounded-lg border border-blue-500/30 relative">
        <img 
          src={getVehicleImageUrl(0)} 
          alt={vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "Featured Vehicle"} 
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6">
          <h2 className="text-white font-orbitron text-2xl">
            {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "Vehicle Telemetry"}
          </h2>
          <p className="text-gray-300">F1-Inspired Performance Analytics</p>
        </div>
        <div className="absolute top-4 right-4 bg-black/70 px-3 py-1 rounded-full flex items-center">
          <Clock className="h-4 w-4 text-green-500 mr-2" />
          <span className="text-white text-sm">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>
      
      {/* Control Panel */}
      <div className="control-panel bg-black rounded-lg p-4 mb-6 flex flex-wrap gap-3 items-center justify-between shadow-lg border border-blue-500/30">
        <div className="flex items-center gap-2">
          <Car className="h-6 w-6 text-green-500" />
          <h3 className="text-blue-400 font-orbitron">
            Paddock20 Telemetry Hub
          </h3>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleFullTelemetry}
            className="apex-button-sm flex items-center gap-1"
          >
            {showFullTelemetry ? <Maximize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            {showFullTelemetry ? 'Compact View' : 'Expanded View'}
          </button>
          
          <div className="bg-gray-800 px-3 py-1 rounded-full flex items-center gap-2">
            <Clock className="h-4 w-4 text-green-500" />
            <span className="text-white text-sm">LIVE</span>
          </div>
        </div>
      </div>
      
      {/* Tabs Navigation */}
      <div className="tabs-nav mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('performance')}
          className={`rounded-md flex items-center gap-2 px-4 py-2 ${
            activeTab === 'performance' ? 'bg-green-500 text-black font-bold' : 'bg-gray-800 text-white'
          } transition-all`}
        >
          <Zap className="h-4 w-4" />
          Performance
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`rounded-md flex items-center gap-2 px-4 py-2 ${
            activeTab === 'maintenance' ? 'bg-green-500 text-black font-bold' : 'bg-gray-800 text-white'
          } transition-all`}
        >
          <Wrench className="h-4 w-4" />
          Maintenance
        </button>
        <button
          onClick={() => setActiveTab('gloss')}
          className={`rounded-md flex items-center gap-2 px-4 py-2 ${
            activeTab === 'gloss' ? 'bg-green-500 text-black font-bold' : 'bg-gray-800 text-white'
          } transition-all`}
        >
          <Droplets className="h-4 w-4" />
          Gloss Metrics
        </button>
        <button
          onClick={() => setActiveTab('concierge')}
          className={`rounded-md flex items-center gap-2 px-4 py-2 ${
            activeTab === 'concierge' ? 'bg-green-500 text-black font-bold' : 'bg-gray-800 text-white'
          } transition-all`}
        >
          <Shield className="h-4 w-4" />
          Concierge Checklists
        </button>
      </div>
      
      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div>
          {/* Vehicle Performance Images */}
          <div className="performance-imagery grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800 rounded-lg overflow-hidden border border-blue-500/20">
              <img src={getVehicleImageUrl(1)} alt="Performance View" className="w-full h-48 object-cover" />
              <div className="p-3">
                <h4 className="text-blue-400 font-orbitron">Performance View</h4>
                <p className="text-gray-400 text-sm">Engine & Dynamics</p>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg overflow-hidden border border-blue-500/20">
              <img src={getVehicleImageUrl(2)} alt="Wheel & Tire Detail" className="w-full h-48 object-cover" />
              <div className="p-3">
                <h4 className="text-blue-400 font-orbitron">Wheel & Tire</h4>
                <p className="text-gray-400 text-sm">Grip & Handling</p>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg overflow-hidden border border-blue-500/20">
              <img src={getVehicleImageUrl(3)} alt="Engine Bay" className="w-full h-48 object-cover" />
              <div className="p-3">
                <h4 className="text-blue-400 font-orbitron">Engine Bay</h4>
                <p className="text-gray-400 text-sm">Power & Performance</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Acceleration Curve */}
            <div 
              className={`bg-gray-800 rounded-lg p-4 border border-blue-500/20 ${
                expandedSection === 'accelerationCurve' ? 'lg:col-span-2' : ''
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <h4 className="text-blue-400 font-orbitron">Acceleration Curve</h4>
                </div>
                <button 
                  onClick={() => toggleExpandedSection('accelerationCurve')}
                  className="text-white hover:text-green-500 transition-colors"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={telemetryData.performance.accelerationCurve}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="time" label={{ value: 'Time (seconds)', position: 'insideBottomRight', offset: -10, fill: '#aaa' }} stroke="#aaa" />
                    <YAxis label={{ value: 'Speed (mph)', angle: -90, position: 'insideLeft', fill: '#aaa' }} stroke="#aaa" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#222', border: '1px solid #555' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="speed" stroke="#22c55e" strokeWidth={2} dot={false} name="Actual" />
                    <Line type="monotone" dataKey="optimal" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Optimal" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Lateral G-Forces */}
            <div 
              className={`bg-gray-800 rounded-lg p-4 border border-blue-500/20 ${
                expandedSection === 'lateralG' ? 'lg:col-span-2' : ''
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <CornerUpRight className="h-5 w-5 text-green-500" />
                  <h4 className="text-blue-400 font-orbitron">Lateral G-Forces</h4>
                </div>
                <button 
                  onClick={() => toggleExpandedSection('lateralG')}
                  className="text-white hover:text-green-500 transition-colors"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={telemetryData.performance.lateralG}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="angle" label={{ value: 'Steering Angle (degrees)', position: 'insideBottomRight', offset: -10, fill: '#aaa' }} stroke="#aaa" />
                    <YAxis label={{ value: 'G-Force', angle: -90, position: 'insideLeft', fill: '#aaa' }} stroke="#aaa" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#222', border: '1px solid #555' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="actual" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="Actual" />
                    <Area type="monotone" dataKey="threshold" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} name="Threshold" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Power Curve */}
            <div 
              className={`bg-gray-800 rounded-lg p-4 border border-blue-500/20 ${
                expandedSection === 'powerCurve' ? 'lg:col-span-2' : ''
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  <h4 className="text-blue-400 font-orbitron">Power & Torque Curves</h4>
                </div>
                <button 
                  onClick={() => toggleExpandedSection('powerCurve')}
                  className="text-white hover:text-green-500 transition-colors"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={telemetryData.performance.powerCurve}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="rpm" label={{ value: 'RPM', position: 'insideBottomRight', offset: -10, fill: '#aaa' }} stroke="#aaa" />
                    <YAxis yAxisId="left" label={{ value: 'Power (hp)', angle: -90, position: 'insideLeft', fill: '#aaa' }} stroke="#aaa" />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Torque (lb-ft)', angle: 90, position: 'insideRight', fill: '#aaa' }} stroke="#aaa" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#222', border: '1px solid #555' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="power" stroke="#22c55e" strokeWidth={2} dot={false} name="Power" />
                    <Line yAxisId="right" type="monotone" dataKey="torque" stroke="#3b82f6" strokeWidth={2} dot={false} name="Torque" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Braking Performance */}
            <div 
              className={`bg-gray-800 rounded-lg p-4 border border-blue-500/20 ${
                expandedSection === 'braking' ? 'lg:col-span-2' : ''
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-green-500" />
                  <h4 className="text-blue-400 font-orbitron">Braking Performance</h4>
                </div>
                <button 
                  onClick={() => toggleExpandedSection('braking')}
                  className="text-white hover:text-green-500 transition-colors"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                <div className="bg-black rounded-lg overflow-hidden">
                  <img src={getPartImageUrl('brake_disc')} alt="Brake Disc" className="w-full h-40 object-cover" />
                  <div className="p-2">
                    <h5 className="text-green-400 text-sm">Brake Discs</h5>
                  </div>
                </div>
                <div className="bg-black rounded-lg overflow-hidden">
                  <img src={getPartImageUrl('brake_caliper')} alt="Brake Caliper" className="w-full h-40 object-cover" />
                  <div className="p-2">
                    <h5 className="text-green-400 text-sm">Brake Calipers</h5>
                  </div>
                </div>
                <div className="bg-black rounded-lg overflow-hidden">
                  <img src={getPartImageUrl('brake_pad')} alt="Brake Pads" className="w-full h-40 object-cover" />
                  <div className="p-2">
                    <h5 className="text-green-400 text-sm">Brake Pads</h5>
                  </div>
                </div>
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={telemetryData.performance.braking}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="pressure" label={{ value: 'Brake Pressure (%)', position: 'insideBottomRight', offset: -10, fill: '#aaa' }} stroke="#aaa" />
                    <YAxis label={{ value: 'Stopping Distance (ft)', angle: -90, position: 'insideLeft', fill: '#aaa' }} stroke="#aaa" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#222', border: '1px solid #555' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="distance" fill="#22c55e" name="Actual" />
                    <Bar dataKey="ideal" fill="#3b82f6" name="Ideal" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Maintenance Tab */}
      {activeTab === 'maintenance' && (
        <div>
          {/* Maintenance Hero Images */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            <div className="lg:col-span-2 bg-gray-800 rounded-lg overflow-hidden relative border border-blue-500/20">
              <img src={getVehicleImageUrl(4)} alt="Brake System" className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-3">
                <h4 className="text-blue-400 font-orbitron">Brake Systems</h4>
                <p className="text-gray-400 text-sm">High Performance Parts</p>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg overflow-hidden relative border border-blue-500/20">
              <img src={getVehicleImageUrl(5)} alt="Interior" className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-3">
                <h4 className="text-blue-400 font-orbitron">Interior</h4>
                <p className="text-gray-400 text-sm">Luxury Materials</p>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg overflow-hidden relative border border-blue-500/20">
              <img src={getVehicleImageUrl(6)} alt="Carbon Fiber" className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-3">
                <h4 className="text-blue-400 font-orbitron">Carbon Fiber</h4>
                <p className="text-gray-400 text-sm">Performance Components</p>
              </div>
            </div>
          </div>
        
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Brake Wear */}
            <div 
              className={`bg-gray-800 rounded-lg p-4 border border-blue-500/20 ${
                expandedSection === 'brakeWear' ? 'lg:col-span-2' : ''
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-green-500" />
                  <h4 className="text-blue-400 font-orbitron">Brake Pad Wear</h4>
                </div>
                <button 
                  onClick={() => toggleExpandedSection('brakeWear')}
                  className="text-white hover:text-green-500 transition-colors"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
                {telemetryData.maintenance.brakeWear.map((item, index) => (
                  <div key={index} className="bg-black rounded-lg overflow-hidden">
                    <img src={getPartImageUrl(item.part)} alt={item.name} className="w-full h-32 object-cover" />
                    <div className="p-2">
                      <div className="flex justify-between items-center mb-1">
                        <h5 className="text-white text-sm">{item.name}</h5>
                        <span className={`text-sm ${
                          item.value > 70 ? 'text-green-400' : 
                          item.value > 40 ? 'text-yellow-400' : 
                          'text-red-400'
                        }`}>{item.value}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            item.value > 70 ? 'bg-green-500' : 
                            item.value > 40 ? 'bg-yellow-500' : 
                            'bg-red-500'
                          }`}
                          style={{ width: `${item.value}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={telemetryData.maintenance.brakeWear}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis type="number" domain={[0, 100]} stroke="#aaa" />
                    <YAxis dataKey="name" type="category" stroke="#aaa" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#222', border: '1px solid #555' }}
                      labelStyle={{ color: '#fff' }}
                      formatter={(value) => [`${value}% Remaining`, 'Brake Pad']}
                    />
                    <Bar dataKey="value" fill="#22c55e" name="Remaining" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Tire Wear */}
            <div 
              className={`bg-gray-800 rounded-lg p-4 border border-blue-500/20 ${
                expandedSection === 'tireWear' ? 'lg:col-span-2' : ''
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-green-500" />
                  <h4 className="text-blue-400 font-orbitron">Tire Tread Life</h4>
                </div>
                <button 
                  onClick={() => toggleExpandedSection('tireWear')}
                  className="text-white hover:text-green-500 transition-colors"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
                {telemetryData.maintenance.tireWear.map((item, index) => (
                  <div key={index} className="bg-black rounded-lg overflow-hidden">
                    <img src={getPartImageUrl(item.part)} alt={item.name} className="w-full h-32 object-cover" />
                    <div className="p-2">
                      <div className="flex justify-between items-center mb-1">
                        <h5 className="text-white text-sm">{item.name}</h5>
                        <span className={`text-sm ${
                          item.value > 70 ? 'text-green-400' : 
                          item.value > 40 ? 'text-yellow-400' : 
                          'text-red-400'
                        }`}>{item.value}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            item.value > 70 ? 'bg-green-500' : 
                            item.value > 40 ? 'bg-yellow-500' : 
                            'bg-red-500'
                          }`}
                          style={{ width: `${item.value}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={telemetryData.maintenance.tireWear}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis type="number" domain={[0, 100]} stroke="#aaa" />
                    <YAxis dataKey="name" type="category" stroke="#aaa" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#222', border: '1px solid #555' }}
                      labelStyle={{ color: '#fff' }}
                      formatter={(value) => [`${value}% Remaining`, 'Tire Tread']}
                    />
                    <Bar dataKey="value" fill="#3b82f6" name="Remaining" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Fluid Levels */}
            <div 
              className={`bg-gray-800 rounded-lg p-4 border border-blue-500/20 ${
                expandedSection === 'fluids' ? 'lg:col-span-2' : ''
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-green-500" />
                  <h4 className="text-blue-400 font-orbitron">Fluid Levels</h4>
                </div>
                <button 
                  onClick={() => toggleExpandedSection('fluids')}
                  className="text-white hover:text-green-500 transition-colors"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                {telemetryData.maintenance.fluids.slice(0, 3).map((item, index) => (
                  <div key={index} className="bg-black rounded-lg overflow-hidden">
                    <img src={getPartImageUrl(item.part)} alt={item.name} className="w-full h-32 object-cover" />
                    <div className="p-2">
                      <div className="flex justify-between items-center mb-1">
                        <h5 className="text-white text-sm">{item.name}</h5>
                        <span className={`text-sm ${
                          item.value > 70 ? 'text-green-400' : 
                          item.value > 40 ? 'text-yellow-400' : 
                          'text-red-400'
                        }`}>{item.value}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            item.value > 70 ? 'bg-green-500' : 
                            item.value > 40 ? 'bg-yellow-500' : 
                            'bg-red-500'
                          }`}
                          style={{ width: `${item.value}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={telemetryData.maintenance.fluids}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="name" stroke="#aaa" />
                    <YAxis domain={[0, 100]} stroke="#aaa" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#222', border: '1px solid #555' }}
                      labelStyle={{ color: '#fff' }}
                      formatter={(value) => [`${value}%`, 'Level']}
                    />
                    <Bar dataKey="value" fill="#22c55e" name="Current Level" />
                    <Bar dataKey="optimal" fill="#3b82f6" name="Optimal Level" fillOpacity={0.4} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Battery Voltage */}
            <div 
              className={`bg-gray-800 rounded-lg p-4 border border-blue-500/20 ${
                expandedSection === 'battery' ? 'lg:col-span-2' : ''
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-green-500" />
                  <h4 className="text-blue-400 font-orbitron">Battery Voltage (24h)</h4>
                </div>
                <button 
                  onClick={() => toggleExpandedSection('battery')}
                  className="text-white hover:text-green-500 transition-colors"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="bg-black rounded-lg overflow-hidden mb-4">
                <img src={getPartImageUrl('battery')} alt="Battery" className="w-full h-40 object-cover" />
                <div className="p-2">
                  <h5 className="text-green-400 text-sm">Battery Status</h5>
                  <p className="text-gray-400 text-xs">Current: 12.6V | Min: 12.1V | Max: 12.9V</p>
                </div>
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={telemetryData.maintenance.battery}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="hour" label={{ value: 'Hour', position: 'insideBottomRight', offset: -10, fill: '#aaa' }} stroke="#aaa" />
                    <YAxis domain={[11.5, 13]} label={{ value: 'Voltage', angle: -90, position: 'insideLeft', fill: '#aaa' }} stroke="#aaa" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#222', border: '1px solid #555' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="voltage" stroke="#f59e0b" strokeWidth={2} name="Voltage" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Gloss Metrics Tab */}
      {activeTab === 'gloss' && (
        <div>
          {/* Gloss Hero Images */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            <div className="lg:col-span-2 bg-gray-800 rounded-lg overflow-hidden relative border border-blue-500/20">
              <img src={getVehicleImageUrl(7)} alt="Paint Finish" className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-3">
                <h4 className="text-blue-400 font-orbitron">Paint Finish</h4>
                <p className="text-gray-400 text-sm">Precision Detailing</p>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg overflow-hidden relative border border-blue-500/20">
              <img src={getPartImageUrl('ceramic_coating')} alt="Ceramic Coating" className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-3">
                <h4 className="text-blue-400 font-orbitron">Ceramic Coating</h4>
                <p className="text-gray-400 text-sm">Protection & Shine</p>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg overflow-hidden relative border border-blue-500/20">
              <img src={getPartImageUrl('paint_correction')} alt="Paint Correction" className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-3">
                <h4 className="text-blue-400 font-orbitron">Paint Correction</h4>
                <p className="text-gray-400 text-sm">Flawless Finish</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gloss Index */}
            <div 
              className={`bg-gray-800 rounded-lg p-4 border border-blue-500/20 ${
                expandedSection === 'glossIndex' ? 'lg:col-span-2' : ''
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-green-500" />
                  <h4 className="text-blue-400 font-orbitron">Gloss Index Over Time</h4>
                </div>
                <button 
                  onClick={() => toggleExpandedSection('glossIndex')}
                  className="text-white hover:text-green-500 transition-colors"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="bg-black rounded-lg overflow-hidden mb-4">
                <img src={getPartImageUrl('car_paint')} alt="Paint Finish" className="w-full h-40 object-cover" />
                <div className="p-2">
                  <h5 className="text-green-400 text-sm">Paint Gloss Monitoring</h5>
                  <p className="text-gray-400 text-xs">Current Gloss Index: 95/100</p>
                </div>
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={telemetryData.gloss.glossIndex}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="month" label={{ value: 'Months Ago', position: 'insideBottomRight', offset: -10, fill: '#aaa' }} stroke="#aaa" />
                    <YAxis domain={[60, 100]} label={{ value: 'Gloss Index', angle: -90, position: 'insideLeft', fill: '#aaa' }} stroke="#aaa" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#222', border: '1px solid #555' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="index" stroke="#22c55e" strokeWidth={2} name="Actual" />
                    <Line type="monotone" dataKey="baseline" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" name="Baseline" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Surface Contaminants */}
            <div 
              className={`bg-gray-800 rounded-lg p-4 border border-blue-500/20 ${
                expandedSection === 'contaminants' ? 'lg:col-span-2' : ''
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-green-500" />
                  <h4 className="text-blue-400 font-orbitron">Surface Contaminants</h4>
                </div>
                <button 
                  onClick={() => toggleExpandedSection('contaminants')}
                  className="text-white hover:text-green-500 transition-colors"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                {telemetryData.gloss.surfaceContaminants.slice(0, 3).map((item, index) => (
                  <div key={index} className="bg-black rounded-lg overflow-hidden">
                    <img src={getPartImageUrl(item.part)} alt={item.name} className="w-full h-32 object-cover" />
                    <div className="p-2">
                      <div className="flex justify-between items-center">
                        <h5 className="text-white text-sm">{item.name}</h5>
                        <span className="text-yellow-400 text-sm">{item.value} count</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={telemetryData.gloss.surfaceContaminants}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label
                    >
                      {telemetryData.gloss.surfaceContaminants.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#222', border: '1px solid #555' }}
                      labelStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Paint Thickness */}
            <div 
              className={`bg-gray-800 rounded-lg p-4 border border-blue-500/20 ${
                expandedSection === 'paintThickness' ? 'lg:col-span-2' : ''
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-green-500" />
                  <h4 className="text-blue-400 font-orbitron">Paint Thickness</h4>
                </div>
                <button 
                  onClick={() => toggleExpandedSection('paintThickness')}
                  className="text-white hover:text-green-500 transition-colors"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                {telemetryData.gloss.paintThickness.slice(0, 3).map((item, index) => (
                  <div key={index} className="bg-black rounded-lg overflow-hidden">
                    <img src={getPartImageUrl(item.part)} alt={item.panel} className="w-full h-32 object-cover" />
                    <div className="p-2">
                      <div className="flex justify-between items-center">
                        <h5 className="text-white text-sm">{item.panel}</h5>
                        <span className="text-green-400 text-sm">{item.current}μm</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={telemetryData.gloss.paintThickness}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis type="number" stroke="#aaa" domain={[95, 120]} />
                    <YAxis dataKey="panel" type="category" stroke="#aaa" width={100} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#222', border: '1px solid #555' }}
                      labelStyle={{ color: '#fff' }}
                      formatter={(value) => [`${value} μm`, 'Thickness']}
                    />
                    <Bar dataKey="current" fill="#22c55e" name="Current" />
                    <Bar dataKey="factory" fill="#3b82f6" name="Factory" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Gloss Radar */}
            <div 
              className={`bg-gray-800 rounded-lg p-4 border border-blue-500/20 ${
                expandedSection === 'glossRadar' ? 'lg:col-span-2' : ''
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-green-500" />
                  <h4 className="text-blue-400 font-orbitron">Gloss Attributes</h4>
                </div>
                <button 
                  onClick={() => toggleExpandedSection('glossRadar')}
                  className="text-white hover:text-green-500 transition-colors"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                {telemetryData.gloss.glossRadar.slice(0, 3).map((item, index) => (
                  <div key={index} className="bg-black rounded-lg overflow-hidden">
                    <img src={getPartImageUrl(item.part)} alt={item.subject} className="w-full h-32 object-cover" />
                    <div className="p-2">
                      <div className="flex justify-between items-center">
                        <h5 className="text-white text-sm">{item.subject}</h5>
                        <span className="text-green-400 text-sm">Before: {item.A} | After: {item.B}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={telemetryData.gloss.glossRadar}>
                    <PolarGrid stroke="#555" />
                    <PolarAngleAxis dataKey="subject" stroke="#aaa" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#aaa" />
                    <Radar name="Before Treatment" dataKey="A" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                    <Radar name="After Treatment" dataKey="B" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                    <Tooltip contentStyle={{ backgroundColor: '#222', border: '1px solid #555' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Concierge Checklists Tab */}
      {activeTab === 'concierge' && (
        <div className="concierge-checklists">
          {/* Concierge Hero Image */}
          <div className="bg-gray-800 rounded-lg overflow-hidden relative border border-blue-500/20 mb-6">
            <img src={getVehicleImageUrl(9)} alt="Concierge Services" className="w-full h-48 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-4">
              <h4 className="text-blue-400 font-orbitron text-xl">GoTime Motorsports™ + Tires & Timepieces™</h4>
              <p className="text-gray-300">Concours d'Elegance × F1 Pit Wall × GoTime OCD</p>
            </div>
          </div>
        
          {/* Checklist Type Selection */}
          <div className="checklist-selection mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedChecklist('preDrive')}
              className={`rounded-md flex items-center gap-2 px-4 py-2 ${
                selectedChecklist === 'preDrive' ? 'bg-green-500 text-black font-bold' : 'bg-gray-800 text-white'
              } transition-all`}
            >
              <Car className="h-4 w-4" />
              Pre-Drive
              <span className="ml-1 bg-gray-900 text-green-400 px-2 py-0.5 rounded-full text-xs">
                {calculateCompletionPercentage('preDrive')}%
              </span>
            </button>
            <button
              onClick={() => setSelectedChecklist('acquisition')}
              className={`rounded-md flex items-center gap-2 px-4 py-2 ${
                selectedChecklist === 'acquisition' ? 'bg-green-500 text-black font-bold' : 'bg-gray-800 text-white'
              } transition-all`}
            >
              <Shield className="h-4 w-4" />
              Acquisition
              <span className="ml-1 bg-gray-900 text-green-400 px-2 py-0.5 rounded-full text-xs">
                {calculateCompletionPercentage('acquisition')}%
              </span>
            </button>
            <button
              onClick={() => setSelectedChecklist('service')}
              className={`rounded-md flex items-center gap-2 px-4 py-2 ${
                selectedChecklist === 'service' ? 'bg-green-500 text-black font-bold' : 'bg-gray-800 text-white'
              } transition-all`}
            >
              <Tool className="h-4 w-4" />
              Service
              <span className="ml-1 bg-gray-900 text-green-400 px-2 py-0.5 rounded-full text-xs">
                {calculateCompletionPercentage('service')}%
              </span>
            </button>
            <button
              onClick={() => setSelectedChecklist('delivery')}
              className={`rounded-md flex items-center gap-2 px-4 py-2 ${
                selectedChecklist === 'delivery' ? 'bg-green-500 text-black font-bold' : 'bg-gray-800 text-white'
              } transition-all`}
            >
              <MapPin className="h-4 w-4" />
              Delivery
              <span className="ml-1 bg-gray-900 text-green-400 px-2 py-0.5 rounded-full text-xs">
                {calculateCompletionPercentage('delivery')}%
              </span>
            </button>
          </div>
          
          {/* Current Checklist */}
          <div className="bg-gray-800 rounded-lg p-4 border border-blue-500/20">
            <h4 className="text-blue-400 font-orbitron text-lg mb-2">
              {conciergeChecklists[selectedChecklist].title}
            </h4>
            <p className="text-gray-400 mb-4">
              {conciergeChecklists[selectedChecklist].description}
            </p>
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {conciergeChecklists[selectedChecklist].items.map((item) => (
                <div 
                  key={item.id}
                  className={`flex items-start p-3 rounded-lg border ${
                    isChecklistItemCompleted(item.id) 
                      ? 'bg-green-500/10 border-green-500' 
                      : 'bg-gray-900 border-gray-700'
                  }`}
                >
                  <div className="flex-shrink-0 mr-3">
                    <button
                      onClick={() => toggleChecklistItem(item.id)}
                      className={`h-6 w-6 rounded-md flex items-center justify-center ${
                        isChecklistItemCompleted(item.id) 
                          ? 'bg-green-500 text-black' 
                          : 'bg-gray-700 text-white'
                      }`}
                    >
                      {isChecklistItemCompleted(item.id) && <Check className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="flex-grow">
                    <span className={`text-sm ${
                      isChecklistItemCompleted(item.id) 
                        ? 'text-white' 
                        : 'text-gray-300'
                    }`}>
                      {item.text}
                    </span>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    <div className="h-12 w-12 rounded overflow-hidden">
                      <img 
                        src={getPartImageUrl(item.part)} 
                        alt={item.text}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default F1TelemetryDashboard;