import React from "react";
import { Link } from "react-router-dom";

const PLATFORM_LINKS = [
  { label: "Projects", to: "/projects" },
  { label: "Hardware", to: "/hardware" },
  { label: "Events", to: "/events" },
  { label: "Articles", to: "/articles" },
];

interface LandingFooterProps {
  whatsappUrl?: string;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({
  whatsappUrl,
}) => {
  return (
    <footer className="border-t border-sees-teal/20 bg-sees-void">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 grid grid-cols-1 sm:grid-cols-3 gap-10">
        <div>
          <Link
            to="/"
            className="text-xl font-black tracking-tight text-sees-mint"
          >
            SEES <span className="text-sees-mustard">NEXUS</span>
          </Link>
          <p className="text-sm text-white/40 mt-3 max-w-xs">
            The centralized hub for the Society of Electrical and Electronics
            Students, UNILAG.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-black uppercase tracking-widest text-white/50 mb-4">
            Platform
          </h4>
          <ul className="space-y-2">
            {PLATFORM_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm text-white/60 hover:text-sees-mint transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-black uppercase tracking-widest text-white/50 mb-4">
            Community
          </h4>
          <ul className="space-y-2">
            <li>
              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/60 hover:text-sees-mint transition-colors"
                >
                  WhatsApp Community
                </a>
              ) : (
                <span
                  className="text-sm text-white/30 cursor-not-allowed"
                  title="WhatsApp invite link not set yet"
                >
                  WhatsApp Community
                </span>
              )}
            </li>
            <li>
              <Link
                to="/register"
                className="text-sm text-white/60 hover:text-sees-mint transition-colors"
              >
                Apply to Contribute
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-sees-teal/10">
        <p className="max-w-7xl mx-auto px-6 md:px-8 py-6 text-xs text-white/30">
          © {new Date().getFullYear()} SEES Nexus. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
