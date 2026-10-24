import { PageShell } from "@/components/Layout";
import { SectionHeading } from "@/components/telemetry";

export default function ProfilesPage() {
  return (
    <PageShell>
      <SectionHeading
        title="Perfis e histórico"
        description="Salve, consulte, compare, restaure, edite e exclua seus perfis."
      />
      <p className="text-sm text-muted-foreground">
        Esta tela será implementada na tarefa de perfis.
      </p>
    </PageShell>
  );
}
