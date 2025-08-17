// app/dashboard/page.tsx
"use client";

import React from "react";
import Sidebar from "../../components/sidebar";
import DashboradHeader from "../../components/dashboard-header"; 
import EnrolledCourseCard from "../../components/enrolled-course-card";
import { courses } from "../../data/coursedata";
export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b2540] to-[#09203a]">
      <div className="max-w-screen-2xl mx-auto flex">
        {/* Sidebar (left) */}
        <Sidebar />

        {/* Main area (right) */}
        <main className="flex-1 p-8 bg-blue-50">
          {/* Header */}
          <DashboradHeader />

          {/* Page content below header */}
          <section className="mt-8">
            {/* ... your Enrolled Courses and Upcoming Assignments components */}
            <p className="text-blue-800 text-3xl">Enrolled Courses</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {courses.slice(0, 3).map((course) => (
                    <EnrolledCourseCard
                        key={course.id}
                        title={course.title}
                        category={course.category}
                        image={course.image}
                        description={course.description}
                        progress={Math.floor(0.72 * 100)} // demo only
                        />
                ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
