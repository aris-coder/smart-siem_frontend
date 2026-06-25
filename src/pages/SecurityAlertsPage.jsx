import { useState } from 'react';
import { alerts, formatLabel, getAlertsForRole, hasPermission, severityTone } from '../data/siemData';
import { AccessNote, Badge, SectionHeader, StatCard } from '../components/ui';

function SecurityAlertsPage({ currentUser }) {
  const visibleAlerts = getAlertsForRole(currentUser.roleId);
  const canUpdateStatus = hasPermission(currentUser.roleId, 'alerts:update_status');
  const canRunPlaybook = hasPermission(currentUser.roleId, 'playbooks:run');
  const [selectedAlert, setSelectedAlert] = useState(visibleAlerts[0] || alerts[0]);

  return (
    <div className="page-stack">
      <section className="stats-grid alert-stats" aria-label="Indicateurs alertes">
        <StatCard label="Alertes totales" value="1,284" helper="dernières 24 h" tone="info" />
        <StatCard label="Alertes critiques" value="24" helper="action requise" tone="danger" />
        <StatCard label="Résolues aujourd'hui" value="156" helper="+12% vs hier" tone="success" />
        <StatCard label="Règles actives" value="892" helper="règles de corrélation" tone="warning" />
      </section>

      <div className="content-grid alerts-layout">
        <section className="panel span-2">
          <SectionHeader
            eyebrow="Alertes sécurité"
            title={canUpdateStatus ? 'File de triage SOC' : 'Incidents résolus'}
            subtitle={canUpdateStatus ? 'Alertes corrélées depuis logs, identité, réseau et endpoints.' : 'Vue lecture seule limitée aux incidents déjà résolus.'}
            action={canUpdateStatus && (
              <button className="btn btn-primary btn-sm d-flex align-items-center gap-2" type="button">
                <i className="bi bi-person-check" aria-hidden="true" />
                Assigner un analyste
              </button>
            )}
          />

          <div className="tabs">
            {(canUpdateStatus ? ['Toutes', 'Critiques', 'Ouvertes', 'Résolues'] : ['Résolues']).map((tab, index) => (
              <button className={index === 0 ? 'is-active' : ''} key={tab} type="button">{tab}</button>
            ))}
          </div>

          <div className="alert-list">
            {visibleAlerts.map((alert) => (
              <button
                className={`alert-row ${selectedAlert.id === alert.id ? 'is-selected' : ''}`}
                key={alert.id}
                type="button"
                onClick={() => setSelectedAlert(alert)}
              >
                <span className={`alert-check tone-${severityTone[alert.severity]}`} />
                <span className="alert-main">
                  <strong>{alert.title}</strong>
                  <small>{alert.source} - {alert.asset} - {alert.time}</small>
                </span>
                <Badge tone={severityTone[alert.severity]}>{formatLabel(alert.severity)}</Badge>
                <Badge tone={severityTone[alert.status]}>{formatLabel(alert.status)}</Badge>
              </button>
            ))}
          </div>
          {!canUpdateStatus && (
            <AccessNote>
              Le rôle Lecteur ne peut pas modifier le statut d'un incident ni exécuter de playbook SOAR.
            </AccessNote>
          )}
        </section>

        <aside className="panel alert-detail">
          <SectionHeader eyebrow="Détail de l'alerte" title={selectedAlert.id} />
          <Badge tone={severityTone[selectedAlert.severity]}>{formatLabel(selectedAlert.severity)}</Badge>
          <h2>{selectedAlert.title}</h2>
          <p>{selectedAlert.description}</p>

          <dl className="detail-list">
            <div>
              <dt>Categorie</dt>
              <dd>{selectedAlert.category}</dd>
            </div>
            <div>
              <dt>Actif</dt>
              <dd>{selectedAlert.asset}</dd>
            </div>
            <div>
              <dt>Responsable</dt>
              <dd>{selectedAlert.owner}</dd>
            </div>
            <div>
              <dt>IP source</dt>
              <dd>{selectedAlert.ip}</dd>
            </div>
            <div>
              <dt>Score</dt>
              <dd>{selectedAlert.score}/100</dd>
            </div>
          </dl>

          <div className="button-row">
            {canUpdateStatus && (
              <button className="btn btn-primary d-flex align-items-center gap-2" type="button">
                <i className="bi bi-play-circle" aria-hidden="true" />
                Passer en cours
              </button>
            )}
            {canRunPlaybook && (
              <button className="btn btn-outline-primary d-flex align-items-center gap-2" type="button">
                <i className="bi bi-terminal" aria-hidden="true" />
                Lancer le playbook
              </button>
            )}
            {!canUpdateStatus && !canRunPlaybook && (
              <AccessNote title="Lecture seule">
                Les actions de triage sont réservées aux analystes et administrateurs.
              </AccessNote>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default SecurityAlertsPage;
