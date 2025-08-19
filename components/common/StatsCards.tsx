import React from 'react';
import { BookOpen, Clock, TrendingUp, Award, LucideIcon } from 'lucide-react';

interface CardData {
  title: string;
  subtitle: string;
  value: number;
  icon: LucideIcon;
  color: string;
  accent: string;
}

interface StatsCardsProps {
  cards: CardData[];
}

export function StatsCards({ cards }: StatsCardsProps) {
  // Ensure we always have exactly 4 cards
  const cardData = cards.length === 4 ? cards : [
    {
      title: "Total",
      subtitle: "Items",
      value: 0,
      icon: BookOpen,
      color: "blue",
      accent: "from-blue-500 to-blue-600"
    },
    {
      title: "Active",
      subtitle: "Items",
      value: 0,
      icon: Clock,
      color: "indigo",
      accent: "from-indigo-500 to-indigo-600"
    },
    {
      title: "Progress",
      subtitle: "Items",
      value: 0,
      icon: TrendingUp,
      color: "sky",
      accent: "from-sky-500 to-sky-600"
    },
    {
      title: "Complete",
      subtitle: "Items",
      value: 0,
      icon: Award,
      color: "blue",
      accent: "from-blue-500 to-blue-600"
    }
  ];

  return (
    <div className="flex items-center justify-center mb-2">
      <div className="w-full">
        {/* Full Width Card Container - Like Window Panes */}
        <div className="grid grid-cols-4 h-24 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-white/40 overflow-hidden">
          {cardData.map((card, index) => {
            const IconComponent = card.icon;
            return (
                <div
                key={index}
                className={`
                  relative group cursor-pointer transition-all duration-700 hover:bg-white/90
                  ${index < 3 ? 'border-r border-slate-200/30' : ''}
                  flex flex-col items-center justify-center p-2
                  hover:shadow-inner
                `}
              >
                {/* Animated Background Overlay */}
                <div className={`
                  absolute inset-0 bg-gradient-to-br ${card.accent} opacity-0 
                  group-hover:opacity-5 transition-opacity duration-500
                `}></div>

                {/* Top Floating Element */}
                <div className={`
                  absolute top-4 right-4 w-8 h-8 rounded bg-gradient-to-br ${card.accent}
                  flex items-center justify-center shadow-lg transform rotate-45
                  group-hover:rotate-0 group-hover:scale-110 transition-all duration-500 opacity-20
                  group-hover:opacity-100
                `}>
                  <IconComponent className="w-4 h-4 text-white transform -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                </div>

                {/* Main Content */}
                <div className="relative z-10 text-center">
                  {/* Large Number */}
                  <div className={`
                    text-2xl font-black text-slate-800 mb-1 leading-none
                    group-hover:text-${card.color}-600 transition-colors duration-300
                  `}>
                    {card.value}
                  </div>

                  {/* Title */}
                  <div className={`
                    text-xs font-bold text-slate-700 uppercase tracking-wider
                    group-hover:text-${card.color}-700 transition-colors duration-300
                  `}>
                    {card.title}
                  </div>

                  {/* Subtitle */}
                  <div className="text-xs text-slate-500 font-medium">
                    {card.subtitle}
                  </div>
                </div>                {/* Bottom Progress Line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100">
                  <div className={`
                    h-full bg-gradient-to-r ${card.accent} transform scale-x-0 origin-left
                    group-hover:scale-x-100 transition-transform duration-700 ease-out
                  `}></div>
                </div>

                {/* Side Accent */}
                <div className={`
                  absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${card.accent}
                  transform scale-y-0 origin-top group-hover:scale-y-100 
                  transition-transform duration-500 delay-200
                `}></div>

                {/* Floating Particles Effect */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`
                        absolute w-0.5 h-0.5 bg-${card.color}-400 rounded-full opacity-0
                        group-hover:opacity-60 transition-all duration-1000
                        group-hover:animate-ping
                      `}
                      style={{
                        top: `${20 + i * 25}%`,
                        left: `${15 + i * 30}%`,
                        animationDelay: `${i * 300}ms`
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};