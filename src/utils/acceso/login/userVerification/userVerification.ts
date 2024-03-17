import { errorMessages } from "../../../../middleware/errorMessages";
import { Request, Response } from 'express';
import { findUserByUserName, lockAccount } from "../lockAccount/lockAccount";
import Verificacion from "../../../../models/verificaciones/verificationsModel";
import bcrypt from 'bcryptjs';

const MAX_LOGIN_ATTEMPTS = 5;


/**
 * Verifica la contraseña del usuario.
 * @param passwordOrRandomPassword Contraseña o contraseña aleatoria proporcionada.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
export const verifyUserPasswordelogin = async (
    passwordOrRandomPassword: string,
    user: any,
    res: Response
): Promise<void> => {
    try {
        // Verifica si la contraseña es válida
        const passwordValid = await isPasswordValidlogin(passwordOrRandomPassword, user, res);
        if (!passwordValid) {
            // Si la contraseña no es válida, devuelve un error de contraseña incorrecta
            await handleFailedLogin(user, res);
        }
    } catch (error) {
        console.error('Error al verificar la contraseña:', error);
    }
};


/**
 * Verifica si la contraseña proporcionada es válida.
 * @param passwordOrRandomPassword Contraseña o contraseña aleatoria proporcionada.
 * @param user Usuario encontrado.
 * @returns True si la contraseña es válida, false en caso contrario.
 */
const isPasswordValidlogin = async (passwordOrRandomPassword: string, user: any, res: Response): Promise<boolean> => {
    // Verifica si la longitud de la contraseña es igual a 8 para determinar si es una contraseña noramla o  aleatoria
    return passwordOrRandomPassword.length === 8
        ? verifyRandomPasswordlogin(passwordOrRandomPassword, user, res)
        : await verifyBcryptPasswordlogin(passwordOrRandomPassword, user.contrasena);
};
/**
 * Verifica la contraseña aleatoria del usuario.
 * @param randomPassword Contraseña aleatoria proporcionada.
 * @param user Usuario encontrado.
 * @returns true si la contraseña aleatoria es válida, false en caso contrario.
 */
const verifyRandomPasswordlogin = (randomPassword: string, user: any, res: Response): boolean => {
    if (isRandomPasswordExpiredlogin(user)) {
        return false;
    }

    console.log('Contraseña aleatoria válida.');
    return randomPassword === user.verificacion.contrasena_aleatoria;
};
/**
 * Verifica si la contraseña aleatoria ha expirado.
 * @param user Usuario encontrado.
 * @returns true si la contraseña aleatoria ha expirado, false si aún es válida.
 */
export const isRandomPasswordExpiredlogin = (user: any): boolean => {
    const expirationDate = new Date(user.verificacion.expiracion_codigo_verificacion);
    const currentDate = new Date();
    return currentDate > expirationDate;
};

/**
 * Verifica la contraseña normal.
 * @param contrasena Contraseña proporcionada.
 * @param contrasena Contraseña almacenada en la base de datos.
 * @returns true si la contraseña es válida, false en caso contrario.
 */
const verifyBcryptPasswordlogin = async (contrasena: string, hashedPassword: string): Promise<boolean> => {
    console.log('Contraseña normal.');
    return await bcrypt.compare(contrasena, hashedPassword);
};

/**
 * Maneja un intento fallido de inicio de sesión.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const handleFailedLogin = async (user: any, res: Response): Promise<void> => {
    // Actualiza el número de intentos de inicio de sesión
    await updateLoginAttemptslogin(user);

    // Obtener el número actualizado de intentos de inicio de sesión desde la base de datos
    const updatedUser = await findUserByUserName(user.usuario);

    // Maneja el bloqueo de la cuenta si es necesario
    await handleMaxLoginAttemptslogin(updatedUser, res);

    // Envía un mensaje de error al cliente
    res.status(400).json({
        msg: errorMessages.incorrectPassword(updatedUser.verificacion.intentos_ingreso),
    });
};
/**
 * Bloquea la cuenta si se excede el número máximo de intentos de inicio de sesión.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
export const handleMaxLoginAttemptslogin = async (user: any, res: Response): Promise<void> => {
    if (user.verificacion.intentos_ingreso >= MAX_LOGIN_ATTEMPTS) {
        await lockAccount(user.usuario);
        res.status(400).json({
            msg: errorMessages.accountLocked,
        });
    }
};
/**
 * Actualiza el número de intentos de inicio de sesión en la tabla de Verificacion.
 * @param user Usuario encontrado.
 */
export const updateLoginAttemptslogin = async (user: any): Promise<void> => {
    const currentLoginAttempts = user.verificacion.intentos_ingreso || 0;
    const updatedLoginAttempts = currentLoginAttempts >= MAX_LOGIN_ATTEMPTS ? MAX_LOGIN_ATTEMPTS : currentLoginAttempts + 1;

    await Verificacion.update(
        { intentos_ingreso: updatedLoginAttempts },
        { where: { usuario_id: user.usuario_id } }
    );
};