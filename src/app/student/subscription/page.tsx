"use client";

import React from "react";
import Sidebar from "../../components/sidebar";
import DashboradHeader from "../../components/dashboard-header"; 
import EnrolledCourseCard from "../../components/enrolled-course-card";
import { courses } from "../../data/coursedata";

export default function Subscription() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b2540] to-[#09203a]">
      <div className="max-w-screen-2xl mx-auto flex">
        {/* Sidebar (left) */}
        <Sidebar />

        {/* Main Content (right) */}
        <div className="flex-1 p-6 bg-white" >
          {/* Header with Wallet Balance */}
          <DashboradHeader />

          {/* Enrolled Courses Section */}
          <h2 className="text-xl font-semibold text-white mb-4">
            Enrolled Courses & Estimated Coins
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <EnrolledCourseCard
                key={course.id}
                title={course.title}
                category={course.category}
                image={course.image}
                description={course.description}
                progress={Math.floor(0.72 * 100)} // demo only
                expectedCoins={course.expectedCoins}
                remainingCoins={course.expectedCoins ? course.expectedCoins - 10 : 0} // demo only
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
