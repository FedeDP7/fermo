<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Scam analysis lives in pure, React-free modules under src/engine (config/rules and config/brands hold all weights and domains); UI only calls analyzeMessage(); scoring is group-capped and bonuses come only from active signals. Why: deterministic, testable, offline by design.
- Theme is a `.light` class on <html> overriding the CSS variables in src/styles.css (dark is :root default); only the theme preference is persisted (localStorage "fermo-theme"), never message content.
- Shared navigation lives in the root layout; employee analysis and the simulated company overview use distinct content routes. Why: preserve independent navigation and page metadata.
- Verification procedures and manager summaries are pure engine functions; summaries allow only generated labels and steps, excluding original content and URL reports. Why: keep guidance deterministic and avoid confidential data in copied reports.
- Keep legacy examples separately from primary business examples. Why: prevent repositioning from removing existing regression coverage.
