import { PageShell } from "@/components/Layout";
import { SectionHeading } from "@/components/telemetry";

export default function GamesPage() {
  return (
    <PageShell>
      <SectionHeading
        title="Meus jogos"
        description="Adicione jogos manualmente e organize seus perfis por título."
      />
      <p className="text-sm text-muted-foreground">
        Esta tela será implementada na tarefa de jogos.
      </p>
    </PageShell>
  );
}
