"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sendCodeVerificationController_1 = require("../../../controllers/auth/telefono/userVerification/sendCodeVerification/sendCodeVerificationController");
const verifyUserCodePhoneController_1 = require("../../../controllers/auth/telefono/userVerification/verifyUserCode/verifyUserCodePhoneController");
const resendCodeVerification_1 = require("../../../controllers/auth/telefono/userVerification/resendCodeVerification/resendCodeVerification");
const phoneVerificationRouter = (0, express_1.Router)();
/**
 * POST /api/user/verify/send
 * Ruta para enviar el código de verificación por SMS.
 * Público
 */
phoneVerificationRouter.post("/verify/phone/send", sendCodeVerificationController_1.sendCodeVerification);
// /**
//  * POST /api/user/verify/resend 
//  * Ruta para reenviar el código de verificación por SMS.
//  * Público
//  */
phoneVerificationRouter.post("/verify/phone/resend", resendCodeVerification_1.resendVerificationCodePhoneResend);
// /**
//  * PUT /api/user/verify/phone
//  * Ruta para verificar el número de teléfono.
//  * Público
//  */
phoneVerificationRouter.put('/verify/phone/verify', verifyUserCodePhoneController_1.verifyPhoneNumber);
exports.default = phoneVerificationRouter;
