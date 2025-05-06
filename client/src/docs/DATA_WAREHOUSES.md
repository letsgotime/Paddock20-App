# PADDOCK20 Data Warehouses (Sources of Truth)

```
                                  +--------------------+
                                  |                    |
                          +-------+ USER PROFILE       +-------+
                          |       | CONTEXT            |       |
                          |       |                    |       |
                          |       +--------------------+       |
                          |                                    |
                          v                                    v
         +----------------+---+                      +---------+----------+
         |                    |                      |                    |
         | VEHICLE CONTEXT    +--------------------->+ MANIFESTATION      |
         |                    |                      | STATION CONTEXT    |
         +--+----------+------+                      |                    |
            |          |                             +------+------+------+
            |          |                                    |      |
            v          v                                    |      |
+----------+-+      +--+------------+                       |      |
|            |      |               |                       |      |
| GALLERY    |      | GARAGE VAULT  |                       |      |
| CONTEXT    |      | CONTEXT       |                       |      |
|            |      |               |                       |      |
+-----+------+      +-------+-------+                       |      |
      |                     |                               |      |
      |                     |                               |      |
      v                     v                               |      |
+-----+---------------------+------+                        |      |
|                                  |                        |      |
| LOCATION SERVICES CONTEXT        +<-----------------------+      |
|                                  |                               |
+--------+--------------------+----+                               |
         |                    |                                    |
         v                    v                                    |
+--------+-------+   +--------+--------+                           |
|                |   |                 |                           |
| JUICE BOX      |   | SPOTIFY         |<--------------------------+
| CONTEXT        |   | CONTEXT         |
|                |   |                 |
+----------------+   +-----------------+
```

## Core Data Warehouses (Sources of Truth)

### 1. LocationServicesContext
- **Central For**: Weather, time, maps, parking, road conditions
- **Powers**: Weather Page, Drive Planning, Route Optimization
- **Key APIs**: OpenWeather, AccuWeather, Google Maps, Waze, TimeZoneDB
- **Status**: Currently being enhanced with comprehensive integration

### 2. VehicleContext/VehicleDataContext
- **Central For**: Vehicle data, performance metrics, service records
- **Powers**: Garage Vault, Vehicle Performance Pages
- **Key APIs**: VIN Decoder, OBD-II Integration, Manufacturer APIs
- **Status**: Partially implemented, needs expansion

### 3. UserProfileContext
- **Central For**: User identity, preferences, authentication
- **Powers**: All personalized features, settings
- **Key APIs**: Supabase Auth, Firebase Auth, Auth0
- **Status**: Partially implemented, needs further data point mapping

### 4. GalleryContext
- **Central For**: Media management, vehicle photos, comparison images
- **Powers**: Before/After views, Vehicle History, Media Sharing
- **Key APIs**: Supabase Storage, Unsplash, Cloudinary
- **Status**: Basic implementation complete, needs enhancement

### 5. SpotifyContext
- **Central For**: Music integration, driving playlists
- **Powers**: Audio Experience, Mood-based Music
- **Key APIs**: Spotify Web API
- **Status**: Basic integration complete

### 6. ManifestationStationContext
- **Central For**: Goals tracking, progress visualization
- **Powers**: Manifestation Station pages, Goal Widgets
- **Key APIs**: Internal data structure (future integrations planned)
- **Status**: Protected implementation, further enhancements planned

### 7. GarageVaultContext
- **Central For**: Comprehensive vehicle collection management
- **Powers**: Maintenance tracking, service history
- **Key APIs**: RepairPal, Parts Databases
- **Status**: Planning stage

### 8. JuiceBoxContext
- **Central For**: Detailing products, recommendations
- **Powers**: Detailing Calendar, Product Management
- **Key APIs**: Product databases, Weather for recommendations
- **Status**: Planning stage

## Data Flow Principles

1. **Single Source of Truth**: Each data type has one authoritative source
2. **Unidirectional Data Flow**: Changes propagate in defined directions
3. **Context Communication**: Contexts can subscribe to changes in other contexts
4. **Caching Strategy**: All contexts implement primary and secondary caching
5. **Efficient API Usage**: Consolidated API calls with proper throttling
6. **Fallback Mechanisms**: Graceful degradation when network or APIs fail

## Next Steps

1. Complete LocationServicesContext with all planned integrations
2. Build new Weather Page using the enhanced context
3. Move to enhancing ManifestationStationContext
4. Continue with remaining contexts in priority order