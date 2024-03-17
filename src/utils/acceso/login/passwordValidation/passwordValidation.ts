import { errorMessages } from "../../../../middleware/errorMessages";
import Verificacion from "../../../../models/verificaciones/verificationsModel";
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';

// Máximo de intentos de inicio de sesión permitidos
const BLOCK_DURATION_MINUTES = 3;
const MAX_LOGIN_ATTEMPTS = 5;


