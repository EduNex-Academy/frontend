import { Code, Palette, Megaphone, Brain, Camera, Music } from "lucide-react";

export function CourseCategories() {
  const categories = [
    { name: "Programming", icon: Code, description: "Learn to code in various languages." },
    { name: "Design", icon: Palette, description: "Master UI/UX, graphic design, and more." },
    { name: "Marketing", icon: Megaphone, description: "Grow your business with digital marketing." },
    { name: "Data Science", icon: Brain, description: "Explore data analysis and machine learning." },
    { name: "Photography", icon: Camera, description: "Capture stunning photos and videos." },
    { name: "Music Production", icon: Music, description: "Create your own beats and melodies." },
  ];

  return (
    //<section className="w-full py-12 md:py-24 lg:py-32 bg-white text-blue-900">
    <section className="w-full py-6 md:py-12 lg:py-16 bg-white text-blue-900">
      <div className="container px-4 md:px-6 text-center">
        <div className="space-y-4 mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-blue-900">
            Explore Our Diverse Course Categories
          </h2>
          <p className="max-w-[900px] mx-auto text-blue-700 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Find the perfect course to kickstart your learning journey or enhance your existing skills.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div
                key={index}
                className="border border-blue-200 rounded-xl p-6 text-center hover:border-blue-600 transition-colors duration-300 cursor-pointer shadow-sm"
              >
                <Icon className="mx-auto mb-4 h-12 w-12 text-blue-800" />
                <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                <p className="text-blue-700">{category.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
