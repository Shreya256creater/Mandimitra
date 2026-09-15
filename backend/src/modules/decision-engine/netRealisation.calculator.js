import { DEFAULT_DISTANCE_KM, haversineKm } from '../../utils/distanceCalculator.js';

const TRANSPORT_RATE = Number(process.env.TRANSPORT_RATE_PER_KM_PER_QUINTAL || 1.5);
const STORAGE_RATE = Number(process.env.STORAGE_RATE_PER_DAY_PER_QUINTAL || 2.0);

/**
 * Net Realisation Engine — take-home ₹ per quintal, not listed price.
 *
 *   netRealisation = offerPrice - transportCostPerUnit - storageCostPerUnit
 *
 * TODO: swap this formula for a richer cost model (fuel index, truck type,
 * loading/unloading, commission, wastage) without changing the return shape.
 *
 * @param {object} params
 * @param {number} params.offerPrice ₹ / quintal
 * @param {number|null} params.farmerLat
 * @param {number|null} params.farmerLng
 * @param {number|null} params.destLat
 * @param {number|null} params.destLng
 * @param {number} [params.delayDays=0] days produce sits in storage before sale
 * @returns {{ distanceKm: number, transportCost: number, storageCost: number, netRealisation: number }}
 */
export function calculateNetRealisation({
  offerPrice,
  farmerLat,
  farmerLng,
  destLat,
  destLng,
  delayDays = 0,
}) {
  const computed = haversineKm(farmerLat, farmerLng, destLat, destLng);
  const distanceKm = computed == null ? DEFAULT_DISTANCE_KM : round2(computed);

  const transportCost = round2(distanceKm * TRANSPORT_RATE);
  const storageCost = round2(Math.max(0, delayDays) * STORAGE_RATE);
  const netRealisation = round2(Number(offerPrice) - transportCost - storageCost);

  return { distanceKm, transportCost, storageCost, netRealisation };
}

export function getTransportRate() {
  return TRANSPORT_RATE;
}

export function getStorageRate() {
  return STORAGE_RATE;
}

function round2(n) {
  return Math.round(Number(n) * 100) / 100;
}
