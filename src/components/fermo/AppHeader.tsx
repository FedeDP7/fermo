import { Link } from "@tanstack/react-router";
import { ScanText, Building2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";

export function AppHeader() {
  return <header className="border-b border-border"><div className="mx-auto max-w-6xl px-5 py-5">
    <div className="flex items-center justify-between gap-4"><Link to="/" className="flex items-center gap-3 text-primary"><ShieldCheck aria-hidden className="h-7 w-7" /><span className="text-2xl font-extrabold">FERMO</span></Link><ThemeToggle /></div>
    <nav aria-label="Navigazione principale" className="mt-5 flex flex-wrap gap-2">
      <Button asChild variant="ghost" className="h-auto min-h-12 whitespace-normal px-3 text-base"><Link to="/" activeProps={{ className: "bg-secondary text-primary" }} activeOptions={{ exact: true }}><ScanText aria-hidden />Analisi comunicazioni</Link></Button>
      <Button asChild variant="ghost" className="h-auto min-h-12 whitespace-normal px-3 text-base"><Link to="/aziende" activeProps={{ className: "bg-secondary text-primary" }}><Building2 aria-hidden />Panoramica aziendale <span className="text-xs font-bold text-risk-mid">DEMO</span></Link></Button>
    </nav>
  </div></header>;
}