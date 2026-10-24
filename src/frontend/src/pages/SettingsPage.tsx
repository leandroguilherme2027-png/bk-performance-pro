import { PageShell } from "@/components/Layout";
import { SectionHeading } from "@/components/telemetry";

export default function SettingsPage() {
  return (
    <PageShell>
      <SectionHeading
        title="Configurações"
        description="Preferências do app, privacidade e informações de uso."
      />
      <p className="text-sm text-muted-foreground">
        Esta tela será implementada na tarefa de configurações.
      </p>
    </PageShell>
  );
}
