import { PageShell } from "@/components/Layout";
import { SectionHeading } from "@/components/telemetry";

export default function HomePage() {
  return (
    <PageShell>
      <SectionHeading
        title="Painel inicial"
        description="Indicadores do aparelho e atalhos principais do BK PERFORMANCE PRO."
      />
      <p className="text-sm text-muted-foreground">
        Esta tela será implementada na tarefa da página inicial.
      </p>
    </PageShell>
  );
}
