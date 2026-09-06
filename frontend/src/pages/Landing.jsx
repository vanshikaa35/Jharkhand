import { Link } from "react-router-dom";
import {
  Camera,
  Sparkles,
  Building2,
  Handshake,
  ListChecks,
  BarChart3,
  Bell,
} from "lucide-react";
import Button from "../components/Button.jsx";
import Tag from "../components/Tag.jsx";

const modules = [
  {
    icon: Camera,
    tone: "sky",
    title: "Report a problem",
    text: "Citizens, panchayats and local bodies submit challenges with photos, location and details.",
  },
  {
    icon: Sparkles,
    tone: "marigold",
    title: "AI sorts and routes it",
    text: "Every submission is categorised, checked for duplicates, and sent to the right university — automatically.",
  },
  {
    icon: Building2,
    tone: "blush",
    title: "Universities take it up",
    text: "Colleges review assigned challenges and form student-faculty teams to work on them.",
  },
  {
    icon: Handshake,
    tone: "sage",
    title: "Industry gets involved",
    text: "Startups, MSMEs and CSR partners mentor, fund and help build the solution.",
  },
  {
    icon: ListChecks,
    tone: "sky",
    title: "Progress is tracked",
    text: "Milestones, approvals and outcomes are visible at every stage of the project.",
  },
  {
    icon: BarChart3,
    tone: "marigold",
    title: "District dashboard",
    text: "Government departments see live stats on challenges, participation and impact.",
  },
];

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-[420px] h-[420px] bg-marigold-light rounded-blob opacity-70 blur-sm" />
        <div className="absolute top-40 -left-20 w-64 h-64 bg-sky rounded-blob opacity-60" />

        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Tag tone="marigold">Government of Jharkhand · Pilot</Tag>
            <h1 className="mt-5 text-4xl sm:text-5xl font-semibold leading-[1.1] tracking-tight">
              Every local problem deserves someone working on it.
            </h1>
            <p className="mt-5 text-ink-soft text-lg max-w-md">
              Sajha Samadhan connects citizens who spot a problem with the
              universities and companies who can actually solve it — no
              phone calls, no dead ends.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/submit">
                <Button variant="primary">Report a problem</Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="ghost">See district impact</Button>
              </Link>
            </div>
          </div>

          {/* Live-looking submission preview card */}
          <div className="bg-cream rounded-3xl shadow-[0_20px_60px_-20px_rgba(30,58,50,0.25)] p-6 border border-sage-dark/60">
            <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-3">
              Just submitted
            </p>
            <p className="font-medium text-ink mb-4">
              "No water supply in our ward for the last 5 days, borewell is
              also dry."
            </p>
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <Tag tone="sky">Water</Tag>
              <Tag tone="blush">Ranchi, Ward 4</Tag>
            </div>
            <div className="flex items-center gap-2 text-sm text-marigold-dark font-semibold">
              <Sparkles size={16} />
              Routed to BIT Mesra — water-tech incubation cell
            </div>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-semibold mb-2">How it works</h2>
        <p className="text-ink-soft mb-10 max-w-xl">
          One problem moves through seven stages, from a citizen's phone to
          a working solution on the ground.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map(({ icon: Icon, tone, title, text }) => (
            <div
              key={title}
              className="bg-cream rounded-2xl p-6 border border-sage-dark/50 hover:border-marigold/40 transition-colors"
            >
              <span
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                  tone === "marigold"
                    ? "bg-marigold-light text-marigold-dark"
                    : tone === "sky"
                    ? "bg-sky text-ink"
                    : tone === "blush"
                    ? "bg-blush text-ink"
                    : "bg-sage-dark text-ink"
                }`}
              >
                <Icon size={20} strokeWidth={2} />
              </span>
              <h3 className="font-display text-lg font-semibold mb-1.5">
                {title}
              </h3>
              <p className="text-sm text-ink-soft leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA strip */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="bg-ink rounded-3xl px-8 py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-cream text-2xl font-semibold mb-2">
              Have a problem in your area?
            </h2>
            <p className="text-cream/70 max-w-md">
              It takes two minutes to submit, and it goes straight to
              people who can act on it.
            </p>
          </div>
          <Link to="/submit">
            <Button variant="primary">
              <Bell size={16} /> Report now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
