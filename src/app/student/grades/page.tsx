"use client";

import { grades } from "../../data/grades";
import Sidebar from "../../components/sidebar";

export default function StudentGradesPage() {
  // For demo, use studentId 123456
  const studentId = 123456;
  const myGrades = grades.filter(g => g.studentId === studentId);

  return (
    <div className="min-h-screen bg-white text-blue-900">
      <div className="max-w-screen-2xl mx-auto flex">
        <Sidebar />
        <div className="flex-1 p-6">
          <h1 className="text-3xl font-bold mb-6">My Grades</h1>
          {myGrades.length === 0 ? (
            <p>No grades found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myGrades.map(grade => (
                <div key={grade.courseId} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h2 className="text-xl font-semibold mb-2 text-blue-900">{grade.courseTitle}</h2>
                  <p className="mb-2 text-gray-700">Grade: <span className="text-green-600 font-bold">{grade.grade}</span></p>
                  <p className="mb-2 text-gray-700">Feedback: <span className="text-blue-700">{grade.feedback}</span></p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
