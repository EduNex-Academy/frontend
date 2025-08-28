"use client";

import { useState } from "react";
import Image from "next/image";
import profilePic from "../../../images/adeepa.jpg"; // local image

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Adeepa Shashiprabhath",
    role: "Computer Science Undergraduate",
    education: "2nd-year Computer Science & Engineering Undergraduate",
    experience: "Experience with web development projects, full-stack applications, and databases.",
    skills: "React, MERN Stack, Databases, AI Concepts",
    bio: "Passionate about Computer Science. Currently working on web projects and full-stack development while balancing academics.",
    goals: "Secure an internship by December 2025 and enhance full-stack development skills.",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="min-h-screen bg-blue-50 flex justify-center items-start p-8">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-2xl p-8 scale-100">
        {/* Profile Header */}
        <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-6">
          <Image
            src={profilePic}
            alt="Profile"
            width={120}
            height={120}
            className="rounded-full border-4 border-blue-500 shadow-md"
          />
          <div className="text-center lg:text-left">
            <h1 className="text-2xl lg:text-3xl font-bold text-blue-900">{profile.name}</h1>
            <p className="text-lg text-gray-700 mt-1">{profile.role}</p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="mt-8 space-y-6 text-gray-800 text-base">
          {isEditing ? (
            Object.keys(profile).map(
              (key) =>
                key !== "name" &&
                key !== "role" && (
                  <div key={key} className="space-y-1">
                    <label className="block font-semibold capitalize">{key}</label>
                    <textarea
                      name={key}
                      value={profile[key as keyof typeof profile]}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg text-sm"
                      rows={2}
                    />
                  </div>
                )
            )
          ) : (
            <div className="space-y-4">
              <p>
                <span className="font-semibold">Education:</span> {profile.education}
              </p>
              <p>
                <span className="font-semibold">Experience:</span> {profile.experience}
              </p>
              <p>
                <span className="font-semibold">Skills:</span> {profile.skills}
              </p>
              <p>
                <span className="font-semibold">Bio:</span> {profile.bio}
              </p>
              <p>
                <span className="font-semibold">Goals:</span> {profile.goals}
              </p>
            </div>
          )}
        </div>

        {/* Edit Button */}
        <button
          onClick={toggleEdit}
          className="mt-6 px-5 py-2 bg-blue-600 text-white text-base rounded-lg hover:bg-blue-700 transition"
        >
          {isEditing ? "Save Changes" : "Edit Profile"}
        </button>
      </div>
    </div>
  );
}
