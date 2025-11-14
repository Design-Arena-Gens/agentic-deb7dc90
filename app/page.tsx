import { getRecommendedParlays, sampleProps } from "@/lib/parlays";
import { ParlayCard } from "@/components/ParlayCard";

export default function Page() {
  const parlays = getRecommendedParlays(sampleProps, { maxLegs: 3, topN: 8 });
  return (
    <div>
      <header className="header">
        <h1>Best Player Parlays</h1>
        <p>Friday, November 14, 2025 ? EV-ranked suggestions</p>
      </header>
      <section className="grid">
        {parlays.map((p) => (
          <ParlayCard key={p.id} parlay={p} />
        ))}
      </section>
      <section className="footnote">
        <p>
          Estimates use assumed probabilities and typical payout ladders; for information only. Not betting advice.
        </p>
      </section>
    </div>
  );
}
