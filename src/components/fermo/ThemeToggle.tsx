import { useI18n } from "@/i18n";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const KEY = "fermo-theme";

/** Only the theme preference is stored. Never message content. */
export function ThemeToggle() {
  const { t } = useI18n();
  const [light, setLight] = useState(true);

  useEffect(() => {
    let saved = true;
    try {
      saved = localStorage.getItem(KEY) !== "dark";
    } catch {
      /* Theme remains usable when storage is unavailable. */
    }
    setLight(saved);
    document.documentElement.classList.toggle("light", saved);
  }, []);

  const toggle = () => {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle("light", next);
    try {
      localStorage.setItem(KEY, next ? "light" : "dark");
    } catch {
      /* Preference is optional. */
    }
  };

  const label = light ? t("Passa al tema scuro") : t("Passa al tema chiaro");
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="flex min-h-14 min-w-14 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:border-primary"
    >
      {light ? <Moon aria-hidden className="h-6 w-6" /> : <Sun aria-hidden className="h-6 w-6" />}
    </button>
  );
}
