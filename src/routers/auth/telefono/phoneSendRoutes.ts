import { Router } from "express";
import { sendCodeVerification } from "../../../controllers/auth/telefono/userVerification/sendCodeVerification/sendCodeVerificationController";
import { verifyPhoneNumber } from "../../../controllers/auth/telefono/userVerification/verifyUserCode/verifyUserCodePhoneController";
import { resendVerificationCodePhoneResend } from "../../../controllers/auth/telefono/userVerification/resendCodeVerification/resendCodeVerification";

const phoneVerificationRouter  = Router();

/**
 * POST /api/user/verify/send
 * Ruta para enviar el código de verificación por SMS.
 * Público
 */
phoneVerificationRouter .post("/verify/phone/send", sendCodeVerification);


// /**
//  * POST /api/user/verify/resend 
//  * Ruta para reenviar el código de verificación por SMS.
//  * Público
//  */
 phoneVerificationRouter.post("/verify/phone/resend", resendVerificationCodePhoneResend);


// /**
//  * PUT /api/user/verify/phone
//  * Ruta para verificar el número de teléfono.
//  * Público
//  */
phoneVerificationRouter .put('/verify/phone/verify', verifyPhoneNumber);

export default phoneVerificationRouter ;
