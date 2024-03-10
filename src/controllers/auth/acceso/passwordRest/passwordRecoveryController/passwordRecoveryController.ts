import { Request, Response } from 'express';
import { errorMessages } from '../../../../../middleware/errorMessages';
import { handleInputValidationErrors } from '../../../../../utils/singup/validation/validationUtils';




/**
 * Validar campos requeridos para el envío de .
 * @param usuario Nombre de usuario.
 * @param celular Número de teléfono.
 * @returns Array de mensajes de error, vacío si no hay errores.
 */
export const validateVerificationFieldsRecoveryPass = (usernameOrEmail: string,): string[] => {
    const errors: string[] = [];
    if (!usernameOrEmail) {
        errors.push(errorMessages.requiredFields);
    }
    return errors;
};






export const passwordRecoveryPass = async (req: Request, res: Response) => {
    try {


        const { usernameOrEmail } = req.body;
        // Validar la entrada de datos
        // Validar la entrada de datos
        const inputValidationErrors = validateVerificationFieldsRecoveryPass(usernameOrEmail);

        handleInputValidationErrors(inputValidationErrors, res);


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
    console.error("Error en el controlador login:", error);
    if (!res.headersSent) {
        res.status(400).json({
            msg: error.message || errorMessages.databaseError,
            error,
        });
    }
};
