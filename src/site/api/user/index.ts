import { Router } from 'express';
import { authenticateSessionController } from '../authenticateSessionController';
import { genericViewController } from '../genericViewController';
import { validateRequestBody } from '../validateRequestBody';
import { loginController, loginRequestSchema } from './login';
import { logoutViewController } from './logout';
import { profileViewController } from './profile';
import { registerController, registrationRequestSchema } from './register';

/** Express Router for handling REST requests. */
export const userApiRouter: Router = Router();
/** Express router for serving views. */
export const userViewRouter: Router = Router();

userApiRouter.post('/login',
	validateRequestBody(loginRequestSchema),
	loginController);

userApiRouter.post('/register',
	validateRequestBody(registrationRequestSchema),
	registerController);

userViewRouter.get('/',
	authenticateSessionController,
	profileViewController);

userViewRouter.get('/login', genericViewController('user/login'));
userViewRouter.get('/logout', logoutViewController);
userViewRouter.get('/register', genericViewController('user/register'));
