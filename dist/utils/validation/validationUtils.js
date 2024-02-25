"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleInputValidationErrors = exports.handlePasswordValidationErrors = exports.validateEmail = exports.validatePassword = exports.validateInput = void 0;
const errorMesages_1 = require("../../middleware/errorMesages");
const PASSWORD_MIN_LENGTH = 10;
const PASSWORD_REGEX_NUMBER = /\d/;
const PASSWORD_REGEX_UPPERCASE = /[A-Z]/;
const PASSWORD_REGEX_LOWERCASE = /[a-z]/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/**
 * Valida que los campos de entrada no estén vacíos.
 * @param usuario Nombre de usuario.
 * @param contrasena Contraseña.
 * @param email Dirección de correo electrónico.
 * @param rol Rol del usuario.
 */
const validateInput = (usuario, contrasena, email, rol) => {
    const errors = [];
    if (!usuario) {
        errors.push(errorMesages_1.errorMessages.requiredFields);
    }
    // ... (validar otros campos)
    return errors;
};
exports.validateInput = validateInput;
/**
 * Valida la contraseña según los requisitos.
 * @param contrasena La contraseña a validar.
 * @returns Lista de errores de validación de la contraseña.
 */
const validatePassword = (contrasena) => {
    const errors = [];
    validateLength(contrasena, errors);
    validateCharacterClass(contrasena, PASSWORD_REGEX_NUMBER, errorMesages_1.errorMessages.passwordNoNumber, errors);
    validateCharacterClass(contrasena, PASSWORD_REGEX_UPPERCASE, errorMesages_1.errorMessages.passwordNoUppercase, errors);
    validateCharacterClass(contrasena, PASSWORD_REGEX_LOWERCASE, errorMesages_1.errorMessages.passwordNoLowercase, errors);
    return errors;
};
exports.validatePassword = validatePassword;
/**
 * Valida la longitud de la contraseña.
 * @param contrasena La contraseña a validar.
 * @param errors Lista de errores de validación.
 */
const validateLength = (contrasena, errors) => {
    if (contrasena.length < PASSWORD_MIN_LENGTH) {
        errors.push(errorMesages_1.errorMessages.passwordTooShort);
    }
};
/**
 * Valida si la contraseña contiene al menos un carácter de la clase especificada.
 * @param contrasena La contraseña a validar.
 * @param characterClass Expresión regular que define la clase de caracteres.
 * @param errorMessage Mensaje de error si no se encuentra el carácter de la clase.
 * @param errors Lista de errores de validación.
 */
const validateCharacterClass = (contrasena, characterClass, errorMessage, errors) => {
    if (!characterClass.test(contrasena)) {
        errors.push(errorMessage);
    }
};
/**
 * Valida el formato del correo electrónico.
 * @param email El correo electrónico a validar.
 */
const validateEmail = (email) => {
    if (!EMAIL_REGEX.test(email)) {
        throw new Error(errorMesages_1.errorMessages.invalidEmail);
    }
};
exports.validateEmail = validateEmail;
/**
 * Maneja los errores de validación de la contraseña.
 * @param errors Lista de errores de validación de la contraseña.
 * @param res La respuesta HTTP saliente.
 */
const handlePasswordValidationErrors = (errors, res) => {
    if (errors.length > 0) {
        res.status(400).json({
            msg: errors,
            errors: 'Error en la validación de la contraseña',
        });
        throw new Error("Password validation failed");
    }
};
exports.handlePasswordValidationErrors = handlePasswordValidationErrors;
/**
 * Maneja los errores de validación de la entrada de datos.
 * @param errors Lista de errores de validación.
 * @param res La respuesta HTTP saliente.
 * @throws {Error} Si hay errores de validación, se lanza un error con el mensaje "Input validation failed".
 */
const handleInputValidationErrors = (errors, res) => {
    if (errors.length > 0) {
        // Concatenar los mensajes de error en una cadena
        const errorMessage = errors.join('. ');
        // Responder con un JSON de error y código de estado 400 
        res.status(400).json({
            msg: errorMessage,
            errors: `Error en la validación de la entrada de datos`,
        });
        // Lanzar un error para indicar que la validación de entrada ha fallado
        throw new Error("Input validation failed");
    }
};
exports.handleInputValidationErrors = handleInputValidationErrors;
