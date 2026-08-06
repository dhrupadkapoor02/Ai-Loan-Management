import * as loanApplicationRepo from "../repositories/loanApplication.repository.js";
import * as loanRepo from "../repositories/loan.repository.js";
import { serializeDecimals, serializeDecimalsList } from "../utils/serialize.js";
import { ApiError } from "../utils/ApiError.js";

const DECIMAL_FIELDS = ["amountRequested", "interestRate"];
const CANCELLABLE_STATUSES = ["PENDING", "UNDER_REVIEW"];

export async function submitApplication(
  userId,
  { type, amountRequested, interestRate, tenureMonths, purpose, loanId }
) {
  if (loanId) {
    const loan = await loanRepo.findLoanById(loanId);
    if (!loan) throw ApiError.badRequest("Referenced loan not found");
    if (loan.userId !== userId) throw ApiError.forbidden("You do not have access to that loan");
  }

  const application = await loanApplicationRepo.createLoanApplication({
    userId,
    type,
    amountRequested,
    interestRate,
    tenureMonths,
    purpose,
    loanId: loanId || null,
  });

  return serializeDecimals(application, DECIMAL_FIELDS);
}

export async function listApplications(userId, filters) {
  const applications = await loanApplicationRepo.findLoanApplicationsByUser(userId, filters);
  return serializeDecimalsList(applications, DECIMAL_FIELDS);
}

async function getOwnedApplication(userId, id) {
  const application = await loanApplicationRepo.findLoanApplicationById(id);
  if (!application) throw ApiError.notFound("Loan application not found");
  if (application.userId !== userId) throw ApiError.forbidden("You do not have access to this application");
  return application;
}

export async function getApplication(userId, id) {
  const application = await getOwnedApplication(userId, id);
  return serializeDecimals(application, DECIMAL_FIELDS);
}

export async function cancelApplication(userId, id) {
  const application = await getOwnedApplication(userId, id);
  if (!CANCELLABLE_STATUSES.includes(application.status)) {
    throw ApiError.badRequest(`Cannot cancel an application with status ${application.status}`);
  }
  const updated = await loanApplicationRepo.updateLoanApplication(id, { status: "CANCELLED" });
  return serializeDecimals(updated, DECIMAL_FIELDS);
}

/**
 * Admin action — approve/reject/put-under-review. Not wired to a route yet
 * (Module 10 adds the `authorize("ADMIN")`-gated endpoint); lives here now
 * so the business logic ships alongside the model it governs.
 */
export async function reviewApplication(adminUserId, id, { status, reviewNotes }) {
  const application = await loanApplicationRepo.findLoanApplicationById(id);
  if (!application) throw ApiError.notFound("Loan application not found");

  const updated = await loanApplicationRepo.updateLoanApplication(id, {
    status,
    reviewNotes,
    reviewedBy: adminUserId,
    reviewedAt: new Date(),
  });
  return serializeDecimals(updated, DECIMAL_FIELDS);
}
