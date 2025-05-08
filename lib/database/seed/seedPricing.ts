import fs from 'fs';
import path from 'path';
import { connectToDatabase } from '../mongoose';
import { Pricing } from '../models/pricing.model';

/**
 * Seed the pricing data from the JSON file to MongoDB
 * This should be called once to initialize the database
 */
export async function seedPricingData() {
  try {
    await connectToDatabase();
    
    // Check if we already have pricing data in the database
    const existingPricing = await Pricing.countDocuments();
    
    if (existingPricing > 0) {
      console.log('Pricing data already exists in the database');
      return;
    }
    
    // Read the JSON file
    const dataFilePath = path.join(process.cwd(), 'data/pricing.json');
    if (!fs.existsSync(dataFilePath)) {
      console.log('No pricing data file found, using default data');
      
      // Create default pricing plans
      const defaultPricingPlans = [
        {
          name: "Basic Bender",
          price: 29,
          interval: "monthly",
          description: "Perfect for beginners looking to start their coding journey.",
          features: [
            "Access to core courses",
            "Practice exercises",
            "Community forum access",
            "Monthly coding challenges",
            "Email support",
          ],
          isPopular: false,
        },
        {
          name: "Master Bender",
          price: 89,
          interval: "monthly",
          description: "For serious learners ready to master the code of the Matrix.",
          features: [
            "All Basic features",
            "Advanced courses",
            "1-on-1 mentoring sessions",
            "Project reviews",
            "Priority support",
            "Certificate of completion",
            "Job opportunity alerts",
          ],
          isPopular: true,
        },
      ];
      
      // Insert default data
      await Pricing.insertMany(defaultPricingPlans);
      console.log('Default pricing data has been seeded to the database');
      return;
    }
    
    // Read and parse the JSON file
    const fileData = fs.readFileSync(dataFilePath, 'utf8');
    const pricingData = JSON.parse(fileData);
    
    // Insert the data into MongoDB
    const formattedData = pricingData.map((item: any) => ({
      name: item.name,
      price: item.price,
      interval: item.interval,
      description: item.description,
      features: item.features,
      isPopular: item.isPopular,
    }));
    
    await Pricing.insertMany(formattedData);
    console.log('Pricing data has been seeded to the database');
  } catch (error) {
    console.error('Error seeding pricing data:', error);
  }
} 