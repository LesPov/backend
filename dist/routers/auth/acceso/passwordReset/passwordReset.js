"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passwordRecoveryController_1 = require("../../../../controllers/auth/acceso/passwordRest/passwordRecoveryController/passwordRecoveryController");
const router = (0, express_1.Router)();
/**
 * POST /api/user/forgot-password
 * Ruta para solicitar un correo electrónico de recuperación de contraseña.
 * Público
 */
router.post('/forgot-password', passwordRecoveryController_1.passwordRecoveryPass);
// /**
//  * POST /api/user/reset-password
//  * Ruta para cambiar la contraseña después de recibir el correo de recuperación.
//  * Público
//  */
// router.post('/reset-password', validateToken, resetPassword);
exports.default = router;
