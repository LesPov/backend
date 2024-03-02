
import { Request, Response } from 'express';
import { errorMessages } from '../../../../../middleware/errorMesages';
import { handleInputValidationErrors } from '../../../../../utils/singup/validation/validationUtils';


/**
 * Validar campos requeridos para el envío de códigos de verificación por SMS.
 * @param usuario Nombre de usuario.
 * @param celular Número de teléfono.
 * @returns Array de mensajes de error, vacío si no hay errores.
 */
export const validateVerificationFieldsPhoneVerify = (usuario: string, celular: string, codigo_verificacion: string): string[] => {
    const errors: string[] = [];
    if (!usuario || !celular || !codigo_verificacion) {
        errors.push(errorMessages.requiredFields);
    }
    return errors;
};



/**
 * Enviar código de verificación por SMS. 
 * @param req Objeto de solicitud HTTP.
 * @param res Objeto de respuesta HTTP.
 */
export const verifyPhoneNumber = async (req: Request, res: Response) => {
    try {
        const { usuario, celular, codigo_verificacion } = req.body;
        // Validar campos
        const validationErrors = validateVerificationFieldsPhoneVerify(usuario, celular,codigo_verificacion);
        handleInputValidationErrors(validationErrors, res);


    } catch (error: any) {
        handleServerErrorPhoneVerify(error, res);
    }
};

/** 
 * Maneja errores internos del servidor.
 * @param error El error ocurrido.
 * @param res La respuesta HTTP saliente.
 */
export const handleServerErrorPhoneVerify = (error: any, res: Response) => {
    console.error("Error en el controlador phoneverify:", error);
    if (!res.headersSent) {
        res.status(400).json({
            msg: error.message || errorMessages.databaseError,
            error,
        });
    }
};
