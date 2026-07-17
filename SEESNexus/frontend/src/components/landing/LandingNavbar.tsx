import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";

const NAV_LINKS = [
  { label: "Network", to: "/projects" },
  { label: "Inventory", to: "/hardware" },
  { label: "Protocol", to: "/events" },
];

export const LandingNavbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "bg-sees-forest/80 backdrop-blur-sees border-b border-sees-teal/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8 h-20 flex items-center justify-between">
        <Link
          to="/"
          className="text-xl font-black tracking-tight text-sees-mint"
        >
          SEES <span className="text-sees-mustard">NEXUS</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-semibold uppercase tracking-widest text-white/70">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="hover:text-sees-mint transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="hidden sm:inline text-sm font-semibold text-white/70 hover:text-sees-mint transition-colors"
          >
            Login
          </Link>
          <Link to="/register">
            <Button variant="secondary" size="sm">
              Register
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};
