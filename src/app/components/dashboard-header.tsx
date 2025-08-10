// components/dashborad-header.tsx
import React from "react";
import Image, { StaticImageData } from "next/image";
import TempImg from "../../images/ai.png"; // example profile pic
import {students} from "../data/students";


type Props = {
  name?: string;
  avatarSrc?: string | StaticImageData;
  subtitle?: string;
};

export default function DashboardHeader({
  name = "Adeepa Shashiprabhath",
  avatarSrc = TempImg,
  subtitle = "Welcome back — here's what's new",
}: Props) {
  return (
    <div className="w-full bg-[#0a1d3a] rounded-xl shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        {/* Left: Welcome text */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
            Welcome <span className="text-blue-300">{name} !</span>
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm md:text-base text-blue-200/80">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right: Avatar */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm text-blue-100 font-medium">{name}</div>
            <div className="text-xs text-blue-300">Student</div>
          </div>
          <div className="w-14 h-14 rounded-full overflow-hidden bg-blue-700 ring-2 ring-blue-500/50 shadow-md">
            <Image
              src={avatarSrc}
              alt={`${name} avatar`}
              width={56}
              height={56}
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
