# Ship Tracking Features

This application includes comprehensive ship tracking and monitoring capabilities integrated into the ship details page.

## Features

### 🚢 Ship Information

- Authentication credentials (email, passwords)
- Vessel details (name, type, flag, dimensions)
- Status tracking (active/inactive)
- Creation and modification history

### 📍 Real-time Location Tracking

- GPS coordinates (latitude/longitude)
- Speed and course information
- Current status (Underway, At anchor, Moored)
- Nearest port information
- Destination tracking
- MMSI and IMO numbers

### 📸 Ship Images

- Latest satellite/aerial imagery
- Image source attribution
- Timestamp information
- Fallback placeholder images

## API Integration

The application is designed to integrate with multiple ship tracking APIs:

### Supported APIs

1. **MarineTraffic API** - Primary vessel tracking
2. **VesselFinder API** - Ship images and details
3. **AIS Marine API** - Alternative tracking data
4. **ShipTracker API** - Additional vessel information

### Current Implementation

- **Demo Mode**: Currently uses mock data for demonstration
- **Consistent Data**: Mock data is generated consistently based on ship email
- **Realistic Values**: Speed, course, and coordinates use realistic ranges
- **Varied Scenarios**: Different ships show different statuses and locations

## Setting Up Real APIs

To enable real ship tracking:

1. **Get API Keys**:

   ```bash
   # Sign up for services:
   # - MarineTraffic: https://www.marinetraffic.com/en/ais-api-services
   # - VesselFinder: https://www.vesselfinder.com/api
   ```

2. **Configure Environment**:

   ```bash
   # Copy .env.example to .env.local
   cp .env.example .env.local

   # Add your API keys
   NEXT_PUBLIC_MARINE_TRAFFIC_API_KEY=your_key_here
   NEXT_PUBLIC_VESSEL_FINDER_API_KEY=your_key_here
   ```

3. **Update Service Implementation**:
   - Modify `src/lib/ship-tracking-service.ts`
   - Replace mock data methods with real API calls
   - Implement proper error handling and rate limiting

4. **Map Ship Identifiers**:
   - Create mapping from ship_email to MMSI/IMO numbers
   - Store vessel identifiers in database
   - Update ship creation form to include vessel numbers

## Database Schema Extensions

For production use, consider extending the ships table:

```sql
-- Add vessel identification columns
ALTER TABLE ships ADD COLUMN mmsi VARCHAR(9);
ALTER TABLE ships ADD COLUMN imo VARCHAR(7);
ALTER TABLE ships ADD COLUMN vessel_name VARCHAR(255);
ALTER TABLE ships ADD COLUMN vessel_type VARCHAR(100);
ALTER TABLE ships ADD COLUMN flag_country VARCHAR(100);

-- Add indexes for vessel lookups
CREATE INDEX idx_ships_mmsi ON ships(mmsi);
CREATE INDEX idx_ships_imo ON ships(imo);
```

## Performance Considerations

- **Caching**: Implement Redis cache for location data
- **Rate Limiting**: Respect API rate limits
- **Background Jobs**: Update locations periodically
- **Error Handling**: Graceful fallbacks for API failures

## Navigation Features

The ship details page includes:

- **Back navigation** to ships list
- **Edit functionality** (to be implemented)
- **Delete confirmation** with optimistic updates
- **Password visibility toggle** for security
- **Responsive design** for mobile/desktop

## Security Notes

- API keys are client-side (NEXT*PUBLIC*\*) for demo purposes
- In production, proxy API calls through backend services
- Never expose sensitive API keys in client code
- Implement proper authentication for ship data access
