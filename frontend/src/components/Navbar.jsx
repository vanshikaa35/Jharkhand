import { Link, useLocation } from "react-router-dom";
import { Sprout } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/submit", label: "Report a problem" },
  { to: "/dashboard", label: "District dashboard" },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <header className="border-b border-sage-dark bg-cream/70 backdrop-blur sticky top-0 z-20">
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="w-8 h-8 rounded-blob bg-marigold-light flex items-center justify-center text-marigold-dark">
            <Sprout size={18} strokeWidth={2.2} />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            Sajha Samadhan
          </span>
        </Link>

        <div className="hidden sm:flex items-center gap-1">
          {links.map((link) => {
            const active = pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  active
                    ? "bg-ink text-cream"
                    : "text-ink-soft hover:bg-sage-dark/60"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <Link
          to="/submit"
          className="sm:hidden px-4 py-2 rounded-full text-sm font-semibold bg-marigold text-white"
        >
          Report
        </Link>
      </nav>
    </header>
  );
}
