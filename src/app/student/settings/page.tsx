"use client";

import React, { useState } from "react";
import Sidebar from "../../components/sidebar";
import DashboardHeader from "../../components/dashboard-header";
import Adeepa from "../../../images/adeepa.jpg";

export default function StudentSettings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [editProfile, setEditProfile] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string>(Adeepa.src);
  const [coins, setCoins] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b2540] to-[#09203a] text-white">
      <div className="max-w-screen-2xl bg-white mx-auto flex">
        {/* Sidebar (left) */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Removed DashboardHeader */}

          {/* Tabs */}
          <div className="flex space-x-4 mt-6 border-b border-gray-600">
            {["profile", "buy coins", "subscription"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 capitalize ${
                  activeTab === tab
                    ? "border-b-2 border-blue-500 text-blue-400"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Profile</h2>
                {/* Dummy user data */}
                <div className="bg-[#102a43] p-6 rounded-lg border border-gray-700 flex items-center space-x-8">
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
                  />
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">Adeepa Shashiprabhath</p>
                    <p className="text-gray-400">adeepashashiprabhath@gmail.com</p>
                    <p className="text-gray-400">Student ID: 123456</p>
                    <p className="text-gray-400">Phone: +94 762457340</p>
                    <p className="text-gray-400">Joined: Jan 2024</p>
                    <p className="text-gray-400">Address: 123 Main St, City, Sri Lanka</p>
                  </div>
                </div>
                <div className="flex space-x-4 mt-4">
                  <button
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                    onClick={() => setEditProfile(!editProfile)}
                  >
                    {editProfile ? "Cancel Edit" : "Edit Profile"}
                  </button>
                  <button
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg"
                    onClick={() => setChangePassword(!changePassword)}
                  >
                    {changePassword ? "Cancel" : "Change Password"}
                  </button>
                </div>
                {editProfile && (
                  <div className="space-y-3 mt-4">
                    {/* Profile Photo Upload */}
                    <div className="flex items-center space-x-4">
                      <img
                        src={profilePhoto}
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover border"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          const file = e.target.files && e.target.files[0];
                          if (file) {
                            const dummyUrl = URL.createObjectURL(file);
                            setProfilePhoto(dummyUrl);
                          }
                        }}
                        className="text-white"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Full Name"
                      defaultValue="John Doe"
                      className="w-full p-3 rounded-lg bg-[#102a43] border border-gray-700 text-white"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      defaultValue="johndoe@email.com"
                      className="w-full p-3 rounded-lg bg-[#102a43] border border-gray-700 text-white"
                    />
                    <input
                      type="text"
                      placeholder="Phone Number"
                      defaultValue="+1 234 567 8901"
                      className="w-full p-3 rounded-lg bg-[#102a43] border border-gray-700 text-white"
                    />
                    <input
                      type="text"
                      placeholder="Address"
                      defaultValue="123 Main St, City, Country"
                      className="w-full p-3 rounded-lg bg-[#102a43] border border-gray-700 text-white"
                    />
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg">
                      Save Changes
                    </button>
                  </div>
                )}
                {changePassword && (
                  <div className="space-y-3 mt-4">
                    <input
                      type="password"
                      placeholder="Current Password"
                      className="w-full p-3 rounded-lg bg-[#102a43] border border-gray-700 text-white"
                    />
                    <input
                      type="password"
                      placeholder="New Password"
                      className="w-full p-3 rounded-lg bg-[#102a43] border border-gray-700 text-white"
                    />
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      className="w-full p-3 rounded-lg bg-[#102a43] border border-gray-700 text-white"
                    />
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">
                      Update Password
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Buy Coins Tab */}
            {activeTab === "buy coins" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Buy Coins</h2>
                <div className="bg-[#102a43] p-4 rounded-lg border border-gray-700">
                  <p className="mb-2">Current Coins: <span className="text-green-400">{coins}</span></p>
                  <input
                    type="number"
                    min="1"
                    placeholder="Enter coins to buy"
                    className="w-full p-3 rounded-lg bg-[#0b2540] border border-gray-700 text-white mb-3"
                    onChange={e => setCoins(Number(e.target.value))}
                  />
                  <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg">
                    Pay & Buy Coins
                  </button>
                  <p className="mt-2 text-sm text-gray-400">Use coins to unlock courses and features.</p>
                </div>
              </div>
            )}

            {/* Subscription Tab */}
            {activeTab === "subscription" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Subscription Settings</h2>
                <div className="bg-[#102a43] p-4 rounded-lg border border-gray-700">
                  <p className="mb-2">Current Plan: <span className="text-blue-400">Premium</span></p>
                  <p className="mb-4">Renews on: 25th Aug 2025</p>
                  <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg mr-3">
                    Upgrade Plan
                  </button>
                  <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg">
                    Cancel Subscription
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
