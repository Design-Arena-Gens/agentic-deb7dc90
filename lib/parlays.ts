export type Sport = "NBA" | "NHL";

export type PlayerProp = {
  id: string;
  sport: Sport;
  player: string;
  team: string;
  opponent: string;
  market: "Points" | "Assists" | "Rebounds" | "Shots" | "Saves";
  selection: "Over" | "Under";
  line: number;
  oddsAmerican: number; // bookmaker price per leg
  impliedProbability: number; // our estimated true probability
};

export type ParlayLeg = PlayerProp & { edgePct: number };

export type RankedParlay = {
  id: string;
  sport: Sport;
  legs: ParlayLeg[];
  winProbability: number;
  payoutMultiplier: number;
  expectedValuePct: number;
  estimatedProfit: number;
  suggestedStake: number;
  risk: "Low" | "Medium" | "High";
  rank: number;
};

export const sampleProps: PlayerProp[] = [
  // NBA sample slate (fictional but plausible)
  { id: "nba1", sport: "NBA", player: "Jayson Tatum", team: "BOS", opponent: "NYK", market: "Points", selection: "Over", line: 27.5, oddsAmerican: -110, impliedProbability: 0.56 },
  { id: "nba2", sport: "NBA", player: "Jalen Brunson", team: "NYK", opponent: "BOS", market: "Assists", selection: "Over", line: 5.5, oddsAmerican: -105, impliedProbability: 0.55 },
  { id: "nba3", sport: "NBA", player: "Giannis Antetokounmpo", team: "MIL", opponent: "CHI", market: "Rebounds", selection: "Over", line: 11.5, oddsAmerican: -115, impliedProbability: 0.58 },
  { id: "nba4", sport: "NBA", player: "DeMar DeRozan", team: "CHI", opponent: "MIL", market: "Points", selection: "Under", line: 22.5, oddsAmerican: -102, impliedProbability: 0.53 },
  { id: "nba5", sport: "NBA", player: "Tyrese Haliburton", team: "IND", opponent: "ORL", market: "Assists", selection: "Over", line: 10.5, oddsAmerican: -120, impliedProbability: 0.6 },
  { id: "nba6", sport: "NBA", player: "Paolo Banchero", team: "ORL", opponent: "IND", market: "Points", selection: "Over", line: 21.5, oddsAmerican: -108, impliedProbability: 0.54 },
  { id: "nba7", sport: "NBA", player: "Nikola Jokic", team: "DEN", opponent: "DAL", market: "Assists", selection: "Over", line: 8.5, oddsAmerican: -112, impliedProbability: 0.57 },
  { id: "nba8", sport: "NBA", player: "Luka Doncic", team: "DAL", opponent: "DEN", market: "Points", selection: "Over", line: 30.5, oddsAmerican: -118, impliedProbability: 0.58 },
  // NHL sample
  { id: "nhl1", sport: "NHL", player: "Auston Matthews", team: "TOR", opponent: "BUF", market: "Shots", selection: "Over", line: 4.5, oddsAmerican: -125, impliedProbability: 0.61 },
  { id: "nhl2", sport: "NHL", player: "Connor McDavid", team: "EDM", opponent: "VGK", market: "Shots", selection: "Over", line: 3.5, oddsAmerican: -135, impliedProbability: 0.63 },
  { id: "nhl3", sport: "NHL", player: "Igor Shesterkin", team: "NYR", opponent: "PIT", market: "Saves", selection: "Over", line: 27.5, oddsAmerican: -105, impliedProbability: 0.55 },
];

function americanToDecimal(american: number): number {
  if (american > 0) return 1 + american / 100;
  return 1 + 100 / Math.abs(american);
}

function product(values: number[]): number { return values.reduce((a, b) => a * b, 1); }

function edge(prob: number, decimalOdds: number): number {
  // EV% for a single leg relative to stake: prob*odds - 1
  return prob * decimalOdds - 1;
}

function riskFromWinProb(p: number): "Low" | "Medium" | "High" {
  if (p >= 0.45) return "Low";
  if (p >= 0.25) return "Medium";
  return "High";
}

function suggestStake(evPct: number, bankroll: number = 100): number {
  // Scaled Kelly fraction cap at 5%
  const kelly = Math.max(0, Math.min(0.05, evPct / 2));
  return bankroll * kelly;
}

function combinations<T>(arr: T[], k: number): T[][] {
  const result: T[][] = [];
  const n = arr.length;
  const idx = Array.from({ length: k }, (_, i) => i);
  while (true) {
    result.push(idx.map(i => arr[i]));
    let i = k - 1;
    while (i >= 0 && idx[i] === i + n - k) i--;
    if (i < 0) break;
    idx[i]++;
    for (let j = i + 1; j < k; j++) idx[j] = idx[j - 1] + 1;
  }
  return result;
}

export function getRecommendedParlays(props: PlayerProp[], opts: { maxLegs: number; topN: number }): RankedParlay[] {
  const eligible = props.filter(Boolean);
  const all: RankedParlay[] = [];
  for (let legs = 2; legs <= opts.maxLegs; legs++) {
    for (const combo of combinations(eligible, legs)) {
      const sport = combo[0].sport;
      if (!combo.every(c => c.sport === sport)) continue; // same-sport parlays to reduce correlation complexity
      const legDecimals = combo.map(c => americanToDecimal(c.oddsAmerican));
      const payoutMultiplier = product(legDecimals);
      const winProbability = product(combo.map(c => c.impliedProbability));
      const expectedValuePct = winProbability * payoutMultiplier - 1;
      const legsWithEdge = combo.map(c => ({ ...c, edgePct: edge(c.impliedProbability, americanToDecimal(c.oddsAmerican)) }));
      const suggestedStake = suggestStake(expectedValuePct);
      const estimatedProfit = suggestedStake * expectedValuePct;
      all.push({
        id: combo.map(c => c.id).join("-"),
        sport,
        legs: legsWithEdge,
        winProbability,
        payoutMultiplier,
        expectedValuePct,
        estimatedProfit,
        suggestedStake,
        risk: riskFromWinProb(winProbability),
        rank: 0,
      });
    }
  }
  const ranked = all
    .filter(p => p.expectedValuePct > 0) // show positive-EV only
    .sort((a, b) => b.expectedValuePct - a.expectedValuePct)
    .slice(0, opts.topN)
    .map((p, i) => ({ ...p, rank: i + 1 }));
  return ranked;
}
