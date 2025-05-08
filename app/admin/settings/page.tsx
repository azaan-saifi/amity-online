"use client";

import React from "react";
import SettingsForm from "@/components/admin/SettingsForm";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="mt-1 text-zinc-400">Configure your admin panel preferences</p>
        </div>
      </div>
      
      <SettingsForm />
    </div>
  );
} 