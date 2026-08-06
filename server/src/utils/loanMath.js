/**
 * Standard reducing-balance EMI formula:
 *   EMI = P * r * (1+r)^n / ((1+r)^n - 1)
 * where P = principal, r = monthly interest rate (annual% / 12 / 100),
 * n = tenure in months. Falls back to a straight-line split when the rate
 * is 0% (the formula above divides by zero at r=0).
 */
export function calculateEmi(principal, annualRatePercent, tenureMonths) {
  const P = Number(principal);
  const n = Number(tenureMonths);
  const r = Number(annualRatePercent) / 12 / 100;

  let emi;
  if (r === 0) {
    emi = P / n;
  } else {
    const factor = Math.pow(1 + r, n);
    emi = (P * r * factor) / (factor - 1);
  }

  const totalPayment = emi * n;
  const totalInterest = totalPayment - P;

  return {
    emi: round2(emi),
    totalInterest: round2(totalInterest),
    totalPayment: round2(totalPayment),
  };
}

/**
 * Month-by-month breakdown of principal vs. interest. The final month's
 * principal component is adjusted to absorb rounding drift so the
 * remaining balance lands exactly on 0.00, not -0.03 or similar.
 */
export function generateAmortizationSchedule(principal, annualRatePercent, tenureMonths) {
  const P = Number(principal);
  const n = Number(tenureMonths);
  const r = Number(annualRatePercent) / 12 / 100;
  const { emi } = calculateEmi(P, annualRatePercent, n);

  const schedule = [];
  let balance = P;

  for (let month = 1; month <= n; month++) {
    const interestComponent = round2(balance * r);
    let principalComponent = round2(emi - interestComponent);

    if (month === n) {
      // Absorb rounding drift on the final installment.
      principalComponent = round2(balance);
    }

    balance = round2(balance - principalComponent);

    schedule.push({
      month,
      emi: round2(principalComponent + interestComponent),
      principalComponent,
      interestComponent,
      remainingBalance: Math.max(balance, 0),
    });
  }

  return schedule;
}

/**
 * Inverse of the EMI formula: given a monthly budget, rate, and tenure,
 * what's the largest principal that stays within that EMI? Used by the
 * eligibility checker to suggest a maximum loan amount.
 */
export function maxPrincipalForEmi(emiBudget, annualRatePercent, tenureMonths) {
  const emi = Number(emiBudget);
  const n = Number(tenureMonths);
  const r = Number(annualRatePercent) / 12 / 100;

  if (emi <= 0) return 0;

  let principal;
  if (r === 0) {
    principal = emi * n;
  } else {
    const factor = Math.pow(1 + r, n);
    principal = (emi * (factor - 1)) / (r * factor);
  }

  return round2(Math.max(principal, 0));
}

export function round2(value) {
  return Math.round(value * 100) / 100;
}
