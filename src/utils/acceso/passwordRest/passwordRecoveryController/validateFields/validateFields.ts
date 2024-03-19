import { errorMessages } from "../../../../../middleware/errorMessages";
import { Request, Response } from 'express';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;


/**
 * Validar campos requeridos para el envío de .
 * @param usuario Nombre de usuario.
 * @param celular Número de teléfono.
 * @returns Array de mensajes de error, vacío si no hay errores.
 */
export const validateVerificationFieldsRecoveryPass = (usernameOrEmail: string): string[] => {
    const errors: string[] = [];

    if (!usernameOrEmail) {
        errors.push(errorMessages.missingUsernameOrEmail);
    } else if (!EMAIL_REGEX.test(usernameOrEmail) && !/^[a-zA-Z0-9_]+$/.test(usernameOrEmail)) {
        errors.push(errorMessages.invalidEmail);
    }

    return errors;
};
/** 
* Maneja errores internos del servidor.
* @param error El error ocurrido.
* @param res La respuesta HTTP saliente.
*/
export const handleServerErrorRecoveryPass = (error: any, res: Response) => {
   console.error("Error en el controlador passwordRecoveryPass:", error);
   if (!res.headersSent) {
       res.status(400).json({
           msg: error.message || errorMessages.databaseError,
           error,
       });
   }
};
