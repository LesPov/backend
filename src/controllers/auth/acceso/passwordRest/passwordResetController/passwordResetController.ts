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
 * Validar campos requeridos para el envío de .
 * @param usuario Nombre de usuario.
 * @param celular Número de teléfono.
 * @returns Array de mensajes de error, vacío si no hay errores.
 */

export const validateVerificationFieldsResetPass = (usernameOrEmail: string, contrasena_aleatoria: string, newPassword: string): string[] => {
    const errors: string[] = [];

    if (!usernameOrEmail || !contrasena_aleatoria || !newPassword) {
        errors.push(errorMessages.missingUsernameOrEmail);
    } else if (!EMAIL_REGEX.test(usernameOrEmail) && !/^[a-zA-Z0-9_]+$/.test(usernameOrEmail)) {
        errors.push(errorMessages.invalidEmail);
    }

    return errors;
};


/**
 * Valida la contraseña aleatoria proporcionada.
 * @param verification - Objeto de modelo de verificación.
 * @param res - Objeto de respuesta.
 * @param randomPassword - Contraseña aleatoria proporcionada.
 * @returns {boolean} - True si la contraseña aleatoria es válida, false de lo contrario.
 */
const validateRandomPassword = (verificacion: VerificacionModel | null, res: Response, contrasena_aleatoria: string): boolean => {
    if (!verificacion || !contrasena_aleatoria || contrasena_aleatoria.length !== 8) {
        res.status(400).json({
            msg: errorMessages.invalidPassword,
        });
        return false;
    }

    // Verificar si la contraseña aleatoria es la misma que la almacenada en la base de datos
    if (verificacion.contrasena_aleatoria !== contrasena_aleatoria) {
        res.status(400).json({
            msg: errorMessages.invalidPasswordDB,
        });
        return false;
    }

    // Verificar si la contraseña aleatoria ha expirado
    if (isVerificationCodeExpired(verificacion.expiracion_codigo_verificacion)) {
        res.status(400).json({
            msg: errorMessages.verificationCodeExpired,
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
const isVerificationCodeExpired = (expirationDate: Date): boolean => {
    const currentDateTime = new Date();
    return currentDateTime > expirationDate;
};


/////////////////////////////////////////
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
const validateRandomPasswordAndNewPassword = (verificacion: VerificacionModel | null, res: Response, contrasena_aleatoria: string, newPassword: string): void => {
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
