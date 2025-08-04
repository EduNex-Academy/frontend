import Image from "next/image";
import Link from "next/link";
import CoverImg from '../../../src/images/cover.jpg'

export function HeroSection() {
  return (
    //<section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-white text-blue-900">
    <section className="w-full py-8 md:py-16 lg:py-20 xl:py-24 bg-white text-blue-900">
      <div className="container px-4 md:px-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_400px] lg:gap-6 xl:grid-cols-[1fr_550px]">
          <div className="flex flex-col justify-center space-y-4 text-center lg:text-left">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl text-blue-900">
                Unlock Your Potential with Expert-Led Courses
              </h1>
              <p className="max-w-[700px] text-blue-700 md:text-xl mx-auto lg:mx-0">
                Dive into a world of knowledge with our comprehensive online courses, designed to help you master new
                skills and advance your career.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center lg:justify-start">
              <Link href="#" passHref>
                <button className="inline-flex h-10 items-center justify-center rounded-md bg-blue-900 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-700 disabled:pointer-events-none disabled:opacity-50">
                  Browse Courses
                </button>
              </Link>
              <Link href="#" passHref>
                <button
                  className="inline-flex h-10 items-center justify-center rounded-md border border-blue-900 px-8 text-sm font-medium text-blue-900 hover:bg-blue-900 hover:text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-700 disabled:pointer-events-none disabled:opacity-50 bg-transparent"
                >
                  Get Started
                </button>
              </Link>
            </div>
          </div>
          <Image
            src={CoverImg}
            width={550}
            height={400}
            alt="Online Course Illustration"
            className="aspect-[1.375/1] rounded-xl object-cover sm:w-full lg:order-last lg:mr-8"
          />
        </div>
      </div>
    </section>
  );
}
