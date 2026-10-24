import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const KEY = "fermo-theme";

/** Only the theme preference is stored. Never message content. */
export function ThemeToggle() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(KEY) === "light";
    setLight(saved);
    document.documentElement.classList.toggle("light", saved);
  }, []);

  const toggle = () => {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle("light", next);
    localStorage.setItem(KEY, next ? "light" : "dark");
  };

  const label = light ? "Passa al tema scuro" : "Passa al tema chiaro";
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
