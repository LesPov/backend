import { Request, Response } from 'express';
import { errorMessages } from '../../../../../middleware/errorMessages';
import { successMessages } from '../../../../../middleware/successMessages';
import { handleInputValidationErrors } from '../../../../../utils/singup/validation/validationUtils';
import { findOrCreateVerificationRecoveryPass, findUserByUsernameRecoveryPass } from '../passwordRecoveryController/passwordRecoveryController';
import { checkUserVerificationStatusLogin } from '../../../../../utils/acceso/login/userVerification/userVerification';
import { VerificacionModel } from '../../../../../models/verificaciones/verificationsModel';
import { UsuarioModel } from '../../../../../models/usuarios/usuariosModel';
import bcrypt from 'bcryptjs';



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

export const validateVerificationFieldsResetPass = (usernameOrEmail: string, contrasena_aleatoria: string, newPassword: string): string[] => {
    const errors: string[] = [];

    validateRequiredFields(usernameOrEmail, contrasena_aleatoria, newPassword, errors);
    validateUsernameOrEmail(usernameOrEmail, errors);

    return errors;
};

const validateRequiredFields = (usernameOrEmail: string, contrasena_aleatoria: string, newPassword: string, errors: string[]) => {
    if (!usernameOrEmail || !contrasena_aleatoria || !newPassword) {
        errors.push(errorMessages.missingUsernameOrEmail);
    }
};

const validateUsernameOrEmail = (usernameOrEmail: string, errors: string[]) => {
    if (!EMAIL_REGEX.test(usernameOrEmail) && !/^[a-zA-Z0-9_]+$/.test(usernameOrEmail)) {
        errors.push(errorMessages.invalidEmail);
    }
};

/**
 * Valida la contraseña aleatoria proporcionada.
 * @param verification - Objeto de modelo de verificación.
 * @param res - Objeto de respuesta.
 * @param randomPassword - Contraseña aleatoria proporcionada.
 * @returns {boolean} - True si la contraseña aleatoria es válida, false de lo contrario.
 */
const validateRandomPassword = (verificacion: VerificacionModel, res: Response, contrasena_aleatoria: string): boolean => {
    return isValidRandomPassword(verificacion, contrasena_aleatoria, res) &&
        compareRandomPasswords(verificacion, contrasena_aleatoria, res) &&
        checkVerificationCodeExpiration(verificacion, res);
};

const isValidRandomPassword = (verificacion: VerificacionModel | null, contrasena_aleatoria: string, res: Response): boolean => {
    if (!verificacion || !contrasena_aleatoria || contrasena_aleatoria.length !== 8) {
        sendErrorResponse(res, errorMessages.invalidPassword);
    }
    return true;
};

const compareRandomPasswords = (verificacion: VerificacionModel, contrasena_aleatoria: string, res: Response): boolean => {
    return compareValues(verificacion.contrasena_aleatoria, contrasena_aleatoria, res, errorMessages.invalidPasswordDB);
};

const checkVerificationCodeExpiration = (verificacion: VerificacionModel, res: Response): boolean => {
    return validateVerificationCodeExpiration(verificacion.expiracion_codigo_verificacion);
};

const compareValues = (value1: string, value2: string, res: Response, errorMessage: string): boolean => {
    if (value1 !== value2) {
        sendErrorResponse(res, errorMessage);
        return false;
    }
    return true;
};

const sendErrorResponse = (res: Response, errorMessage: string): void => {
    res.status(400).json({
        msg: errorMessage,
    });
};

// Puedes agregar funciones adicionales para verificar criterios adicionales como mayúsculas, minúsculas, números, caracteres especiales, etc.


export const validateVerificationCodeExpiration = (expirationDate: Date): boolean => {
    const currentDateTime = new Date();
    return expirationDate < currentDateTime;  // Corrección: Cambio de '>=' a '<'
};


///////////////////////////////////////////
/**
 * Valida la longitud mínima de la contraseña.
* @param newPassword - Nueva contraseña a validar.
* @returns Mensajes de error si la longitud no cumple con las reglas, nulo si es válida.
*/
const validateLength = (newPassword: string): string | null => {
    return newPassword.length < PASSWORD_MIN_LENGTH ? errorMessages.passwordTooShort : null;
};

/**
* Valida la presencia de al menos una letra mayúscula en la contraseña.
* @param newPassword - Nueva contraseña a validar.
* @returns Mensajes de error si no cumple con las reglas, nulo si es válida.
*/
const validateUppercase = (newPassword: string): string | null => {
    return PASSWORD_REGEX_UPPERCASE.test(newPassword) ? null : errorMessages.passwordNoUppercase;
};

/**
* Valida la presencia de al menos una letra minúscula en la contraseña.
* @param newPassword - Nueva contraseña a validar.
* @returns Mensajes de error si no cumple con las reglas, nulo si es válida.
*/
const validateLowercase = (newPassword: string): string | null => {
    return PASSWORD_REGEX_LOWERCASE.test(newPassword) ? null : errorMessages.passwordNoLowercase;
};

/**
* Valida la presencia de al menos un número en la contraseña.
* @param newPassword - Nueva contraseña a validar.
* @returns Mensajes de error si no cumple con las reglas, nulo si es válida.
*/
const validateNumber = (newPassword: string): string | null => {
    return PASSWORD_REGEX_NUMBER.test(newPassword) ? null : errorMessages.passwordNoNumber;
};

/**
* Valida la presencia de al menos un carácter especial en la contraseña.
* @param newPassword - Nueva contraseña a validar.
* @returns Mensajes de error si no cumple con las reglas, nulo si es válida.
*/
const validateSpecialChar = (newPassword: string): string | null => {
    return PASSWORD_REGEX_SPECIAL.test(newPassword) ? null : errorMessages.passwordNoSpecialChar;
};

/**
* Valida la nueva contraseña según las reglas establecidas.
* @param newPassword - Nueva contraseña a validar.
* @returns Mensajes de error si la contraseña no cumple con las reglas, nulo si es válida.
*/
const validateNewPassword = (newPassword: string): string[] => {
    const errors: string[] = [
        validateLength(newPassword),
        validateUppercase(newPassword),
        validateLowercase(newPassword),
        validateNumber(newPassword),
        validateSpecialChar(newPassword),
    ].filter((error) => error !== null) as string[];

    return errors;
};

/**
 * Valida los errores de la contraseña.
 * @param res - Objeto de respuesta.
 * @param newPassword - Nueva contraseña a validar.
 * @returns {string[]} - Array de mensajes de error.
 */
const validatePasswordErrors = (res: Response, newPassword: string): string[] => {
    const passwordValidationErrors = validateNewPassword(newPassword);
    if (passwordValidationErrors.length > 0) {
        res.status(400).json({
            msg: errorMessages.passwordValidationFailed,
            errors: passwordValidationErrors,  // Include specific error messages
        });
        return passwordValidationErrors;
    } else {
        return [];  // No errors, return an empty array
    }
};

/**
 * Valida la contraseña aleatoria y la nueva contraseña antes de restablecerla.
 * @param verification - Objeto de modelo de verificación.
 * @param res - Objeto de respuesta.
 * @param randomPassword - Contraseña aleatoria proporcionada.
 * @param newPassword - Nueva contraseña a establecer.
 */
const validateRandomPasswordAndNewPassword = (verificacion: VerificacionModel , res: Response, contrasena_aleatoria: string, newPassword: string): void => {
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
const updateAndClearPassword = async (user: UsuarioModel, verificacion: VerificacionModel | null, newPassword: string): Promise<void> => {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.contrasena = hashedPassword;

    if (verificacion) {
        verificacion.contrasena_aleatoria = '';
        verificacion.expiracion_codigo_verificacion = new Date();
        await verificacion.save();
    }

    await user.save();
};

/////////////////////////////////////////////////////

//////////////////////////////////////////////////////
export const passwordresetPass = async (req: Request, res: Response) => {
    try {

        const { usernameOrEmail, contrasena_aleatoria, newPassword } = req.body;

        // Validar la entrada de datos
        const inputValidationErrors = validateVerificationFieldsResetPass(
            usernameOrEmail,
            contrasena_aleatoria,
            newPassword
        );
        handleInputValidationErrors(inputValidationErrors, res);

        // Buscar al usuario por nombre de usuario
        const user = await findUserByUsernameRecoveryPass(usernameOrEmail, res);
        // Verificar la propiedad de verificación del usuario
        checkUserVerificationStatusLogin(user, res);
        // Buscar o crear un registro de verificación para el usuario
        const verification = await findOrCreateVerificationRecoveryPass(user.usuario_id);

        // Validar la contraseña aleatoria y si ya expiración 
        validateRandomPassword(verification, res, contrasena_aleatoria);

        // Validar la nueva contraseñ
        validateRandomPasswordAndNewPassword(verification, res, contrasena_aleatoria, newPassword);

        // Actualizar y borrar la contraseña del usuario
        await updateAndClearPassword(user, verification, newPassword);

        // Restablecimiento de contraseña exitoso
        res.status(200).json({ msg: successMessages.passwordUpdated });

    } catch (error) {
        // Manejar errores internos del servidor
        handleServerErrorRecoveryPass(error, res);
    }
};

/** 
 * Maneja errores internos del servidor.
 * @param error El error ocurrido.
 * @param res La respuesta HTTP saliente.
 */
export const handleServerErrorRecoveryPass = (error: any, res: Response) => {
    console.error("Error en el controlador passwordResetPass:", error);
    if (!res.headersSent) {
        res.status(500).json({
            msg: error.message || errorMessages.databaseError,
            error,
        });
    }
};
