import { Router } from 'express';
import { authenticateSessionController } from '../authenticateSessionController';
import { genericViewController } from '../genericViewController';
import { validateRequestBody } from '../validateRequestBody';
import { loginController, loginRequestSchema } from './login';
import { logoutViewController } from './logout';
import { profileViewController } from './profileView';
import { registerController, registrationRequestSchema } from './register';
import { resetPasswordController, resetPasswordRequestSchema } from './resetPassword';
import { updateUserController, updateUserRequestSchema } from './update';
import { updatePasswordController, updatePasswordRequestSchema } from './updatePassword';

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

userApiRouter.patch('/',
	authenticateSessionController,
	validateRequestBody(updateUserRequestSchema),
	updateUserController);

userViewRouter.get('/',
	authenticateSessionController,
	profileViewController);

userApiRouter.post('/update-password',
	authenticateSessionController,
	validateRequestBody(updatePasswordRequestSchema),
	updatePasswordController);

userApiRouter.post('/reset-password',
	validateRequestBody(resetPasswordRequestSchema),
	resetPasswordController);

userViewRouter.get('/login', genericViewController('user/login'));
userViewRouter.get('/logout', logoutViewController);
userViewRouter.get('/register', genericViewController('user/register'));
