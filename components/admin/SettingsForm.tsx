import React, { useState } from "react";
import { FiSave, FiMail, FiLock, FiUser, FiGlobe, FiBell, FiThumbsUp, FiCheck, FiMessageCircle } from "react-icons/fi";
import { Select } from "@/components/ui/select";

const SettingsForm = () => {
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [timezone, setTimezone] = useState("UTC");
  
  const timezoneOptions = [
    { value: "UTC", label: "UTC (Coordinated Universal Time)" },
    { value: "EST", label: "EST (Eastern Standard Time)" },
    { value: "CST", label: "CST (Central Standard Time)" },
    { value: "PST", label: "PST (Pacific Standard Time)" }
  ];
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    
    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };
  
  return (
    <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-6 backdrop-blur-sm">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      
      <div className="mb-6">
        <h3 className="text-xl font-medium text-white">Settings</h3>
        <p className="mt-1 text-sm text-zinc-400">Manage your admin preferences and configurations</p>
      </div>
      
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex flex-col space-y-1">
            <button
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-left transition-colors ${
                activeTab === "general" 
                  ? "bg-[#4cc9f0]/20 text-[#4cc9f0]" 
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
              }`}
              onClick={() => setActiveTab("general")}
            >
              <FiUser size={18} />
              <span className="text-sm font-medium">General</span>
            </button>
            
            <button
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-left transition-colors ${
                activeTab === "security" 
                  ? "bg-[#4cc9f0]/20 text-[#4cc9f0]" 
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
              }`}
              onClick={() => setActiveTab("security")}
            >
              <FiLock size={18} />
              <span className="text-sm font-medium">Security</span>
            </button>
            
            <button
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-left transition-colors ${
                activeTab === "notifications" 
                  ? "bg-[#4cc9f0]/20 text-[#4cc9f0]" 
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
              }`}
              onClick={() => setActiveTab("notifications")}
            >
              <FiBell size={18} />
              <span className="text-sm font-medium">Notifications</span>
            </button>
            
            <button
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-left transition-colors ${
                activeTab === "integrations" 
                  ? "bg-[#4cc9f0]/20 text-[#4cc9f0]" 
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
              }`}
              onClick={() => setActiveTab("integrations")}
            >
              <FiGlobe size={18} />
              <span className="text-sm font-medium">Integrations</span>
            </button>
          </div>
        </div>
        
        <div className="md:col-span-3">
          <form onSubmit={handleSubmit}>
            {activeTab === "general" && (
              <div className="space-y-6">
                <div className="border-b border-zinc-800 pb-6">
                  <h4 className="mb-4 text-base font-medium text-white">Profile Information</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="mb-1 block text-sm font-medium text-zinc-400">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        defaultValue="Admin User"
                        className="w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm text-white placeholder-zinc-500 focus:border-[#4cc9f0] focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="mb-1 block text-sm font-medium text-zinc-400">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        defaultValue="admin@example.com"
                        className="w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm text-white placeholder-zinc-500 focus:border-[#4cc9f0] focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="timezone" className="mb-1 block text-sm font-medium text-zinc-400">
                        Timezone
                      </label>
                      <Select
                        value={timezone}
                        onChange={setTimezone}
                        options={timezoneOptions}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="mb-4 text-base font-medium text-white">Site Settings</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="site-name" className="mb-1 block text-sm font-medium text-zinc-400">
                        Site Name
                      </label>
                      <input
                        type="text"
                        id="site-name"
                        defaultValue="Code Benders Academy"
                        className="w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm text-white placeholder-zinc-500 focus:border-[#4cc9f0] focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="site-description" className="mb-1 block text-sm font-medium text-zinc-400">
                        Site Description
                      </label>
                      <textarea
                        id="site-description"
                        defaultValue="Turn passive video watching into an active, search-driven, practice-oriented learning journey"
                        rows={3}
                        className="w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm text-white placeholder-zinc-500 focus:border-[#4cc9f0] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === "security" && (
              <div className="space-y-6">
                <div className="border-b border-zinc-800 pb-6">
                  <h4 className="mb-4 text-base font-medium text-white">Change Password</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="current-password" className="mb-1 block text-sm font-medium text-zinc-400">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="current-password"
                        placeholder="••••••••"
                        className="w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm text-white placeholder-zinc-500 focus:border-[#4cc9f0] focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="new-password" className="mb-1 block text-sm font-medium text-zinc-400">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="new-password"
                        placeholder="••••••••"
                        className="w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm text-white placeholder-zinc-500 focus:border-[#4cc9f0] focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium text-zinc-400">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        id="confirm-password"
                        placeholder="••••••••"
                        className="w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm text-white placeholder-zinc-500 focus:border-[#4cc9f0] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
                

              </div>
            )}
            
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h4 className="mb-4 text-base font-medium text-white">Email Notifications</h4>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
                    <div>
                      <p className="font-medium text-white">New Student Enrollments</p>
                      <p className="text-sm text-zinc-400">Get notified when a new student enrolls in a course</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" defaultChecked className="peer sr-only" />
                      <div className="h-6 w-11 rounded-full bg-zinc-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#4cc9f0] peer-checked:after:translate-x-full peer-focus:outline-none"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
                    <div>
                      <p className="font-medium text-white">Course Completions</p>
                      <p className="text-sm text-zinc-400">Get notified when a student completes a course</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" defaultChecked className="peer sr-only" />
                      <div className="h-6 w-11 rounded-full bg-zinc-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#4cc9f0] peer-checked:after:translate-x-full peer-focus:outline-none"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
                    <div>
                      <p className="font-medium text-white">Payment Notifications</p>
                      <p className="text-sm text-zinc-400">Get notified about new payments and subscriptions</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" defaultChecked className="peer sr-only" />
                      <div className="h-6 w-11 rounded-full bg-zinc-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#4cc9f0] peer-checked:after:translate-x-full peer-focus:outline-none"></div>
                    </label>
                  </div>
                  

                </div>
              </div>
            )}
            
            {activeTab === "integrations" && (
              <div className="space-y-6">
                <h4 className="mb-4 text-base font-medium text-white">API Integrations</h4>
                
                <div className="space-y-4">
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#1da1f2]/10">
                          <FiThumbsUp className="text-[#1da1f2]" />
                        </div>
                        <div className="ml-4">
                          <p className="font-medium text-white">Stripe</p>
                          <p className="text-sm text-zinc-400">Payment processor integration</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-emerald-900/30 px-2 py-1 text-xs font-medium text-emerald-500">Connected</span>
                        <button className="text-xs text-[#4cc9f0]">Configure</button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#ea4335]/10">
                          <FiMail className="text-[#ea4335]" />
                        </div>
                        <div className="ml-4">
                          <p className="font-medium text-white">Mailchimp</p>
                          <p className="text-sm text-zinc-400">Email marketing automation</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="rounded-md bg-[#4cc9f0]/20 px-3 py-1 text-xs font-medium text-[#4cc9f0]">Connect</button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#4a154b]/10">
                          <FiMessageCircle className="text-[#4a154b]" />
                        </div>
                        <div className="ml-4">
                          <p className="font-medium text-white">Slack</p>
                          <p className="text-sm text-zinc-400">Team communication</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-emerald-900/30 px-2 py-1 text-xs font-medium text-emerald-500">Connected</span>
                        <button className="text-xs text-[#4cc9f0]">Configure</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-8 flex items-center justify-end">
              {saved && (
                <span className="mr-4 flex items-center text-sm text-emerald-500">
                  <FiCheck className="mr-1" />
                  Settings saved successfully
                </span>
              )}
              <button
                type="submit"
                className="flex items-center gap-2 rounded-md bg-[#4cc9f0] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4cc9f0]/90"
              >
                <FiSave size={16} />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsForm; 