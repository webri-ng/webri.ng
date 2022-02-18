import { Router } from 'express';
import { validateRequestBody } from '../validateRequestBody';
import { loginController, loginRequestSchema } from './login';
import { registerController, registrationRequestSchema } from './register';

export const userApi: Router = Router();

userApi.post('/login', validateRequestBody(loginRequestSchema), loginController);

userApi.post('/register', validateRequestBody(registrationRequestSchema), registerController);
