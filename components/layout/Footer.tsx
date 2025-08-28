import Link from "next/link"
import { Logo } from "@/components/common/Logo"
import { footerSections } from "@/data/constants"

export function Footer() {
  return (
    <footer className="bg-white border-t border-blue-100 pt-10 pb-4">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <Logo className="mb-4" />
            <p className="text-gray-600">Empowering learners worldwide with quality education.</p>
          </div>
          
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold text-blue-900 mb-4">{section.title}</h3>
              <ul className="space-y-2 text-gray-600">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="hover:text-blue-600"
                      {...(link.external && { target: "_blank", rel: "noopener noreferrer" })}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="border-t border-blue-100 mt-8 pt-4 text-center text-gray-600">
          <p>&copy; 2024 EduNex. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
