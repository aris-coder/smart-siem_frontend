export interface MfaPolicy {
  enabled: boolean
  validitySeconds: number
  maxAttempts: number
  resendCooldownSeconds: number
  senderEmail: string
}

export const DEFAULT_MFA_POLICY: MfaPolicy = {
  enabled: true,
  validitySeconds: 60,
  maxAttempts: 3,
  resendCooldownSeconds: 10,
  senderEmail: 'security-alerts@siem-corp.local',
}

const STORAGE_KEY = 'smart-siem_mfa_policy'

export function getMfaPolicy(): MfaPolicy {
  if (typeof window === 'undefined') return DEFAULT_MFA_POLICY

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return DEFAULT_MFA_POLICY

    const parsed = JSON.parse(stored)
    return {
      enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : DEFAULT_MFA_POLICY.enabled,
      validitySeconds: typeof parsed.validitySeconds === 'number' ? parsed.validitySeconds : DEFAULT_MFA_POLICY.validitySeconds,
      maxAttempts: typeof parsed.maxAttempts === 'number' ? parsed.maxAttempts : DEFAULT_MFA_POLICY.maxAttempts,
      resendCooldownSeconds: typeof parsed.resendCooldownSeconds === 'number' ? parsed.resendCooldownSeconds : DEFAULT_MFA_POLICY.resendCooldownSeconds,
      senderEmail: typeof parsed.senderEmail === 'string' && parsed.senderEmail ? parsed.senderEmail : DEFAULT_MFA_POLICY.senderEmail,
    }
  } catch {
    return DEFAULT_MFA_POLICY
  }
}

export function setMfaPolicy(policy: MfaPolicy): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(policy))
  } catch (error) {
    console.error('Failed to save MFA policy settings:', error)
  }
}
