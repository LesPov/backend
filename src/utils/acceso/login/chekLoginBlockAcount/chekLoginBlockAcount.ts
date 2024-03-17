import { unlockAccount } from "../unlockAccount/unlockAccoun";
import { Request, Response } from 'express';

// Máximo de intentos de inicio de sesión permitidos
const BLOCK_DURATION_MINUTES = 2;
const MAX_LOGIN_ATTEMPTS = 5;

/**
 * Verifica si la cuenta del usuario está bloqueada debido a intentos fallidos de inicio de sesión.
 * @param user Usuario encontrado.
 * @returns true si la cuenta está bloqueada, false si no lo está.
 */
const isAccountBlockedlogin = (user: any): boolean => {
    return user.verificacion.intentos_ingreso >= MAX_LOGIN_ATTEMPTS;
};

/**
 * Verifica si la cuenta está bloqueada temporalmente y maneja la respuesta HTTP en consecuencia.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const handleTemporaryLocklogin = (user: any, res: Response): void => {
    const currentDate = new Date();
    const expirationDate = user.verificacion.expiracion_intentos_ingreso;

    if (expirationDate && expirationDate > currentDate) {
        const timeLeft = Math.ceil((expirationDate.getTime() - currentDate.getTime()) / (60 * 1000));
        res.status(400).json({
            msg: `La cuenta está bloqueada temporalmente debido a múltiples intentos fallidos. Inténtalo de nuevo más tarde. Tiempo restante: ${timeLeft} minutos`,
        });
    } else {
        unlockAccount(user.usuario);
    }
};

/**
 * Verifica si la cuenta está bloqueada y maneja la respuesta HTTP en consecuencia.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const checkAndHandleAccountBlocklogin = (user: any, res: Response): void => {
    if (isAccountBlockedlogin(user)) {
        handleTemporaryLocklogin(user, res);
    }
};

/**
 * Verifica si la cuenta está bloqueada según la nueva lógica proporcionada y maneja la respuesta HTTP en consecuencia.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const checkAndHandleNewAccountBlockLogiclogin = (user: any, res: Response): void => {
    const currentDate = new Date();
    const blockExpiration = user.verificacion.blockExpiration;

    if (blockExpiration && blockExpiration > currentDate) {
        const timeLeft = Math.ceil((blockExpiration.getTime() - currentDate.getTime()) / (60 * 1000));
        res.status(400).json({
            msg: `La cuenta está bloqueada temporalmente debido a múltiples intentos fallidos. Inténtalo de nuevo más tarde. Tiempo restante: ${timeLeft} minutos`,
        });
    }
};

/**
 * Verifica el estado de bloqueo de la cuenta y maneja la respuesta HTTP en consecuencia.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
export const checkLoginAttemptsAndBlockAccountlogin = async (user: any, res: Response): Promise<void> => {
    checkAndHandleAccountBlocklogin(user, res);
    checkAndHandleNewAccountBlockLogiclogin(user, res);
};