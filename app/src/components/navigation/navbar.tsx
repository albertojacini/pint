"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Menu, X, Info } from "lucide-react";
import { Logo } from "./logo";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left Section: Logo */}
          <Logo />

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Search Icon */}
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Search className="w-5 h-5 text-gray-600" />
            </button>

            {/* Hamburger Menu */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-2">
            <Link
              href="/pe"
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Entities
            </Link>
            <Link
              href="/ideas"
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Ideas
            </Link>
            <Link
              href="/projects"
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Projects
            </Link>
            <Link
              href="/how-it-works"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Info className="w-4 h-4" />
              How it works
            </Link>

            <div className="border-t border-gray-100 pt-4 mt-4 space-y-2">
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-blue-600 hover:bg-gray-50 rounded-lg transition-colors font-medium"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium text-center"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
