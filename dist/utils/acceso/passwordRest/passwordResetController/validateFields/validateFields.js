"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleServerErrordResetPass = exports.validateVerificationFieldsResetPass = void 0;
const errorMessages_1 = require("../../../../../middleware/errorMessages");
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/////////////////////////////////////////
/**
 * Validar campos requeridos para el envío de .
 * @param usuario Nombre de usuario.
 * @param celular Número de teléfono.
 * @returns Array de mensajes de error, vacío si no hay errores.
 */
const validateVerificationFieldsResetPass = (usernameOrEmail, contrasena_aleatoria, newPassword) => {
    const errors = [];
    if (!usernameOrEmail || !contrasena_aleatoria || !newPassword) {
        errors.push(errorMessages_1.errorMessages.missingUsernameOrEmail);
    }
    else if (!EMAIL_REGEX.test(usernameOrEmail) && !/^[a-zA-Z0-9_]+$/.test(usernameOrEmail)) {
        errors.push(errorMessages_1.errorMessages.invalidEmail);
    }
    return errors;
};
exports.validateVerificationFieldsResetPass = validateVerificationFieldsResetPass;
/**
 * Maneja errores internos del servidor.
 * @param error El error ocurrido.
 * @param res La respuesta HTTP saliente.
 */
const handleServerErrordResetPass = (error, res) => {
    console.error("Error en el controlador passwordResetPass:", error);
    if (!res.headersSent) {
        res.status(500).json({
            msg: error.message || errorMessages_1.errorMessages.databaseError,
            error,
        });
    }
};
exports.handleServerErrordResetPass = handleServerErrordResetPass;
