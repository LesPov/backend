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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleServerErrordResetPass = exports.passwordresetPass = exports.validateVerificationFieldsResetPass = void 0;
const errorMessages_1 = require("../../../../../middleware/errorMessages");
const successMessages_1 = require("../../../../../middleware/successMessages");
const validationUtils_1 = require("../../../../../utils/singup/validation/validationUtils");
const passwordRecoveryController_1 = require("../passwordRecoveryController/passwordRecoveryController");
const userVerification_1 = require("../../../../../utils/acceso/login/userVerification/userVerification");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const PASSWORD_MIN_LENGTH = 10;
const PASSWORD_REGEX_NUMBER = /\d/;
const PASSWORD_REGEX_UPPERCASE = /[A-Z]/;
const PASSWORD_REGEX_LOWERCASE = /[a-z]/;
const PASSWORD_REGEX_SPECIAL = /[&$@_/-]/;
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
 * Valida la contraseña aleatoria proporcionada.
 * @param verification - Objeto de modelo de verificación.
 * @param res - Objeto de respuesta.
 * @param randomPassword - Contraseña aleatoria proporcionada.
 * @returns {boolean} - True si la contraseña aleatoria es válida, false de lo contrario.
 */
const validateRandomPasswordResetPass = (verificacion, res, contrasena_aleatoria) => {
    if (!verificacion || !contrasena_aleatoria || contrasena_aleatoria.length !== 8) {
        res.status(400).json({
            msg: errorMessages_1.errorMessages.invalidPassword,
        });
        return false;
    }
    // Verificar si la contraseña aleatoria es la misma que la almacenada en la base de datos
    if (verificacion.contrasena_aleatoria !== contrasena_aleatoria) {
        res.status(400).json({
            msg: errorMessages_1.errorMessages.invalidPasswordDB,
        });
        return false;
    }
    // Verificar si la contraseña aleatoria ha expirado
    if (isVerificationCodeExpiredResetPass(verificacion.expiracion_codigo_verificacion)) {
        res.status(400).json({
            msg: errorMessages_1.errorMessages.verificationCodeExpired,
        });
        return false;
    }
    // Verificar criterios adicionales si es necesario (e.g., uppercase, lowercase, numbers, special characters)
    return true;
};
/**
 * Valida si la contraseña aleatoria ha expirado.
 * @param expirationDate - Fecha de expiración almacenada en el registro de verificación.
 * @returns {boolean} - True si la contraseña aleatoria ha expirado, false si no ha expirado.
 */
const isVerificationCodeExpiredResetPass = (expirationDate) => {
    const currentDateTime = new Date();
    return currentDateTime > expirationDate;
};
/////////////////////////////////////////
/**
 * Valida la longitud mínima de la contraseña.
* @param newPassword - Nueva contraseña a validar.
* @returns Mensajes de error si la longitud no cumple con las reglas, nulo si es válida.
*/
const validateLengthResetPass = (newPassword) => {
    return newPassword.length < PASSWORD_MIN_LENGTH ? errorMessages_1.errorMessages.passwordTooShort : null;
};
/**
* Valida la presencia de al menos una letra mayúscula en la contraseña.
* @param newPassword - Nueva contraseña a validar.
* @returns Mensajes de error si no cumple con las reglas, nulo si es válida.
*/
const validateUppercaseResetPass = (newPassword) => {
    return PASSWORD_REGEX_UPPERCASE.test(newPassword) ? null : errorMessages_1.errorMessages.passwordNoUppercase;
};
/**
* Valida la presencia de al menos una letra minúscula en la contraseña.
* @param newPassword - Nueva contraseña a validar.
* @returns Mensajes de error si no cumple con las reglas, nulo si es válida.
*/
const validateLowercaseResetPass = (newPassword) => {
    return PASSWORD_REGEX_LOWERCASE.test(newPassword) ? null : errorMessages_1.errorMessages.passwordNoLowercase;
};
/**
* Valida la presencia de al menos un número en la contraseña.
* @param newPassword - Nueva contraseña a validar.
* @returns Mensajes de error si no cumple con las reglas, nulo si es válida.
*/
const validateNumberResetPass = (newPassword) => {
    return PASSWORD_REGEX_NUMBER.test(newPassword) ? null : errorMessages_1.errorMessages.passwordNoNumber;
};
/**
* Valida la presencia de al menos un carácter especial en la contraseña.
* @param newPassword - Nueva contraseña a validar.
* @returns Mensajes de error si no cumple con las reglas, nulo si es válida.
*/
const validateSpecialCharResetPass = (newPassword) => {
    return PASSWORD_REGEX_SPECIAL.test(newPassword) ? null : errorMessages_1.errorMessages.passwordNoSpecialChar;
};
/**
* Valida la nueva contraseña según las reglas establecidas.
* @param newPassword - Nueva contraseña a validar.
* @returns Mensajes de error si la contraseña no cumple con las reglas, nulo si es válida.
*/
const validateNewPasswordResetPass = (newPassword) => {
    const errors = [
        validateLengthResetPass(newPassword),
        validateUppercaseResetPass(newPassword),
        validateLowercaseResetPass(newPassword),
        validateNumberResetPass(newPassword),
        validateSpecialCharResetPass(newPassword),
    ].filter((error) => error !== null);
    return errors;
};
/**
 * Valida los errores de la contraseña.
 * @param res - Objeto de respuesta.
 * @param newPassword - Nueva contraseña a validar.
 * @returns {string[]} - Array de mensajes de error.
 */
const validatePasswordErrorsResetPass = (res, newPassword) => {
    const passwordValidationErrors = validateNewPasswordResetPass(newPassword);
    if (passwordValidationErrors.length > 0) {
        res.status(400).json({
            msg: errorMessages_1.errorMessages.passwordValidationFailed,
            errors: passwordValidationErrors, // Include specific error messages
        });
        return passwordValidationErrors;
    }
    else {
        return []; // No errors, return an empty array
    }
};
/**
 * Valida la contraseña aleatoria y la nueva contraseña antes de restablecerla.
 * @param verification - Objeto de modelo de verificación.
 * @param res - Objeto de respuesta.
 * @param randomPassword - Contraseña aleatoria proporcionada.
 * @param newPassword - Nueva contraseña a establecer.
 */
const validateRandomPasswordAndNewPasswordResetPass = (verificacion, res, contrasena_aleatoria, newPassword) => {
    if (!validateRandomPasswordResetPass(verificacion, res, contrasena_aleatoria)) {
        return;
    }
    const passwordErrors = validatePasswordErrorsResetPass(res, newPassword);
    if (passwordErrors.length > 0) {
        return;
    }
};
/////////////////////////////////////////////////////
/**
 * Actualiza y borra la contraseña del usuario.
 * @param user - Objeto de modelo de usuario.
 * @param verification - Objeto de modelo de verificación.
 * @param newPassword - Nueva contraseña a establecer.
 */
const updateAndClearPasswordResetPass = (user, verificacion, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
    user.contrasena = hashedPassword;
    if (verificacion) {
        verificacion.contrasena_aleatoria = '';
        verificacion.expiracion_codigo_verificacion = new Date();
        yield verificacion.save();
    }
    yield user.save();
});
/////////////////////////////////////////////////////
//////////////////////////////////////////////////////
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
        validateRandomPasswordResetPass(verification, res, contrasena_aleatoria);
        // Validar la nueva contraseñ
        validateRandomPasswordAndNewPasswordResetPass(verification, res, contrasena_aleatoria, newPassword);
        // Actualizar y borrar la contraseña del usuario
        yield updateAndClearPasswordResetPass(user, verification, newPassword);
        // Restablecimiento de contraseña exitoso
        res.status(200).json({ msg: successMessages_1.successMessages.passwordUpdated });
    }
    catch (error) {
        // Manejar errores internos del servidor
        (0, exports.handleServerErrordResetPass)(error, res);
    }
});
exports.passwordresetPass = passwordresetPass;
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
