import { Router } from 'express';
import {
  getCategoria,
  getCategorias,
  patchCategoriaEstado,
  postCategoria,
  putCategoria,
} from '../controllers/categorias-controller.js';
import { authGuard } from '../middlewares/auth-guard.js';
import { requirePermisos } from '../middlewares/permission-guard.js';

export const categoriasRouter = Router();

categoriasRouter.use(authGuard);
categoriasRouter.get('/', requirePermisos('CAT_VER'), getCategorias);
categoriasRouter.get('/:id', requirePermisos('CAT_VER'), getCategoria);
categoriasRouter.post('/', requirePermisos('CAT_CREAR'), postCategoria);
categoriasRouter.put('/:id', requirePermisos('CAT_EDITAR'), putCategoria);
categoriasRouter.patch('/:id/estado', requirePermisos('CAT_ELIMINAR'), patchCategoriaEstado);
