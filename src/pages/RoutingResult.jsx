import { useLocation, Link, Navigate } from "react-router-dom";
import { CheckCircle2, AlertTriangle, Copy, Sparkles } from "lucide-react";
import Button from "../components/Button.jsx";
import Tag from "../components/Tag.jsx";

export default function RoutingResult() {
  const { state } = useLocation();
  if (!state) return <Navigate to="/submit" replace />;

  const { text, location, result } = state;
  const { category, confidence, matches, duplicates, needsReview } = result;
  const confidencePct = Math.round(confidence * 100);

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="flex items-center gap-2 text-marigold-dark font-semibold mb-2">
        <Sparkles size={18} />
        Sorted automatically
      </div>
      <h1 className="text-3xl font-semibold mb-8">Here's what happened</h1>

      {/* Original submission */}
      <div className="bg-cream rounded-2xl border border-sage-dark/60 p-5 mb-6">
        <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-2">
          Your report
        </p>
        <p className="text-ink mb-3">"{text}"</p>
        <Tag tone="blush">{location}</Tag>
      </div>

      {/* Category + confidence */}
      <div className="bg-cream rounded-2xl border border-sage-dark/60 p-5 mb-6">
        <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-3">
          Category detected
        </p>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Tag tone="marigold">{category}</Tag>
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 rounded-full bg-sage-dark overflow-hidden">
              <div
                className="h-full bg-marigold"
                style={{ width: `${confidencePct}%` }}
              />
            </div>
            <span className="text-sm text-ink-soft">{confidencePct}% confident</span>
          </div>
        </div>

        {needsReview && (
          <div className="mt-4 flex items-start gap-2 text-sm bg-blush/50 text-ink rounded-xl p-3">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-marigold-dark" />
            <p>
              Confidence is below our threshold, so this has also been
              flagged for manual review instead of being auto-routed blindly.
            </p>
          </div>
        )}
      </div>

      {/* Duplicate detection */}
      {duplicates.length > 0 && (
        <div className="bg-cream rounded-2xl border border-sage-dark/60 p-5 mb-6">
          <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Copy size={14} /> Similar reports nearby
          </p>
          <p className="text-sm text-ink-soft mb-3">
            This looks related to {duplicates.length} other report
            {duplicates.length > 1 ? "s" : ""} — grouping them shows how
            widespread the issue is.
          </p>
          <ul className="space-y-2">
            {duplicates.map((d) => (
              <li
                key={d.id}
                className="text-sm bg-sage/60 rounded-xl px-3 py-2 flex justify-between gap-3"
              >
                <span>"{d.text}"</span>
                <span className="text-ink-soft shrink-0">{d.district}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Routing */}
      <div className="bg-cream rounded-2xl border border-sage-dark/60 p-5 mb-8">
        <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-3">
          Routed to
        </p>
        {matches.length === 0 ? (
          <p className="text-sm text-ink-soft">
            No strong institutional match yet — sent to the state
            coordination team for manual assignment.
          </p>
        ) : (
          <ul className="space-y-3">
            {matches.map((college, i) => (
              <li
                key={college.id}
                className={`rounded-xl p-4 border ${
                  i === 0
                    ? "border-marigold bg-marigold-light/40"
                    : "border-sage-dark/50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {i === 0 && <CheckCircle2 size={16} className="text-marigold-dark" />}
                  <span className="font-semibold">{college.name}</span>
                  <span className="text-xs text-ink-soft">· {college.district}</span>
                </div>
                <p className="text-sm text-ink-soft">{college.note}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex gap-3">
        <Link to="/submit">
          <Button variant="ghost">Report another</Button>
        </Link>
        <Link to="/dashboard">
          <Button variant="primary">View dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
