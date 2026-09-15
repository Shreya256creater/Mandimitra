import { createLot, getLot, listLots } from './lot.service.js';
import { parseBody, createLotSchema } from '../../utils/validators.js';

export async function listHandler(req, res, next) {
  try {
    const farmerId = req.user.role === 'FARMER' ? req.user.id : req.query.farmerId;
    const lots = await listLots({
      farmerId,
      fpoId: req.query.fpoId,
      status: req.query.status,
    });
    res.json({ lots });
  } catch (err) {
    next(err);
  }
}

export async function createHandler(req, res, next) {
  try {
    const data = parseBody(createLotSchema, req.body);
    const lot = await createLot(req.user.id, data);
    res.status(201).json({ lot });
  } catch (err) {
    next(err);
  }
}

export async function getHandler(req, res, next) {
  try {
    const lot = await getLot(req.params.id);
    res.json({ lot });
  } catch (err) {
    next(err);
  }
}
