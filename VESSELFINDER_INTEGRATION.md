# VesselFinder Scraping Integration

This document describes the VesselFinder.com scraping functionality that has been implemented in the admin dashboard.

## Overview

The system can now scrape vessel data directly from VesselFinder.com URLs to extract real-time ship information, including:

- Vessel name, MMSI, IMO, type, flag
- Current location (latitude/longitude)
- Speed, course, navigation status
- Port information and destination
- Vessel images
- Dimensions and specifications

## Implementation

### 1. HTML Parsing (`/api/scrape-vessel-detail`)

The scraping service parses the HTML structure you provided:

```html
<h1 class="title">HY EMERALD</h1>
<h2 class="vst">Bunkering Tanker, IMO 9676307</h2>
```

Key data extraction points:

- **Vessel Name**: From `<h1 class="title">` element
- **Type & IMO**: From `<h2 class="vst">` subtitle
- **MMSI**: From voyage data table `IMO / MMSI` row
- **Location Data**: From embedded JSON in `<div id="djson">`
- **Course/Speed**: From `Course / Speed` table row
- **Destination**: From voyage data section
- **Images**: From `<img class="main-photo">` elements

### 2. Database Integration

Ships now have an optional `vesselfinder_url` field:

```sql
ALTER TABLE ships ADD COLUMN vesselfinder_url TEXT;
```

### 3. Updated Ship Service

The ship tracking service now prioritizes VesselFinder URLs when available:

```typescript
// Updated calls
const locationData = await shipTrackingService.getShipLocation(
  shipData.ship_email,
  shipData.vesselfinder_url, // NEW: Uses VF URL if available
);
```

### 4. Enhanced Ship Forms

The add/edit ship forms now include:

- VesselFinder URL field (optional)
- Bulk import supports 4th column for VF URLs
- Enhanced preview showing URL data

## API Endpoints

### `/api/scrape-vessel-detail` (POST)

Scrapes individual VesselFinder vessel pages.

**Request:**

```json
{
  "url": "https://www.vesselfinder.com/vessels/details/9676307"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "name": "HY EMERALD",
    "mmsi": "566982000",
    "imo": "9676307",
    "type": "Bunkering Tanker",
    "flag": "Singapore",
    "location": {
      "latitude": 1.2966,
      "longitude": 103.7764,
      "speed": 0.2,
      "course": 270.2,
      "status": "Under way",
      "destination": "Singapore Anch. 4, Singapore"
    }
  }
}
```

### `/api/test-scraping` (GET/POST)

Test endpoint for verifying scraping functionality.

## Testing

Visit `/dashboard/ships/test` to test the scraping functionality:

1. **Search Test**: Test general vessel search (uses mock data)
2. **URL Test**: Test direct VesselFinder URL scraping (real scraping)

Example URLs to test:

- `https://www.vesselfinder.com/vessels/details/9676307` (HY EMERALD)
- Any VesselFinder vessel detail page

## Usage in Ship Details Page

The ship details page (`/dashboard/ships/[id]`) now:

1. Checks if the ship has a `vesselfinder_url`
2. If yes, uses that URL for enhanced data
3. If no, falls back to mock data generation
4. Displays real-time vessel tracking data

## Benefits

1. **Real Data**: Gets actual vessel positions and status
2. **Enhanced Accuracy**: Direct from VesselFinder's tracking system
3. **Rich Details**: More comprehensive vessel information
4. **Images**: Access to vessel photos when available
5. **Real-time Updates**: Current position and status data

## Fallback Strategy

The system gracefully handles failures:

1. If VesselFinder URL is unavailable → falls back to mock data
2. If scraping fails → returns realistic mock data
3. If network issues → uses cached/generated data
4. All errors are logged but don't break the UI

## Configuration

To use real scraping in production:

1. Ensure the server can access external URLs
2. Consider rate limiting to avoid being blocked
3. Add error handling for network timeouts
4. Monitor scraping success rates

## Future Enhancements

Potential improvements:

- Add Puppeteer for JavaScript-heavy pages
- Implement caching to reduce API calls
- Add background jobs for data updates
- Support multiple vessel tracking websites
- Add data validation and sanitization
