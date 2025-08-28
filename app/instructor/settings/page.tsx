"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function InstructorSettingsPage() {
  // Notification settings
  const [notifications, setNotifications] = useState({
    newStudent: true,
    courseUpdate: true,
    newReview: true,
    assignmentSubmission: true,
    messageFromStudent: true,
    systemAlert: true,
    suggestedFeature: false,
  });

  // Preferences
  const [preferences, setPreferences] = useState({
    theme: "blue",
    language: "English",
    defaultView: "grid",
  });

  // Security
  const [password, setPassword] = useState("");

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
  };

  const handlePreferenceChange = (key: string, value: string) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const handlePasswordChange = () => {
    if (password.trim()) {
      console.log("New password:", password);
      setPassword("");
      alert("Password updated successfully!");
    }
  };

  const handleDeactivate = () => {
    alert("Account deactivated!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-blue-900">Settings</h1>

        {/* Notifications Section */}
        <Card className="shadow-lg border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.keys(notifications).map((key) => (
              <div key={key} className="flex items-center justify-between">
                <span className="capitalize text-gray-700">
                  {key.replace(/([A-Z])/g, " $1")}
                </span>
                <Switch
                  checked={notifications[key as keyof typeof notifications]}
                  onCheckedChange={(val) =>
                    handleNotificationChange(key, val)
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Preferences Section */}
        <Card className="shadow-lg border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Theme</p>
              <select
                value={preferences.theme}
                onChange={(e) => handlePreferenceChange("theme", e.target.value)}
                className="mt-1 w-full p-2 border rounded-lg"
              >
                <option value="blue">Blue</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div>
              <p className="text-sm text-gray-600">Language</p>
              <select
                value={preferences.language}
                onChange={(e) => handlePreferenceChange("language", e.target.value)}
                className="mt-1 w-full p-2 border rounded-lg"
              >
                <option value="English">English</option>
                <option value="Sinhala">Sinhala</option>
                <option value="Tamil">Tamil</option>
              </select>
            </div>
            <div>
              <p className="text-sm text-gray-600">Default View</p>
              <select
                value={preferences.defaultView}
                onChange={(e) => handlePreferenceChange("defaultView", e.target.value)}
                className="mt-1 w-full p-2 border rounded-lg"
              >
                <option value="grid">Grid</option>
                <option value="list">List</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card className="shadow-lg border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Change Password</p>
              <div className="flex gap-2 mt-1">
                <Input
                  type="password"
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handlePasswordChange}
                >
                  Update
                </Button>
              </div>
            </div>
            <Separator />
            <Button
              variant="destructive"
              onClick={handleDeactivate}
            >
              Deactivate Account
            </Button>
          </CardContent>
        </Card>

        {/* Support Section */}
        <Card className="shadow-lg border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              Need help or have questions? Contact our support team or visit the FAQ.
            </p>
            <div className="flex gap-4">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Contact Support
              </Button>
              <Button variant="outline">
                FAQ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
