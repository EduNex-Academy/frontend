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
  const [selectedAssignment, setSelectedAssignment] = useState<number | null>(null);
  const [studentsData] = useState([
    { course: "React Basics", students: 120 },
    { course: "Node.js Advanced", students: 85 },
    { course: "Database Systems", students: 60 },
    { course: "AI Fundamentals", students: 45 },
  ]);

  // Assignments with module and course info
  const [assignmentsList, setAssignmentsList] = useState([
    { title: "React Components", module: "Module 1", course: "React Basics", finished: 30, pending: 10 },
    { title: "Express API", module: "Module 2", course: "Node.js Advanced", finished: 20, pending: 5 },
    { title: "SQL Queries", module: "Module 1", course: "Database Systems", finished: 10, pending: 5 },
    { title: "AI Project", module: "Module 3", course: "AI Fundamentals", finished: 5, pending: 2 },
  ]);
  // Refresh pie chart data
  const handleRefresh = () => {
    setAssignmentsList(list =>
      list.map(a => ({
        ...a,
        finished: Math.floor(Math.random() * 40) + 5,
        pending: Math.floor(Math.random() * 15) + 2,
      }))
    );
    setSelectedAssignment(null);
  };

  // Pie chart data for finished/pending students (sum from assignmentsList)
  const finishedTotal = assignmentsList.reduce((sum, a) => sum + a.finished, 0);
  const pendingTotal = assignmentsList.reduce((sum, a) => sum + a.pending, 0);
  const assignmentsData = [
    { name: "Finished", value: finishedTotal },
    { name: "Pending", value: pendingTotal },
  ];

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
                <Tooltip
                  cursor={false}
                  content={({ active, payload }) =>
                    active && payload && payload.length ? (
                      <div className="bg-white p-2 rounded shadow text-blue-900 font-bold">
                        {payload[0].value}
                      </div>
                    ) : null
                  }
                />
                <Bar dataKey="students" fill="#3B82F6" barSize={40} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Assignment Completion List & Pie Chart */}
        <Card className="shadow-md border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            
            <div className="mb-6">
              <table className="w-full text-left table-auto border-collapse">
                <thead>
                  <tr className="bg-blue-100 text-blue-900">
                    <th className="p-4 w-1/4">Assignment</th>
                    <th className="p-4 w-1/5">Module</th>
                    <th className="p-4 w-1/5">Course</th>
                    <th className="p-4 w-1/6">Finished</th>
                    <th className="p-4 w-1/6">Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {assignmentsList.map((a, i) => (
                    <tr
                      key={i}
                      className="border-b border-blue-100 cursor-pointer hover:bg-blue-50 transition"
                      onClick={() => setSelectedAssignment(i)}
                    >
                      <td className="p-4 font-semibold text-blue-900">{a.title}</td>
                      <td className="p-4 text-blue-700">{a.module}</td>
                      <td className="p-4 text-blue-700">{a.course}</td>
                      <td className="p-4 text-green-700 font-bold">{a.finished}</td>
                      <td className="p-4 text-orange-700 font-bold">{a.pending}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-center">
              {selectedAssignment !== null && (
                <div className="animate-fade-in mt-8">
                  <ResponsiveContainer width="40%" height={260}>
                    <PieChart>
                      <Pie
                        data={[{ name: "Finished", value: assignmentsList[selectedAssignment].finished }, { name: "Pending", value: assignmentsList[selectedAssignment].pending }]}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        fill="#3B82F6"
                        label
                      >
                        <Cell key="cell-0" fill={COLORS[0]} />
                        <Cell key="cell-1" fill={COLORS[1]} />
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

<style>{`
  .animate-fade-in {
    animation: fadeIn 0.6s;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
`}</style>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
