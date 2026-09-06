import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, ImagePlus, Loader2 } from "lucide-react";
import Button from "../components/Button.jsx";
import { categorizeComplaint } from "../services/aiRouter.js";

export default function Submit() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [location, setLocation] = useState("");
  const [photo, setPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;

    setSubmitting(true);
    const result = await categorizeComplaint(text);
    setSubmitting(false);

    // Pass the submission + AI result forward to the results page.
    navigate("/routing-result", {
      state: { text, location, photoName: photo?.name, result },
    });
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-semibold mb-2">Report a problem</h1>
      <p className="text-ink-soft mb-10">
        Describe what's happening in your own words — our system figures
        out the category and the right college on its own.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="description" className="block text-sm font-semibold mb-2">
            What's the problem?
          </label>
          <textarea
            id="description"
            required
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. No water supply in our ward for the last 5 days, borewell is also dry."
            className="w-full rounded-2xl border border-sage-dark bg-cream p-4 text-ink placeholder:text-ink-soft/60 focus:border-marigold outline-none resize-none"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-semibold mb-2">
            Location
          </label>
          <div className="relative">
            <MapPin
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft"
            />
            <input
              id="location"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Ranchi, Ward 4"
              className="w-full rounded-full border border-sage-dark bg-cream pl-11 pr-4 py-3 text-ink placeholder:text-ink-soft/60 focus:border-marigold outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            Photo (optional)
          </label>
          <label
            htmlFor="photo"
            className="flex items-center gap-3 rounded-2xl border border-dashed border-sage-dark bg-cream p-4 cursor-pointer hover:border-marigold/60 transition-colors"
          >
            <ImagePlus size={20} className="text-ink-soft" />
            <span className="text-sm text-ink-soft">
              {photo ? photo.name : "Tap to attach a photo"}
            </span>
            <input
              id="photo"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        <Button type="submit" variant="primary" disabled={submitting} className="w-full">
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Sorting your report…
            </>
          ) : (
            "Submit report"
          )}
        </Button>
      </form>
    </div>
  );
}
