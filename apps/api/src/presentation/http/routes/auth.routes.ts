import { Router } from 'express';

import { login, me, register } from '../controllers/auth.controller.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

export const authRouter = Router();

authRouter.post('/register', asyncHandler(register));
authRouter.post('/login', asyncHandler(login));
authRouter.get('/me', authMiddleware, asyncHandler(me));
