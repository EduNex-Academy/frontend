"use client";

import { useState } from "react";

interface Student {
  id: number;
  name: string;
  email: string;
  enrolledCourses: number;
  progress: number; // percentage
}

const mockStudents: Student[] = [
  { id: 1, name: "John Doe", email: "john@example.com", enrolledCourses: 3, progress: 75 },
  { id: 2, name: "Jane Smith", email: "jane@example.com", enrolledCourses: 2, progress: 50 },
  { id: 3, name: "Alice Brown", email: "alice@example.com", enrolledCourses: 1, progress: 100 },
];

export default function InstructorStudentsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStudents = mockStudents.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-900 mb-4">Students</h1>
        <p className="text-blue-800 mb-6">View and manage your enrolled students</p>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-1/3 p-3 rounded-lg border border-blue-300 mb-6 focus:ring-2 focus:ring-blue-400"
        />

        {/* Students Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow p-4">
          <table className="w-full text-left table-auto border-collapse">
            <thead>
              <tr className="bg-blue-100 text-blue-900">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Enrolled Courses</th>
                <th className="p-3">Progress</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-b border-blue-200">
                  <td className="p-3">{student.name}</td>
                  <td className="p-3">{student.email}</td>
                  <td className="p-3">{student.enrolledCourses}</td>
                  <td className="p-3">
                    <div className="w-full bg-blue-100 rounded-full h-4">
                      <div
                        className="bg-blue-600 h-4 rounded-full"
                        style={{ width: `${student.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-blue-800">{student.progress}%</span>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-blue-700 p-4">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
