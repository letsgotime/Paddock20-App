import express, { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { UserRoute, InsertUserRoute } from '@shared/schema';
import { z } from 'zod';

const router = express.Router();

// Type definitions for Express request with authenticated user
declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      email: string;
      [key: string]: any;
    }
  }
}

// Custom error handler middleware
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      console.error('Route error:', error);
      res.status(500).json({ 
        error: 'Server error', 
        message: error.message || 'An unexpected error occurred',
        code: 'INTERNAL_SERVER_ERROR'
      });
    });
  };
};

// Authentication middleware
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'You must be logged in to access this resource',
      code: 'AUTHENTICATION_REQUIRED'
    });
  }
  next();
};

// Route parameter validation middleware
const validateRouteId = (req: Request, res: Response, next: NextFunction) => {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ 
      error: 'Invalid route ID', 
      message: 'Route ID must be a positive integer',
      code: 'INVALID_ROUTE_ID'
    });
  }
  req.params.id = id.toString();
  next();
};

// Route ownership validation middleware
const validateRouteOwnership = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const routeId = parseInt(req.params.id);
    const route = await storage.getUserRoute(routeId);
    
    if (!route) {
      return res.status(404).json({ 
        error: 'Route not found', 
        message: 'The requested route does not exist',
        code: 'ROUTE_NOT_FOUND'
      });
    }
    
    if (route.userId !== req.user.id) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'You do not have permission to access this route',
        code: 'PERMISSION_DENIED'
      });
    }
    
    // Attach route to request for downstream handlers
    (req as any).route = route;
    next();
  } catch (error) {
    next(error);
  }
};

// API rate limiting - simple implementation
const apiRequests: Record<number, number[]> = {}; // userId -> timestamps
const RATE_LIMIT = 100; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute in milliseconds

const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) return next();
  
  const userId = req.user.id;
  const now = Date.now();
  
  // Initialize or clean up old requests
  if (!apiRequests[userId]) {
    apiRequests[userId] = [];
  } else {
    apiRequests[userId] = apiRequests[userId].filter(
      timestamp => now - timestamp < RATE_WINDOW
    );
  }
  
  // Check if rate limit exceeded
  if (apiRequests[userId].length >= RATE_LIMIT) {
    return res.status(429).json({ 
      error: 'Too Many Requests', 
      message: 'Rate limit exceeded. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      resetAt: apiRequests[userId][0] + RATE_WINDOW
    });
  }
  
  // Record this request
  apiRequests[userId].push(now);
  next();
};

// Apply rate limiting to all route handlers
router.use(rateLimiter);

// Get all routes for a user
router.get('/routes', isAuthenticated, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const routes = await storage.getUserRoutes(userId);
  
  // Parse notes data for each route
  const routesWithParsedData = routes.map(route => {
    let notesData: Record<string, any> = {};
    if (route.notes) {
      try {
        notesData = JSON.parse(route.notes);
      } catch (e) {
        console.error('Error parsing notes JSON for route', route.id, e);
      }
    }
    
    return {
      ...route,
      // Add parsed data fields for easier frontend consumption
      description: notesData.description || '',
      weatherRecommendations: notesData.weatherRecommendations || {},
      isPerformanceDrive: notesData.isPerformanceDrive || false,
      vehicleId: notesData.vehicleId || null
    };
  });
  
  return res.json(routesWithParsedData);
}));

// This middleware is already defined above

// Get a specific route
router.get('/routes/:id', validateRouteId, isAuthenticated, validateRouteOwnership, asyncHandler(async (req, res) => {
  const route = (req as any).route;
  
  // Parse notes data for easier frontend consumption
  let notesData: Record<string, any> = {};
  if (route.notes) {
    try {
      notesData = JSON.parse(route.notes);
    } catch (e) {
      console.error('Error parsing notes JSON for route', route.id, e);
    }
  }
  
  return res.json({
    ...route,
    description: notesData.description || '',
    weatherRecommendations: notesData.weatherRecommendations || {},
    isPerformanceDrive: notesData.isPerformanceDrive || false,
    vehicleId: notesData.vehicleId || null
  });
}));

// Zod schema for route creation validation
const CoordinateSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180)
});

const WaypointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  name: z.string().optional(),
  stopDuration: z.number().min(0).optional(),
  order: z.number().min(0).optional()
});

const RouteTypeEnum = z.enum(['leisure', 'commute', 'performance', 'scenic', 'adventure', 'custom']);

const createRouteSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  startLocation: CoordinateSchema.or(z.string()),
  endLocation: CoordinateSchema.or(z.string()),
  waypoints: z.array(WaypointSchema).optional(),
  type: RouteTypeEnum.optional().default('leisure'),
  distance: z.number().min(0).optional().default(0),
  estimatedTime: z.number().min(0).optional().default(0),
  favorite: z.boolean().optional().default(false),
  isPerformanceDrive: z.boolean().optional().default(false),
  weatherRecommendations: z.record(z.any()).optional().default({}),
  vehicleId: z.number().nullable().optional(),
  // Additional fields for future fun drive planner and drive journal features
  driveDifficulty: z.number().min(1).max(10).optional(),
  scenicRating: z.number().min(1).max(10).optional(),
  trafficConditions: z.enum(['light', 'moderate', 'heavy']).optional(),
  roadSurface: z.enum(['paved', 'gravel', 'mixed']).optional(),
  bestTimeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night', 'any']).optional(),
  seasonality: z.enum(['spring', 'summer', 'fall', 'winter', 'year-round']).optional(),
  tags: z.array(z.string()).optional()
});

// Create a new route
router.post('/routes', isAuthenticated, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  
  // Validate input with zod schema
  const result = createRouteSchema.safeParse(req.body);
  
  if (!result.success) {
    return res.status(400).json({ 
      error: 'Validation error', 
      message: 'The provided route data is invalid',
      details: result.error.format(),
      code: 'VALIDATION_ERROR'
    });
  }
  
  const validatedData = result.data;
  
  // Extract location data from startLocation and endLocation
  const startCoords = typeof validatedData.startLocation === 'object' 
    ? validatedData.startLocation 
    : { lat: 0, lon: 0 };
    
  const endCoords = typeof validatedData.endLocation === 'object' 
    ? validatedData.endLocation 
    : { lat: 0, lon: 0 };
  
  // Store extended data in notes field as JSON
  const notesData = {
    description: validatedData.description || '',
    weatherRecommendations: validatedData.weatherRecommendations || {},
    isPerformanceDrive: validatedData.isPerformanceDrive || false,
    vehicleId: validatedData.vehicleId || null,
    driveDifficulty: validatedData.driveDifficulty,
    scenicRating: validatedData.scenicRating,
    trafficConditions: validatedData.trafficConditions,
    roadSurface: validatedData.roadSurface,
    bestTimeOfDay: validatedData.bestTimeOfDay,
    seasonality: validatedData.seasonality,
    tags: validatedData.tags
  };
  
  // Create new route with proper typing according to schema
  const routeData: Partial<InsertUserRoute> = {
    userId,
    name: validatedData.name,
    type: validatedData.type,
    startLat: startCoords.lat,
    startLon: startCoords.lon,
    endLat: endCoords.lat,
    endLon: endCoords.lon,
    distance: validatedData.distance,
    estimatedDuration: validatedData.estimatedTime,
    waypoints: validatedData.waypoints ? JSON.stringify(validatedData.waypoints) : null,
    favorite: validatedData.favorite,
    notes: JSON.stringify(notesData)
  };
  
  const newRoute = await storage.createUserRoute(routeData as InsertUserRoute);
  
  return res.status(201).json({
    ...newRoute,
    // Add the parsed fields for frontend convenience
    description: notesData.description,
    weatherRecommendations: notesData.weatherRecommendations,
    isPerformanceDrive: notesData.isPerformanceDrive,
    vehicleId: notesData.vehicleId,
    // Include the future fields that were stored
    driveDifficulty: notesData.driveDifficulty,
    scenicRating: notesData.scenicRating,
    trafficConditions: notesData.trafficConditions,
    roadSurface: notesData.roadSurface,
    bestTimeOfDay: notesData.bestTimeOfDay,
    seasonality: notesData.seasonality,
    tags: notesData.tags
  });
}));

// Create a route update schema that includes future drive planner and journal features
const updateRouteSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  startLocation: CoordinateSchema.or(z.string()).optional(),
  endLocation: CoordinateSchema.or(z.string()).optional(),
  waypoints: z.array(WaypointSchema).optional(),
  type: RouteTypeEnum.optional(),
  distance: z.number().min(0).optional(),
  estimatedTime: z.number().min(0).optional(),
  favorite: z.boolean().optional(),
  isPerformanceDrive: z.boolean().optional(),
  weatherRecommendations: z.record(z.any()).optional(),
  vehicleId: z.number().nullable().optional(),
  // Additional fields for future fun drive planner and drive journal features
  driveDifficulty: z.number().min(1).max(10).optional(),
  scenicRating: z.number().min(1).max(10).optional(),
  trafficConditions: z.enum(['light', 'moderate', 'heavy']).optional(),
  roadSurface: z.enum(['paved', 'gravel', 'mixed']).optional(),
  bestTimeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night', 'any']).optional(),
  seasonality: z.enum(['spring', 'summer', 'fall', 'winter', 'year-round']).optional(),
  tags: z.array(z.string()).optional(),
  // Journal-specific fields 
  journalEntries: z.array(z.record(z.any())).optional(),
  photos: z.array(z.string()).optional(),
  rating: z.number().min(1).max(5).optional(),
  feedback: z.string().optional(),
  completedAt: z.string().optional() // ISO date string
});

// Update a route
router.put('/routes/:id', validateRouteId, isAuthenticated, validateRouteOwnership, asyncHandler(async (req, res) => {
  const route = (req as any).route;
  const routeId = parseInt(req.params.id);
  
  // Validate the input data
  const result = updateRouteSchema.safeParse(req.body);
  
  if (!result.success) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'The provided route data is invalid',
      details: result.error.format(),
      code: 'VALIDATION_ERROR'
    });
  }
  
  const validatedData = result.data;
  
  // Get current route notes data
  let notesData: Record<string, any> = {};
  
  // Parse existing notes if available
  if (route.notes) {
    try {
      notesData = JSON.parse(route.notes);
    } catch (e) {
      console.error('Error parsing notes JSON:', e);
    }
  }
  
  // Create standardUpdates object for database fields
  const standardUpdates: Partial<UserRoute> = {};
  
  // Handle location updates if provided
  if (validatedData.startLocation && typeof validatedData.startLocation === 'object') {
    standardUpdates.startLat = validatedData.startLocation.lat;
    standardUpdates.startLon = validatedData.startLocation.lon;
  }
  
  if (validatedData.endLocation && typeof validatedData.endLocation === 'object') {
    standardUpdates.endLat = validatedData.endLocation.lat;
    standardUpdates.endLon = validatedData.endLocation.lon;
  }
  
  // Add other standard fields
  if (validatedData.name) standardUpdates.name = validatedData.name;
  if (validatedData.type) standardUpdates.type = validatedData.type;
  if (validatedData.distance !== undefined) standardUpdates.distance = validatedData.distance;
  if (validatedData.estimatedTime !== undefined) standardUpdates.estimatedDuration = validatedData.estimatedTime;
  if (validatedData.favorite !== undefined) standardUpdates.favorite = validatedData.favorite;
  if (validatedData.waypoints) standardUpdates.waypoints = JSON.stringify(validatedData.waypoints);
  
  // Update all the extended fields stored in notes
  const updatedNotesData = {
    ...notesData,
    description: validatedData.description !== undefined ? validatedData.description : notesData.description || '',
    weatherRecommendations: validatedData.weatherRecommendations !== undefined ? validatedData.weatherRecommendations : notesData.weatherRecommendations || {},
    isPerformanceDrive: validatedData.isPerformanceDrive !== undefined ? validatedData.isPerformanceDrive : notesData.isPerformanceDrive || false,
    vehicleId: validatedData.vehicleId !== undefined ? validatedData.vehicleId : notesData.vehicleId || null,
    // Update future drive planner fields if provided
    driveDifficulty: validatedData.driveDifficulty !== undefined ? validatedData.driveDifficulty : notesData.driveDifficulty,
    scenicRating: validatedData.scenicRating !== undefined ? validatedData.scenicRating : notesData.scenicRating,
    trafficConditions: validatedData.trafficConditions !== undefined ? validatedData.trafficConditions : notesData.trafficConditions,
    roadSurface: validatedData.roadSurface !== undefined ? validatedData.roadSurface : notesData.roadSurface,
    bestTimeOfDay: validatedData.bestTimeOfDay !== undefined ? validatedData.bestTimeOfDay : notesData.bestTimeOfDay,
    seasonality: validatedData.seasonality !== undefined ? validatedData.seasonality : notesData.seasonality,
    tags: validatedData.tags !== undefined ? validatedData.tags : notesData.tags,
    // Update journal-specific fields if provided
    journalEntries: validatedData.journalEntries !== undefined ? validatedData.journalEntries : notesData.journalEntries,
    photos: validatedData.photos !== undefined ? validatedData.photos : notesData.photos,
    rating: validatedData.rating !== undefined ? validatedData.rating : notesData.rating,
    feedback: validatedData.feedback !== undefined ? validatedData.feedback : notesData.feedback,
    completedAt: validatedData.completedAt !== undefined ? validatedData.completedAt : notesData.completedAt
  };
  
  // Add the updated notes to the update object
  standardUpdates.notes = JSON.stringify(updatedNotesData);
  standardUpdates.updatedAt = new Date();
  
  // Make the update
  const updatedRoute = await storage.updateUserRoute(routeId, standardUpdates);
  
  // Return the updated route with parsed notes fields for easier frontend consumption
  return res.json({
    ...updatedRoute,
    // Include the parsed fields for frontend convenience
    description: updatedNotesData.description,
    weatherRecommendations: updatedNotesData.weatherRecommendations,
    isPerformanceDrive: updatedNotesData.isPerformanceDrive,
    vehicleId: updatedNotesData.vehicleId,
    // Include the future fields
    driveDifficulty: updatedNotesData.driveDifficulty,
    scenicRating: updatedNotesData.scenicRating,
    trafficConditions: updatedNotesData.trafficConditions,
    roadSurface: updatedNotesData.roadSurface,
    bestTimeOfDay: updatedNotesData.bestTimeOfDay,
    seasonality: updatedNotesData.seasonality,
    tags: updatedNotesData.tags,
    // Include journal fields
    journalEntries: updatedNotesData.journalEntries,
    photos: updatedNotesData.photos,
    rating: updatedNotesData.rating,
    feedback: updatedNotesData.feedback,
    completedAt: updatedNotesData.completedAt
  });
}));

// Validation schema for favorite toggle
const favoriteToggleSchema = z.object({
  favorite: z.boolean({
    required_error: "The favorite field is required",
    invalid_type_error: "The favorite field must be a boolean"
  })
});

// Mark a route as favorite/unfavorite
router.put('/routes/:id/favorite', 
  validateRouteId, 
  isAuthenticated, 
  validateRouteOwnership, 
  asyncHandler(async (req, res) => {
    const route = (req as any).route;
    const routeId = parseInt(req.params.id);
    
    // Validate favorite value
    const result = favoriteToggleSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid request body',
        details: result.error.format(),
        code: 'VALIDATION_ERROR'
      });
    }
    
    const { favorite } = result.data;
    
    try {
      // Update favorite status
      const updatedRoute = await storage.updateRouteFavorite(routeId, favorite);
      
      // Get notes data to include with response
      let notesData: Record<string, any> = {};
      if (updatedRoute.notes) {
        try {
          notesData = JSON.parse(updatedRoute.notes);
        } catch (e) {
          console.error('Error parsing notes JSON for route', routeId, e);
        }
      }
      
      // Return the updated route with parsed notes fields for easier frontend consumption
      return res.json({
        ...updatedRoute,
        // Include the parsed fields for frontend convenience
        description: notesData.description || '',
        weatherRecommendations: notesData.weatherRecommendations || {},
        isPerformanceDrive: notesData.isPerformanceDrive || false,
        vehicleId: notesData.vehicleId || null,
        // Include the future fields
        driveDifficulty: notesData.driveDifficulty,
        scenicRating: notesData.scenicRating,
        trafficConditions: notesData.trafficConditions,
        roadSurface: notesData.roadSurface,
        bestTimeOfDay: notesData.bestTimeOfDay,
        seasonality: notesData.seasonality,
        tags: notesData.tags
      });
    } catch (e) {
      console.error('Error updating route favorite status:', e);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to update route favorite status',
        code: 'DB_ERROR'
      });
    }
  })
);

// Delete a route
router.delete('/routes/:id', 
  validateRouteId, 
  isAuthenticated, 
  validateRouteOwnership, 
  asyncHandler(async (req, res) => {
    const routeId = parseInt(req.params.id);
    
    try {
      // Check if route has associated journal entries or is part of a collection
      // In a future implementation, this would check for relationships
      // const hasJournalEntries = await storage.hasJournalEntries(routeId);
      // const isInCollection = await storage.isRouteInCollection(routeId);
      
      // If this is going to be used in the drive journal, we might want to 
      // implement a soft delete option in the future instead of hard delete
      
      // Delete the route
      await storage.deleteUserRoute(routeId);
      
      // Return success with no content
      return res.status(204).end();
    } catch (e) {
      console.error('Failed to delete route:', e);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to delete route due to a database error',
        code: 'DB_ERROR'
      });
    }
  })
);

// Get route weather recommendations
router.get('/routes/:id/weather', 
  validateRouteId, 
  isAuthenticated, 
  validateRouteOwnership, 
  asyncHandler(async (req, res) => {
    const route = (req as any).route;
    
    try {
      // Parse notes data from the route
      let weatherData: Record<string, any> = {};
      if (route.notes) {
        try {
          weatherData = JSON.parse(route.notes);
        } catch (e) {
          console.error('Error parsing route notes JSON:', e);
          return res.status(500).json({
            error: 'Data parsing error',
            message: 'Could not parse route data',
            code: 'PARSE_ERROR'
          });
        }
      }
      
      // Return weather recommendations and additional fields for Drive Planner integration
      return res.json({
        weatherRecommendations: weatherData.weatherRecommendations || {},
        isPerformanceDrive: weatherData.isPerformanceDrive || false,
        vehicleId: weatherData.vehicleId || null,
        description: weatherData.description || '',
        // Include additional data for fun drive planner integration
        driveDifficulty: weatherData.driveDifficulty,
        scenicRating: weatherData.scenicRating,
        trafficConditions: weatherData.trafficConditions,
        roadSurface: weatherData.roadSurface,
        bestTimeOfDay: weatherData.bestTimeOfDay,
        seasonality: weatherData.seasonality,
        tags: weatherData.tags || []
      });
    } catch (e) {
      console.error('Error fetching route weather recommendations:', e);
      return res.status(500).json({ 
        error: 'Server error',
        message: 'Failed to fetch route weather recommendations',
        code: 'SERVER_ERROR'
      });
    }
  })
);

// Get all favorite routes for user
router.get('/routes/favorites', isAuthenticated, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const routes = await storage.getUserRoutes(userId);
  
  // Filter to only include favorite routes
  const favoriteRoutes = routes
    .filter(route => route.favorite)
    .map(route => {
      // Parse notes data for each route for frontend convenience
      let notesData: Record<string, any> = {};
      if (route.notes) {
        try {
          notesData = JSON.parse(route.notes);
        } catch (e) {
          console.error('Error parsing notes JSON for route', route.id, e);
        }
      }
      
      return {
        ...route,
        // Add parsed data fields for easier frontend consumption
        description: notesData.description || '',
        weatherRecommendations: notesData.weatherRecommendations || {},
        isPerformanceDrive: notesData.isPerformanceDrive || false,
        vehicleId: notesData.vehicleId || null,
        // Include future fields
        driveDifficulty: notesData.driveDifficulty,
        scenicRating: notesData.scenicRating,
        trafficConditions: notesData.trafficConditions,
        roadSurface: notesData.roadSurface,
        bestTimeOfDay: notesData.bestTimeOfDay,
        seasonality: notesData.seasonality,
        tags: notesData.tags
      };
    });
  
  return res.json(favoriteRoutes);
}));

// Schema for weather recommendations
const weatherRecommendationsSchema = z.object({
  weatherRecommendations: z.object({
    // Temperature preferences
    minTemp: z.number().optional(),
    maxTemp: z.number().optional(),
    optimalTemp: z.number().optional(),
    
    // Wind preferences
    maxWindSpeed: z.number().optional(),
    optimalWindSpeed: z.number().optional(),
    
    // Precipitation preferences
    maxPrecipitation: z.number().optional(),
    prefersSunny: z.boolean().optional(),
    prefersOvercast: z.boolean().optional(),
    
    // Road condition preferences
    minRoadTemp: z.number().optional(),
    optimalRoadTemp: z.number().optional(),
    acceptableHumidity: z.number().optional(),
    
    // Performance driving specific preferences
    optimalGrip: z.boolean().optional(),
    performanceTempWindow: z.object({
      min: z.number(),
      max: z.number()
    }).optional(),
    
    // Scenic factors
    scenicValue: z.number().min(1).max(10).optional(),
    visibilityPreference: z.number().optional(),
    
    // Time preferences
    dayTimeOnly: z.boolean().optional(),
    duskDawnPreferred: z.boolean().optional(),
    
    // Custom notes
    weatherNotes: z.string().optional(),
    
    // Additional performance data added for the future drive planner integration
    tirePressureAdjustment: z.record(z.string(), z.number()).optional(),
    tireTempRanges: z.object({
      optimal: z.object({
        min: z.number(),
        max: z.number()
      }),
      acceptable: z.object({
        min: z.number(),
        max: z.number()
      })
    }).optional(),
    suspensionSettings: z.record(z.string(), z.any()).optional(),
    drivingMode: z.enum(['comfort', 'sport', 'track', 'eco', 'adaptive']).optional(),
  }).strict(),
  
  // Optional vehicle context for these recommendations
  vehicleId: z.number().optional(),
  
  // Whether these settings should become the default for future routes
  saveAsDefault: z.boolean().optional()
});

// Update weather recommendations for a route
router.put('/routes/:id/weather-recommendations', 
  validateRouteId, 
  isAuthenticated, 
  validateRouteOwnership, 
  asyncHandler(async (req, res) => {
    const route = (req as any).route;
    const routeId = parseInt(req.params.id);
    
    // Validate the input data
    const result = weatherRecommendationsSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'The provided weather recommendations are invalid',
        details: result.error.format(),
        code: 'VALIDATION_ERROR'
      });
    }
    
    const { weatherRecommendations, vehicleId, saveAsDefault } = result.data;
    
    // Get current route to access existing notes
    let notesData: Record<string, any> = {};
    
    // Parse existing notes if available
    if (route.notes) {
      try {
        notesData = JSON.parse(route.notes);
      } catch (e) {
        console.error('Error parsing notes JSON:', e);
      }
    }
    
    // Update weather recommendations and vehicle ID if provided
    const updatedNotesData = {
      ...notesData,
      weatherRecommendations,
      vehicleId: vehicleId !== undefined ? vehicleId : notesData.vehicleId
    };
    
    // Update the route with new notes
    const updates = {
      notes: JSON.stringify(updatedNotesData),
      updatedAt: new Date()
    };
    
    const updatedRoute = await storage.updateUserRoute(routeId, updates);
    
    // If user wants to save these as default settings for their account
    if (saveAsDefault) {
      try {
        // Get user data to update preferences
        const user = await storage.getUser(req.user!.id);
        
        if (user) {
          // Update user preferences (assumes user schema has defaultWeatherPrefs field)
          // This is a placeholder - you'd implement this based on your user schema
          console.log(`Saving default weather preferences for user ${user.id}`);
          // Implement storage.updateUserPreferences or similar
        }
      } catch (e) {
        console.error('Failed to save default weather preferences:', e);
        // Don't fail the entire request if this part fails
      }
    }
    
    return res.json({ 
      success: true,
      weatherRecommendations,
      vehicleId: updatedNotesData.vehicleId,
      route: updatedRoute 
    });
  })
);

// Schema for query parameters for weather-optimized routes
const weatherOptimizedQuerySchema = z.object({
  weatherData: z.string().optional(),
  vehicleId: z.string().regex(/^\d+$/).transform(val => parseInt(val)).optional(),
  routeType: RouteTypeEnum.optional(),
  driveDifficulty: z.string().regex(/^\d+$/).transform(val => parseInt(val)).optional(),
  roadSurface: z.enum(['paved', 'gravel', 'mixed']).optional(),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night', 'any']).optional(),
  season: z.enum(['spring', 'summer', 'fall', 'winter', 'year-round']).optional(),
  minScenicRating: z.string().regex(/^\d+$/).transform(val => parseInt(val)).optional(),
  maxDistance: z.string().regex(/^\d+$/).transform(val => parseInt(val)).optional(),
  maxDuration: z.string().regex(/^\d+$/).transform(val => parseInt(val)).optional(),
  includeExploratory: z.enum(['true', 'false']).transform(val => val === 'true').optional()
});

// Get routes optimized for current weather conditions
router.get('/routes/weather-optimized', isAuthenticated, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  
  // Validate and parse query parameters
  const validatedQuery = weatherOptimizedQuerySchema.safeParse(req.query);
  
  if (!validatedQuery.success) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Invalid query parameters',
      details: validatedQuery.error.format(),
      code: 'VALIDATION_ERROR'
    });
  }
  
  const {
    weatherData,
    vehicleId,
    routeType,
    driveDifficulty,
    roadSurface,
    timeOfDay,
    season,
    minScenicRating,
    maxDistance,
    maxDuration,
    includeExploratory
  } = validatedQuery.data;
  
  // Get all user routes
  const routes = await storage.getUserRoutes(userId);
  
  // Transform routes to include parsed notes data
  const routesWithData = routes.map(route => {
    let notesData: Record<string, any> = {};
    if (route.notes) {
      try {
        notesData = JSON.parse(route.notes);
      } catch (e) {
        console.error('Error parsing notes JSON for route', route.id, e);
      }
    }
    
    // Create a complete route object with all possible fields
    return {
      ...route,
      // Add parsed data fields for easier frontend consumption
      description: notesData.description || '',
      weatherRecommendations: notesData.weatherRecommendations || {},
      isPerformanceDrive: notesData.isPerformanceDrive || false,
      vehicleId: notesData.vehicleId || null,
      // Include future fields for fun drive planner integration
      driveDifficulty: notesData.driveDifficulty,
      scenicRating: notesData.scenicRating,
      trafficConditions: notesData.trafficConditions,
      roadSurface: notesData.roadSurface,
      bestTimeOfDay: notesData.bestTimeOfDay,
      seasonality: notesData.seasonality,
      tags: notesData.tags,
      journalEntries: notesData.journalEntries || [],
      exploratory: notesData.exploratory || false
    };
  });
  
  // Apply filters based on query parameters
  let filteredRoutes = routesWithData;
  
  // Vehicle filter
  if (vehicleId) {
    filteredRoutes = filteredRoutes.filter(route => route.vehicleId === vehicleId);
  }
  
  // Route type filter
  if (routeType) {
    filteredRoutes = filteredRoutes.filter(route => route.type === routeType);
  }
  
  // Drive difficulty filter
  if (driveDifficulty) {
    filteredRoutes = filteredRoutes.filter(route => 
      route.driveDifficulty && route.driveDifficulty <= driveDifficulty);
  }
  
  // Road surface filter
  if (roadSurface) {
    filteredRoutes = filteredRoutes.filter(route => 
      !route.roadSurface || route.roadSurface === roadSurface);
  }
  
  // Time of day filter
  if (timeOfDay) {
    filteredRoutes = filteredRoutes.filter(route => 
      !route.bestTimeOfDay || route.bestTimeOfDay === timeOfDay || route.bestTimeOfDay === 'any');
  }
  
  // Season filter
  if (season) {
    filteredRoutes = filteredRoutes.filter(route => 
      !route.seasonality || route.seasonality === season || route.seasonality === 'year-round');
  }
  
  // Scenic rating filter
  if (minScenicRating) {
    filteredRoutes = filteredRoutes.filter(route => 
      route.scenicRating && route.scenicRating >= minScenicRating);
  }
  
  // Distance filter
  if (maxDistance) {
    filteredRoutes = filteredRoutes.filter(route => 
      route.distance <= maxDistance);
  }
  
  // Duration filter
  if (maxDuration) {
    filteredRoutes = filteredRoutes.filter(route => 
      route.estimatedDuration <= maxDuration);
  }
  
  // Exploratory routes filter
  if (includeExploratory !== undefined) {
    if (includeExploratory) {
      // Include exploratory routes (no filter)
    } else {
      // Exclude exploratory routes
      filteredRoutes = filteredRoutes.filter(route => !route.exploratory);
    }
  }
  
  // Sort routes by weather compatibility if weather data provided
  if (weatherData) {
    try {
      const parsedWeatherData = JSON.parse(weatherData);
      
      // Advanced weather-based sorting algorithm
      filteredRoutes.sort((a, b) => {
        // Extract weather recommendations
        const aRecs = a.weatherRecommendations || {};
        const bRecs = b.weatherRecommendations || {};
        
        // Calculate weather compatibility scores
        let aScore = calculateWeatherCompatibilityScore(aRecs, parsedWeatherData);
        let bScore = calculateWeatherCompatibilityScore(bRecs, parsedWeatherData);
        
        // Bonus points for routes matching current time of day
        if (timeOfDay && a.bestTimeOfDay === timeOfDay) aScore += 5;
        if (timeOfDay && b.bestTimeOfDay === timeOfDay) bScore += 5;
        
        // Bonus points for routes matching current season
        if (season && a.seasonality === season) aScore += 5;
        if (season && b.seasonality === season) bScore += 5;
        
        // For performance drives, prioritize routes with proper surface conditions
        if (parsedWeatherData.isRaining && a.isPerformanceDrive) aScore -= 10;
        if (parsedWeatherData.isRaining && b.isPerformanceDrive) bScore -= 10;
        
        return bScore - aScore; // Higher score first
      });
    } catch (e) {
      console.error('Error parsing weather data:', e);
    }
  }
  
  return res.json(filteredRoutes);
}));

// Helper function to calculate weather compatibility score
function calculateWeatherCompatibilityScore(
  routeWeatherRecs: Record<string, any>, 
  currentWeather: Record<string, any>
): number {
  let score = 0;
  
  // Basic matching (can be expanded with more sophisticated logic)
  if (routeWeatherRecs.minTemp && currentWeather.temp >= routeWeatherRecs.minTemp) score += 2;
  if (routeWeatherRecs.maxTemp && currentWeather.temp <= routeWeatherRecs.maxTemp) score += 2;
  if (routeWeatherRecs.maxWindSpeed && currentWeather.windSpeed <= routeWeatherRecs.maxWindSpeed) score += 2;
  if (routeWeatherRecs.maxPrecipitation && currentWeather.precipitation <= routeWeatherRecs.maxPrecipitation) score += 3;
  if (routeWeatherRecs.prefersSunny && !currentWeather.isRaining) score += 5;
  if (routeWeatherRecs.prefersOvercast && currentWeather.clouds > 70) score += 3;
  
  // Performance driving specific factors
  if (routeWeatherRecs.optimalGrip) {
    if (!currentWeather.isRaining && currentWeather.roadTemp > 15) score += 5;
  }
  
  // Scenic routes get a bonus in good visibility conditions
  if (routeWeatherRecs.scenicValue && routeWeatherRecs.scenicValue > 7) {
    if (currentWeather.visibility > 8000) score += 4;
  }
  
  return score;
}

// Export default for ES modules
// Schema for fun drive planner recommendations
const funDrivePlannerQuerySchema = z.object({
  vehicleId: z.string().regex(/^\d+$/).transform(val => parseInt(val)).optional(),
  drivingPreference: z.enum(['relaxed', 'balanced', 'spirited']).optional().default('balanced'),
  maxDistance: z.string().regex(/^\d+$/).transform(val => parseInt(val)).optional(),
  maxDuration: z.string().regex(/^\d+$/).transform(val => parseInt(val)).optional(),
  roadType: z.enum(['any', 'paved', 'scenic', 'technical', 'highway']).optional().default('any'),
  returnToStart: z.enum(['true', 'false']).transform(val => val === 'true').optional().default(false),
  minimumGripLevel: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  avoidTraffic: z.enum(['true', 'false']).transform(val => val === 'true').optional().default(true),
  avoidPrecipitation: z.enum(['true', 'false']).transform(val => val === 'true').optional().default(false),
  includeUnexplored: z.enum(['true', 'false']).transform(val => val === 'true').optional().default(true),
});

// Get tire performance data based on weather conditions
router.get('/vehicles/:id/tire-performance', 
  isAuthenticated, 
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const vehicleId = parseInt(req.params.id);
    
    // Validate vehicle ID
    if (isNaN(vehicleId) || vehicleId <= 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Vehicle ID must be a positive integer',
        code: 'INVALID_VEHICLE_ID'
      });
    }
    
    try {
      // Get vehicle
      const vehicle = await storage.getVehicle(vehicleId);
      
      if (!vehicle || vehicle.userId !== userId) {
        return res.status(404).json({
          error: 'Vehicle not found',
          message: 'The specified vehicle could not be found or does not belong to the user',
          code: 'VEHICLE_NOT_FOUND'
        });
      }
      
      // Get tire data
      const tire = await storage.getTireByVehicleId(vehicleId);
      
      if (!tire) {
        return res.status(404).json({
          error: 'Tire data not found',
          message: 'No tire data available for this vehicle',
          code: 'TIRE_DATA_NOT_FOUND'
        });
      }
      
      // Get weather data from query params (to be replaced with actual Weather API integration)
      const { surfaceTemp, airTemp, rainfall, humidity } = req.query;
      
      // Calculate tire performance metrics based on weather and tire data
      const tirePressureAdjustment = calculateTirePressure(
        parseFloat(surfaceTemp as string) || 70, 
        parseFloat(rainfall as string) || 0,
        tire
      );
      
      const optimalTireTemp = calculateOptimalTireTemp(
        parseFloat(airTemp as string) || 68, 
        tire
      );
      
      const gripLevelEstimate = calculateGripLevel(
        parseFloat(surfaceTemp as string) || 70,
        parseFloat(rainfall as string) || 0,
        parseFloat(humidity as string) || 50,
        tire
      );
      
      // Calculate warm-up time based on temperatures
      const warmupTimeMinutes = calculateWarmupTime(
        parseFloat(airTemp as string) || 68,
        parseFloat(surfaceTemp as string) || 70,
        tire
      );
      
      // Return comprehensive tire performance data with Ferrari-style telemetry format
      return res.json({
        vehicle: {
          id: vehicle.id,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year
        },
        tire: {
          id: tire.id,
          brand: tire.brand,
          model: tire.model,
          type: tire.type,
          currentPressure: tire.currentPressure
        },
        performance: {
          currentGripLevel: gripLevelEstimate.gripLevel,
          gripPercentage: gripLevelEstimate.percentage,
          optimalTirePressure: {
            front: tirePressureAdjustment.front,
            rear: tirePressureAdjustment.rear
          },
          optimalTireTemp: {
            min: optimalTireTemp.min,
            max: optimalTireTemp.max,
            ideal: optimalTireTemp.ideal
          },
          warmupTimeMinutes,
          tireDegradationFactor: calculateDegradation(
            parseFloat(surfaceTemp as string) || 70,
            tire
          )
        },
        recommendations: {
          drivingStyle: recommendDrivingStyle(gripLevelEstimate.percentage),
          throttleApplication: recommendThrottleApplication(gripLevelEstimate.percentage),
          brakingDistance: recommendBrakingDistance(gripLevelEstimate.percentage)
        },
        telemetry: {
          timestamp: new Date().toISOString(),
          surfaceTemperature: parseFloat(surfaceTemp as string) || 70,
          airTemperature: parseFloat(airTemp as string) || 68,
          rainfall: parseFloat(rainfall as string) || 0,
          humidity: parseFloat(humidity as string) || 50
        }
      });
    } catch (e) {
      console.error('Error fetching tire performance data:', e);
      return res.status(500).json({
        error: 'Server error',
        message: 'Failed to calculate tire performance metrics',
        code: 'SERVER_ERROR'
      });
    }
  })
);

// Helper functions for tire performance calculations
function calculateTirePressure(surfaceTemp: number, rainfall: number, tire: any): { front: number, rear: number } {
  // Base pressures (should be stored with tire data in a real implementation)
  const baseFrontPressure = tire.currentPressure || 32; // PSI
  const baseRearPressure = (tire.currentPressure || 32) + 1; // Typically slightly higher in rear
  
  // Temperature adjustment factor (simplified)
  const tempAdjustment = (surfaceTemp - 70) * 0.05; // 0.05 PSI per degree F difference from 70F
  
  // Rain adjustment (increase pressure slightly in wet conditions for better contact)
  const rainAdjustment = rainfall > 0 ? 0.5 : 0;
  
  return {
    front: parseFloat((baseFrontPressure + tempAdjustment + rainAdjustment).toFixed(1)),
    rear: parseFloat((baseRearPressure + tempAdjustment + rainAdjustment).toFixed(1))
  };
}

function calculateOptimalTireTemp(airTemp: number, tire: any): { min: number, ideal: number, max: number } {
  // Different tire compounds have different optimal temperature ranges
  // This is a simplified model - in reality, this would depend on the specific tire compound
  const tireType = tire.type || 'all_season';
  
  let baseIdealTemp: number;
  let range: number;
  
  switch (tireType.toLowerCase()) {
    case 'summer':
    case 'performance':
      baseIdealTemp = 180; // F
      range = 40;
      break;
    case 'racing':
    case 'track':
      baseIdealTemp = 210;
      range = 30;
      break;
    case 'winter':
    case 'snow':
      baseIdealTemp = 120;
      range = 50;
      break;
    case 'all_season':
    default:
      baseIdealTemp = 150;
      range = 45;
      break;
  }
  
  // Adjust based on air temperature (simplified)
  const adjustedIdeal = baseIdealTemp + (airTemp - 70) * 0.5;
  
  return {
    min: Math.round(adjustedIdeal - range/2),
    ideal: Math.round(adjustedIdeal),
    max: Math.round(adjustedIdeal + range/2)
  };
}

function calculateGripLevel(surfaceTemp: number, rainfall: number, humidity: number, tire: any): 
  { gripLevel: 'low' | 'medium' | 'high', percentage: number } {
  // Base grip level - depends on tire type and temperature
  const tireType = tire.type || 'all_season';
  let baseGrip: number;
  
  switch (tireType.toLowerCase()) {
    case 'summer':
    case 'performance':
      baseGrip = 85;
      break;
    case 'racing':
    case 'track':
      baseGrip = 95;
      break;
    case 'winter':
    case 'snow':
      baseGrip = surfaceTemp < 45 ? 80 : 60; // Better in cold
      break;
    case 'all_season':
    default:
      baseGrip = 75;
      break;
  }
  
  // Temperature adjustment
  let tempAdjustment = 0;
  const optimalTemp = calculateOptimalTireTemp(surfaceTemp, tire);
  
  if (surfaceTemp < optimalTemp.min) {
    tempAdjustment = -10 * (1 - surfaceTemp/optimalTemp.min);
  } else if (surfaceTemp > optimalTemp.max) {
    tempAdjustment = -15 * (surfaceTemp/optimalTemp.max - 1);
  } else {
    // In optimal range - extra grip bonus the closer to ideal temp
    const distFromIdeal = Math.abs(surfaceTemp - optimalTemp.ideal);
    const rangeSize = (optimalTemp.max - optimalTemp.min) / 2;
    tempAdjustment = 5 * (1 - distFromIdeal/rangeSize);
  }
  
  // Rain and humidity adjustments
  const rainAdjustment = rainfall > 0 ? -30 * Math.min(rainfall, 1) : 0;
  const humidityAdjustment = -0.1 * Math.max(0, humidity - 50);
  
  // Calculate final grip percentage
  let gripPercentage = baseGrip + tempAdjustment + rainAdjustment + humidityAdjustment;
  gripPercentage = Math.max(0, Math.min(100, gripPercentage));
  
  // Determine grip level category
  let gripLevel: 'low' | 'medium' | 'high';
  if (gripPercentage >= 75) {
    gripLevel = 'high';
  } else if (gripPercentage >= 40) {
    gripLevel = 'medium';
  } else {
    gripLevel = 'low';
  }
  
  return { 
    gripLevel, 
    percentage: Math.round(gripPercentage) 
  };
}

function calculateWarmupTime(airTemp: number, surfaceTemp: number, tire: any): number {
  // Base warmup time in minutes - depends on tire type
  const tireType = tire.type || 'all_season';
  let baseWarmupTime: number;
  
  switch (tireType.toLowerCase()) {
    case 'racing':
    case 'track':
      baseWarmupTime = 2; // Racing tires warm up quickly
      break;
    case 'summer':
    case 'performance':
      baseWarmupTime = 4;
      break;
    case 'winter':
    case 'snow':
      baseWarmupTime = 8; // Take longer to reach optimal performance
      break;
    case 'all_season':
    default:
      baseWarmupTime = 6;
      break;
  }
  
  // Temperature adjustments
  // Colder temps mean longer warmup times
  const tempFactor = Math.max(0.5, Math.min(2, 70 / Math.max(50, airTemp)));
  
  // Surface temp affects warmup - warmer surface helps tires warm faster
  const surfaceFactor = Math.max(0.5, Math.min(1.5, 70 / Math.max(50, surfaceTemp)));
  
  // Calculate adjusted warmup time
  return Math.round(baseWarmupTime * tempFactor * surfaceFactor);
}

function calculateDegradation(surfaceTemp: number, tire: any): number {
  // Higher surface temps generally cause faster degradation
  const tempFactor = Math.pow(surfaceTemp / 70, 1.5);
  
  // Base degradation factor depends on tire type (1.0 is normal rate)
  const tireType = tire.type || 'all_season';
  let baseDegradation: number;
  
  switch (tireType.toLowerCase()) {
    case 'racing':
    case 'track':
      baseDegradation = 2.0; // Racing tires degrade faster
      break;
    case 'summer':
    case 'performance':
      baseDegradation = 1.2;
      break;
    case 'winter':
    case 'snow':
      baseDegradation = surfaceTemp > 50 ? 2.5 : 0.8; // Degrade very fast in warm weather
      break;
    case 'all_season':
    default:
      baseDegradation = 1.0;
      break;
  }
  
  return parseFloat((baseDegradation * tempFactor).toFixed(2));
}

function recommendDrivingStyle(gripPercentage: number): string {
  if (gripPercentage >= 85) {
    return "Aggressive - Conditions support performance driving";
  } else if (gripPercentage >= 70) {
    return "Spirited - Good grip allows confident cornering";
  } else if (gripPercentage >= 50) {
    return "Balanced - Moderate inputs recommended";
  } else if (gripPercentage >= 30) {
    return "Conservative - Smooth inputs advised";
  } else {
    return "Cautious - Slippery conditions detected";
  }
}

function recommendThrottleApplication(gripPercentage: number): string {
  if (gripPercentage >= 85) {
    return "Full throttle application possible on exits";
  } else if (gripPercentage >= 70) {
    return "Progressive throttle application recommended";
  } else if (gripPercentage >= 50) {
    return "Gentle throttle application, especially mid-corner";
  } else if (gripPercentage >= 30) {
    return "Very gradual throttle application recommended";
  } else {
    return "Extremely gentle throttle inputs required";
  }
}

function recommendBrakingDistance(gripPercentage: number): string {
  const normalBraking = 100; // Reference distance in percent
  const adjustedBraking = normalBraking * (100 / gripPercentage);
  
  // Round to the nearest 5%
  const roundedAdjustment = Math.round(adjustedBraking / 5) * 5;
  
  if (roundedAdjustment <= 100) {
    return "Normal braking distances";
  } else if (roundedAdjustment <= 120) {
    return "Increase braking distance by 20%";
  } else if (roundedAdjustment <= 150) {
    return "Increase braking distance by 50%";
  } else if (roundedAdjustment <= 200) {
    return "Double normal braking distances";
  } else {
    return "Triple or more normal braking distances";
  }
}

// Get fun drive planner recommendations based on weather and vehicle
router.get('/drive-planner/recommend', isAuthenticated, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  
  // Validate and parse query parameters
  const validatedQuery = funDrivePlannerQuerySchema.safeParse(req.query);
  
  if (!validatedQuery.success) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Invalid query parameters',
      details: validatedQuery.error.format(),
      code: 'VALIDATION_ERROR'
    });
  }
  
  const {
    vehicleId,
    drivingPreference,
    maxDistance,
    maxDuration,
    roadType,
    returnToStart,
    minimumGripLevel,
    avoidTraffic,
    avoidPrecipitation,
    includeUnexplored
  } = validatedQuery.data;
  
  try {
    // Get user vehicle if specified
    let vehicle = null;
    if (vehicleId) {
      vehicle = await storage.getVehicle(vehicleId);
      if (!vehicle || vehicle.userId !== userId) {
        return res.status(404).json({
          error: 'Vehicle not found',
          message: 'The specified vehicle could not be found or does not belong to the user',
          code: 'VEHICLE_NOT_FOUND'
        });
      }
    }
    
    // Get all user routes
    const routes = await storage.getUserRoutes(userId);
    
    // Compile weather data - in a real implementation, fetch from weather service
    // This would connect to the existing Weather Paddock data
    const currentWeather = {
      temperature: 68, // F
      conditions: 'clear',
      precipitation: 0,
      humidity: 45,
      windSpeed: 5,
      roadTemperature: 72,
      visibility: 10,
      gripLevel: 'high',
      uvIndex: 3,
      timestamp: new Date().toISOString()
    };
    
    // Transform routes to include parsed notes data
    const routesWithData = routes.map(route => {
      let notesData: Record<string, any> = {};
      if (route.notes) {
        try {
          notesData = JSON.parse(route.notes);
        } catch (e) {
          console.error('Error parsing notes JSON for route', route.id, e);
        }
      }
      
      // Create a complete route object with all possible fields
      return {
        ...route,
        // Add parsed data fields for easier frontend consumption
        description: notesData.description || '',
        weatherRecommendations: notesData.weatherRecommendations || {},
        isPerformanceDrive: notesData.isPerformanceDrive || false,
        vehicleId: notesData.vehicleId || null,
        // Include future fields for fun drive planner integration
        driveDifficulty: notesData.driveDifficulty,
        scenicRating: notesData.scenicRating,
        trafficConditions: notesData.trafficConditions,
        roadSurface: notesData.roadSurface,
        bestTimeOfDay: notesData.bestTimeOfDay,
        seasonality: notesData.seasonality,
        tags: notesData.tags || [],
        exploratory: notesData.exploratory || false
      };
    });
    
    // Apply filters based on query parameters
    let filteredRoutes = routesWithData;
    
    // Filter by vehicle
    if (vehicleId) {
      filteredRoutes = filteredRoutes.filter(route => 
        !route.vehicleId || route.vehicleId === vehicleId
      );
    }
    
    // Filter by route type based on driving preference
    if (drivingPreference === 'spirited') {
      filteredRoutes = filteredRoutes.filter(route => 
        route.type === 'performance' || route.isPerformanceDrive || route.type === 'adventure'
      );
    } else if (drivingPreference === 'relaxed') {
      filteredRoutes = filteredRoutes.filter(route => 
        route.type === 'scenic' || route.type === 'leisure'
      );
    }
    
    // Filter by maximum distance
    if (maxDistance) {
      filteredRoutes = filteredRoutes.filter(route => 
        route.distance <= maxDistance
      );
    }
    
    // Filter by maximum duration
    if (maxDuration) {
      filteredRoutes = filteredRoutes.filter(route => 
        route.estimatedDuration <= maxDuration
      );
    }
    
    // Filter by road type
    if (roadType !== 'any') {
      filteredRoutes = filteredRoutes.filter(route => {
        if (roadType === 'scenic' && route.scenicRating && route.scenicRating >= 7) return true;
        if (roadType === 'technical' && route.driveDifficulty && route.driveDifficulty >= 7) return true;
        if (roadType === 'paved' && route.roadSurface === 'paved') return true;
        if (roadType === 'highway' && route.type === 'commute') return true;
        return false;
      });
    }
    
    // Only include unexplored routes if requested
    if (includeUnexplored) {
      // Consider a route unexplored if it hasn't been marked as completed
      const exploratoryRoutes = routesWithData.filter(route => {
        const notesData = route.notes ? JSON.parse(route.notes) : {};
        return !notesData.completedAt;
      });
      
      // Add some exploratory routes to the filtered set
      filteredRoutes = [...filteredRoutes, ...exploratoryRoutes.slice(0, 3)];
    }
    
    // Score each route based on current weather conditions
    const scoredRoutes = filteredRoutes.map(route => {
      let weatherScore = scoreRouteForCurrentWeather(route, currentWeather, {
        minimumGripLevel,
        avoidTraffic,
        avoidPrecipitation
      });
      
      return {
        ...route,
        weatherScore,
        currentConditions: {
          ...currentWeather,
          matchScore: weatherScore
        }
      };
    });
    
    // Sort routes by weather score
    scoredRoutes.sort((a, b) => b.weatherScore - a.weatherScore);
    
    // Return top recommendations
    return res.json({
      recommendations: scoredRoutes.slice(0, 5),
      currentWeather,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    console.error('Error fetching fun drive recommendations:', e);
    return res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch fun drive recommendations',
      code: 'SERVER_ERROR'
    });
  }
}));

// Function to score a route based on current weather conditions
function scoreRouteForCurrentWeather(
  route: any, 
  weather: any, 
  preferences: {
    minimumGripLevel: string;
    avoidTraffic: boolean;
    avoidPrecipitation: boolean;
  }
): number {
  // Start with a base score
  let score = 50;
  
  // Get weather recommendations from route
  const recommendations = route.weatherRecommendations || {};
  
  // Check temperature preferences
  if (recommendations.optimalTemp) {
    const tempDiff = Math.abs(weather.temperature - recommendations.optimalTemp);
    if (tempDiff < 5) score += 10;
    else if (tempDiff < 10) score += 5;
    else if (tempDiff > 20) score -= 5;
  }
  
  // Check precipitation
  if (weather.precipitation > 0 && preferences.avoidPrecipitation) {
    score -= 15;
  }
  
  // Check grip level
  if (preferences.minimumGripLevel === 'high' && weather.gripLevel !== 'high') {
    score -= 20;
  } else if (preferences.minimumGripLevel === 'medium' && weather.gripLevel === 'low') {
    score -= 10;
  }
  
  // Check traffic conditions
  if (preferences.avoidTraffic && route.trafficConditions === 'heavy') {
    score -= 15;
  }
  
  // Check visibility
  if (weather.visibility < 5) {
    score -= 10;
  }
  
  // Add bonus for scenic routes on clear days
  if (weather.conditions === 'clear' && route.scenicRating && route.scenicRating > 7) {
    score += 10;
  }
  
  // Add bonus for spirited driving in ideal conditions
  if (weather.gripLevel === 'high' && route.isPerformanceDrive) {
    score += 15;
  }
  
  // Time of day bonus
  const currentHour = new Date().getHours();
  if (route.bestTimeOfDay === 'morning' && currentHour >= 6 && currentHour <= 10) {
    score += 10;
  } else if (route.bestTimeOfDay === 'afternoon' && currentHour >= 14 && currentHour <= 17) {
    score += 10;
  } else if (route.bestTimeOfDay === 'evening' && currentHour >= 17 && currentHour <= 20) {
    score += 10;
  } else if (route.bestTimeOfDay === 'night' && (currentHour >= 20 || currentHour <= 5)) {
    score += 10;
  }
  
  // Cap the score at 100
  return Math.min(100, Math.max(0, score));
}

export default router;