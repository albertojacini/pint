"use client";

import Link from "next/link";
import { Search, Menu, Info } from "lucide-react";
import { Logo } from "./logo";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between h-16">
          {/* Left Section: Logo */}
          <div className="flex items-center gap-8">
            <Logo />

            {/* Desktop Search Box */}
            <div className="hidden md:flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2 w-64 lg:w-80">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Right Section: Links and Buttons */}
          <div className="flex items-center gap-4">
            {/* How it works - Desktop only */}
            <Link
              href="/how-it-works"
              className="hidden md:flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Info className="w-4 h-4" />
              <span>How it works</span>
            </Link>

            {/* Auth Buttons - Desktop */}
            <Link
              href="/login"
              className="hidden md:block text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="hidden md:block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
            >
              Sign Up
            </Link>

            {/* Mobile: Search Icon */}
            <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Search className="w-5 h-5 text-gray-600" />
            </button>

            {/* Hamburger Menu */}
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Main Navigation - Desktop only */}
        <div className="hidden md:flex items-center gap-8 border-t border-gray-100 h-12">
          <Link
            href="/entities"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Entities
          </Link>
          <Link
            href="/ideas"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Ideas
          </Link>
          <Link
            href="/projects"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Projects
          </Link>
        </div>
      </div>
    </nav>
  );
}
