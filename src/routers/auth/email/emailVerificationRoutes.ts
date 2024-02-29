import { Router } from "express";
import { verifyUser } from "../../../controllers/auth/email/userVerification/verifyEmailController";

const emailVerificationRoutes = Router();

/**
 * PUT /api/user/verify/email
 * Ruta para verificar el correo electrónico.
 * Público
 */
emailVerificationRoutes.put('/verify/email', verifyUser);


/**
 * POST /api/user/verify/email/resend
 * Ruta para reenviar el código de verificación por correo electrónico.
 * Público
 */
// emailVerificationRoutes.post('/verify/email/resend', resendVerificationCode);


export default emailVerificationRoutes;
