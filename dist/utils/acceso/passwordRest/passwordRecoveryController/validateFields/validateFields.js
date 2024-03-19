"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleServerErrorRecoveryPass = exports.validateVerificationFieldsRecoveryPass = void 0;
const errorMessages_1 = require("../../../../../middleware/errorMessages");
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
/**
 * Validar campos requeridos para el envío de .
 * @param usuario Nombre de usuario.
 * @param celular Número de teléfono.
 * @returns Array de mensajes de error, vacío si no hay errores.
 */
const validateVerificationFieldsRecoveryPass = (usernameOrEmail) => {
    const errors = [];
    if (!usernameOrEmail) {
        errors.push(errorMessages_1.errorMessages.missingUsernameOrEmail);
    }
    else if (!EMAIL_REGEX.test(usernameOrEmail) && !/^[a-zA-Z0-9_]+$/.test(usernameOrEmail)) {
        errors.push(errorMessages_1.errorMessages.invalidEmail);
    }
    return errors;
};
exports.validateVerificationFieldsRecoveryPass = validateVerificationFieldsRecoveryPass;
/**
* Maneja errores internos del servidor.
* @param error El error ocurrido.
* @param res La respuesta HTTP saliente.
*/
const handleServerErrorRecoveryPass = (error, res) => {
    console.error("Error en el controlador passwordRecoveryPass:", error);
    if (!res.headersSent) {
        res.status(400).json({
            msg: error.message || errorMessages_1.errorMessages.databaseError,
            error,
        });
    }
};
exports.handleServerErrorRecoveryPass = handleServerErrorRecoveryPass;
