import { CONTEXT_LABELS, classifyContext } from "./context";
import { normalize } from "./normalize";
import { buildRecommendations } from "./recommend";
import { computeScore, levelFor } from "./score";
import { detectBrands, detectSignals } from "./signals";
import type { AnalysisResult } from "./types";
import { analyzeUrl, extractUrls } from "./urls";

export function analyze(text: string): AnalysisResult {
  const norm = normalize(text);
  const context = classifyContext(norm);
  const links = extractUrls(text).map(analyzeUrl);
  const brands = detectBrands(norm);
  const signals = detectSignals(norm, context, links, brands).sort((a, b) => b.weight - a.weight);
  const score = computeScore(signals);
  const level = levelFor(score);
  const { recommendations, safeReply } = buildRecommendations(context, level, signals);
  return { score, level, context, contextLabel: CONTEXT_LABELS[context], signals, links, recommendations, safeReply, brands };
}
