import { Router } from "express";
import { passwordRecoveryPass } from "../../../../controllers/auth/acceso/passwordRest/passwordRecoveryController/passwordRecoveryController";
import validateToken from "../../../../middleware/validateToken/validateToken";
import { passwordresetPass } from "../../../../controllers/auth/acceso/passwordRest/passwordResetController/passwordResetController";

const router = Router();

/**
 * POST /api/user/forgot-password
 * Ruta para solicitar un correo electrónico de recuperación de contraseña.
 * Público
 */
router.post('/forgot-password', passwordRecoveryPass);


// /**
//  * POST /api/user/reset-password
//  * Ruta para cambiar la contraseña después de recibir el correo de recuperación.
//  * Público
//  */
router.post('/reset-password', validateToken, passwordresetPass);

export default router;
