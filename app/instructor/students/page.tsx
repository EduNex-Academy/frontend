"use client";

import { useState } from "react";

interface Student {
  id: number;
  name: string;
  email: string;
  enrolledCourses: { id: string; title: string; progress: number }[];
}

const mockStudents: Student[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    enrolledCourses: [
      { id: "c1", title: "React Basics", progress: 75 },
      { id: "c2", title: "Node.js Essentials", progress: 50 },
      { id: "c3", title: "UI/UX Design", progress: 100 },
    ],
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    enrolledCourses: [
      { id: "c1", title: "React Basics", progress: 40 },
      { id: "c4", title: "Python for Beginners", progress: 80 },
    ],
  },
  {
    id: 3,
    name: "Alice Brown",
    email: "alice@example.com",
    enrolledCourses: [
      { id: "c5", title: "Data Science", progress: 100 },
    ],
  },
  {
    id: 4,
    name: "Michael Green",
    email: "michael.green@example.com",
    enrolledCourses: [
      { id: "c6", title: "Machine Learning", progress: 60 },
      { id: "c7", title: "Cloud Computing", progress: 30 },
    ],
  },
  {
    id: 5,
    name: "Sara Lee",
    email: "sara.lee@example.com",
    enrolledCourses: [
      { id: "c8", title: "Web Development", progress: 90 },
      { id: "c9", title: "Cybersecurity", progress: 20 },
      { id: "c10", title: "Business Analytics", progress: 55 },
    ],
  },
  {
    id: 6,
    name: "David Kim",
    email: "david.kim@example.com",
    enrolledCourses: [
      { id: "c11", title: "Mobile App Development", progress: 10 },
    ],
  },
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
                <th className="p-3">Enrolled Courses & Progress</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-b border-blue-200 align-top">
                  <td className="p-3 font-semibold text-blue-900">{student.name}</td>
                  <td className="p-3 text-blue-800">{student.email}</td>
                  <td className="p-3">
                    <ul className="space-y-2">
                      {student.enrolledCourses.map((course) => (
                        <li key={course.id} className="mb-2">
                          <div className="font-medium text-blue-700">{course.title}</div>
                          <div className="w-full bg-blue-100 rounded-full h-4 mt-1">
                            <div
                              className="bg-blue-600 h-4 rounded-full"
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-blue-800">Progress: {course.progress}%</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center text-blue-700 p-4">
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

