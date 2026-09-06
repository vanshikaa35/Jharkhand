import { FileText, Building2, Handshake, TrendingUp } from "lucide-react";
import Tag from "../components/Tag.jsx";

const stats = [
  { icon: FileText, label: "Problems submitted", value: "1,284", tone: "sky" },
  { icon: Building2, label: "Universities active", value: "18", tone: "marigold" },
  { icon: Handshake, label: "Industry partners", value: "42", tone: "blush" },
  { icon: TrendingUp, label: "Resolved this month", value: "231", tone: "sage" },
];

const districts = [
  { name: "Ranchi", count: 412, category: "Water" },
  { name: "Jamshedpur", count: 298, category: "Infrastructure" },
  { name: "Dhanbad", count: 176, category: "Environment" },
  { name: "Bokaro", count: 154, category: "Healthcare" },
  { name: "Hazaribagh", count: 98, category: "Agriculture" },
];

const toneClass = {
  sky: "bg-sky text-ink",
  marigold: "bg-marigold-light text-marigold-dark",
  blush: "bg-blush text-ink",
  sage: "bg-sage-dark text-ink",
};

export default function Dashboard() {
  const max = Math.max(...districts.map((d) => d.count));

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-semibold mb-2">District dashboard</h1>
      <p className="text-ink-soft mb-10">
        Live view for government departments monitoring participation and impact.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
        {stats.map(({ icon: Icon, label, value, tone }) => (
          <div
            key={label}
            className="bg-cream rounded-2xl border border-sage-dark/50 p-5"
          >
            <span className={`w-9 h-9 rounded-lg flex items-center justify-center mb-4 ${toneClass[tone]}`}>
              <Icon size={18} />
            </span>
            <p className="text-2xl font-display font-semibold">{value}</p>
            <p className="text-sm text-ink-soft mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-cream rounded-2xl border border-sage-dark/50 p-6">
        <h2 className="font-display text-lg font-semibold mb-6">
          Submissions by district
        </h2>
        <div className="space-y-4">
          {districts.map((d) => (
            <div key={d.name}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium">{d.name}</span>
                <div className="flex items-center gap-2">
                  <Tag tone="sky">{d.category}</Tag>
                  <span className="text-sm text-ink-soft w-10 text-right">{d.count}</span>
                </div>
              </div>
              <div className="w-full h-2.5 rounded-full bg-sage-dark/60 overflow-hidden">
                <div
                  className="h-full bg-marigold rounded-full"
                  style={{ width: `${(d.count / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
