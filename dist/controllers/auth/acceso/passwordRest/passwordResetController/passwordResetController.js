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
exports.handleServerErrorRecoveryPass = exports.passwordresetPass = exports.validateVerificationFieldsResetPass = void 0;
const errorMessages_1 = require("../../../../../middleware/errorMessages");
const successMessages_1 = require("../../../../../middleware/successMessages");
const passwordRecoveryController_1 = require("../passwordRecoveryController/passwordRecoveryController");
const userVerification_1 = require("../../../../../utils/acceso/login/userVerification/userVerification");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const lockAccount_1 = require("../../../../../utils/acceso/login/lockAccount/lockAccount");
const MAX_LOGIN_ATTEMPTS = 5;
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
const validateRandomPassword = (verificacion, res, contrasena_aleatoria) => __awaiter(void 0, void 0, void 0, function* () {
    // Verifica si el objeto de verificación o la contraseña aleatoria son nulos
    if (!verificacion || !contrasena_aleatoria) {
        res.status(400).json({
            msg: errorMessages_1.errorMessages.invalidPassword,
        });
        return false;
    }
    // Verifica la longitud de la contraseña aleatoria
    if (contrasena_aleatoria.length !== 8) {
        // Incrementa el contador de intentos fallidos y maneja el bloqueo de la cuenta si es necesario
        yield incrementFailedAttempts(verificacion);
        if (verificacion.intentos_ingreso >= MAX_LOGIN_ATTEMPTS) {
            yield (0, lockAccount_1.lockAccount)(verificacion.Usuario);
            res.status(400).json({
                msg: errorMessages_1.errorMessages.accountLocked,
            });
            return false;
        }
        res.status(400).json({
            msg: errorMessages_1.errorMessages.invalidPasswordLength,
            intentos: verificacion.intentos_ingreso,
        });
        return false;
    }
    // Verifica si la contraseña aleatoria coincide con la almacenada en el objeto de verificación
    if (verificacion.contrasena_aleatoria !== contrasena_aleatoria) {
        // Incrementa el contador de intentos fallidos y maneja el bloqueo de la cuenta si es necesario
        yield incrementFailedAttempts(verificacion);
        if (verificacion.intentos_ingreso >= MAX_LOGIN_ATTEMPTS) {
            yield (0, lockAccount_1.lockAccount)(verificacion.Usuario);
            res.status(400).json({
                msg: errorMessages_1.errorMessages.accountLocked,
            });
            return false;
        }
        res.status(400).json({
            msg: errorMessages_1.errorMessages.invalidPasswordDB,
            intentos: verificacion.intentos_ingreso,
        });
        return false;
    }
    // Verifica si el código de verificación ha expirado
    if (isVerificationCodeExpired(verificacion.expiracion_codigo_verificacion)) {
        res.status(400).json({
            msg: errorMessages_1.errorMessages.verificationCodeExpired,
        });
        return false;
    }
    // La contraseña aleatoria ha pasado todas las validaciones
    return true;
});
/**
 * Incrementa el contador de intentos fallidos e actualiza la fecha de expiración.
 * @param verification - Objeto de modelo de verificación.
 */
const incrementFailedAttempts = (verification) => __awaiter(void 0, void 0, void 0, function* () {
    if (verification.intentos_ingreso < MAX_LOGIN_ATTEMPTS) {
        verification.intentos_ingreso += 1;
    }
    verification.expiracion_intentos_ingreso = calculateLockoutExpiration();
    yield verification.save();
});
/**
 * Calcula la fecha de expiración para el bloqueo de la cuenta.
 * @returns Fecha de expiración para el bloqueo de la cuenta.
 */
const calculateLockoutExpiration = () => {
    const lockoutDurationMinutes = 2; // Cambiar según tus requisitos
    const currentDateTime = new Date();
    currentDateTime.setMinutes(currentDateTime.getMinutes() + lockoutDurationMinutes);
    return currentDateTime;
};
/**
 * Verifica si la cuenta está bloqueada.
 * @param verification - Objeto de modelo de verificación.
 * @returns True si la cuenta está bloqueada, false de lo contrario.
 */
const isAccountLockedOut = (verification) => {
    const currentDateTime = new Date();
    return verification.intentos_ingreso >= 5 && verification.expiracion_intentos_ingreso > currentDateTime;
};
/**
 * Valida si la contraseña aleatoria ha expirado.
 * @param expirationDate - Fecha de expiración almacenada en el registro de verificación.
 * @returns {boolean} - True si la contraseña aleatoria ha expirado, false si no ha expirado.
 */
const isVerificationCodeExpired = (expirationDate) => {
    const currentDateTime = new Date();
    return currentDateTime > expirationDate;
};
/////////////////////////////////////////
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
/////////////////////////////////////////////////////
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
        verificacion.intentos_ingreso = 0; // Reiniciar el contador de intentos fallidos
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
        // Buscar al usuario por nombre de usuario
        const user = yield (0, passwordRecoveryController_1.findUserByUsernameRecoveryPass)(usernameOrEmail, res);
        // Verificar la propiedad de verificación del usuario
        (0, userVerification_1.checkUserVerificationStatusLogin)(user, res);
        // Verificar si el usuario ha excedido el número máximo de intentos de inicio de sesión y manejar el bloqueo de la cuenta
        yield (0, userVerification_1.checkLoginAttemptsAndBlockAccount)(user, res);
        // Buscar o crear un registro de verificación para el usuario
        const verification = yield (0, passwordRecoveryController_1.findOrCreateVerificationRecoveryPass)(user.usuario_id);
        // Validar la contraseña aleatoria y si ya expiración 
        const isRandomPasswordValid = yield validateRandomPassword(verification, res, contrasena_aleatoria);
        if (!isRandomPasswordValid) {
            return; // ¡Importante! Salir de la función después de enviar la respuesta
        }
        // Validar la nueva contraseña
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
