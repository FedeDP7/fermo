# FERMO — Studio

Approved direction: Studio (first visual proposal). Target: the analysis page and shared navigation, preserving the existing engine and separate company demo route.

- Light canvas, white workspace, navy typography, teal primary action, Manrope.
- Desktop: brand introduction on the left, communication editor in the center, actual analysis on the right. At intermediate widths results follow the editor; on phones the layout becomes a single column.
- Empty state explains the workflow. No generated example score is presented as a real result.
- Original logo: `logo/logo.png`, imported by Vite. The header frames the shield from the transparent logo and places the text FERMO to its right. The container has no background; the source image is unchanged.
- Dark theme remains available. Only `fermo-theme` is persisted; light is the default when no preference exists.
- Input remains limited to 10,000 characters. Editing input clears the prior result. The engine, scoring, recommendations, and privacy-safe summaries remain unchanged.
- Preserve labels identifying simulated company information and future SaaS features.

Validation: production build, TypeScript, 54 existing tests; browser checks of analysis, summary copying, stale-result clearing, and responsive layout at 390px. Publication remains through Lovable.

Analysis reports open automatically in an accessible modal with a fixed header and internally scrolling body. The page keeps only a compact risk summary and a reopen button. Escape and the close control dismiss the modal; focus returns to the editor.

## Floating navigation and languages

The shared navbar uses a dark navy capsule with a thin border, subtle shadow, centered navigation, a white transparent brand symbol and IT | EN controls. On mobile a compact accessible menu retains the logo, languages and theme control.

Italian is the default. Language lives only in React state, survives route navigation and is not persisted. Authored translations are centralised under src/i18n: en.json for interface and generated guidance, report.ts for signal/link copy by stable IDs and privacy-safe English summaries. Input, excerpts, URLs, scoring and engine rules remain unchanged. The English interface explicitly states that detection is configured for Italian messages. Browser lang and page metadata update with the selected interface language.
