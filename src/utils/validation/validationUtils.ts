import { errorMessages } from "../../middleware/errorMesages";
import { Response } from 'express';

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
export const validateInput = (usuario: string, contrasena: string, email: string, rol: string): string[] => {
    const errors: string[] = [];
    if (!usuario) {
        errors.push(errorMessages.requiredFields);
    }
    // ... (validar otros campos)
    return errors;
};

/**
 * Valida la contraseña según los requisitos.
 * @param contrasena La contraseña a validar.
 * @returns Lista de errores de validación de la contraseña.
 */
export const validatePassword = (contrasena: string): string[] => {
    const errors: string[] = [];

    validateLength(contrasena, errors);
    validateCharacterClass(contrasena, PASSWORD_REGEX_NUMBER, errorMessages.passwordNoNumber, errors);
    validateCharacterClass(contrasena, PASSWORD_REGEX_UPPERCASE, errorMessages.passwordNoUppercase, errors);
    validateCharacterClass(contrasena, PASSWORD_REGEX_LOWERCASE, errorMessages.passwordNoLowercase, errors);

    return errors;
};

/**
 * Valida la longitud de la contraseña.
 * @param contrasena La contraseña a validar.
 * @param errors Lista de errores de validación.
 */
export const validateLength = (contrasena: string, errors: string[]) => {
    if (contrasena.length < PASSWORD_MIN_LENGTH) {
        errors.push(errorMessages.passwordTooShort);
    }
};

/**
 * Valida si la contraseña contiene al menos un carácter de la clase especificada.
 * @param contrasena La contraseña a validar.
 * @param characterClass Expresión regular que define la clase de caracteres.
 * @param errorMessage Mensaje de error si no se encuentra el carácter de la clase.
 * @param errors Lista de errores de validación.
 */
export const validateCharacterClass = (contrasena: string, characterClass: RegExp, errorMessage: string, errors: string[]) => {
    if (!characterClass.test(contrasena)) {
        errors.push(errorMessage);
    }
};

/**
 * Valida el formato del correo electrónico.
 * @param email El correo electrónico a validar.
 */
export const validateEmail = (email: string) => {
    if (!EMAIL_REGEX.test(email)) {
        throw new Error(errorMessages.invalidEmail);
    }
};

/**
 * Maneja los errores de validación de la contraseña.
 * @param errors Lista de errores de validación de la contraseña.
 * @param res La respuesta HTTP saliente.
 */
export const handlePasswordValidationErrors = (errors: string[], res: Response) => {
    if (errors.length > 0) {
        res.status(400).json({
            msg: errors,
            errors: 'Error en la validación de la contraseña',
        });
        throw new Error("Password validation failed");
    }
};

/**
 * Maneja los errores de validación de la entrada de datos.
 * @param errors Lista de errores de validación.
 * @param res La respuesta HTTP saliente.
 * @throws {Error} Si hay errores de validación, se lanza un error con el mensaje "Input validation failed".
 */
export const handleInputValidationErrors = (errors: string[], res: Response): void => {
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
