// components/Sidebar.tsx
import React from "react";
import Link from "next/link";

type NavItem = {
  href: string;
  label: string;
  icon?: React.ReactNode;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/courses", label: "Courses" },
  { href: "/grades", label: "Grades" },
  { href: "/settings", label: "Settings" },
];

export default function Sidebar() {
  return (
    <aside className="w-80 bg-[#072042] text-blue-100 min-h-screen px-6 py-8 hidden lg:block">
      

      <nav className="space-y-3">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="block">
            <div className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-blue-800/30 transition">
              {/* icon slot (optional) */}
              {/* <span className="w-6 h-6">ICON</span> */}
              <span className="text-lg font-medium text-blue-100">{item.label}</span>
            </div>
          </Link>
        ))}
      </nav>

      
    </aside>
  );
}
