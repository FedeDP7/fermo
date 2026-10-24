import { Link } from "@tanstack/react-router";
import logo from "../../../logo/logo.png";
import { ThemeToggle } from "./ThemeToggle";

export function AppHeader() {
  return (
    <header className="studio-header">
      <Link to="/" className="studio-brand" aria-label="FERMO — pagina iniziale">
        <span className="studio-logo">
          <img src={logo} alt="FERMO" width={1312} height={1199} />
        </span>
      </Link>
      <nav aria-label="Navigazione principale">
        <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "is-active" }}>
          Analisi comunicazioni
        </Link>
        <Link to="/aziende" activeProps={{ className: "is-active" }}>
          Aziende <span className="studio-demo">DEMO</span>
        </Link>
      </nav>
      <ThemeToggle />
    </header>
  );
}
