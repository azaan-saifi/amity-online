import { NextRequest, NextResponse } from "next/server";

import { Pricing } from "@/lib/database/models/pricing.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { seedPricingData } from "@/lib/database/seed/seedPricing";

// Run this once to initialize data
let isInitialized = false;
async function initializeOnce() {
  if (!isInitialized) {
    await seedPricingData();
    isInitialized = true;
  }
}

// GET /api/pricing - Get all pricing plans
export async function GET() {
  try {
    await connectToDatabase();

    // Check if we need to seed the initial data
    await initializeOnce();

    // Fetch pricing plans from MongoDB
    const pricingPlans = await Pricing.find({}).sort({ price: 1 });

    // Format the response to match the expected format by the frontend
    const formattedPlans = pricingPlans.map((plan) => ({
      id: plan._id.toString(),
      name: plan.name,
      price: plan.price,
      interval: plan.interval,
      description: plan.description,
      features: plan.features,
      isPopular: plan.isPopular,
    }));

    return NextResponse.json(formattedPlans);
  } catch (error) {
    console.error("Error fetching pricing data:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch pricing plans", details: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/pricing - Update pricing plans
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // For the admin panel, we'll skip authentication for now
    // TODO: Add proper authentication check

    const plans = await request.json();

    // Validate the data
    if (!Array.isArray(plans)) {
      return NextResponse.json(
        { error: "Invalid data format. Expected an array of pricing plans." },
        { status: 400 }
      );
    }

    // Clear existing pricing plans
    await Pricing.deleteMany({});

    // Insert new pricing plans
    const formattedPlans = plans.map((plan) => ({
      name: plan.name,
      price: plan.price,
      interval: plan.interval || "monthly",
      description: plan.description,
      features: plan.features,
      isPopular: plan.isPopular || false,
    }));

    await Pricing.insertMany(formattedPlans);

    return NextResponse.json({
      success: true,
      message: "Pricing plans updated successfully",
    });
  } catch (error) {
    console.error("Error updating pricing data:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update pricing plans", details: errorMessage },
      { status: 500 }
    );
  }
}

// Handle single plan operations
export async function PATCH(request: NextRequest) {
  try {
    await connectToDatabase();

    // For the admin panel, we'll skip authentication for now
    // TODO: Add proper authentication check

    const { id, ...planData } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }

    // Update the plan
    const updatedPlan = await Pricing.findByIdAndUpdate(
      id,
      { ...planData },
      { new: true, runValidators: true }
    );

    if (!updatedPlan) {
      return NextResponse.json(
        { error: "Pricing plan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Pricing plan updated successfully",
      plan: {
        id: updatedPlan._id.toString(),
        name: updatedPlan.name,
        price: updatedPlan.price,
        interval: updatedPlan.interval,
        description: updatedPlan.description,
        features: updatedPlan.features,
        isPopular: updatedPlan.isPopular,
      },
    });
  } catch (error) {
    console.error("Error updating pricing plan:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update pricing plan", details: errorMessage },
      { status: 500 }
    );
  }
}

// Create a new pricing plan
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();

    // For the admin panel, we'll skip authentication for now
    // TODO: Add proper authentication check

    const planData = await request.json();

    // Create the plan
    const newPlan = await Pricing.create(planData);

    return NextResponse.json({
      success: true,
      message: "Pricing plan created successfully",
      plan: {
        id: newPlan._id.toString(),
        name: newPlan.name,
        price: newPlan.price,
        interval: newPlan.interval,
        description: newPlan.description,
        features: newPlan.features,
        isPopular: newPlan.isPopular,
      },
    });
  } catch (error) {
    console.error("Error creating pricing plan:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create pricing plan", details: errorMessage },
      { status: 500 }
    );
  }
}

// Delete a pricing plan
export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();

    // For the admin panel, we'll skip authentication for now
    // TODO: Add proper authentication check

    // Get the plan ID from the URL
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }

    // Delete the plan
    const deletedPlan = await Pricing.findByIdAndDelete(id);

    if (!deletedPlan) {
      return NextResponse.json(
        { error: "Pricing plan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Pricing plan deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting pricing plan:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to delete pricing plan", details: errorMessage },
      { status: 500 }
    );
  }
}
