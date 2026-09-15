import { useLocation, Link, Navigate } from "react-router-dom";
import {
  CheckCircle2,
  AlertTriangle,
  Copy,
  Sparkles,
} from "lucide-react";

import Button from "../components/Button.jsx";
import Tag from "../components/Tag.jsx";

export default function RoutingResult() {
  const { state } = useLocation();

  // Backend response is stored in state.problem
  if (!state?.problem) {
    return <Navigate to="/submit" replace />;
  }

  const problem = state.problem;

  const {
    description,
    location,
    category,
    confidence,
    duplicateFound,
    duplicateOf,
    assignedCollege,
    recommendedSolutions,
    routingReason,
    humanReview,
    status,
  } = problem;

  const confidencePct = Math.round(
    (confidence || 0) * 100
  );

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">

      {/* Header */}
      <div className="flex items-center gap-2 text-marigold-dark font-semibold mb-2">
        <Sparkles size={18} />
        Sorted automatically
      </div>

      <h1 className="text-3xl font-semibold mb-8">
        Here's what happened
      </h1>

      {/* Original submission */}
      <div className="bg-cream rounded-2xl border border-sage-dark/60 p-5 mb-6">
        <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-2">
          Your report
        </p>

        <p className="text-ink mb-3">
          "{description}"
        </p>

        <Tag tone="blush">
          {location}
        </Tag>
      </div>

      {/* Category */}
      <div className="bg-cream rounded-2xl border border-sage-dark/60 p-5 mb-6">

        <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-3">
          Category detected
        </p>

        <div className="flex items-center justify-between flex-wrap gap-3">

          <Tag tone="marigold">
            {category}
          </Tag>

          <div className="flex items-center gap-2">

            <div className="w-32 h-2 rounded-full bg-sage-dark overflow-hidden">
              <div
                className="h-full bg-marigold"
                style={{
                  width: `${confidencePct}%`,
                }}
              />
            </div>

            <span className="text-sm text-ink-soft">
              {confidencePct}% confident
            </span>

          </div>

        </div>

        {/* Human review */}
        {humanReview && (
          <div className="mt-4 flex items-start gap-2 text-sm bg-blush/50 text-ink rounded-xl p-3">

            <AlertTriangle
              size={16}
              className="mt-0.5 shrink-0 text-marigold-dark"
            />

            <p>
              Confidence is below the required
              threshold, so this report has been
              flagged for manual review.
            </p>

          </div>
        )}

      </div>

      {/* Duplicate */}
      {duplicateFound && (
        <div className="bg-cream rounded-2xl border border-sage-dark/60 p-5 mb-6">

          <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-3 flex items-center gap-1.5">

            <Copy size={14} />

            Similar report found

          </p>

          <p className="text-sm text-ink-soft">
            This report appears to be related
            to an existing report.
          </p>

          {duplicateOf && (
            <p className="text-xs text-ink-soft mt-2">
              Existing report ID: {duplicateOf}
            </p>
          )}

        </div>
      )}

      {/* Routing */}
      <div className="bg-cream rounded-2xl border border-sage-dark/60 p-5 mb-8">

        <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-3">
          Routed to
        </p>

        {assignedCollege ? (

          <div className="rounded-xl p-4 border border-marigold bg-marigold-light/40">

            <div className="flex items-center gap-2 mb-1">

              <CheckCircle2
                size={16}
                className="text-marigold-dark"
              />

              <span className="font-semibold">
                {typeof assignedCollege === "string"
                  ? assignedCollege
                  : assignedCollege.institution ||
                    assignedCollege.college ||
                    "Institution assigned"}
              </span>

            </div>

            {typeof assignedCollege === "object" &&
              assignedCollege.district && (
                <p className="text-xs text-ink-soft">
                  {assignedCollege.district}
                </p>
              )}

            {typeof assignedCollege === "object" &&
              assignedCollege.role && (
                <p className="text-sm text-ink-soft mt-2">
                  {assignedCollege.role}
                </p>
              )}

          </div>

        ) : (

          <p className="text-sm text-ink-soft">
            No institution was automatically
            assigned. This report requires
            manual review.
          </p>

        )}

        {/* Routing reason */}
        {routingReason && (
          <div className="mt-4">

            <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-1">
              Why?
            </p>

            <p className="text-sm text-ink-soft">
              {routingReason}
            </p>

          </div>
        )}

      </div>

      {/* Recommended solutions */}
      {recommendedSolutions &&
        recommendedSolutions.length > 0 && (

        <div className="bg-cream rounded-2xl border border-sage-dark/60 p-5 mb-8">

          <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-4">
            Recommended solutions
          </p>

          <div className="space-y-3">

            {recommendedSolutions.map(
              (solution, index) => (

              <div
                key={solution.id || index}
                className="bg-sage/60 rounded-xl p-4"
              >

                <p className="font-semibold">
                  {solution.solutionTitle ||
                    "Recommended solution"}
                </p>

                {solution.implementer && (
                  <p className="text-sm text-ink-soft mt-2">
                    <strong>Implementer:</strong>{" "}
                    {solution.implementer}
                  </p>
                )}

                {solution.whereImplemented && (
                  <p className="text-sm text-ink-soft mt-1">
                    <strong>Where implemented:</strong>{" "}
                    {solution.whereImplemented}
                  </p>
                )}

                {solution.outcome && (
                  <p className="text-sm text-ink-soft mt-1">
                    <strong>Outcome:</strong>{" "}
                    {solution.outcome}
                  </p>
                )}

              </div>

            )
          )}

          </div>

        </div>

      )}

      {/* Status */}
      <div className="text-sm text-ink-soft mb-6">

        Current status:

        <span className="font-semibold text-ink ml-1">
          {status?.replace(/_/g, " ")}
        </span>

      </div>

      {/* Buttons */}
      <div className="flex gap-3">

        <Link to="/submit">
          <Button variant="ghost">
            Report another
          </Button>
        </Link>

        <Link to="/dashboard">
          <Button variant="primary">
            View dashboard
          </Button>
        </Link>

      </div>

    </div>
  );
}