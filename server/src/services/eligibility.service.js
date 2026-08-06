import { sumIncome } from "../repositories/income.repository.js";
import { sumActiveEmis } from "../repositories/loan.repository.js";
import { calculateEmi, maxPrincipalForEmi, round2 } from "../utils/loanMath.js";
import { monthRange, lastNMonths } from "../utils/dateRange.js";

/**
 * A common simplified underwriting heuristic: total monthly debt payments
 * (existing EMIs + the new one being requested) shouldn't exceed this
 * fraction of monthly income. Real lenders use far more inputs (credit
 * history, employment stability, collateral, etc.) — this is a transparent
 * estimate to help the user gut-check a loan amount, not a guarantee of
 * approval from any actual lender.
 */
const DTI_THRESHOLD = 0.5;
const INCOME_LOOKBACK_MONTHS = 3;

export async function checkEligibility(userId, { requestedAmount, interestRate, tenureMonths }) {
  const months = lastNMonths(INCOME_LOOKBACK_MONTHS);
  const { start } = monthRange(months[0].month, months[0].year);
  const { end } = monthRange(months[months.length - 1].month, months[months.length - 1].year);

  const totalIncome = await sumIncome(userId, { startDate: start, endDate: end });
  const avgMonthlyIncome = totalIncome / INCOME_LOOKBACK_MONTHS;

  const existingMonthlyEmis = await sumActiveEmis(userId);

  const maxAllowableEmi = Math.max(avgMonthlyIncome * DTI_THRESHOLD - existingMonthlyEmis, 0);

  const { emi: requestedEmi, totalInterest, totalPayment } = calculateEmi(
    requestedAmount,
    interestRate,
    tenureMonths
  );

  const isEligible = avgMonthlyIncome > 0 && requestedEmi <= maxAllowableEmi;

  const debtToIncomeRatio =
    avgMonthlyIncome > 0
      ? round2(((existingMonthlyEmis + requestedEmi) / avgMonthlyIncome) * 100)
      : null;

  let eligibilityScore = 0;
  if (avgMonthlyIncome > 0) {
    const usedRatio = (existingMonthlyEmis + requestedEmi) / avgMonthlyIncome;
    eligibilityScore = Math.max(0, Math.min(100, Math.round((1 - usedRatio / DTI_THRESHOLD) * 100)));
  }

  const suggestedMaxPrincipal = maxPrincipalForEmi(maxAllowableEmi, interestRate, tenureMonths);

  return {
    isEligible,
    avgMonthlyIncome: round2(avgMonthlyIncome),
    existingMonthlyEmis: round2(existingMonthlyEmis),
    maxAllowableEmi: round2(maxAllowableEmi),
    requestedEmi,
    totalInterest,
    totalPayment,
    debtToIncomeRatioPercent: debtToIncomeRatio,
    eligibilityScore,
    suggestedMaxPrincipal,
    assumptions: {
      dtiThresholdPercent: DTI_THRESHOLD * 100,
      incomeLookbackMonths: INCOME_LOOKBACK_MONTHS,
      note:
        "This is a simplified estimate based on your recorded income and active loans — not a guarantee of approval from any lender.",
    },
  };
}
