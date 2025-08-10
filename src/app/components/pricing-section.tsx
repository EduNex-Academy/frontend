import { Check } from "lucide-react";

export function PricingSection() {
  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      description: "Perfect for trying out our platform.",
      features: ["Access to basic courses", "Limited community support", "Ad-supported learning"],
      buttonText: "Start for Free",
    },
    {
      name: "Pro",
      price: "$29",
      period: "/month",
      description: "Unlock full access to all premium content.",
      features: [
        "Unlimited course access",
        "Priority community support",
        "Ad-free experience",
        "Downloadable resources",
      ],
      buttonText: "Go Pro",
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "Tailored solutions for large organizations.",
      features: ["All Pro features", "Dedicated account manager", "Custom course development", "Team analytics"],
      buttonText: "Contact Sales",
    },
  ];

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-white text-blue-900">
      <div className="container px-4 md:px-6 text-center">
        <div className="space-y-4 mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-blue-900">
            Simple, Transparent Pricing
          </h2>
          <p className="max-w-[900px] mx-auto text-blue-700 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Choose the plan that best fits your learning needs or organizational goals.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className="flex flex-col justify-between rounded-lg p-6 shadow-lg border border-blue-900 bg-blue-900 text-white"
            >
              <header className="pb-4">
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className="text-blue-200">{plan.description}</p>
              </header>

              <div className="flex-1 py-4">
                <div className="text-4xl font-bold mb-4">
                  {plan.price}
                  <span className="text-lg font-normal text-blue-300">{plan.period}</span>
                </div>
                <ul className="space-y-2 text-left">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-white" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <footer className="pt-6">
                <button
                  className="w-full rounded-md px-4 py-2 font-semibold bg-white text-blue-900 hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700"
                >
                  {plan.buttonText}
                </button>
              </footer>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
