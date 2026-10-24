import { BONUSES, GROUP_CAPS, THRESHOLDS } from "./config/rules";
import type { Bonus, Breakdown, Group, Level, Signal } from "./types";

const RISKY_METHODS = ["paypal_amici", "gift_card", "metodo_irrecuperabile"];

function has(ids: Set<string>, signals: Signal[], req: string): boolean {
  if (req === "@link_sospetto") return signals.some((s) => s.group === "LINK" && s.weight >= 15);
  if (req === "@metodo_rischioso") return RISKY_METHODS.some((m) => ids.has(m));
  return ids.has(req);
}

/** Deterministic: sum per group -> cap -> bonuses -> clamp 100. */
export function computeScore(signals: Signal[]): Breakdown {
  const ids = new Set(signals.map((s) => s.id));
  const groups = (Object.keys(GROUP_CAPS) as Group[])
    .map((group) => {
      const raw = signals.filter((s) => s.group === group).reduce((n, s) => n + s.weight, 0);
      return { group, raw, cap: GROUP_CAPS[group], applied: Math.min(raw, GROUP_CAPS[group]) };
    })
    .filter((g) => g.raw > 0);
  const bonuses: Bonus[] = BONUSES.filter((b) => b.requires.every((r) => has(ids, signals, r))).map(({ id, label, points }) => ({ id, label, points }));
  const subtotal = groups.reduce((n, g) => n + g.applied, 0) + bonuses.reduce((n, b) => n + b.points, 0);
  return { groups, bonuses, subtotal, total: Math.min(100, subtotal) };
}

export function levelFor(score: number): Level {
  if (score >= THRESHOLDS.alto) return "ALTO";
  if (score >= THRESHOLDS.medio) return "MEDIO";
  return "BASSO";
}
