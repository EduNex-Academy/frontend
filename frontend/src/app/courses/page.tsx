import Image from "next/image";
import Link from "next/link";
import FullStack from "../../images/full_stack.jpg"
import DataScience from "../../images/ai.png"
import MobileApp from "../../images/mobile_app.webp"

const courses = [
  {
    id: 1,
    title: "Full-Stack Web Development",
    description: "Master front-end and back-end development using React, Node.js, and MongoDB.",
    image: FullStack,
  },
  {
    id: 2,
    title: "Data Science & AI",
    description: "Learn to analyze data, build machine learning models, and harness AI tools.",
    image: DataScience,
  },
  {
    id: 3,
    title: "Mobile App Development",
    description: "Create cross-platform mobile apps using Flutter and React Native.",
    image: MobileApp,
  },
];

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-white text-blue-900 px-4 py-16 md:px-10">
      <h1 className="text-4xl font-bold mb-8 text-center">Explore Our Courses</h1>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
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
        ))}
      </div>
    </div>
  );
}
