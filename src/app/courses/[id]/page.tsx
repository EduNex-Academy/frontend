"use client";

import { courses } from "../../data/coursedata";
import { courseDetails } from "../../data/courseDetails";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function CourseDetailsPage() {
  const params = useParams();
  const courseId = params?.id?.toString() || "";
  const course = courses.find(c => c.id.toString() === courseId);
  const details = (courseDetails as any)[courseId];

  if (!course) {
    return <div className="p-10 text-center text-red-600">Course not found.</div>;
  }

  return (
    <div className="min-h-screen bg-white text-blue-900 px-4 py-16 md:px-10">
      <div className="max-w-4xl mx-auto bg-blue-50 rounded-2xl shadow-lg p-8">
        <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
        <Image src={course.image} alt={course.title} width={600} height={350} className="rounded-xl mb-6" />
        <p className="mb-4 text-lg">{course.description}</p>
        <p className="mb-4 text-green-700 text-xl font-bold">Expected Coins: {course.expectedCoins}</p>
        {details && (
          <>
            <h2 className="text-2xl font-semibold mt-8 mb-2">Full Description</h2>
            <p className="mb-4 text-blue-800">{details.fullDescription}</p>
            <h2 className="text-xl font-semibold mb-2">Instructor</h2>
            <p className="mb-2 text-blue-700">{details.instructor}</p>
            <h2 className="text-xl font-semibold mb-2">Prerequisites</h2>
            <p className="mb-2 text-blue-700">{details.prerequisites}</p>
            <h2 className="text-xl font-semibold mb-2">Outcomes</h2>
            <ul className="mb-4">
              {details.outcomes.map((outcome: string, idx: number) => (
                <li key={idx} className="mb-1 text-blue-700">{outcome}</li>
              ))}
            </ul>
            <p className="mb-2"><span className="font-semibold">Duration:</span> {details.duration}</p>
            <p className="mb-2"><span className="font-semibold">Level:</span> {details.level}</p>
          </>
        )}
        {details && (
          <>
            <h2 className="text-2xl font-semibold mt-8 mb-2">Full Description</h2>
            <p className="mb-4 text-blue-800">{details.fullDescription}</p>
            <h2 className="text-xl font-semibold mb-2">Instructor</h2>
            <p className="mb-2 text-blue-700">{details.instructor}</p>
            <h2 className="text-xl font-semibold mb-2">Prerequisites</h2>
            <p className="mb-2 text-blue-700">{details.prerequisites}</p>
            <h2 className="text-xl font-semibold mb-2">Outcomes</h2>
            <ul className="mb-4">
              {details.outcomes.map((outcome: string, idx: number) => (
                <li key={idx} className="mb-1 text-blue-700">{outcome}</li>
              ))}
            </ul>
            <p className="mb-2"><span className="font-semibold">Duration:</span> {details.duration}</p>
            <p className="mb-2"><span className="font-semibold">Level:</span> {details.level}</p>
          </>
        )}
        <Link href="/courses" className="inline-block bg-blue-900 text-white px-4 py-2 rounded-xl hover:bg-blue-800 transition">Back to Courses</Link>
      </div>
    </div>
  );
}
