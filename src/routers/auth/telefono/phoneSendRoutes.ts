import { Router } from "express";
import { sendCodeVerification } from "../../../controllers/auth/telefono/userVerification/sendCodeVerification/sendCodeVerification";

const phoneVerificationRouter  = Router();

/**
 * POST /api/user/verify/send
 * Ruta para enviar el código de verificación por SMS.
 * Público
 */
phoneVerificationRouter .post("/verify/send", sendCodeVerification);


// /**
//  * POST /api/user/verify/resend 
//  * Ruta para reenviar el código de verificación por SMS.
//  * Público
//  */
// phoneVerificationRouter.post("/verify/resend", resendVerificationCodeSMS);


// /**
//  * PUT /api/user/verify/phone
//  * Ruta para verificar el número de teléfono.
//  * Público
//  */
// phoneVerificationRouter .put('/verify/phone', verifyPhoneNumber);

export default phoneVerificationRouter ;
