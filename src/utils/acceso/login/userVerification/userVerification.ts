import { errorMessages } from "../../../../middleware/errorMessages";
import { Request, Response } from 'express';
import { unlockAccount } from "../unlockAccount/unlockAccoun";
const MAX_LOGIN_ATTEMPTS = 5;

/**
 * Verifica si el correo electrónico del usuario está verificado.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const checkEmailVerification = (user: any, res: Response) => {
    if (!user.verificacion.correo_verificado) {
        return res.status(400).json({
            msg: errorMessages.userNotVerified,
        });
    }
};

/**
 * Verifica si el teléfono del usuario está verificado.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const checkPhoneVerification = (user: any, res: Response) => {
    if (!user.verificacion.celular_verificado) {
        return res.status(400).json({
            msg: errorMessages.phoneVerificationRequired,
        });
    }
};

/**
 * Verifica si el teléfono del usuario está verificado.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const checkVerificationverificado = (user: any, res: Response) => {
    if (!user.verificacion.verificado) {
        return res.status(400).json({
            msg: errorMessages.verificadoVericationRequired,
        });
    }
};
/**
 * Verifica el estado de verificación del usuario.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
export const checkUserVerificationStatusLogin = (user: any, res: Response) => {
    checkEmailVerification(user, res);
    checkPhoneVerification(user, res);
    checkVerificationverificado(user, res);

};


////////////////////////////////////////////////////////////////////////////////
/**
 * Verifica si la cuenta del usuario está bloqueada debido a intentos fallidos de inicio de sesión.
 * @param user Usuario encontrado.
 * @returns true si la cuenta está bloqueada, false si no lo está.
 */
const isAccountBlocked = (user: any): boolean => {
    return user.verificacion.intentos_ingreso >= MAX_LOGIN_ATTEMPTS;
};

/**
 * Verifica si la cuenta está bloqueada temporalmente y maneja la respuesta HTTP en consecuencia.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const handleTemporaryLock = (user: any, res: Response): void => {
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
const checkAndHandleAccountBlock = (user: any, res: Response): void => {
    if (isAccountBlocked(user)) {
        handleTemporaryLock(user, res);
    }
};

/**
 * Verifica si la cuenta está bloqueada según la nueva lógica proporcionada y maneja la respuesta HTTP en consecuencia.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const checkAndHandleNewAccountBlockLogic = (user: any, res: Response): void => {
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
export const checkLoginAttemptsAndBlockAccount = async (user: any, res: Response): Promise<void> => {
    checkAndHandleAccountBlock(user, res);
    checkAndHandleNewAccountBlockLogic(user, res);
};