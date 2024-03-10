import { Router } from "express";
import { passwordRecoveryPass } from "../../../../controllers/auth/acceso/passwordRest/passwordRecoveryController/passwordRecoveryController";

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
// router.post('/reset-password', validateToken, resetPassword);

export default router;
