"use client";
import React from "react";
import { type RankedParlay } from "@/lib/parlays";

export function ParlayCard({ parlay }: { parlay: RankedParlay }) {
  return (
    <article className="card">
      <div className="row" style={{alignItems:"center"}}>
        <h3 style={{margin:0}}>#{parlay.rank} ? {parlay.legs.length}-Leg Parlay</h3>
        <span className="badge">{parlay.sport}</span>
      </div>
      <div className="meta">
        <span className="tag">EV {formatPct(parlay.expectedValuePct)}</span>
        <span className="tag">Win% {formatPct(parlay.winProbability)}</span>
        <span className="tag">Payout x{parlay.payoutMultiplier.toFixed(2)}</span>
        <span className="tag">Risk: {parlay.risk}</span>
      </div>
      <div className="legs">
        {parlay.legs.map((l) => (
          <div key={l.id} className="prop">
            <div className="left">
              <span className="title">{l.player} ? {l.market} {l.selection}</span>
              <span className="sub">Implied {formatPct(l.impliedProbability)} ? Odds {formatAmerican(l.oddsAmerican)}</span>
            </div>
            <div>
              <span className={l.edgePct >= 0 ? "rate-good" : "rate-risk"}>
                Edge {formatPct(l.edgePct)}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="kv">
        <div>Suggested stake</div><strong>${parlay.suggestedStake.toFixed(2)}</strong>
        <div>Est. profit</div><strong>${parlay.estimatedProfit.toFixed(2)}</strong>
      </div>
    </article>
  );
}

function formatPct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

function formatAmerican(odds: number): string {
  return odds > 0 ? `+${odds}` : `${odds}`;
}
