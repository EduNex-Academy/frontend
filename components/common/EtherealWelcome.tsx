import React, { useState, useEffect } from 'react';
import { Sparkles, CreditCard, Radius } from 'lucide-react';
import { useRouter } from "next/navigation"

export default function EtherealWelcome() {
  const [timeOffset, setTimeOffset] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOffset(prev => prev + 0.02);
    }, 16);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative overflow-hidden rounded-3xl p-8"
      style={{
        background: `
          linear-gradient(45deg, 
            rgba(29, 78, 216, 1) 0%, 
            rgba(37, 99, 235, 0.9) 25%, 
            rgba(59, 130, 246, 0.8) 50%, 
            rgba(30, 64, 175, 0.9) 75%, 
            rgba(30, 58, 138, 1) 100%
          )
        `,
        minHeight: '200px'
      }}
    >
      {/* Animated Blob Background */}
      <div className="absolute inset-0 opacity-40">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full mix-blend-screen filter blur-xl animate-pulse"
            style={{
              width: `${60 + i * 20}px`,
              height: `${60 + i * 20}px`,
              left: `${(i * 17 + Math.sin(timeOffset + i) * 20) % 100}%`,
              top: `${(i * 23 + Math.cos(timeOffset + i * 0.7) * 15) % 100}%`,
              background: `hsl(${220 + (i * 15 + timeOffset * 15) % 40}, 90%, ${50 + Math.sin(timeOffset + i) * 15}%)`,
              transform: `scale(${1 + Math.sin(timeOffset + i) * 0.3})`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`
            }}
          />
        ))}
      </div>

      {/* Floating Sparkles */}
      <div className="absolute top-6 right-6">
        <div className="relative">
          <Radius
            className="h-12 w-12 text-white"
            style={{
              filter: `drop-shadow(0 0 10px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 20px rgba(59, 130, 246, 0.6))`,
              transform: `rotate(${timeOffset * 20}deg) scale(${1 + Math.sin(timeOffset * 2) * 0.2})`
            }}
          />
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-80"
              style={{
                left: `${Math.cos(timeOffset * 2 + i) * 30 + 20}px`,
                top: `${Math.sin(timeOffset * 2 + i) * 30 + 20}px`,
                transform: `scale(${0.5 + Math.sin(timeOffset * 3 + i) * 0.5})`,
                boxShadow: '0 0 4px rgba(255,255,255,0.8)'
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-white">
        <div
          className="mb-6"
          style={{
            transform: `translateY(${Math.sin(timeOffset * 0.5) * 3}px)`
          }}
        >
          <h1
            className="text-4xl font-bold mb-3 bg-gradient-to-r from-white via-blue-50 to-blue-100 bg-clip-text text-transparent"
            style={{
              textShadow: '0 0 30px rgba(255,255,255,0.5)',
              transform: `perspective(1000px) rotateX(${Math.sin(timeOffset * 0.3) * 2}deg)`
            }}
          >
            Welcome back, John!
          </h1>
          <p
            className="text-lg text-blue-50 mb-6 leading-relaxed"
            style={{
              textShadow: '0 0 20px rgba(219, 234, 254, 0.6)',
              opacity: 0.95 + Math.sin(timeOffset * 0.8) * 0.05
            }}
          >
            Step into the extraordinary realm of infinite possibilities.<br />
            Your journey transcends the ordinary.
          </p>
        </div>

        {/* Unique Button */}
        <div className="flex">
          <button
            onClick={() => router.push("/student/subscription")} // redirect
            className="relative overflow-hidden px-6 py-3 rounded-2xl font-semibold text-blue-900 transition-all duration-300 hover:scale-105"
            style={{
              background: `
        linear-gradient(45deg, 
          rgba(255,255,255,0.8) 0%, 
          rgba(240,248,255,0.9) 50%, 
          rgba(224,242,254,0.9) 100%
        )
      `,
              border: '1px solid rgba(191,219,254,0.8)',
              boxShadow: `
        0 4px 20px rgba(191,219,254,0.7),
        inset 0 1px 0 rgba(255,255,255,0.6)
      `
            }}
          >
            <div className="flex items-center space-x-3">
              <CreditCard
                className="h-5 w-5 text-blue-700"
                style={{
                  filter: `drop-shadow(0 0 4px rgba(96,165,250,0.5))`
                }}
              />
              <span className="tracking-wide">Manage Subscription</span>
            </div>

            {/* Hover overlay shimmer effect */}
            <span className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
          </button>
        </div>
      </div>
    </div>
  );
};