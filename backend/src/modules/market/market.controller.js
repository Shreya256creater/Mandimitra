import { getPrices, ingestPrice, listCrops, listMarkets } from './market.service.js';

export async function cropsHandler(_req, res, next) {
  try {
    res.json({ crops: await listCrops() });
  } catch (err) {
    next(err);
  }
}

export async function marketsHandler(req, res, next) {
  try {
    res.json({ markets: await listMarkets(req.query) });
  } catch (err) {
    next(err);
  }
}

export async function pricesHandler(req, res, next) {
  try {
    const prices = await getPrices({
      cropId: req.query.cropId,
      marketId: req.query.marketId,
      days: req.query.days,
    });
    res.json({ prices });
  } catch (err) {
    next(err);
  }
}

export async function ingestHandler(req, res, next) {
  try {
    const price = await ingestPrice(req.body);
    res.status(201).json({ price });
  } catch (err) {
    next(err);
  }
}
