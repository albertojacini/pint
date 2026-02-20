import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("footer");

  const footerLinks = [
    { label: t("about"), href: "/about" },
    { label: t("howItWorks"), href: "/how-it-works" },
    { label: t("contact"), href: "/contact" },
    { label: t("github"), href: "https://github.com/pint-platform/pint" },
  ];

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
