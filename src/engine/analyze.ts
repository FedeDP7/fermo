import { CONTEXT_LABELS, classifyContext } from "./context";
import { normalize } from "./normalize";
import { buildRecommendations, detectSituation } from "./recommend";
import { computeScore, levelFor } from "./score";
import { buildSignals, detectBrands, detectTextSignals } from "./signals";
import type { AnalysisResult } from "./types";
import { analyzeLink, extractUrls } from "./urls";

export const MAX_LENGTH = 10_000;

/** Pure, deterministic, offline. Never opens URLs, never stores text. */
export function analyzeMessage(text: string): AnalysisResult {
  const input = text.slice(0, MAX_LENGTH);
  const norm = normalize(input);
  const context = classifyContext(norm);
  const urls = extractUrls(input);
  const brands = detectBrands(norm, urls.map((u) => normalize(u.original)));
  const textIds = detectTextSignals(norm);
  const sensitiveRequest = textIds.some((i) => ["credenziali", "caparra", "gift_card", "metodo_irrecuperabile", "documenti"].includes(i));
  const links = urls.map((u) => analyzeLink(u, { claimedBrand: brands.claimed, mentionedBrands: brands.mentioned, sensitiveRequest }));
  const signals = buildSignals(textIds, links, brands.claimed).sort((a, b) => b.weight - a.weight);
  const breakdown = computeScore(signals);
  const level = levelFor(breakdown.total);
  const situation = detectSituation(signals, context);
  const { recommendations, safeReply } = buildRecommendations(situation, level);
  return {
    score: breakdown.total,
    level,
    context,
    contextLabel: CONTEXT_LABELS[context],
    situation,
    claimedBrand: brands.claimed?.name ?? null,
    signals,
    links,
    breakdown,
    recommendations,
    safeReply,
  };
}

export const analyze = analyzeMessage;
