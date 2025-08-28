import { FeatureCard } from "@/components/common/FeatureCard"
import { features } from "@/data/constants"

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-blue-900 mb-4">Why Choose EduNex?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We provide everything you need to succeed in your learning journey
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
