import { createFileRoute } from "@tanstack/react-router";
import { CompanyOverview } from "@/components/fermo/CompanyOverview";

export const Route = createFileRoute("/aziende")({
  head: () => ({ meta: [
    { title: "FERMO per le aziende — Panoramica dimostrativa" },
    { name: "description", content: "Scopri la visione FERMO per le PMI: panoramica con dati simulati, procedure di verifica e futuri servizi START, TEAM e BUSINESS." },
    { property: "og:title", content: "FERMO per le aziende — Panoramica dimostrativa" },
    { property: "og:description", content: "Una visione trasparente del futuro SaaS FERMO per le PMI. Dashboard dimostrativa, non attività reali." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: CompanyOverview,
});