import { createTransaction, listTransactions, updateTransaction } from './transaction.service.js';
import { parseBody, createTransactionSchema } from '../../utils/validators.js';

export async function listHandler(req, res, next) {
  try {
    const transactions = await listTransactions({
      userId: req.user.id,
      role: req.user.role,
    });
    res.json({ transactions });
  } catch (err) {
    next(err);
  }
}

export async function createHandler(req, res, next) {
  try {
    const data = parseBody(createTransactionSchema, req.body);
    const transaction = await createTransaction(data);
    res.status(201).json({ transaction });
  } catch (err) {
    next(err);
  }
}

export async function updateHandler(req, res, next) {
  try {
    const transaction = await updateTransaction(req.params.id, req.body);
    res.json({ transaction });
  } catch (err) {
    next(err);
  }
}
