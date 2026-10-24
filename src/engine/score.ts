import { THRESHOLDS } from "./config/rules";
import type { Level, Signal } from "./types";

export function computeScore(signals: Signal[]): number {
  let s = signals.reduce((n, x) => n + x.weight, 0);
  const ids = new Set(signals.map((x) => x.id));
  // Dangerous combinations
  if (ids.has("urgenza") && (ids.has("dati_sensibili") || ids.has("link_sospetto"))) s += 10;
  if (ids.has("anticipo") && ids.has("estero")) s += 15;
  if (ids.has("paypal_amici") && ids.has("cambio_canale")) s += 10;
  return Math.max(0, Math.min(100, Math.round(s)));
}

export function levelFor(score: number): Level {
  if (score >= THRESHOLDS.alto) return "ALTO";
  if (score >= THRESHOLDS.medio) return "MEDIO";
  return "BASSO";
}
