# VesselFinder Web Scraping Implementation Guide

## Overview

This guide explains how to implement actual web scraping for VesselFinder.com to extract real ship data instead of using paid APIs.

## Current Implementation

The current implementation provides a foundation with:

1. **Mock Data Service** (`/src/lib/vessel-scraper-service.ts`)
   - Generates realistic ship data for demonstration
   - Uses ship email/name to create consistent mock results
   - Includes location, images, and vessel details

2. **API Route** (`/src/app/api/scrape-vessel/route.ts`)
   - Server-side endpoint to handle scraping requests
   - Currently returns mock data to avoid CORS issues
   - Ready to be enhanced with actual scraping logic

3. **Updated Ship Tracking Service** (`/src/lib/ship-tracking-service.ts`)
   - Integrates with the scraping API
   - Fallback to mock data when scraping fails
   - Maintains same interface for easy integration

## Production Implementation Steps

### 1. Install Required Dependencies

```bash
npm install puppeteer @types/puppeteer cheerio @types/cheerio
```

### 2. Update API Route with Real Scraping

Replace the mock implementation in `/src/app/api/scrape-vessel/route.ts`:

```typescript
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

async function scrapeVesselByMMSI(mmsi: string): Promise<VesselData[]> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    const url = `https://www.vesselfinder.com/vessels/${mmsi}`;
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for vessel data to load
    await page.waitForSelector('.vessel-info', { timeout: 10000 });
    
    const data = await page.evaluate(() => {
      // Extract vessel information from the page
      const name = document.querySelector('.vessel-name')?.textContent?.trim();
      const type = document.querySelector('.vessel-type')?.textContent?.trim();
      const flag = document.querySelector('.flag-country')?.textContent?.trim();
      
      // Extract location data
      const latElement = document.querySelector('[data-latitude]');
      const lngElement = document.querySelector('[data-longitude]');
      const latitude = latElement ? parseFloat(latElement.getAttribute('data-latitude') || '0') : 0;
      const longitude = lngElement ? parseFloat(lngElement.getAttribute('data-longitude') || '0') : 0;
      
      // Extract other details
      const speed = document.querySelector('.speed-value')?.textContent?.trim();
      const course = document.querySelector('.course-value')?.textContent?.trim();
      const status = document.querySelector('.vessel-status')?.textContent?.trim();
      
      return {
        name,
        mmsi: mmsi,
        type,
        flag,
        location: {
          latitude,
          longitude,
          speed: speed ? parseFloat(speed) : 0,
          course: course ? parseFloat(course) : 0,
          status: status || 'Unknown'
        }
      };
    });
    
    return [data];
  } finally {
    await browser.close();
  }
}
```

### 3. Handle Search Functionality

```typescript
async function scrapeVesselSearch(query: string): Promise<VesselData[]> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    const searchUrl = `https://www.vesselfinder.com/vessels?name=${encodeURIComponent(query)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });
    
    // Wait for search results
    await page.waitForSelector('.search-results', { timeout: 10000 });
    
    const results = await page.evaluate(() => {
      const vessels = [];
      const resultElements = document.querySelectorAll('.vessel-search-result');
      
      resultElements.forEach(element => {
        const name = element.querySelector('.vessel-name')?.textContent?.trim();
        const mmsi = element.querySelector('.mmsi')?.textContent?.trim();
        const type = element.querySelector('.vessel-type')?.textContent?.trim();
        
        if (name && mmsi) {
          vessels.push({ name, mmsi, type });
        }
      });
      
      return vessels;
    });
    
    return results;
  } finally {
    await browser.close();
  }
}
```

### 4. Error Handling and Rate Limiting

```typescript
// Add rate limiting to avoid being blocked
const rateLimiter = new Map();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const requests = rateLimiter.get(ip) || [];
  
  // Remove old requests (older than 1 minute)
  const recentRequests = requests.filter((time: number) => now - time < 60000);
  
  // Allow max 10 requests per minute
  if (recentRequests.length >= 10) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimiter.set(ip, recentRequests);
  return true;
}
```

### 5. Alternative: Cheerio for HTML Parsing

If you prefer server-side HTML parsing without a full browser:

```typescript
import * as cheerio from 'cheerio';

async function scrapeWithCheerio(url: string) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  
  const html = await response.text();
  const $ = cheerio.load(html);
  
  const vesselData = {
    name: $('.vessel-name').text().trim(),
    mmsi: $('.mmsi-number').text().trim(),
    type: $('.vessel-type').text().trim(),
    // ... extract more data
  };
  
  return vesselData;
}
```

## Important Considerations

### Legal and Ethical
- Check VesselFinder's robots.txt and terms of service
- Implement respectful scraping (delays between requests)
- Consider contacting VesselFinder for API access

### Technical
- Handle anti-bot measures (CAPTCHAs, rate limiting)
- Use rotating user agents and proxies if needed
- Implement caching to reduce requests
- Add proper error handling and retries

### Deployment
- Puppeteer requires additional setup in production (Docker, serverless)
- Consider memory usage and performance implications
- Monitor for changes in VesselFinder's HTML structure

## Testing the Implementation

1. **Test API Route**: Use the test page at `/dashboard/ships/test`
2. **Search Examples**:
   - Ship names: "MAERSK", "COSCO", "MSC"
   - Specific ships: "hyemerald" (returns "HY EMERALD"), "anderson" (returns "MV ANDERSON STAR")
   - MMSI numbers: "123456789"
   - Captain emails: "captain.anderson@oceanfreight.com"

## Current Fallback Behavior

The system is designed to gracefully fall back to mock data when:
- Scraping fails
- Network issues occur
- Rate limits are hit
- VesselFinder is unavailable

This ensures the ship tracking interface remains functional during development and testing.
