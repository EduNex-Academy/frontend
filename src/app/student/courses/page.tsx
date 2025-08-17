"use client";

import { studentCourses } from "../../data/studentCourses";
import { courses } from "../../data/coursedata";
import Sidebar from "../../components/sidebar";

export default function StudentCoursesPage() {
  // For demo, use studentId 123456
  const studentId = 123456;
  const enrolled = studentCourses.find(s => s.studentId === studentId)?.courses || [];

  return (
    <div className="min-h-screen bg-white text-blue-900">
      <div className="max-w-screen-2xl mx-auto flex">
        <Sidebar />
        <div className="flex-1 p-6">
          <h1 className="text-3xl font-bold mb-6">My Enrolled Courses</h1>
          {enrolled.length === 0 ? (
            <p>No enrolled courses found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolled.map(course => (
                <div key={course.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h2 className="text-xl font-semibold mb-2 text-blue-900">{course.title}</h2>
                  <p className="mb-2 text-gray-700">Progress: <span className="text-green-600 font-bold">{course.progress}%</span></p>
                  <p className="mb-2 text-gray-700">Enrolled Date: <span className="text-blue-700">{course.enrolledDate}</span></p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
