import { useEffect, useState } from "react";

import {
  FileText,
  Building2,
  Clock,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import Tag from "../components/Tag.jsx";

import {
  getProblems,
  getProblemStats,
} from "../services/aiRouter.js";


export default function Dashboard() {

  const [stats, setStats] = useState(null);

  const [problems, setProblems] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  useEffect(() => {

    async function loadDashboard() {

      try {

        const statsResponse =
          await getProblemStats();

        const problemsResponse =
          await getProblems();


        setStats(
          statsResponse.stats
        );

        setProblems(
          problemsResponse.problems || []
        );

      } catch (err) {

        console.error(
          "Dashboard error:",
          err
        );

        setError(
          err.message ||
          "Failed to load dashboard."
        );

      } finally {

        setLoading(false);

      }

    }

    loadDashboard();

  }, []);


  // -----------------------------
  // Loading
  // -----------------------------

  if (loading) {

    return (
      <div className="min-h-[60vh] flex items-center justify-center">

        <Loader2
          size={28}
          className="animate-spin"
        />

        <span className="ml-3">
          Loading dashboard...
        </span>

      </div>
    );

  }


  // -----------------------------
  // Error
  // -----------------------------

  if (error) {

    return (
      <div className="max-w-6xl mx-auto px-6 py-16">

        <h1 className="text-3xl font-semibold mb-3">
          District dashboard
        </h1>

        <p className="text-red-600">
          {error}
        </p>

      </div>
    );

  }


  // -----------------------------
  // Backend statistics
  // -----------------------------

  const totalProblems =
    stats?.totalProblems || 0;

  const assigned =
    stats?.assigned || 0;

  const underReview =
    stats?.underReview || 0;

  const solved =
    stats?.solved || 0;


  // -----------------------------
  // Category statistics
  // -----------------------------

  const categoryCounts =
    stats?.categoryCounts || {};

  const categories =
    Object.entries(categoryCounts)
      .sort(
        ([, a], [, b]) => b - a
      );


  const maxCategory =
    Math.max(
      ...categories.map(
        ([, count]) => count
      ),
      1
    );


  // -----------------------------
  // UI
  // -----------------------------

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">

      {/* Header */}

      <h1 className="text-3xl font-semibold mb-2">
        District dashboard
      </h1>

      <p className="text-ink-soft mb-10">
        Live view of submitted civic
        problems and their current status.
      </p>


      {/* Statistics cards */}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">

        <StatCard
          icon={FileText}
          label="Problems submitted"
          value={totalProblems}
        />

        <StatCard
          icon={Building2}
          label="Problems assigned"
          value={assigned}
        />

        <StatCard
          icon={Clock}
          label="Under review"
          value={underReview}
        />

        <StatCard
          icon={CheckCircle2}
          label="Resolved"
          value={solved}
        />

      </div>


      {/* Problems by category */}

      <div className="bg-cream rounded-2xl border border-sage-dark/50 p-6 mb-8">

        <h2 className="font-display text-lg font-semibold mb-6">
          Problems by category
        </h2>


        {categories.length === 0 ? (

          <p className="text-sm text-ink-soft">
            No complaints submitted yet.
          </p>

        ) : (

          <div className="space-y-4">

            {categories.map(
              ([category, count]) => (

              <div key={category}>

                <div className="flex items-center justify-between mb-1.5">

                  <span className="text-sm font-medium">
                    {category}
                  </span>

                  <span className="text-sm text-ink-soft">
                    {count}
                  </span>

                </div>


                <div className="w-full h-2.5 rounded-full bg-sage-dark/60 overflow-hidden">

                  <div
                    className="h-full bg-marigold rounded-full"
                    style={{
                      width:
                        `${(count / maxCategory) * 100}%`,
                    }}
                  />

                </div>

              </div>

            ))}

          </div>

        )}

      </div>


      {/* Recent submissions */}

      <div className="bg-cream rounded-2xl border border-sage-dark/50 p-6">

        <h2 className="font-display text-lg font-semibold mb-6">
          Recent submissions
        </h2>


        {problems.length === 0 ? (

          <p className="text-sm text-ink-soft">
            No submissions yet.
          </p>

        ) : (

          <div className="space-y-3">

            {[...problems]
              .reverse()
              .slice(0, 10)
              .map((problem) => (

              <div
                key={problem.id}
                className="rounded-xl bg-sage/50 p-4"
              >

                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">

                  <Tag tone="marigold">
                    {problem.category}
                  </Tag>

                  <span className="text-xs text-ink-soft">
                    {problem.status}
                  </span>

                </div>


                <p className="text-sm font-medium">
                  {problem.description}
                </p>


                <p className="text-xs text-ink-soft mt-1">
                  {problem.location}
                </p>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}


// ----------------------------------
// Statistics card
// ----------------------------------

function StatCard({
  icon: Icon,
  label,
  value,
}) {

  return (

    <div className="bg-cream rounded-2xl border border-sage-dark/50 p-5">

      <span className="w-9 h-9 rounded-lg flex items-center justify-center mb-4 bg-sage">

        <Icon size={18} />

      </span>


      <p className="text-2xl font-display font-semibold">
        {value}
      </p>


      <p className="text-sm text-ink-soft mt-1">
        {label}
      </p>

    </div>

  );

}