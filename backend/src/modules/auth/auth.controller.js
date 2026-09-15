import { getMe, login, register } from './auth.service.js';
import { parseBody, loginSchema, registerSchema } from '../../utils/validators.js';

export async function registerHandler(req, res, next) {
  try {
    const data = parseBody(registerSchema, req.body);
    const result = await register(data);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function loginHandler(req, res, next) {
  try {
    const data = parseBody(loginSchema, req.body);
    const result = await login(data);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function meHandler(req, res, next) {
  try {
    const user = await getMe(req.user.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}
