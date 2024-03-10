// Importación de módulos y funciones necesarios
import { successMessages } from "../../../../middleware/successMessages";
import { generateAuthToken } from "../generateAuthToken/generateAuthToken";
import { Response } from 'express';

/**
 * Maneja un inicio de sesión exitoso y devuelve la respuesta JSON con la información necesaria.
 * @param user - Información del usuario que inició sesión.
 * @param res - Objeto de respuesta de Express.
 * @param contrasena - Contraseña proporcionada durante el inicio de sesión.
 * @returns Respuesta JSON con mensajes, token de autenticación y detalles del usuario.
 */
export const handleSuccessfulLogin = async (user: any, res: Response, contrasena: string) => {
    // Obtiene el mensaje adecuado según la longitud de la contraseña.
    const msg = getMessage(contrasena);

    // Genera un token de autenticación para el usuario.
    const token = generateAuthToken(user);

    // Obtiene la información del usuario, como el ID y el rol.
    const { userId, rol } = getUserInfo(user);

    // Retorna la respuesta JSON con mensajes, token, ID de usuario, rol y contraseña aleatoria si es aplicable.
    return res.json({ msg, token, userId, rol, passwordorrandomPassword: getPasswordOrRandomPassword(user, contrasena) });
};

/**
 * Determina el mensaje en función de la longitud de la contraseña.
 * @param contrasena - Contraseña proporcionada durante el inicio de sesión.
 * @returns Mensaje adecuado según la longitud de la contraseña.
 */
const getMessage = (contrasena: string): string => {
    return contrasena.length === 8 ? 'Inicio de sesión Recuperación de contraseña' : successMessages.userLoggedIn;
};

/**
 * Obtiene la información esencial del usuario, como el ID y el rol.
 * @param user - Información del usuario que inició sesión.
 * @returns Objeto con el ID de usuario y el rol (puede ser nulo).
 */
const getUserInfo = (user: any): { userId: string, rol: string | null } => {
    const userId = user.usuario_id;
    const rol = Array.isArray(user.rols) && user.rols.length > 0 ? user.rols[0].nombre : null;
    return { userId, rol };
};

/**
 * Obtiene la contraseña aleatoria del usuario si la longitud de la contraseña es 8.
 * @param user - Información del usuario que inició sesión.
 * @param contrasena - Contraseña proporcionada durante el inicio de sesión.
 * @returns Contraseña aleatoria del usuario o indefinido si la longitud de la contraseña no es 8.
 */
const getPasswordOrRandomPassword = (user: any, contrasena: string): string | undefined => {
    return contrasena.length === 8 ? user.verificacion.contrasena_aleatoria : undefined;
};
