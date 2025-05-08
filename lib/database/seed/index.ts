import { seedPricingData } from "./seedPricing";

/**
 * Initialize all database seed data at startup
 * This ensures all necessary data is available in the database
 */
export async function initializeDatabaseData() {
  console.log("Initializing database data...");
  
  try {
    // Seed pricing data
    await seedPricingData();
    
    // Add more seed functions here as needed
    
    console.log("Database initialization completed successfully");
  } catch (error) {
    console.error("Error initializing database data:", error);
  }
} 