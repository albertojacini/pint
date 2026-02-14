import Link from "next/link";

const footerLinks = [
  { label: "About", href: "/about" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Contact", href: "/contact" },
  { label: "GitHub", href: "https://github.com/pint-platform/pint" },
];

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mb-16 md:mb-0">
      <div className="container py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
            <span className="text-sm font-semibold text-gray-900">Pint</span>
            <nav className="flex flex-wrap gap-4">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Pint
          </p>
        </div>
      </div>
    </footer>
  );
}
