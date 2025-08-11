import { NextRequest, NextResponse } from "next/server";
import { shipService } from "@/lib/ship-service";

export async function POST() {
  try {
    console.log("🚢 Populating VesselFinder URLs...");

    // Ensure ships have VesselFinder URLs
    await shipService.ensureShipsHaveVesselFinderUrls();

    // Get updated ships list
    const ships = await shipService.getAllShips();
    const shipsWithUrls = ships.filter((ship) => ship.vesselfinder_url);

    return NextResponse.json({
      success: true,
      message: `Successfully ensured VesselFinder URLs are populated`,
      data: {
        total: ships.length,
        withUrls: shipsWithUrls.length,
        ships: ships.map((ship) => ({
          email: ship.ship_email,
          hasUrl: !!ship.vesselfinder_url,
          url: ship.vesselfinder_url,
        })),
      },
    });
  } catch (error) {
    console.error("Error populating VesselFinder URLs:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    // Get all ships and their URL status
    const ships = await shipService.getAllShips();

    return NextResponse.json({
      success: true,
      data: {
        total: ships.length,
        withUrls: ships.filter((ship) => ship.vesselfinder_url).length,
        ships: ships.map((ship) => ({
          id: ship.id,
          email: ship.ship_email,
          hasUrl: !!ship.vesselfinder_url,
          url: ship.vesselfinder_url,
          isActive: ship.is_active,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching ships status:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
