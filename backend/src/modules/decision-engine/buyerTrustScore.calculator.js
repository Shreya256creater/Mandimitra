/**
 * Buyer Trust Score — reliability, not just a rating star.
 *
 * Weighted average scaled 0–100:
 *   50% on-time payment rate
 *   30% deal volume (normalized to 50 completed deals)
 *   20% inverse of average payment delay
 *
 * TODO: replace with a Bayesian / Elo-style model that also factors in
 * grievance rate and quantity of disputed lots. Keep the 0–100 contract.
 *
 * @param {object} buyer
 * @param {number} buyer.onTimePaymentRate  0–1
 * @param {number} buyer.totalDealsCompleted
 * @param {number} buyer.avgPaymentDelayDays
 * @returns {number} 0–100
 */
export function calculateBuyerTrustScore(buyer) {
  const onTime = clamp(Number(buyer.onTimePaymentRate) || 0, 0, 1);
  const deals = Math.max(0, Number(buyer.totalDealsCompleted) || 0);
  const delay = Math.max(0, Number(buyer.avgPaymentDelayDays) || 0);

  const onTimeComponent = onTime * 100;
  const volumeComponent = Math.min(deals / 50, 1) * 100;
  // 0 delay → 100; ~7 days → 50; long delays approach 0
  const delayComponent = (1 / (1 + delay / 7)) * 100;

  const score = 0.5 * onTimeComponent + 0.3 * volumeComponent + 0.2 * delayComponent;
  return Math.round(clamp(score, 0, 100) * 10) / 10;
}

/**
 * Grade match between farmer produce and buyer minimum requirement.
 * Returns 0–100. Below-min grade is penalized, not zeroed, so farmers still
 * see the option with a quality warning.
 */
export function calculateQualityMatch(farmerGrade, buyerMinGrade) {
  const rank = { A: 3, FAQ: 2, B: 2, C: 1 };
  const farmer = rank[String(farmerGrade).toUpperCase()] ?? 1;
  const required = rank[String(buyerMinGrade || 'C').toUpperCase()] ?? 1;
  if (farmer >= required) return 100;
  return Math.round((farmer / required) * 70);
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}
