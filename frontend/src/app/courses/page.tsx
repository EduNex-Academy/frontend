"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { courses } from "../data/coursedata";

export default function CoursesPage() {
  const [searchInput, setSearchInput] = useState("");
  const [filteredCourses, setFilteredCourses] = useState(courses);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Get unique categories from courses
  const categories = Array.from(new Set(courses.map((c) => c.category.toLowerCase())));

  // Filter category suggestions based on input
  const suggestions = searchInput
    ? categories.filter((cat) => cat.includes(searchInput.toLowerCase()))
    : categories;

  // Filter courses by category on search or suggestion click (no reload here)
  const filterByCategory = (category: string) => {
    setSearchInput(category);
    setFilteredCourses(
      courses.filter((c) => c.category.toLowerCase().includes(category.toLowerCase()))
    );
    setShowSuggestions(false);
  };

  // Search button click: filter and reload
  const handleSearchClick = () => {
    filterByCategory(searchInput);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-white text-blue-900 px-4 py-16 md:px-10">
      <h1 className="text-4xl font-bold mb-8 text-center">Explore Our Courses</h1>

      <div className="mb-8 max-w-xl mx-auto relative">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search by category..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setShowSuggestions(true);
            }}
            onBlur={() => {
              // Delay hiding to allow click on suggestion
              setTimeout(() => setShowSuggestions(false), 100);
            }}
            onFocus={() => setShowSuggestions(true)}
            className="flex-grow px-4 py-2 border border-blue-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            autoComplete="off"
          />

          <button
            onClick={handleSearchClick}
            className="w-24 px-4 py-2 bg-blue-900 text-white rounded-xl hover:bg-blue-800 transition"
          >
            Search
          </button>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border border-blue-300 rounded-md max-h-40 overflow-auto mt-1 shadow-md">
            {suggestions.map((cat) => (
              <li
                key={cat}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent input blur before click
                  filterByCategory(cat); // No reload here
                }}
                className="cursor-pointer px-4 py-2 hover:bg-blue-100 capitalize"
              >
                {cat}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-blue-50 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-300"
            >
              <Image
                src={course.image}
                alt={course.title}
                width={500}
                height={300}
                className="w-full h-56 object-cover"
              />
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-2">{course.title}</h2>
                <p className="text-blue-800 mb-4">{course.description}</p>
                <Link
                  href={`/courses/${course.id}`}
                  className="inline-block bg-blue-900 text-white px-4 py-2 rounded-xl hover:bg-blue-800 transition"
                >
                  Learn More
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center col-span-full text-lg text-gray-500">No courses found.</p>
        )}
      </div>
    </div>
  );
}
