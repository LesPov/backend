"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleServerErrorRecoveryPass = exports.passwordresetPass = exports.validateVerificationCodeExpiration = exports.validateVerificationFieldsResetPass = void 0;
const errorMessages_1 = require("../../../../../middleware/errorMessages");
const validationUtils_1 = require("../../../../../utils/singup/validation/validationUtils");
const passwordRecoveryController_1 = require("../passwordRecoveryController/passwordRecoveryController");
const userVerification_1 = require("../../../../../utils/acceso/login/userVerification/userVerification");
const VERIFICATION_CODE_EXPIRATION_HOURS = 1;
const PASSWORD_MIN_LENGTH = 10;
const PASSWORD_REGEX_NUMBER = /\d/;
const PASSWORD_REGEX_UPPERCASE = /[A-Z]/;
const PASSWORD_REGEX_LOWERCASE = /[a-z]/;
const PASSWORD_REGEX_SPECIAL = /[&$@_/-]/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
 * Valida la contraseña aleatoria proporcionada.
 * @param verification - Objeto de modelo de verificación.
 * @param res - Objeto de respuesta.
 * @param randomPassword - Contraseña aleatoria proporcionada.
 * @returns {boolean} - True si la contraseña aleatoria es válida, false de lo contrario.
 */
const validateRandomPassword = (verificacion, res, contrasena_aleatoria) => {
    if (!verificacion || !contrasena_aleatoria || contrasena_aleatoria.length !== 8) {
        res.status(400).json({
            msg: errorMessages_1.errorMessages.invalidPassword,
            details: "La contraseña aleatoria debe tener exactamente 8 caracteres.",
        });
        return false;
    }
    // Verificar si la contraseña aleatoria es la misma que la almacenada en la base de datos
    if (verificacion.contrasena_aleatoria !== contrasena_aleatoria) {
        res.status(400).json({
            msg: errorMessages_1.errorMessages.invalidPassword,
            details: "La contraseña aleatoria proporcionada no coincide con la almacenada en la base de datos.",
        });
        return false;
    }
    // Verificar si la contraseña aleatoria ha expirado
    if (!(0, exports.validateVerificationCodeExpiration)(verificacion.expiracion_codigo_verificacion)) {
        res.status(400).json({
            msg: errorMessages_1.errorMessages.expiredVerificationCode,
        });
        return false;
    }
    // Verificar criterios adicionales si es necesario (e.g., uppercase, lowercase, numbers, special characters)
    return true;
};
const validateVerificationCodeExpiration = (expirationDate) => {
    const currentDateTime = new Date();
    return expirationDate > currentDateTime;
};
exports.validateVerificationCodeExpiration = validateVerificationCodeExpiration;
const passwordresetPass = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { usernameOrEmail, contrasena_aleatoria, newPassword } = req.body;
        // Validar la entrada de datos
        const inputValidationErrors = (0, exports.validateVerificationFieldsResetPass)(usernameOrEmail, contrasena_aleatoria, newPassword);
        (0, validationUtils_1.handleInputValidationErrors)(inputValidationErrors, res);
        // Buscar al usuario por nombre de usuario
        const user = yield (0, passwordRecoveryController_1.findUserByUsernameRecoveryPass)(usernameOrEmail, res);
        // Verificar la propiedad de verificación del usuario
        (0, userVerification_1.checkUserVerificationStatusLogin)(user, res);
        // Buscar o crear un registro de verificación para el usuario
        const verification = yield (0, passwordRecoveryController_1.findOrCreateVerificationRecoveryPass)(user.usuario_id);
        // Validar la contraseña aleatoria y si ya expiración 
        validateRandomPassword(verification, res, contrasena_aleatoria);
        // // Maneja el inicio de sesión fallido
    }
    catch (error) {
        // Manejar errores internos del servidor
        (0, exports.handleServerErrorRecoveryPass)(error, res);
    }
});
exports.passwordresetPass = passwordresetPass;
/**
 * Maneja errores internos del servidor.
 * @param error El error ocurrido.
 * @param res La respuesta HTTP saliente.
 */
const handleServerErrorRecoveryPass = (error, res) => {
    console.error("Error en el controlador passwordResetPass:", error);
    if (!res.headersSent) {
        res.status(400).json({
            msg: error.message || errorMessages_1.errorMessages.databaseError,
            error,
        });
    }
};
exports.handleServerErrorRecoveryPass = handleServerErrorRecoveryPass;
