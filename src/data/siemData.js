export const navItems = [
  {
    id: 'dashboard',
    label: 'Tableau de bord',
    eyebrow: 'Vue globale',
    endpoint: '/api/v1/dashboard/stats',
    icon: 'bi-speedometer2',
    roles: ['reader', 'analyst', 'admin'],
  },
  {
    id: 'logs',
    label: 'Journaux',
    eyebrow: 'Explorateur d\'événements',
    endpoint: '/api/v1/logs/search',
    icon: 'bi-list-ul',
    roles: ['reader', 'analyst', 'admin'],
  },
  {
    id: 'alerts',
    label: 'Alertes de sécurité',
    eyebrow: 'File SOC',
    endpoint: '/api/v1/incidents',
    icon: 'bi-shield-exclamation',
    roles: ['reader', 'analyst', 'admin'],
  },
  {
    id: 'reports',
    label: 'Rapports et analyses',
    eyebrow: 'Analyse',
    endpoint: '/api/v1/reports/generate',
    icon: 'bi-bar-chart-line',
    roles: ['reader', 'analyst', 'admin'],
  },
  {
    id: 'settings',
    label: 'Paramètres',
    eyebrow: 'Administration',
    endpoint: '/api/v1/admin/users',
    icon: 'bi-gear',
    roles: ['reader', 'analyst', 'admin'],
  },
];

export const roles = {
  reader: {
    id: 'reader',
    label: 'Lecteur',
    description: 'Auditeur / agent terrain',
    initials: 'LC',
  },
  analyst: {
    id: 'analyst',
    label: 'Analyste',
    description: 'Opérateur SOC',
    initials: 'SA',
  },
  admin: {
    id: 'admin',
    label: 'Administrateur',
    description: 'Architecte SIEM',
    initials: 'AS',
  },
};

export const rolePermissions = {
  reader: [
    'dashboard:view',
    'logs:view_limited',
    'alerts:view_resolved',
    'reports:export_readonly',
    'profile:manage',
  ],
  analyst: [
    'dashboard:view',
    'logs:view_full',
    'alerts:view_all',
    'alerts:update_status',
    'playbooks:run',
    'playbooks:cancel',
    'audit:view',
    'reports:generate_investigation',
    'profile:manage',
  ],
  admin: [
    'dashboard:view',
    'logs:view_full',
    'alerts:view_all',
    'alerts:update_status',
    'playbooks:run',
    'playbooks:cancel',
    'audit:view',
    'reports:generate_investigation',
    'rules:crud',
    'users:manage',
    'retention:configure',
    'integrity:validate',
    'workers:configure',
    'profile:manage',
  ],
};

export function hasPermission(roleId, permission) {
  return rolePermissions[roleId]?.includes(permission) || false;
}

export function getDefaultPageForRole(roleId) {
  return navItems.find((item) => item.roles.includes(roleId))?.id || 'dashboard';
}

export function getVisibleNavItems(roleId) {
  return navItems.filter((item) => item.roles.includes(roleId));
}

export const displayLabels = {
  CRITICAL: 'Critique',
  HIGH: 'Élevée',
  MEDIUM: 'Moyenne',
  LOW: 'Faible',
  INFO: 'Information',
  OPEN: 'Ouverte',
  IN_PROGRESS: 'En cours',
  RESOLVED: 'Résolue',
  FALSE_POSITIVE: 'Faux positif',
  Active: 'Actif',
  Inactive: 'Inactif',
  Ready: 'Prêt',
  Running: 'En cours',
  Failed: 'Échec',
};

export function formatLabel(value) {
  return displayLabels[value] || value;
}

export const severityTone = {
  CRITICAL: 'danger',
  HIGH: 'warning',
  MEDIUM: 'notice',
  LOW: 'success',
  INFO: 'info',
  OPEN: 'danger',
  IN_PROGRESS: 'warning',
  RESOLVED: 'success',
  FALSE_POSITIVE: 'muted',
  Active: 'success',
  Inactive: 'muted',
  Ready: 'success',
  Running: 'warning',
  Failed: 'danger',
};

export const dashboardStats = [
  { label: 'Journaux traités', value: '1.2M', helper: '+15% vs hier', tone: 'info' },
  { label: 'Menaces détectées', value: '144', helper: '24 critiques', tone: 'danger' },
  { label: 'Faux positifs', value: '03', helper: '-8% cette semaine', tone: 'warning' },
  { label: 'MTTR moyen', value: '1h 26m', helper: 'objectif 2h', tone: 'success' },
];

export const trafficSeries = [
  { label: '00h', safe: 31, alert: 8 },
  { label: '03h', safe: 36, alert: 11 },
  { label: '06h', safe: 45, alert: 18 },
  { label: '09h', safe: 58, alert: 23 },
  { label: '12h', safe: 72, alert: 35 },
  { label: '15h', safe: 64, alert: 28 },
  { label: '18h', safe: 83, alert: 42 },
  { label: '21h', safe: 69, alert: 31 },
];

export const logs = [
  {
    id: 'LOG-4182',
    time: '21:17:12',
    severity: 'CRITICAL',
    source: 'vpn-gw-01',
    sourceIp: '185.21.44.9',
    destination: '10.10.4.12',
    event: 'auth.failure',
    message: '48 tentatives SSH depuis une source rare',
    hash: 'sha256:9c2a',
  },
  {
    id: 'LOG-4174',
    time: '21:12:38',
    severity: 'HIGH',
    source: 'ad-dc-02',
    sourceIp: '10.10.2.14',
    destination: 'domain-admins',
    event: 'identity.escalation',
    message: 'Ajout au groupe Domain Admins après échec login',
    hash: 'sha256:71de',
  },
  {
    id: 'LOG-4169',
    time: '21:08:04',
    severity: 'HIGH',
    source: 'dns-edge-04',
    sourceIp: '10.10.7.43',
    destination: 'rare-domain.net',
    event: 'network.dns',
    message: 'Requêtes TXT volumineuses vers domaine rare',
    hash: 'sha256:18af',
  },
  {
    id: 'LOG-4158',
    time: '20:58:46',
    severity: 'MEDIUM',
    source: 'edr-wks-18',
    sourceIp: '10.10.9.18',
    destination: 'powershell.exe',
    event: 'process.spawn',
    message: 'PowerShell avec argument encodé',
    hash: 'sha256:a0fd',
  },
  {
    id: 'LOG-4144',
    time: '20:44:15',
    severity: 'INFO',
    source: 'fw-core-01',
    sourceIp: '10.10.1.1',
    destination: '45.90.28.13',
    event: 'traffic.allow',
    message: 'Flux sortant autorisé vers nouvel ASN',
    hash: 'sha256:1bd4',
  },
];

export function sanitizeLogForRole(log, roleId) {
  if (roleId !== 'reader') {
    return log;
  }

  const { hash, ...safeLog } = log;

  return {
    ...safeLog,
    sourceIp: safeLog.sourceIp.replace(/\.\d+$/, '.xxx'),
    destination: safeLog.destination.includes('.') ? safeLog.destination.replace(/\.\d+$/, '.xxx') : safeLog.destination,
  };
}

export const alerts = [
  {
    id: 'ALT-2406-117',
    title: 'Injection SQL potentielle détectée sur la base de production',
    severity: 'CRITICAL',
    status: 'OPEN',
    source: 'waf-prod-02',
    asset: 'prod-db-01',
    owner: 'A. Mvondo',
    category: 'Application',
    score: 98,
    time: 'il y a 4 min',
    ip: '185.21.44.9',
    response: 'Bloquer l\'IP et isoler la session',
    description: 'Payload SQL répété sur endpoint login avec variation de signature et hausse de latence DB.',
  },
  {
    id: 'ALT-2406-109',
    title: 'Trafic sortant suspect vers une IP signalée',
    severity: 'HIGH',
    status: 'IN_PROGRESS',
    source: 'fw-core-01',
    asset: 'fin-app-03',
    owner: 'N. Makosso',
    category: 'Réseau',
    score: 87,
    time: 'il y a 18 min',
    ip: '45.90.28.13',
    response: 'Confiner l\'hôte',
    description: 'Connexions périodiques vers une IP réputée malveillante depuis un serveur financier.',
  },
  {
    id: 'ALT-2406-096',
    title: 'Multiples échecs de connexion',
    severity: 'MEDIUM',
    status: 'OPEN',
    source: 'ad-dc-02',
    asset: 'identity-core',
    owner: 'M. Biloa',
    category: 'Identité',
    score: 72,
    time: 'il y a 42 min',
    ip: '10.10.2.14',
    response: 'Forcer la réinitialisation MFA',
    description: "Pic d'échecs de connexion suivi d'une authentification réussie sur compte privilégié.",
  },
  {
    id: 'ALT-2406-081',
    title: 'Charge utile encodée en ligne de commande',
    severity: 'LOW',
    status: 'RESOLVED',
    source: 'edr-wks-18',
    asset: 'wks-fin-18',
    owner: 'S. Nkoa',
    category: 'Poste',
    score: 44,
    time: 'il y a 1 h',
    ip: '10.10.9.18',
    response: 'Revue analyste',
    description: 'Exécution PowerShell encodée classifiée comme activité admin légitime après vérification.',
  },
];

export function getAlertsForRole(roleId) {
  if (roleId === 'reader') {
    return alerts.filter((alert) => alert.status === 'RESOLVED');
  }

  return alerts;
}

export const reportCards = [
  { label: 'Rapports générés', value: '1,284', helper: '+18% ce mois-ci', tone: 'info' },
  { label: 'Rapports critiques', value: '24', helper: 'à réviser', tone: 'danger' },
  { label: 'Résolution moyenne', value: '2.8h', helper: '-30 min', tone: 'success' },
];

export const attackTypes = [
  { label: 'Logiciels malveillants', value: 94, amount: '382 cas' },
  { label: 'Hameçonnage', value: 82, amount: '341 cas' },
  { label: 'Force brute', value: 63, amount: '268 cas' },
  { label: 'Exfiltration de données', value: 48, amount: '154 cas' },
  { label: 'Abus de privilèges', value: 36, amount: '91 cas' },
];

export const reports = [
  { id: 'REP-8801', name: 'Synthèse hebdomadaire des menaces', type: 'PDF', status: 'Ready', created: '24 juin 2026', owner: 'A. Mvondo' },
  { id: 'REP-8794', name: 'Modèles d\'événements de sécurité', type: 'Excel', status: 'Running', created: '24 juin 2026', owner: 'N. Makosso' },
  { id: 'REP-8750', name: 'Audit de réponse aux incidents', type: 'PDF', status: 'Ready', created: '23 juin 2026', owner: 'M. Biloa' },
  { id: 'REP-8718', name: 'Dossier de preuves conformité', type: 'PDF', status: 'Failed', created: '22 juin 2026', owner: 'Système' },
];

export const users = [
  { name: 'Administrateur SOC', username: 'admin@siem.local', role: 'Admin', roleId: 'admin', status: 'Active', lastLogin: 'il y a 2 min', initials: 'AS' },
  { name: 'Analyste sécurité', username: 'analyst@siem.local', role: 'Analyste', roleId: 'analyst', status: 'Active', lastLogin: 'il y a 18 min', initials: 'SA' },
  { name: 'Claire Biloa', username: 'c.biloa@siem.local', role: 'Analyste', roleId: 'analyst', status: 'Active', lastLogin: 'il y a 1 h', initials: 'CB' },
  { name: 'Lecteur système', username: 'viewer@siem.local', role: 'Lecteur', roleId: 'reader', status: 'Inactive', lastLogin: 'il y a 2 jours', initials: 'LS' },
];

export const activityTrail = [
  { time: '21:16', actor: 'admin@siem.local', action: 'Rôle utilisateur modifié', target: 'Analyste sécurité' },
  { time: '21:10', actor: 'système', action: 'Règle de corrélation déclenchée', target: 'R001 SSH Brute Force' },
  { time: '20:51', actor: 'analyst@siem.local', action: 'Rapport généré', target: 'Synthèse hebdomadaire des menaces' },
  { time: '20:37', actor: 'admin@siem.local', action: 'Politique de rétention modifiée', target: 'Journaux bruts' },
];

export const collectors = [
  { name: 'Équipements réseau', active: '32/32', health: 100 },
  { name: 'Agents Linux', active: '412/416', health: 99 },
  { name: 'Windows EDR', active: '188/193', health: 97 },
];
