import { errorMessages } from "../../../../middleware/errorMessages";
import { Request, Response } from 'express';

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
 * Verifica si esta  usuario está verificado.
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
