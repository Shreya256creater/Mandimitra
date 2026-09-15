import { evaluateSellDecision } from './decisionEngine.service.js';
import { parseBody, evaluateDecisionSchema } from '../../utils/validators.js';

export async function evaluate(req, res, next) {
  try {
    const input = parseBody(evaluateDecisionSchema, req.body);
    const result = await evaluateSellDecision(req.user?.id, input);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
