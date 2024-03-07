import { errorMessages } from "../../../middleware/errorMessages";
import Verificacion from "../../../models/verificaciones/verificationsModel";
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { findUserByUserName, lockAccount } from "../lockAccount/lockAccount";

// Máximo de intentos de inicio de sesión permitidos
const BLOCK_DURATION_MINUTES = 3;
const MAX_LOGIN_ATTEMPTS = 5;


/**
 * Verifica la contraseña aleatoria del usuario.
 * @param randomPassword Contraseña aleatoria proporcionada.
 * @param user Usuario encontrado.
 * @returns true si la contraseña aleatoria es válida, false en caso contrario.
 */
const verifyRandomPassword = (randomPassword: string, user: any): boolean => {
    console.log('Contraseña aleatoria.');
    return randomPassword === user.verificacion.contrasena_aleatoria;
};

/**
 * Verifica la contraseña utilizando bcrypt.
 * @param password Contraseña proporcionada.
 * @param hashedPassword Contraseña almacenada en la base de datos.
 * @returns true si la contraseña es válida, false en caso contrario.
 */
const verifyBcryptPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    console.log('Contraseña normal.');
    return await bcrypt.compare(password, hashedPassword);
};

/**
 * Actualiza el número de intentos de inicio de sesión en la tabla de Verificacion.
 * @param user Usuario encontrado.
 */
const updateLoginAttempts = async (user: any): Promise<void> => {
    const currentLoginAttempts = user.verificacion.intentos_ingreso || 0;
    const updatedLoginAttempts = currentLoginAttempts >= MAX_LOGIN_ATTEMPTS ? MAX_LOGIN_ATTEMPTS : currentLoginAttempts + 1;

    await Verificacion.update(
        { intentos_ingreso: updatedLoginAttempts },
        { where: { usuario_id: user.usuario_id } }
    );
};


/**
 * Bloquea la cuenta si se excede el número máximo de intentos de inicio de sesión.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const handleMaxLoginAttempts = async (user: any, res: Response): Promise<void> => {
    if (user.verificacion.intentos_ingreso >= MAX_LOGIN_ATTEMPTS) {
        await lockAccount(user.usuario);
        res.status(400).json({
            msg: errorMessages.accountLocked,
        });
    }
};
/**
 * Verifica la contraseña del usuario.
 * @param passwordOrRandomPassword Contraseña o contraseña aleatoria proporcionada.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
export const verifyUserPassworde = async (
    passwordOrRandomPassword: string,
    user: any,
    res: Response
): Promise<void> => {
    try {
        // Verifica si la contraseña es válida

        const passwordValid = await isPasswordValid(passwordOrRandomPassword, user);

        if (!passwordValid) {
            // Maneja el inicio de sesión fallido
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
const isPasswordValid = async (passwordOrRandomPassword: string, user: any): Promise<boolean> => {
    // Verifica si la longitud de la contraseña es igual a 8 para determinar si es una contraseña aleatoria
    return passwordOrRandomPassword.length === 8
        ? verifyRandomPassword(passwordOrRandomPassword, user)
        : await verifyBcryptPassword(passwordOrRandomPassword, user.contrasena);
};


/**
 * Maneja un intento fallido de inicio de sesión.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const handleFailedLogin = async (user: any, res: Response): Promise<void> => {
    // Actualiza el número de intentos de inicio de sesión
    await updateLoginAttempts(user);

    // Obtener el número actualizado de intentos de inicio de sesión desde la base de datos
    const updatedUser = await findUserByUserName(user.usuario);

    // Maneja el bloqueo de la cuenta si es necesario
    await handleMaxLoginAttempts(updatedUser, res);

    // Envía un mensaje de error al cliente
    res.status(400).json({
        msg: errorMessages.incorrectPassword(updatedUser.verificacion.intentos_ingreso),
    });
};
