"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sendVerificationCode_1 = require("../../../controllers/auth/telefono/userVerification/sendVerificationCode/sendVerificationCode");
const phoneVerificationRouter = (0, express_1.Router)();
/**
 * POST /api/user/verify/send
 * Ruta para enviar el código de verificación por SMS.
 * Público
 */
phoneVerificationRouter.post("/verify/send", sendVerificationCode_1.sendVerificationCode);
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
exports.default = phoneVerificationRouter;
