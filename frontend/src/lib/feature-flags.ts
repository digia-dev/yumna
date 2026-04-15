// 480 – Feature Flag System
// Lightweight client-side feature flags (server-configured via env vars)
// Integrates with GrowthBook or can be used standalone.

export type FeatureFlag =
  | 'ZAKAT_AUTO_CALC'
  | 'AI_VOICE_INPUT'
  | 'SAKINAH_MODE'
  | 'BARAKAH_SCORE'
  | 'DARK_MODE'
  | 'PWA_INSTALL_PROMPT'
  | 'COLLABORATIVE_TASKS'
  | 'ADVANCED_ANALYTICS'
  | 'GEOFENCING_REMINDERS'
  | 'FIELD_ENCRYPTION'
  | 'AI_FORECAST'
  | 'HOLIDAY_PLANNER'
  | 'FAMILY_MEETING_AGENDA'
  | 'EXPORT_PDF'
  | 'EXPORT_CSV'
  | 'TAX_PREP'
  | 'BILL_AUTOPAY'
  | 'PRIVATE_TASKS'
  | 'PUSH_NOTIFICATIONS'
  | 'BETA_FEATURES';

// Default flag values (all enabled for production)
const DEFAULT_FLAGS: Record<FeatureFlag, boolean> = {
  ZAKAT_AUTO_CALC:          true,
  AI_VOICE_INPUT:           true,
  SAKINAH_MODE:             true,
  BARAKAH_SCORE:            true,
  DARK_MODE:                true,
  PWA_INSTALL_PROMPT:       true,
  COLLABORATIVE_TASKS:      true,
  ADVANCED_ANALYTICS:       true,
  GEOFENCING_REMINDERS:     false, // Future feature
  FIELD_ENCRYPTION:         true,
  AI_FORECAST:              true,
  HOLIDAY_PLANNER:          true,
  FAMILY_MEETING_AGENDA:    true,
  EXPORT_PDF:               true,
  EXPORT_CSV:               true,
  TAX_PREP:                 true,
  BILL_AUTOPAY:             true,
  PRIVATE_TASKS:            true,
  PUSH_NOTIFICATIONS:       false, // Requires VAPID keys
  BETA_FEATURES:            false,
};

class FeatureFlagService {
  private flags: Record<FeatureFlag, boolean>;

  constructor() {
    // Load overrides from localStorage (allows runtime toggling)
    const stored = this.loadStored();
    this.flags = { ...DEFAULT_FLAGS, ...stored };
  }

  private loadStored(): Partial<Record<FeatureFlag, boolean>> {
    if (typeof window === 'undefined') return {};
    try {
      return JSON.parse(localStorage.getItem('yumna:feature-flags') || '{}');
    } catch {
      return {};
    }
  }

  /**
   * Check if a feature flag is enabled
   */
  isEnabled(flag: FeatureFlag): boolean {
    return this.flags[flag] ?? DEFAULT_FLAGS[flag] ?? false;
  }

  /**
   * Override a flag (persists to localStorage — useful for A/B testing)
   */
  setFlag(flag: FeatureFlag, value: boolean): void {
    this.flags[flag] = value;
    if (typeof window !== 'undefined') {
      const stored = this.loadStored();
      stored[flag] = value;
      localStorage.setItem('yumna:feature-flags', JSON.stringify(stored));
    }
  }

  /**
   * Get all current flag values
   */
  getAllFlags(): Record<FeatureFlag, boolean> {
    return { ...this.flags };
  }

  /**
   * Reset all flags to defaults
   */
  reset(): void {
    this.flags = { ...DEFAULT_FLAGS };
    if (typeof window !== 'undefined') {
      localStorage.removeItem('yumna:feature-flags');
    }
  }
}

// Singleton export
export const featureFlags = new FeatureFlagService();

/**
 * React hook for feature flags
 * Usage: const isEnabled = useFeatureFlag('DARK_MODE');
 */
export function useFeatureFlag(flag: FeatureFlag): boolean {
  return featureFlags.isEnabled(flag);
}
