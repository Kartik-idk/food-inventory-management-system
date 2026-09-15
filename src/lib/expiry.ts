import { differenceInDays, parseISO, startOfDay } from "date-fns";

export type RiskLevel = "EXPIRED" | "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export function calculateExpiryRisk(expiryDateStr: string): { risk: RiskLevel; days: number } {
  const expiryDate = startOfDay(parseISO(expiryDateStr));
  const today = startOfDay(new Date());
  const days = differenceInDays(expiryDate, today);

  let risk: RiskLevel = "LOW";
  
  if (days < 0) {
    risk = "EXPIRED";
  } else if (days >= 0 && days <= 2) {
    risk = "CRITICAL";
  } else if (days >= 3 && days <= 5) {
    risk = "HIGH";
  } else if (days >= 6 && days <= 10) {
    risk = "MEDIUM";
  } else {
    risk = "LOW";
  }

  return { risk, days };
}

export function getBadgeVariant(risk: RiskLevel): string {
  switch (risk) {
    case "EXPIRED":
      return "bg-status-waste text-white border-transparent";
    case "CRITICAL":
      return "bg-status-critical text-white border-transparent";
    case "HIGH":
    case "MEDIUM":
      return "bg-status-warning text-white border-transparent";
    case "LOW":
    default:
      return "bg-status-normal text-white border-transparent";
  }
}
