import React from "react";
import Image, { StaticImageData } from "next/image";

type EnrolledCourseCardProps = {
  title: string;
  category: string;
  image: StaticImageData | string;
  description?: string;
  progress?: number; // percentage
  expectedCoins?: number;
  remainingCoins?: number;
};

export default function EnrolledCourseCard({
  title,
  category,
  image,
  description,
  progress,
  expectedCoins,
  remainingCoins,
}: EnrolledCourseCardProps) {
  return (
    <div className="bg-[#0a1d3a] rounded-xl shadow-md overflow-hidden border border-blue-800 hover:shadow-lg transition">
      {/* Course Image */}
      <div className="relative w-full h-40">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
        />
      </div>

      {/* Course Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-blue-300 capitalize">{category}</p>
        {typeof expectedCoins === "number" && (
          <p className="text-xs text-green-400 mt-1">Expected Coins: {expectedCoins}</p>
        )}
        {typeof remainingCoins === "number" && (
          <p className="text-xs text-yellow-400 mt-1">Remaining Coins Needed: {remainingCoins}</p>
        )}

        {description && (
          <p className="mt-2 text-sm text-blue-200/80 line-clamp-2">
            {description}
          </p>
        )}

        {/* Progress Bar */}
        {typeof progress === "number" && (
          <div className="mt-4">
            <div className="w-full bg-blue-900 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-blue-200 mt-1">{progress}% completed</p>
          </div>
        )}
      </div>
    </div>
  );
}
