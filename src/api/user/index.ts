import { Router } from 'express';
import { authenticateSessionController } from '../authenticateSessionController';
import { genericViewController } from '../genericViewController';
import { validateRequestBody } from '../validateRequestBody';
import { loginController, loginRequestSchema } from './login';
import { logoutViewController } from './logout';
import { profileViewController } from './profileView';
import { registerController, registrationRequestSchema } from './register';
import {
	resetPasswordController,
	resetPasswordRequestSchema
} from './resetPassword';
import { updateUserController, updateUserRequestSchema } from './update';
import {
	updatePasswordController,
	updatePasswordRequestSchema
} from './updatePassword';
import { loginHtmlFormController } from './htmlForms/loginHtmlForm';
import {
	registerHtmlFormController,
	registerHtmlFormRequestSchema
} from './htmlForms/registerHtmlForm';
import { updateUserHtmlFormController } from './htmlForms/updateHtmlForm';
import {
	updatePasswordHtmlFormController,
	updatePasswordHtmlFormRequestSchema
} from './htmlForms/updatePasswordHtmlForm';
import { resetPasswordHtmlFormController } from './htmlForms/resetPasswordHtmlForm';

/** Express Router for handling REST requests. */
export const userApiRouter: Router = Router();
/** Express router for serving views. */
export const userViewRouter: Router = Router();

userApiRouter.post(
	'/login',
	validateRequestBody(loginRequestSchema),
	loginController
);

userApiRouter.post(
	'/register',
	validateRequestBody(registrationRequestSchema),
	registerController
);

userApiRouter.patch(
	'/',
	authenticateSessionController,
	validateRequestBody(updateUserRequestSchema),
	updateUserController
);

userViewRouter.get('/', authenticateSessionController, profileViewController);

userApiRouter.post(
	'/update-password',
	authenticateSessionController,
	validateRequestBody(updatePasswordRequestSchema),
	updatePasswordController
);

userApiRouter.post(
	'/reset-password',
	validateRequestBody(resetPasswordRequestSchema),
	resetPasswordController
);

// Forgot password endpoint for the front-end pure HTML form.
userViewRouter.post(
	'/reset-password/form',
	validateRequestBody(resetPasswordRequestSchema),
	resetPasswordHtmlFormController
);

// Login endpoint for the front-end pure HTML form.
userViewRouter.post(
	'/login/form',
	validateRequestBody(loginRequestSchema),
	loginHtmlFormController
);

// Register endpoint for the front-end pure HTML form.
userViewRouter.post(
	'/register/form',
	validateRequestBody(registerHtmlFormRequestSchema),
	registerHtmlFormController
);

// Update user endpoint for the front-end pure HTML form.
userViewRouter.post(
	'/form',
	authenticateSessionController,
	validateRequestBody(updateUserRequestSchema),
	updateUserHtmlFormController
);

// Update password endpoint for the front-end pure HTML form.
userViewRouter.post(
	'/update-password/form',
	authenticateSessionController,
	validateRequestBody(updatePasswordHtmlFormRequestSchema),
	updatePasswordHtmlFormController
);

userViewRouter.get('/login', genericViewController('user/login'));
userViewRouter.get(
	'/logout',
	authenticateSessionController,
	logoutViewController
);
userViewRouter.get('/register', genericViewController('user/register'));
userViewRouter.get(
	'/update',
	authenticateSessionController,
	genericViewController('user/update')
);
userViewRouter.get(
	'/update-password',
	authenticateSessionController,
	genericViewController('user/updatePassword')
);
userViewRouter.get(
	'/forgot-password',
	genericViewController('user/forgotPassword')
);
