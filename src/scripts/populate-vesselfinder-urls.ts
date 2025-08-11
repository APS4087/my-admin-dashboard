/**
 * Script to populate VesselFinder URLs for existing ships
 * Run this script to ensure all ships have tracking URLs
 */

import { shipService } from "../lib/ship-service";

const SHIP_URL_MAPPINGS = [
  { email: "hyemerald01@gmail.com", url: "https://www.vesselfinder.com/vessels/details/9676307" },
  { email: "hypartner02@gmail.com", url: "https://www.vesselfinder.com/vessels/details/9234567" },
  { email: "hychampion03@gmail.com", url: "https://www.vesselfinder.com/vessels/details/9345678" },
  { email: "captain.johnson@atlanticlines.com", url: "https://www.vesselfinder.com/vessels/details/9456789" },
  { email: "navigator.patel@asiancargo.com", url: "https://www.vesselfinder.com/vessels/details/9567890" },
];

async function populateVesselFinderUrls() {
  try {
    console.log("🚢 Starting VesselFinder URL population...");

    // Get all ships
    const ships = await shipService.getAllShips();
    console.log(`Found ${ships.length} ships in database`);

    if (ships.length === 0) {
      console.log("No ships found in database. Consider adding ships first.");
      return;
    }

    // Check which ships need URLs
    const shipsNeedingUrls = ships.filter((ship) => !ship.vesselfinder_url);
    console.log(`${shipsNeedingUrls.length} ships need VesselFinder URLs`);

    if (shipsNeedingUrls.length === 0) {
      console.log("✅ All ships already have VesselFinder URLs!");
      return;
    }

    // Update ships with URLs
    const updates = [];
    for (const ship of shipsNeedingUrls) {
      const mapping = SHIP_URL_MAPPINGS.find((m) => m.email === ship.ship_email);
      if (mapping) {
        updates.push({ email: ship.ship_email, url: mapping.url });
        console.log(`📍 Mapping ${ship.ship_email} -> ${mapping.url}`);
      } else {
        console.log(`⚠️  No URL mapping found for ${ship.ship_email}`);
      }
    }

    if (updates.length > 0) {
      await shipService.batchUpdateVesselFinderUrls(updates);
      console.log(`✅ Successfully updated ${updates.length} ships with VesselFinder URLs`);
    }

    // Verify the updates
    const updatedShips = await shipService.getAllShips();
    const shipsWithUrls = updatedShips.filter((ship) => ship.vesselfinder_url);
    console.log(`🎉 Final result: ${shipsWithUrls.length}/${updatedShips.length} ships now have VesselFinder URLs`);
  } catch (error) {
    console.error("❌ Error populating VesselFinder URLs:", error);
  }
}

// Run the script if called directly
if (require.main === module) {
  populateVesselFinderUrls()
    .then(() => {
      console.log("Script completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Script failed:", error);
      process.exit(1);
    });
}

export { populateVesselFinderUrls };
