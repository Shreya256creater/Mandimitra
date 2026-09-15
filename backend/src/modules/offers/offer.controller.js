import { createOffer, listOffers } from './offer.service.js';
import { parseBody, createOfferSchema } from '../../utils/validators.js';

export async function listHandler(req, res, next) {
  try {
    const offers = await listOffers({
      cropId: req.query.cropId,
      buyerId: req.query.buyerId,
      status: req.query.status,
    });
    res.json({ offers });
  } catch (err) {
    next(err);
  }
}

export async function createHandler(req, res, next) {
  try {
    const data = parseBody(createOfferSchema, req.body);
    const offer = await createOffer(req.user.id, data);
    res.status(201).json({ offer });
  } catch (err) {
    next(err);
  }
}
