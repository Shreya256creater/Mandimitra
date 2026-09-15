import { addMember, createFpo, getFpoDashboard, listFpos } from './fpo.service.js';
import { parseBody, addFpoMemberSchema, createFpoSchema } from '../../utils/validators.js';

export async function listHandler(_req, res, next) {
  try {
    res.json({ fpos: await listFpos() });
  } catch (err) {
    next(err);
  }
}

export async function dashboardHandler(req, res, next) {
  try {
    const result = await getFpoDashboard(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function createHandler(req, res, next) {
  try {
    const data = parseBody(createFpoSchema, req.body);
    const fpo = await createFpo(req.user.id, data);
    res.status(201).json({ fpo });
  } catch (err) {
    next(err);
  }
}

export async function addMemberHandler(req, res, next) {
  try {
    const data = parseBody(addFpoMemberSchema, req.body);
    const member = await addMember(req.params.id, data.userId);
    res.status(201).json({ member });
  } catch (err) {
    next(err);
  }
}
