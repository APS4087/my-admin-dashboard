import { NextRequest, NextResponse } from "next/server";

/**
 * Test API endpoint for VesselFinder scraping
 * This can be used to test the scraping functionality with real VesselFinder URLs
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const testUrl = searchParams.get("url") || "https://www.vesselfinder.com/vessels/details/9676307";

  try {
    // Call our scrape-vessel-detail API
    const response = await fetch(`${request.nextUrl.origin}/api/scrape-vessel-detail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: testUrl }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: "Scraping test completed",
      testUrl,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Scraping test error:", error);
    return NextResponse.json(
      {
        error: "Scraping test failed",
        message: error instanceof Error ? error.message : "Unknown error",
        testUrl,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Call our scrape-vessel-detail API
    const response = await fetch(`${request.nextUrl.origin}/api/scrape-vessel-detail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: "Scraping test completed",
      testUrl: url,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Scraping test error:", error);
    return NextResponse.json(
      {
        error: "Scraping test failed",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
