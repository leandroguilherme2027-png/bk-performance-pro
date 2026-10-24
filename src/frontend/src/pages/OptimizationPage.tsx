import { PageShell } from "@/components/Layout";
import { SectionHeading } from "@/components/telemetry";

export default function OptimizationPage() {
  return (
    <PageShell>
      <SectionHeading
        title="Central de otimização"
        description="Análise de desempenho, recomendações gráficas e perfis por jogo."
      />
      <p className="text-sm text-muted-foreground">
        Esta tela será implementada na tarefa da central de otimização.
      </p>
    </PageShell>
  );
}
