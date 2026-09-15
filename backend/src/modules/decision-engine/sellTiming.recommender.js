/**
 * Sell-timing recommender (rule-based MVP).
 *
 * Compares current modal price vs the last 7–14 days of nearby-market prices.
 *   - Rising + storage available → WAIT_FEW_DAYS or SELL_PART_STORE_REST
 *   - Flat / falling / no storage → SELL_NOW
 *
 * TODO: swap `recommendSellTiming` for a time-series / ML model
 * (ARIMA, Prophet, or a trained regressor). Keep this function signature
 * and the three enum values so the API contract stays stable.
 *
 * @param {object} params
 * @param {number[]} params.modalPricesOldestFirst  daily modal prices
 * @param {boolean} params.hasStorage
 * @param {number} [params.storageDaysAvailable]
 * @returns {{ advice: 'SELL_NOW'|'WAIT_FEW_DAYS'|'SELL_PART_STORE_REST', reasoning: string, trendPct: number, waitDays: number }}
 */
export function recommendSellTiming({
  modalPricesOldestFirst = [],
  hasStorage = false,
  storageDaysAvailable = 0,
}) {
  const prices = modalPricesOldestFirst.filter((p) => Number.isFinite(Number(p))).map(Number);

  if (prices.length < 3) {
    return {
      advice: 'SELL_NOW',
      reasoning:
        'Not enough recent mandi price history to project a trend. Sell now at the best net-realisation option rather than waiting on an unknown market.',
      trendPct: 0,
      waitDays: 0,
    };
  }

  const recentWindow = prices.slice(-14);
  const shortWindow = recentWindow.slice(-7);
  const trendPct = percentChange(recentWindow[0], recentWindow[recentWindow.length - 1]);
  const shortTrendPct = percentChange(shortWindow[0], shortWindow[shortWindow.length - 1]);
  const canStore = Boolean(hasStorage) && (storageDaysAvailable == null || storageDaysAvailable > 0);
  const waitDays = canStore ? Math.min(storageDaysAvailable || 7, 7) : 0;

  // Strong recent rise + storage → hold some inventory
  if (canStore && trendPct >= 4 && shortTrendPct >= 1.5) {
    return {
      advice: 'SELL_PART_STORE_REST',
      reasoning: `Nearby mandi modal prices have risen about ${trendPct.toFixed(1)}% over the last two weeks (and ${shortTrendPct.toFixed(1)}% in the last 7 days). Sell part of the lot now to lock in cash, and store the rest for up to ${waitDays} days.`,
      trendPct,
      waitDays,
    };
  }

  if (canStore && trendPct >= 2) {
    return {
      advice: 'WAIT_FEW_DAYS',
      reasoning: `Prices are trending up (~${trendPct.toFixed(1)}% over 14 days). With storage available, waiting up to ${waitDays} days may improve net realisation after storage cost. Re-check daily — this is a rule-based signal, not a guarantee.`,
      trendPct,
      waitDays,
    };
  }

  if (!canStore && trendPct >= 3) {
    return {
      advice: 'SELL_NOW',
      reasoning: `Prices are rising (~${trendPct.toFixed(1)}%), but no storage is available. Selling now avoids spoilage and extra handling risk.`,
      trendPct,
      waitDays: 0,
    };
  }

  if (trendPct <= -1.5) {
    return {
      advice: 'SELL_NOW',
      reasoning: `Modal prices have softened (~${trendPct.toFixed(1)}% over 14 days). Holding is likely to reduce take-home profit. Prefer the highest net-realisation buyer/market today.`,
      trendPct,
      waitDays: 0,
    };
  }

  return {
    advice: 'SELL_NOW',
    reasoning: `The 14-day price trend is roughly flat (${trendPct.toFixed(1)}%). Without a clear upside, selling now at the best net realisation is the safer default.`,
    trendPct,
    waitDays: 0,
  };
}

function percentChange(from, to) {
  if (!from) return 0;
  return ((to - from) / from) * 100;
}
