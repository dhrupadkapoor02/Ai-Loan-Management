import * as loanRepo from "../repositories/loan.repository.js";
import { calculateEmi, generateAmortizationSchedule } from "../utils/loanMath.js";
import { serializeDecimals, serializeDecimalsList } from "../utils/serialize.js";
import { ApiError } from "../utils/ApiError.js";

const LOAN_DECIMAL_FIELDS = ["principal", "interestRate", "emiAmount", "totalInterest", "totalPayment"];

/** Pure calculation — no persistence. Powers the EMI Calculator screen. */
export function calculate({ principal, interestRate, tenureMonths }) {
  const result = calculateEmi(principal, interestRate, tenureMonths);
  const schedule = generateAmortizationSchedule(principal, interestRate, tenureMonths);
  return { ...result, schedule };
}

export async function saveLoan(userId, { type, principal, interestRate, tenureMonths, name, lender, notes }) {
  const { emi, totalInterest, totalPayment } = calculateEmi(principal, interestRate, tenureMonths);

  const loan = await loanRepo.createLoan({
    userId,
    type,
    principal,
    interestRate,
    tenureMonths,
    emiAmount: emi,
    totalInterest,
    totalPayment,
    name,
    lender,
    notes,
  });

  return serializeDecimals(loan, LOAN_DECIMAL_FIELDS);
}

export async function listLoans(userId, filters) {
  const loans = await loanRepo.findLoansByUser(userId, filters);
  return serializeDecimalsList(loans, LOAN_DECIMAL_FIELDS);
}

async function getOwnedLoan(userId, id) {
  const loan = await loanRepo.findLoanById(id);
  if (!loan) throw ApiError.notFound("Loan not found");
  if (loan.userId !== userId) throw ApiError.forbidden("You do not have access to this loan");
  return loan;
}

export async function updateLoan(userId, id, data) {
  await getOwnedLoan(userId, id);
  const updated = await loanRepo.updateLoan(id, data);
  return serializeDecimals(updated, LOAN_DECIMAL_FIELDS);
}

export async function deleteLoan(userId, id) {
  await getOwnedLoan(userId, id);
  await loanRepo.deleteLoan(id);
}

/** Side-by-side comparison of 2-5 hypothetical offers — pure calculation, nothing persisted. */
export function compareLoans(offers) {
  return offers.map((offer, index) => {
    const { emi, totalInterest, totalPayment } = calculateEmi(
      offer.principal,
      offer.interestRate,
      offer.tenureMonths
    );
    return {
      label: offer.label || `Offer ${index + 1}`,
      principal: Number(offer.principal),
      interestRate: Number(offer.interestRate),
      tenureMonths: Number(offer.tenureMonths),
      emi,
      totalInterest,
      totalPayment,
    };
  });
}
