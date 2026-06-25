import { dashboardStats, formatLabel, getAlertsForRole, hasPermission, logs, sanitizeLogForRole, severityTone, trafficSeries } from '../data/siemData';
import { AccessNote, Badge, DataTable, MiniBarChart, SectionHeader, StatCard } from '../components/ui';

function DashboardPage({ currentUser, onNavigate }) {
  const visibleLogs = logs.map((log) => sanitizeLogForRole(log, currentUser.roleId));
  const visibleAlerts = getAlertsForRole(currentUser.roleId);
  const priorityAlert = visibleAlerts[0];
  const canInvestigate = hasPermission(currentUser.roleId, 'alerts:update_status');
  const recentRows = visibleLogs.slice(0, 4).map((log) => [
    log.time,
    log.source,
    log.event,
    log.message,
    <Badge tone={severityTone[log.severity]}>{formatLabel(log.severity)}</Badge>,
  ]);

  return (
    <div className="page-stack">
      <section className="stats-grid" aria-label="Indicateurs du tableau de bord">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <div className="content-grid">
        <section className="panel span-2">
          <SectionHeader
            eyebrow="Chronologie sécurité"
            title="Activité sécurité en temps réel"
            subtitle="Volumes logs et alertes qualifiés sur les dernières 24 heures."
            action={(
              <button className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2" type="button" onClick={() => onNavigate('logs')}>
                <i className="bi bi-list-ul" aria-hidden="true" />
                Voir les journaux
              </button>
            )}
          />
          <MiniBarChart data={trafficSeries} />
        </section>

        <aside className="panel priority-panel">
          <SectionHeader eyebrow="Attention" title={canInvestigate ? 'Incident prioritaire' : 'Vue incidents résolus'} />
          {priorityAlert ? (
            <>
              <Badge tone={severityTone[priorityAlert.severity]}>{formatLabel(priorityAlert.severity)}</Badge>
              <h2>{priorityAlert.title}</h2>
              <p>{priorityAlert.description}</p>
              <dl className="detail-list">
                <div>
                  <dt>Actif</dt>
                  <dd>{priorityAlert.asset}</dd>
                </div>
                <div>
                  <dt>Score</dt>
                  <dd>{priorityAlert.score}/100</dd>
                </div>
                <div>
                  <dt>Réponse</dt>
                  <dd>{priorityAlert.response}</dd>
                </div>
              </dl>
              <button className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2" type="button" onClick={() => onNavigate('alerts')}>
                <i className="bi bi-shield-exclamation" aria-hidden="true" />
                {canInvestigate ? "Investiguer l'alerte" : 'Voir les incidents résolus'}
              </button>
            </>
          ) : (
            <AccessNote>
              Aucune alerte visible avec votre rôle actuel.
            </AccessNote>
          )}
        </aside>

        <section className="panel span-2">
          <SectionHeader eyebrow="Journaux récents" title="Derniers événements qualifiés" />
          <DataTable columns={['Heure', 'Source', 'Événement', 'Message', 'Sévérité']} rows={recentRows} />
        </section>

        <section className="panel">
          <SectionHeader eyebrow="État système" title="Pipeline SIEM" />
          <div className="pipeline-list">
            {['Collecte', 'Normalisation', 'Correlation', 'Triage', 'Rapports'].map((step, index) => (
              <article className="pipeline-item" key={step}>
                <span>{index + 1}</span>
                <div>
                  <strong>{step}</strong>
                  <small>{index === 3 ? 'File analyste' : 'Opérationnel'}</small>
                </div>
                <Badge tone={index === 3 ? 'warning' : 'success'}>{index === 3 ? 'Revue' : 'OK'}</Badge>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default DashboardPage;
