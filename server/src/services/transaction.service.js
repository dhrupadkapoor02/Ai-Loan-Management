import * as transactionRepo from "../repositories/transaction.repository.js";
import { buildPaginationMeta } from "../utils/pagination.js";

export async function listTransactions(userId, filters, pagination) {
  const { items, total } = await transactionRepo.findTransactions(userId, filters, pagination);
  return {
    items,
    meta: buildPaginationMeta({ page: pagination.page, limit: pagination.limit, total }),
  };
}
