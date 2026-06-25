import { useState } from 'react';
import { collectors, formatLabel, hasPermission, logs, sanitizeLogForRole, severityTone } from '../data/siemData';
import { AccessNote, Badge, DataTable, SectionHeader } from '../components/ui';

function LogsPage({ currentUser }) {
  const visibleLogs = logs.map((log) => sanitizeLogForRole(log, currentUser.roleId));
  const canCreateRule = hasPermission(currentUser.roleId, 'rules:crud');
  const canSearchFullIndex = hasPermission(currentUser.roleId, 'logs:view_full');
  const [selectedLog, setSelectedLog] = useState(visibleLogs[0]);

  const logRows = visibleLogs.map((log) => [
    log.time,
    <button className="table-link" type="button" onClick={() => setSelectedLog(log)}>{log.id}</button>,
    log.source,
    log.sourceIp,
    log.event,
    <Badge tone={severityTone[log.severity]}>{formatLabel(log.severity)}</Badge>,
  ]);

  return (
    <div className="content-grid">
      <section className="panel span-2">
          <SectionHeader
            eyebrow="Explorateur de journaux"
            title="Recherche et filtrage des logs"
            subtitle={canSearchFullIndex ? 'Recherche full-text, filtres par sévérité, source, IP et période.' : 'Accès Lecteur: recherche limitée aux dernières 24 h.'}
            action={(
              <button className="btn btn-primary btn-sm d-flex align-items-center gap-2" type="button">
                <i className="bi bi-download" aria-hidden="true" />
                Exporter CSV
              </button>
            )}
          />

        <div className="filter-bar">
          <label className="form-label">
            Requête
            <input className="form-control" defaultValue="source:vpn-gw-01 OR event:auth.failure" />
          </label>
          <label className="form-label">
            Sévérité
            <select className="form-select" defaultValue="all">
              <option value="all">Toutes</option>
              <option value="CRITICAL">{formatLabel('CRITICAL')}</option>
              <option value="HIGH">{formatLabel('HIGH')}</option>
              <option value="MEDIUM">{formatLabel('MEDIUM')}</option>
              <option value="INFO">{formatLabel('INFO')}</option>
            </select>
          </label>
          <label className="form-label">
            Période
            <select className="form-select" defaultValue="24h" disabled={!canSearchFullIndex}>
              <option value="1h">Dernière heure</option>
              <option value="24h">Dernières 24 h</option>
              {canSearchFullIndex && <option value="7d">7 jours</option>}
            </select>
          </label>
          <button className="btn btn-primary d-flex align-items-center justify-content-center gap-2" type="button">
            <i className="bi bi-search" aria-hidden="true" />
            Rechercher
          </button>
        </div>

        <DataTable
          columns={['Heure', 'ID journal', 'Source', 'IP source', 'Type événement', 'Sévérité']}
          rows={logRows}
        />
      </section>

      <aside className="panel detail-panel">
        <SectionHeader eyebrow="Événement brut" title={selectedLog.id} />
        {!canSearchFullIndex && (
          <AccessNote>
            Les champs sensibles comme `hash`, `password_hash` et `mfa_secret` sont masqués pour le rôle Lecteur.
          </AccessNote>
        )}
        <div className="raw-event">
          <span className={`severity-line tone-${severityTone[selectedLog.severity]}`} />
          <pre>{JSON.stringify(selectedLog, null, 2)}</pre>
        </div>
        {canCreateRule ? (
          <button className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2" type="button">
            <i className="bi bi-plus-circle" aria-hidden="true" />
            Créer une règle d'alerte
          </button>
        ) : (
          <AccessNote title="Action réservée">
            La création de règles de corrélation est réservée aux administrateurs.
          </AccessNote>
        )}
      </aside>

      <section className="panel span-2">
        <SectionHeader eyebrow="Collecteurs" title="État des collecteurs" />
        <div className="collector-grid">
          {collectors.map((collector) => (
            <article className="collector-tile" key={collector.name}>
              <div>
                <strong>{collector.name}</strong>
                <small>{collector.active} actifs</small>
              </div>
              <div className="health-ring" style={{ '--value': `${collector.health * 3.6}deg` }}>
                <span>{collector.health}%</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default LogsPage;
