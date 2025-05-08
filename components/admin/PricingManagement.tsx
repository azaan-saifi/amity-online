"use client";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FiEdit2, FiCheck, FiX, FiPlus, FiTrash2 } from "react-icons/fi";
import { IoIosArrowRoundForward } from "react-icons/io";

// Define the pricing plan interface
interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
  description: string;
  features: string[];
  isPopular: boolean;
}

interface EditablePricingPlanProps {
  plan: PricingPlan;
  onSave: (plan: PricingPlan) => void;
  onCancel: () => void;
}

const EditablePricingPlan = ({
  plan,
  onSave,
  onCancel,
}: EditablePricingPlanProps) => {
  const [editedPlan, setEditedPlan] = useState<PricingPlan>({ ...plan });

  const handleChange = (field: keyof PricingPlan, value: any) => {
    setEditedPlan({ ...editedPlan, [field]: value });
  };

  const handleFeatureChange = (index: number, value: string) => {
    const updatedFeatures = [...editedPlan.features];
    updatedFeatures[index] = value;
    setEditedPlan({ ...editedPlan, features: updatedFeatures });
  };

  const addFeature = () => {
    setEditedPlan({
      ...editedPlan,
      features: [...editedPlan.features, ""],
    });
  };

  const removeFeature = (index: number) => {
    setEditedPlan({
      ...editedPlan,
      features: editedPlan.features.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-4 rounded-lg border border-[#f0bb1c]/30 bg-black/80 p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            className="w-full rounded border border-zinc-800 bg-zinc-900/50 px-2 py-1 text-lg font-medium text-white focus:border-[#f0bb1c] focus:outline-none sm:w-auto"
            value={editedPlan.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          <div className="flex items-center gap-1 text-xs">
            <input
              type="checkbox"
              id="isPopular"
              checked={editedPlan.isPopular}
              onChange={(e) => handleChange("isPopular", e.target.checked)}
              className="size-3 rounded border-zinc-700 bg-zinc-900 text-[#f0bb1c]"
            />
            <label htmlFor="isPopular" className="text-zinc-400">
              Popular
            </label>
          </div>
        </div>
        <div className="mt-2 flex gap-2 sm:mt-0">
          <button
            onClick={() => onSave(editedPlan)}
            className="rounded p-1 text-emerald-500 hover:bg-zinc-800"
          >
            <FiCheck />
          </button>
          <button
            onClick={onCancel}
            className="rounded p-1 text-rose-500 hover:bg-zinc-800"
          >
            <FiX />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-zinc-400">$</span>
        <input
          type="number"
          className="w-20 rounded border border-zinc-800 bg-zinc-900/50 px-2 py-1 text-xl font-bold text-white focus:border-[#f0bb1c] focus:outline-none"
          value={editedPlan.price}
          onChange={(e) => handleChange("price", Number(e.target.value))}
        />
        <span className="text-zinc-400">per month</span>
      </div>

      <div>
        <textarea
          className="w-full rounded border border-zinc-800 bg-zinc-900/50 px-2 py-1 text-sm text-white focus:border-[#f0bb1c] focus:outline-none"
          value={editedPlan.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-zinc-400">Features</h4>
          <button
            onClick={addFeature}
            className="rounded-full bg-zinc-900 p-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            + Add
          </button>
        </div>

        {editedPlan.features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              className="flex-1 rounded border border-zinc-800 bg-zinc-900/50 px-2 py-1 text-sm text-white focus:border-[#f0bb1c] focus:outline-none"
              value={feature}
              onChange={(e) => handleFeatureChange(index, e.target.value)}
            />
            <button
              onClick={() => removeFeature(index)}
              className="rounded p-1 text-xs text-zinc-400 hover:text-rose-500"
            >
              <FiX />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const PricingManagement = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Fetch pricing plans from the API
  const fetchPricingPlans = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/pricing");

      if (!response.ok) {
        throw new Error("Failed to fetch pricing plans");
      }

      const data = await response.json();
      setPlans(data);
    } catch (error) {
      console.error("Error fetching pricing plans:", error);
      toast.error("Failed to load pricing plans");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPricingPlans();
  }, []);

  const handleEdit = (id: string) => {
    setEditingPlanId(id);
  };

  const handleSave = async (updatedPlan: PricingPlan) => {
    try {
      setIsSaving(true);

      const response = await fetch("/api/pricing", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPlan),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update pricing plan");
      }

      // Update the local state
      setPlans(
        plans.map((plan) => (plan.id === updatedPlan.id ? updatedPlan : plan))
      );

      toast.success("Pricing plan updated successfully!");
    } catch (error) {
      console.error("Error updating pricing plan:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update pricing plan"
      );
    } finally {
      setIsSaving(false);
      setEditingPlanId(null);
    }
  };

  const handleCancel = () => {
    setEditingPlanId(null);
  };

  const handleCreateNew = () => {
    // Create a new empty plan template
    const newPlan: PricingPlan = {
      id: "new",
      name: "New Plan",
      price: 0,
      interval: "monthly",
      description: "Description of your new plan",
      features: ["Feature 1"],
      isPopular: false,
    };

    setPlans([...plans, newPlan]);
    setEditingPlanId("new");
    setIsCreating(true);
  };

  const handleSaveNew = async (newPlan: PricingPlan) => {
    try {
      setIsSaving(true);

      // Remove the temporary ID
      const { id, ...planData } = newPlan;

      const response = await fetch("/api/pricing", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(planData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create pricing plan");
      }

      const result = await response.json();

      // Remove the temporary plan and add the new one with the real ID
      setPlans(plans.filter((p) => p.id !== "new").concat(result.plan));

      toast.success("New pricing plan created successfully!");
    } catch (error) {
      console.error("Error creating pricing plan:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create pricing plan"
      );
    } finally {
      setIsSaving(false);
      setEditingPlanId(null);
      setIsCreating(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    try {
      setIsDeleting(id);

      const response = await fetch(`/api/pricing?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete pricing plan");
      }

      // Remove the plan from the local state
      setPlans(plans.filter((plan) => plan.id !== id));

      toast.success("Pricing plan deleted successfully!");
    } catch (error) {
      console.error("Error deleting pricing plan:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete pricing plan"
      );
    } finally {
      setIsDeleting(null);
    }
  };

  const handlePublish = async () => {
    try {
      setIsSaving(true);

      const response = await fetch("/api/pricing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(plans),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update pricing plans");
      }

      toast.success("Pricing plans published successfully!");
    } catch (error) {
      console.error("Error publishing pricing plans:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to publish pricing plans"
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-4 backdrop-blur-sm sm:p-6">
        <div className="flex h-40 items-center justify-center">
          <div className="animate-pulse text-zinc-400">
            Loading pricing plans...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-4 backdrop-blur-sm sm:p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-medium text-white">Pricing Management</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Update pricing plans shown on the pricing page
          </p>
        </div>

        <div className="mt-3 flex gap-3 sm:mt-0">
          <button
            onClick={handleCreateNew}
            disabled={isCreating}
            className="flex items-center justify-center gap-2 rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiPlus />
            <span>New Plan</span>
          </button>

          <button
            onClick={handlePublish}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 rounded-md bg-[#ffc20b31] px-4 py-2 text-sm font-medium text-[#f0bb1c] transition-colors hover:bg-[#ffc20b50] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>{isSaving ? "Publishing..." : "Publish Changes"}</span>
            <IoIosArrowRoundForward className="text-xl" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
        {plans.map((plan) => (
          <div key={plan.id}>
            {editingPlanId === plan.id ? (
              <EditablePricingPlan
                plan={plan}
                onSave={plan.id === "new" ? handleSaveNew : handleSave}
                onCancel={handleCancel}
              />
            ) : (
              <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-4 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700 hover:shadow-lg sm:p-6">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                {plan.isPopular && (
                  <div className="absolute right-2 top-2 rounded-full border border-[#f0bb1c]/30 bg-[#ffc20b31] px-2 py-0.5">
                    <span className="text-xs font-medium text-[#f0bb1c]">
                      POPULAR
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-lg font-medium text-white">
                    {plan.name}
                  </h3>
                  <div className="mt-1 flex items-baseline">
                    <span className="text-2xl font-bold text-white">
                      ${plan.price}
                    </span>
                    <span className="ml-1 text-sm text-zinc-400">
                      /{plan.interval === "monthly" ? "month" : "year"}
                    </span>
                  </div>
                </div>

                <p className="mb-4 text-sm text-zinc-400">{plan.description}</p>

                <div className="mb-6 space-y-2">
                  <h4 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Features
                  </h4>
                  <ul className="space-y-1 text-sm text-zinc-300">
                    {plan.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-800 pt-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(plan.id)}
                      className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      disabled={isDeleting === plan.id || plans.length <= 1}
                      className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      {isDeleting === plan.id ? (
                        <span className="inline-block size-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                      ) : (
                        <FiTrash2 />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingManagement;
