import { activityTrail, formatLabel, severityTone, users } from '../data/siemData';
import { Badge, DataTable, SectionHeader } from '../components/ui';

function SettingsPage() {
  const userRows = users.map((user) => [
    <span className="identity-cell"><span className="avatar muted">{user.initials}</span>{user.name}</span>,
    user.username,
    user.role,
    <Badge tone={severityTone[user.status]}>{formatLabel(user.status)}</Badge>,
    user.lastLogin,
  ]);

  const activityRows = activityTrail.map((entry) => [
    entry.time,
    entry.actor,
    entry.action,
    entry.target,
  ]);

  return (
    <div className="content-grid settings-layout">
      <section className="panel span-2">
        <SectionHeader
          eyebrow="Gestion des utilisateurs"
          title="Gestion utilisateur"
          subtitle="Administration des rôles, accès et statuts des utilisateurs SOC."
          action={(
            <button className="btn btn-primary btn-sm d-flex align-items-center gap-2" type="button">
              <i className="bi bi-person-plus" aria-hidden="true" />
              Ajouter un utilisateur
            </button>
          )}
        />
        <DataTable
          columns={['Nom', 'Identifiant', 'Rôle', 'Statut', 'Dernière connexion']}
          rows={userRows}
        />
      </section>

      <aside className="panel">
        <SectionHeader eyebrow="Politique RBAC" title="Permissions" />
        <div className="policy-stack">
          {[
            ['Admin', 'Accès complet, utilisateurs, rétention'],
            ['Analyste', 'Investigation et mise à jour des incidents'],
            ['Lecteur', 'Lecture seule des tableaux et rapports'],
          ].map(([role, scope]) => (
            <article className="policy-card" key={role}>
              <strong>{role}</strong>
              <small>{scope}</small>
            </article>
          ))}
        </div>

        <div className="security-note">
          <Badge tone="success">MFA obligatoire</Badge>
          <p>Les sessions analystes expirent après 30 minutes d'inactivité.</p>
        </div>
      </aside>

      <section className="panel span-2">
        <SectionHeader eyebrow="Audit récent" title="Activité administrative" />
        <DataTable
          columns={['Heure', 'Acteur', 'Action', 'Cible']}
          rows={activityRows}
        />
      </section>

      <section className="panel">
        <SectionHeader eyebrow="Création utilisateur" title="Invitation rapide" />
        <form className="settings-form">
          <label className="form-label">
            Email
            <input className="form-control" placeholder="user@siem.local" type="email" />
          </label>
          <label className="form-label">
            Rôle
            <select className="form-select" defaultValue="Analyste">
              <option>Admin</option>
              <option>Analyste</option>
              <option>Lecteur</option>
            </select>
          </label>
          <label className="form-check check-label">
            <input className="form-check-input" type="checkbox" defaultChecked />
            <span className="form-check-label">Exiger la réinitialisation du mot de passe</span>
          </label>
          <button className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2" type="button">
            <i className="bi bi-send" aria-hidden="true" />
            Envoyer l'invitation
          </button>
        </form>
      </section>
    </div>
  );
}

export default SettingsPage;
