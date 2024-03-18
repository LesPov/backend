import { errorMessages } from "../../../../../middleware/errorMessages";
import { Request, Response } from 'express';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/////////////////////////////////////////

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
 * Maneja errores internos del servidor.
 * @param error El error ocurrido.
 * @param res La respuesta HTTP saliente.
 */
export const handleServerErrordResetPass = (error: any, res: Response) => {
    console.error("Error en el controlador passwordResetPass:", error);
    if (!res.headersSent) {
        res.status(500).json({
            msg: error.message || errorMessages.databaseError,
            error,
        });
    }
};