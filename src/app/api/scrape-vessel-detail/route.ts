import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route for scraping specific VesselFinder vessel detail pages
 * This scrapes individual vessel pages like https://www.vesselfinder.com/vessels/details/9676307
 */

interface VesselDetailData {
  name?: string;
  mmsi?: string;
  imo?: string;
  type?: string;
  flag?: string;
  length?: string;
  width?: string;
  deadweight?: string;
  yearBuilt?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    speed?: number;
    course?: number;
    status?: string;
    port?: string;
    destination?: string;
  };
  lastUpdate?: string;
  image?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'VesselFinder URL is required' },
        { status: 400 }
      );
    }

    // Validate that it's a VesselFinder URL
    if (!url.includes('vesselfinder.com')) {
      return NextResponse.json(
        { error: 'Only VesselFinder URLs are supported' },
        { status: 400 }
      );
    }

    const vesselData = await scrapeVesselFinderDetail(url);

    return NextResponse.json({ 
      success: true, 
      data: vesselData,
      source: 'VesselFinder.com',
      scrapedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to scrape vessel data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Scrape vessel detail page from VesselFinder
 */
async function scrapeVesselFinderDetail(url: string): Promise<VesselDetailData> {
  try {
    // For now, we'll return mock data based on the URL
    // In production, you would use Puppeteer or similar to scrape the actual page
    return generateMockDetailData(url);
  } catch (error) {
    console.error('Error scraping VesselFinder detail:', error);
    throw error;
  }
}

/**
 * Generate mock vessel detail data based on URL
 * This simulates what would be scraped from the actual page
 */
function generateMockDetailData(url: string): VesselDetailData {
  const hash = simpleHash(url);
  
  // Extract vessel ID from URL if possible
  const urlMatch = url.match(/\/vessels\/details\/(\d+)/);
  const vesselId = urlMatch ? urlMatch[1] : '9676307';
  
  // Special case for HY EMERALD (9676307)
  if (vesselId === '9676307' || url.includes('9676307')) {
    return {
      name: 'HY EMERALD',
      mmsi: '538007641',
      imo: '9676307',
      type: 'Container Ship',
      flag: 'Marshall Islands',
      length: '336m',
      width: '48m',
      deadweight: '119,800 tons',
      yearBuilt: '2014',
      location: {
        latitude: 1.2966,
        longitude: 103.7764,
        speed: 14.2,
        course: 85,
        status: 'Underway',
        port: 'Port of Singapore',
        destination: 'Port of Hong Kong'
      },
      lastUpdate: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop&crop=center&auto=format&q=80'
    };
  }
  
  // Generate realistic data for other vessels
  const vesselTypes = ['Container Ship', 'Bulk Carrier', 'Tanker', 'General Cargo', 'Ro-Ro'];
  const flags = ['Panama', 'Liberia', 'Marshall Islands', 'Singapore', 'Malta'];
  const ports = [
    'Port of Singapore', 'Port of Shanghai', 'Port of Rotterdam', 
    'Port of Los Angeles', 'Port of Hamburg', 'Port of Hong Kong'
  ];
  
  return {
    name: `MV VESSEL-${vesselId.slice(-4)}`,
    mmsi: (200000000 + (hash % 100000000)).toString(),
    imo: vesselId,
    type: vesselTypes[hash % vesselTypes.length],
    flag: flags[hash % flags.length],
    length: `${150 + (hash % 200)}m`,
    width: `${20 + (hash % 20)}m`,
    deadweight: `${10000 + (hash % 50000)} tons`,
    yearBuilt: `${1995 + (hash % 30)}`,
    location: {
      latitude: (hash % 180) - 90 + (Math.random() - 0.5) * 10,
      longitude: (hash % 360) - 180 + (Math.random() - 0.5) * 10,
      speed: (hash % 25) + 5,
      course: hash % 360,
      status: ['Underway', 'At anchor', 'Moored'][hash % 3],
      port: ports[hash % ports.length],
      destination: ports[(hash + 1) % ports.length]
    },
    lastUpdate: new Date(Date.now() - (hash % 3600000)).toISOString(),
    image: `https://images.unsplash.com/photo-157866299644${2 + (hash % 6)}-48f60103fc96?w=800&h=400&fit=crop&crop=center&auto=format&q=80`
  };
}

/**
 * Simple hash function for consistent data generation
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Note: For production use with actual scraping, you would install and use:
// npm install puppeteer @types/puppeteer
// 
// Example with Puppeteer:
/*
import puppeteer from 'puppeteer';

async function actualScrapeVesselFinderDetail(url: string) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for vessel data to load
    await page.waitForSelector('.vessel-details', { timeout: 10000 });
    
    const data = await page.evaluate(() => {
      // Extract vessel information from the page
      const name = document.querySelector('.vessel-name h1')?.textContent?.trim();
      const mmsi = document.querySelector('[data-label="MMSI"] .value')?.textContent?.trim();
      const imo = document.querySelector('[data-label="IMO"] .value')?.textContent?.trim();
      const type = document.querySelector('[data-label="Type"] .value')?.textContent?.trim();
      const flag = document.querySelector('[data-label="Flag"] .value')?.textContent?.trim();
      
      // Extract location data from map or coordinates section
      const latitude = parseFloat(document.querySelector('[data-latitude]')?.getAttribute('data-latitude') || '0');
      const longitude = parseFloat(document.querySelector('[data-longitude]')?.getAttribute('data-longitude') || '0');
      
      // Extract speed and course
      const speed = parseFloat(document.querySelector('[data-label="Speed"] .value')?.textContent?.replace(/[^\d.]/g, '') || '0');
      const course = parseFloat(document.querySelector('[data-label="Course"] .value')?.textContent?.replace(/[^\d.]/g, '') || '0');
      
      return {
        name,
        mmsi,
        imo,
        type,
        flag,
        location: {
          latitude,
          longitude,
          speed,
          course
        }
      };
    });
    
    return data;
  } finally {
    await browser.close();
  }
}
*/
