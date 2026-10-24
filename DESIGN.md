# FERMO — Studio

Approved direction: Studio (first visual proposal). Target: the analysis page and shared navigation, preserving the existing engine and separate company demo route.

- Light canvas, white workspace, navy typography, teal primary action, Manrope.
- Desktop: brand introduction on the left, communication editor in the center, actual analysis on the right. At intermediate widths results follow the editor; on phones the layout becomes a single column.
- Empty state explains the workflow. No generated example score is presented as a real result.
- Original logo: `logo/logo.png`, imported by Vite. The header frames the shield portion without modifying the original image.
- Dark theme remains available. Only `fermo-theme` is persisted; light is the default when no preference exists.
- Input remains limited to 10,000 characters. Editing input clears the prior result. The engine, scoring, recommendations, and privacy-safe summaries remain unchanged.
- Preserve labels identifying simulated company information and future SaaS features.

Validation: production build, TypeScript, 54 existing tests; browser checks of analysis, summary copying, stale-result clearing, and responsive layout at 390px. Publication remains through Lovable.
