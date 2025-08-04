import Image from "next/image";
import { Header } from "./components/header";
import { HeroSection } from "./components/hero-section";
import { CourseCategories } from "./components/course-categories";
import { PricingSection } from "./components/pricing-section";
import { Footer } from "./components/footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <CourseCategories/>
        <PricingSection/>
      </main>
      <Footer/>
    </div>
  );
}
