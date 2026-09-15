import { createGrievance, listGrievances, updateGrievance } from './grievance.service.js';
import { parseBody, createGrievanceSchema } from '../../utils/validators.js';

export async function listHandler(req, res, next) {
  try {
    const grievances = await listGrievances(req.user);
    res.json({ grievances });
  } catch (err) {
    next(err);
  }
}

export async function createHandler(req, res, next) {
  try {
    const data = parseBody(createGrievanceSchema, req.body);
    const grievance = await createGrievance(req.user.id, data);
    res.status(201).json({ grievance });
  } catch (err) {
    next(err);
  }
}

export async function updateHandler(req, res, next) {
  try {
    const grievance = await updateGrievance(req.params.id, req.body);
    res.json({ grievance });
  } catch (err) {
    next(err);
  }
}
