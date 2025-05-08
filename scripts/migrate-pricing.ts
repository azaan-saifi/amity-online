import { seedPricingData } from "@/lib/database/seed/seedPricing";

async function main() {
  console.log("Starting pricing data migration...");
  await seedPricingData();
  console.log("Migration completed!");
  process.exit(0);
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
}); 