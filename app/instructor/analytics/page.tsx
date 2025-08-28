"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function InstructorAnalyticsPage() {
  const [studentsData] = useState([
    { course: "React Basics", students: 120 },
    { course: "Node.js Advanced", students: 85 },
    { course: "Database Systems", students: 60 },
    { course: "AI Fundamentals", students: 45 },
  ]);

  const [assignmentsData] = useState([
    { name: "Completed", value: 35 },
    { name: "Pending", value: 15 },
  ]);

  const COLORS = ["#1E3A8A", "#3B82F6"]; // blue-themed

  const totalStudents = studentsData.reduce((sum, d) => sum + d.students, 0);
  const totalCourses = studentsData.length;
  const totalAssignments = assignmentsData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-blue-900">Analytics</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="shadow-md border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-900">{totalStudents}</p>
            </CardContent>
          </Card>
          <Card className="shadow-md border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">Total Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-900">{totalCourses}</p>
            </CardContent>
          </Card>
          <Card className="shadow-md border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">Total Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-900">{totalAssignments}</p>
            </CardContent>
          </Card>
        </div>

        {/* Course-wise Enrollment Bar Chart */}
        <Card className="shadow-md border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Course-wise Student Enrollment</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={studentsData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="course" stroke="#1E3A8A" />
                <YAxis stroke="#1E3A8A" />
                <Tooltip />
                <Bar dataKey="students" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Assignments Pie Chart */}
        <Card className="shadow-md border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Assignments Completion</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="50%" height={300}>
              <PieChart>
                <Pie
                  data={assignmentsData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#3B82F6"
                  label
                >
                  {assignmentsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
