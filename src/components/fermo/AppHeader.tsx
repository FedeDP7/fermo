import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import logo from "../../../logo/logo.png";
import { useI18n } from "@/i18n";
import { ThemeToggle } from "./ThemeToggle";

export function AppHeader() {
  const { language, setLanguage, t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  return (
    <header
      className="studio-header"
      data-menu-open={menuOpen}
      onKeyDown={(event) => {
        if (event.key === "Escape" && menuOpen) {
          setMenuOpen(false);
          menuButton.current?.focus();
        }
      }}
    >
      <Link to="/" className="studio-brand" aria-label="FERMO" onClick={() => setMenuOpen(false)}>
        <span className="studio-logo">
          <img src={logo} alt="" width={1312} height={1199} />
        </span>
        <span>FERMO</span>
      </Link>
      <nav id="fermo-navigation" aria-label={t("Navigazione principale")}>
        <Link
          to="/"
          activeOptions={{ exact: true }}
          activeProps={{ className: "is-active" }}
          onClick={() => setMenuOpen(false)}
        >
          {t("Analisi comunicazioni")}
        </Link>
        <Link
          to="/aziende"
          activeProps={{ className: "is-active" }}
          onClick={() => setMenuOpen(false)}
        >
          {t("Aziende")}
          <span className="studio-demo">DEMO</span>
        </Link>
      </nav>
      <div className="studio-header-actions">
        <div className="studio-languages" role="group" aria-label={t("Lingua")}>
          <button
            type="button"
            lang="it"
            aria-label="Italiano"
            aria-pressed={language === "it"}
            onClick={() => setLanguage("it")}
          >
            IT
          </button>
          <span aria-hidden>|</span>
          <button
            type="button"
            lang="en"
            aria-label="English"
            aria-pressed={language === "en"}
            onClick={() => setLanguage("en")}
          >
            EN
          </button>
        </div>
        <ThemeToggle />
        <button
          type="button"
          className="studio-menu-toggle"
          ref={menuButton}
          aria-expanded={menuOpen}
          aria-controls="fermo-navigation"
          aria-label={t(menuOpen ? "Chiudi menu" : "Apri menu")}
          onClick={() => setMenuOpen(!menuOpen)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setMenuOpen(false);
          }}
        >
          {menuOpen ? <X aria-hidden /> : <Menu aria-hidden />}
        </button>
      </div>
    </header>
  );
}
