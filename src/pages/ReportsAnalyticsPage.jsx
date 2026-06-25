import { attackTypes, formatLabel, reportCards, reports, severityTone } from '../data/siemData';
import { Badge, DataTable, DonutChart, ProgressBar, SectionHeader, StatCard } from '../components/ui';

function ReportsAnalyticsPage() {
  const reportRows = reports.map((report) => [
    report.id,
    report.name,
    report.type,
    report.owner,
    report.created,
    <Badge tone={severityTone[report.status]}>{formatLabel(report.status)}</Badge>,
  ]);

  return (
    <div className="page-stack">
      <section className="stats-grid" aria-label="Indicateurs rapports">
        {reportCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </section>

      <div className="content-grid">
        <section className="panel">
          <SectionHeader eyebrow="Distribution des menaces" title="Répartition des menaces" />
          <DonutChart value={76} label="Confiance de détection" />
          <div className="legend-list">
            <span><i className="legend-dot danger" /> Critique</span>
            <span><i className="legend-dot warning" /> Élevée</span>
            <span><i className="legend-dot info" /> Moyenne</span>
          </div>
        </section>

        <section className="panel span-2">
          <SectionHeader
            eyebrow="Analyse"
            title="Attaques les plus détectées"
            subtitle="Classement des catégories détectées par les règles de corrélation."
            action={(
              <button className="btn btn-primary btn-sm d-flex align-items-center gap-2" type="button">
                <i className="bi bi-file-earmark-bar-graph" aria-hidden="true" />
                Générer un rapport
              </button>
            )}
          />
          <div className="progress-list">
            {attackTypes.map((attack) => (
              <ProgressBar key={attack.label} label={attack.label} value={attack.value} meta={attack.amount} />
            ))}
          </div>
        </section>

        <section className="panel span-3">
          <SectionHeader eyebrow="Rapports récents" title="Historique des rapports" />
          <DataTable
            columns={['ID rapport', 'Nom', 'Type', 'Responsable', 'Création', 'Statut']}
            rows={reportRows}
          />
        </section>
      </div>
    </div>
  );
}

export default ReportsAnalyticsPage;
