"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePasswordErrorsResetPass = void 0;
const errorMessages_1 = require("../../../../../middleware/errorMessages");
const PASSWORD_MIN_LENGTH = 10;
const PASSWORD_REGEX_NUMBER = /\d/;
const PASSWORD_REGEX_UPPERCASE = /[A-Z]/;
const PASSWORD_REGEX_LOWERCASE = /[a-z]/;
const PASSWORD_REGEX_SPECIAL = /[&$@_/-]/;
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
exports.validatePasswordErrorsResetPass = validatePasswordErrorsResetPass;
