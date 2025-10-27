// Risk thresholds
const RISK_THRESHOLD_LOW = 30;
const RISK_THRESHOLD_MEDIUM = 60;

// Risk indicator emojis
export const RISK_INDICATOR_LOW = "🟢";
export const RISK_INDICATOR_MEDIUM = "🟡";
export const RISK_INDICATOR_HIGH = "🔴";

// Type for risk levels
export type RiskLevel = "low" | "medium" | "high";

/**
 * Determine risk indicator based on average days past due
 * @param avgDpd - Average days past due
 * @returns Risk indicator emoji
 */
export function getRiskIndicator(avgDpd: number): string {
  if (avgDpd < RISK_THRESHOLD_LOW) {
    return RISK_INDICATOR_LOW;
  } else if (avgDpd < RISK_THRESHOLD_MEDIUM) {
    return RISK_INDICATOR_MEDIUM;
  } else {
    return RISK_INDICATOR_HIGH;
  }
}

/**
 * Get risk level classification
 * @param avgDpd - Average days past due
 * @returns Risk level string
 */
export function getRiskLevel(avgDpd: number): RiskLevel {
  if (avgDpd < RISK_THRESHOLD_LOW) {
    return "low";
  } else if (avgDpd < RISK_THRESHOLD_MEDIUM) {
    return "medium";
  } else {
    return "high";
  }
}
