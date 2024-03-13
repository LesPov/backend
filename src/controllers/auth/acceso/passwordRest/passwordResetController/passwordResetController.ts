import { Request, Response } from 'express';
import { errorMessages } from '../../../../../middleware/errorMessages';
import { successMessages } from '../../../../../middleware/successMessages';
import { handleInputValidationErrors } from '../../../../../utils/singup/validation/validationUtils';
import { findOrCreateVerificationRecoveryPass, findUserByUsernameRecoveryPass } from '../passwordRecoveryController/passwordRecoveryController';
import { checkLoginAttemptsAndBlockAccount, checkUserVerificationStatusLogin } from '../../../../../utils/acceso/login/userVerification/userVerification';
import { VerificacionModel } from '../../../../../models/verificaciones/verificationsModel';
import { UsuarioModel } from '../../../../../models/usuarios/usuariosModel';
import bcrypt from 'bcryptjs';
import { lockAccount } from '../../../../../utils/acceso/login/lockAccount/lockAccount';

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
const validateRandomPassword = async (verificacion: VerificacionModel | null, res: Response, contrasena_aleatoria: string): Promise<boolean> => {
    // Verifica si el objeto de verificación o la contraseña aleatoria son nulos
    if (!verificacion || !contrasena_aleatoria) {
        res.status(400).json({
            msg: errorMessages.invalidPassword,
        });
        return false;
    }

    // Verifica la longitud de la contraseña aleatoria
    if (contrasena_aleatoria.length !== 8) {
        // Incrementa el contador de intentos fallidos y maneja el bloqueo de la cuenta si es necesario
        await incrementFailedAttempts(verificacion);
        if (verificacion.intentos_ingreso >= MAX_LOGIN_ATTEMPTS) {
            await lockAccount(verificacion.Usuario);
            res.status(400).json({
                msg: errorMessages.accountLocked,
            });
            return false;
        }
        res.status(400).json({
            msg: errorMessages.invalidPasswordLength,
            intentos: verificacion.intentos_ingreso,
        });
        return false;
    }

    // Verifica si la contraseña aleatoria coincide con la almacenada en el objeto de verificación
    if (verificacion.contrasena_aleatoria !== contrasena_aleatoria) {
        // Incrementa el contador de intentos fallidos y maneja el bloqueo de la cuenta si es necesario
        await incrementFailedAttempts(verificacion);
        if (verificacion.intentos_ingreso >= MAX_LOGIN_ATTEMPTS) {
            await lockAccount(verificacion.Usuario);
            res.status(400).json({
                msg: errorMessages.accountLocked,
            });
            return false;
        }
        res.status(400).json({
            msg: errorMessages.invalidPasswordDB,
            intentos: verificacion.intentos_ingreso,
        });
        return false;
    }

    // Verifica si el código de verificación ha expirado
    if (isVerificationCodeExpired(verificacion.expiracion_codigo_verificacion)) {
        res.status(400).json({
            msg: errorMessages.verificationCodeExpired,
        });
        return false;
    }

  

    // La contraseña aleatoria ha pasado todas las validaciones
    return true;
};

/**
 * Incrementa el contador de intentos fallidos e actualiza la fecha de expiración.
 * @param verification - Objeto de modelo de verificación.
 */
const incrementFailedAttempts = async (verification: VerificacionModel): Promise<void> => {
    if (verification.intentos_ingreso < MAX_LOGIN_ATTEMPTS) {
        verification.intentos_ingreso += 1;
    }
    verification.expiracion_intentos_ingreso = calculateLockoutExpiration();
    await verification.save();
};


/**
 * Calcula la fecha de expiración para el bloqueo de la cuenta.
 * @returns Fecha de expiración para el bloqueo de la cuenta.
 */
const calculateLockoutExpiration = (): Date => {
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
const isAccountLockedOut = (verification: VerificacionModel): boolean => {
    const currentDateTime = new Date();
    return verification.intentos_ingreso >= 5 && verification.expiracion_intentos_ingreso > currentDateTime;
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
        verificacion.intentos_ingreso = 0; // Reiniciar el contador de intentos fallidos
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


        // Buscar al usuario por nombre de usuario
        const user = await findUserByUsernameRecoveryPass(usernameOrEmail, res);
        // Verificar la propiedad de verificación del usuario
        checkUserVerificationStatusLogin(user, res);

        // Verificar si el usuario ha excedido el número máximo de intentos de inicio de sesión y manejar el bloqueo de la cuenta
        await checkLoginAttemptsAndBlockAccount(user, res);

        // Buscar o crear un registro de verificación para el usuario
        const verification = await findOrCreateVerificationRecoveryPass(user.usuario_id);

        // Validar la contraseña aleatoria y si ya expiración 
        const isRandomPasswordValid = await validateRandomPassword(verification, res, contrasena_aleatoria);
        if (!isRandomPasswordValid) {
            return; // ¡Importante! Salir de la función después de enviar la respuesta
        }

        // Validar la nueva contraseña
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
