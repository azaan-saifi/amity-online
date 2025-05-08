import mongoose, { Document, Schema } from "mongoose";

// Define the interface for Pricing document
export interface IPricing extends Document {
  name: string;
  price: number;
  interval: string;
  description: string;
  features: string[];
  isPopular: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Create the schema
const PricingSchema = new Schema<IPricing>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    interval: {
      type: String,
      required: [true, "Interval is required"],
      default: "monthly",
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    features: {
      type: [String],
      required: [true, "Features are required"],
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export the model
export const Pricing = mongoose.models.Pricing || mongoose.model<IPricing>("Pricing", PricingSchema); 