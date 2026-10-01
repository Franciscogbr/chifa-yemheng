import { Router } from 'express';
import { getMisPermisos, patchClave, postLogin } from '../controllers/auth-controller.js';
import { authGuard } from '../middlewares/auth-guard.js';

export const authRouter = Router();

authRouter.post('/login', postLogin);
authRouter.get('/permisos', authGuard, getMisPermisos);
authRouter.patch('/clave', authGuard, patchClave);
