'use client';
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const updateProgress = () => {
      // Fades/blurs in continuously over the first 10px of scroll — short enough
      // that the very first bit of scroll already produces a visible change,
      // instead of a "dead zone" before anything happens.
      setScrollProgress(Math.min(window.scrollY / 10, 1));
      ticking = false;
    };

    // rAF-throttled: native scroll events can fire far more often than the
    // display can paint, so without this every single event was triggering
    // its own React re-render — that extra main-thread work while scrolling
    // through animated sections is what read as jank elsewhere on the page.
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateProgress);
        ticking = true;
      }
    };

    updateProgress();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrolled = scrollProgress > 0.2;

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 w-full max-w-full border-b border-white/20"
        style={{
          backgroundColor: `rgba(0, 0, 0, ${0.8 * scrollProgress})`,
          backdropFilter: `blur(${16 * scrollProgress}px)`,
          WebkitBackdropFilter: `blur(${16 * scrollProgress}px)`,
          borderBottomColor: `rgba(255, 255, 255, ${0.2 * scrollProgress})`,
          boxShadow: scrollProgress > 0.5 ? '0 4px 24px rgba(0,0,0,0.3)' : 'none',
          // These are set directly from JS on every scroll event, so without an
          // explicit transition they'd jump per-event instead of interpolating —
          // that's what read as a "pause"/stutter rather than a smooth fade.
          transition: 'background-color 150ms ease-out, backdrop-filter 150ms ease-out, border-color 150ms ease-out, box-shadow 150ms ease-out',
          // Pre-promotes this element to its own GPU compositing layer at mount
          // time instead of paying that cost mid-scroll — that first-time layer
          // promotion is what caused the initial-scroll jank before it smoothed out.
          willChange: 'background-color, backdrop-filter',
        }}
      >
        <ul
          className={`flex flex-row justify-between items-center px-4 text-white w-full max-w-full transition-[padding] duration-300 ${
            scrolled ? 'py-2.5' : 'py-4'
          }`}
        >
          <li className="shrink-0">
            <Link href="/">
              {/*
                Real height classes here, not a transform:scale() — a scale transform
                is paint-only and doesn't shrink the element's layout box, so it was
                never actually reducing the navbar's height.
              */}
              <Image
                src="/logo.png"
                alt="FOSS Logo"
                width={140}
                height={50}
                className={`cursor-pointer hover:opacity-80 transition-all duration-300 w-auto ${
                  scrolled ? 'h-18' : 'h-30'
                }`}
                priority
              />
            </Link>
          </li>
          <li className="flex items-center">
            {/* Desktop links (unchanged) */}
            <div className="hidden md:flex flex-row gap-8">
              <a href="/" className="text-lg hover:text-gray-300 transition-colors">Home</a>
              <a href="#about" className="text-lg hover:text-gray-300 transition-colors">About</a>
              <a href="/blogs" className="text-lg hover:text-gray-300 transition-colors">Blog</a>
              <a href="/team" className="text-lg hover:text-gray-300 transition-colors">Team</a>
              <a href="/contact" className="text-lg hover:text-gray-300 transition-colors">Contact</a>
              <a href="/gallery" className="text-lg hover:text-gray-300 transition-colors">Gallery</a>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Toggle menu"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6h18M3 12h18M3 18h18" />
                )}
              </svg>
            </button>
          </li>
        </ul>

        {/* Mobile dropdown */}
        {open && (
          <div className="md:hidden absolute top-full left-0 right-0 border-t border-white/20 bg-black/50 backdrop-blur-lg text-white shadow-lg">
            <ul className="px-4 py-3 space-y-2">
              <li><a href="/" className="block py-2 hover:text-gray-300 transition-colors" onClick={() => setOpen(false)}>Home</a></li>
              <li><a href="#about" className="block py-2 hover:text-gray-300 transition-colors" onClick={() => setOpen(false)}>About</a></li>
              <li><a href="/blogs" className="block py-2 hover:text-gray-300 transition-colors" onClick={() => setOpen(false)}>Blog</a></li>
              <li><a href="/team" className="block py-2 hover:text-gray-300 transition-colors" onClick={() => setOpen(false)}>Team</a></li>
              <li><a href="/contact" className="block py-2 hover:text-gray-300 transition-colors" onClick={() => setOpen(false)}>Contact</a></li>
              <li><a href="/gallery" className="block py-2 hover:text-gray-300 transition-colors" onClick={() => setOpen(false)}>Gallery</a></li>
            </ul>
          </div>
        )}
      </nav>
    </>
  );
}
