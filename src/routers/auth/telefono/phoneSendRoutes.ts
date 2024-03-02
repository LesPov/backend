import { Router } from "express";
import { sendVerificationCode } from "../../../controllers/auth/telefono/userVerification/sendVerificationCode/sendVerificationCode";

const phoneVerificationRouter  = Router();

/**
 * POST /api/user/verify/send
 * Ruta para enviar el código de verificación por SMS.
 * Público
 */
phoneVerificationRouter .post("/verify/send", sendVerificationCode);


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
