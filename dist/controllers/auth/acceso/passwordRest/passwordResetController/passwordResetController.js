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
exports.handleServerErrorRecoveryPass = exports.passwordresetPass = exports.validateVerificationCodeExpiration = exports.validateVerificationFieldsResetPass = void 0;
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
/**
 * Validar campos requeridos para el envío de correo de verificación para restablecimiento de contraseña.
 * @param usernameOrEmail Nombre de usuario o correo electrónico.
 * @param contrasena_aleatoria Contraseña aleatoria generada.
 * @param newPassword Nueva contraseña ingresada.
 * @returns Array de mensajes de error, vacío si no hay errores.
 */
const validateVerificationFieldsResetPass = (usernameOrEmail, contrasena_aleatoria, newPassword) => {
    const errors = [];
    validateRequiredFields(usernameOrEmail, contrasena_aleatoria, newPassword, errors);
    validateUsernameOrEmail(usernameOrEmail, errors);
    return errors;
};
exports.validateVerificationFieldsResetPass = validateVerificationFieldsResetPass;
const validateRequiredFields = (usernameOrEmail, contrasena_aleatoria, newPassword, errors) => {
    if (!usernameOrEmail || !contrasena_aleatoria || !newPassword) {
        errors.push(errorMessages_1.errorMessages.missingUsernameOrEmail);
    }
};
const validateUsernameOrEmail = (usernameOrEmail, errors) => {
    if (!EMAIL_REGEX.test(usernameOrEmail) && !/^[a-zA-Z0-9_]+$/.test(usernameOrEmail)) {
        errors.push(errorMessages_1.errorMessages.invalidEmail);
    }
};
/**
 * Valida la contraseña aleatoria proporcionada.
 * @param verification - Objeto de modelo de verificación.
 * @param res - Objeto de respuesta.
 * @param randomPassword - Contraseña aleatoria proporcionada.
 * @returns {boolean} - True si la contraseña aleatoria es válida, false de lo contrario.
 */
const validateRandomPassword = (verificacion, res, contrasena_aleatoria) => {
    return isValidRandomPassword(verificacion, contrasena_aleatoria, res) &&
        compareRandomPasswords(verificacion, contrasena_aleatoria, res) &&
        checkVerificationCodeExpiration(verificacion, res);
};
const isValidRandomPassword = (verificacion, contrasena_aleatoria, res) => {
    if (!verificacion || !contrasena_aleatoria || contrasena_aleatoria.length !== 8) {
        sendErrorResponse(res, errorMessages_1.errorMessages.invalidPassword);
    }
    return true;
};
const compareRandomPasswords = (verificacion, contrasena_aleatoria, res) => {
    return compareValues(verificacion.contrasena_aleatoria, contrasena_aleatoria, res, errorMessages_1.errorMessages.invalidPasswordDB);
};
const checkVerificationCodeExpiration = (verificacion, res) => {
    return (0, exports.validateVerificationCodeExpiration)(verificacion.expiracion_codigo_verificacion);
};
const compareValues = (value1, value2, res, errorMessage) => {
    if (value1 !== value2) {
        sendErrorResponse(res, errorMessage);
        return false;
    }
    return true;
};
const sendErrorResponse = (res, errorMessage) => {
    res.status(400).json({
        msg: errorMessage,
    });
};
// Puedes agregar funciones adicionales para verificar criterios adicionales como mayúsculas, minúsculas, números, caracteres especiales, etc.
const validateVerificationCodeExpiration = (expirationDate) => {
    const currentDateTime = new Date();
    return expirationDate < currentDateTime; // Corrección: Cambio de '>=' a '<'
};
exports.validateVerificationCodeExpiration = validateVerificationCodeExpiration;
///////////////////////////////////////////
/**
 * Valida la longitud mínima de la contraseña.
* @param newPassword - Nueva contraseña a validar.
* @returns Mensajes de error si la longitud no cumple con las reglas, nulo si es válida.
*/
const validateLength = (newPassword) => {
    return newPassword.length < PASSWORD_MIN_LENGTH ? errorMessages_1.errorMessages.passwordTooShort : null;
};
/**
* Valida la presencia de al menos una letra mayúscula en la contraseña.
* @param newPassword - Nueva contraseña a validar.
* @returns Mensajes de error si no cumple con las reglas, nulo si es válida.
*/
const validateUppercase = (newPassword) => {
    return PASSWORD_REGEX_UPPERCASE.test(newPassword) ? null : errorMessages_1.errorMessages.passwordNoUppercase;
};
/**
* Valida la presencia de al menos una letra minúscula en la contraseña.
* @param newPassword - Nueva contraseña a validar.
* @returns Mensajes de error si no cumple con las reglas, nulo si es válida.
*/
const validateLowercase = (newPassword) => {
    return PASSWORD_REGEX_LOWERCASE.test(newPassword) ? null : errorMessages_1.errorMessages.passwordNoLowercase;
};
/**
* Valida la presencia de al menos un número en la contraseña.
* @param newPassword - Nueva contraseña a validar.
* @returns Mensajes de error si no cumple con las reglas, nulo si es válida.
*/
const validateNumber = (newPassword) => {
    return PASSWORD_REGEX_NUMBER.test(newPassword) ? null : errorMessages_1.errorMessages.passwordNoNumber;
};
/**
* Valida la presencia de al menos un carácter especial en la contraseña.
* @param newPassword - Nueva contraseña a validar.
* @returns Mensajes de error si no cumple con las reglas, nulo si es válida.
*/
const validateSpecialChar = (newPassword) => {
    return PASSWORD_REGEX_SPECIAL.test(newPassword) ? null : errorMessages_1.errorMessages.passwordNoSpecialChar;
};
/**
* Valida la nueva contraseña según las reglas establecidas.
* @param newPassword - Nueva contraseña a validar.
* @returns Mensajes de error si la contraseña no cumple con las reglas, nulo si es válida.
*/
const validateNewPassword = (newPassword) => {
    const errors = [
        validateLength(newPassword),
        validateUppercase(newPassword),
        validateLowercase(newPassword),
        validateNumber(newPassword),
        validateSpecialChar(newPassword),
    ].filter((error) => error !== null);
    return errors;
};
/**
 * Valida los errores de la contraseña.
 * @param res - Objeto de respuesta.
 * @param newPassword - Nueva contraseña a validar.
 * @returns {string[]} - Array de mensajes de error.
 */
const validatePasswordErrors = (res, newPassword) => {
    const passwordValidationErrors = validateNewPassword(newPassword);
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
const validateRandomPasswordAndNewPassword = (verificacion, res, contrasena_aleatoria, newPassword) => {
    if (!validateRandomPassword(verificacion, res, contrasena_aleatoria)) {
        return;
    }
    const passwordErrors = validatePasswordErrors(res, newPassword);
    if (passwordErrors.length > 0) {
        return;
    }
};
///////////////////////////////////////////////////////
/**
 * Actualiza y borra la contraseña del usuario.
 * @param user - Objeto de modelo de usuario.
 * @param verification - Objeto de modelo de verificación.
 * @param newPassword - Nueva contraseña a establecer.
 */
const updateAndClearPassword = (user, verificacion, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
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
        validateRandomPassword(verification, res, contrasena_aleatoria);
        // Validar la nueva contraseñ
        validateRandomPasswordAndNewPassword(verification, res, contrasena_aleatoria, newPassword);
        // Actualizar y borrar la contraseña del usuario
        yield updateAndClearPassword(user, verification, newPassword);
        // Restablecimiento de contraseña exitoso
        res.status(200).json({ msg: successMessages_1.successMessages.passwordUpdated });
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
        res.status(500).json({
            msg: error.message || errorMessages_1.errorMessages.databaseError,
            error,
        });
    }
};
exports.handleServerErrorRecoveryPass = handleServerErrorRecoveryPass;
