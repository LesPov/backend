import { errorMessages } from '../../../../../middleware/errorMessages';
import { Response } from 'express';
import Verificacion from '../../../../../models/verificaciones/verificationsModel';

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
 * Validar si el número de teléfono coincide con el almacenado en la base de datos.
 * @param user Objeto de usuario.
 * @param phoneNumber Número de teléfono a verificar.
 * @param res Objeto de respuesta HTTP.
 * @throws Error si el número de teléfono no coincide.
 */
export const validatePhoneNumberMatchPhoneVerify = (user: any, celular: string, res: Response) => {
    if (user.celular !== celular) {
        throw new Error(errorMessages.incorrectPhoneNumber);
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




/**
 * Busca el registro de verificación correspondiente al usuario.
 * @param userId ID del usuario.
 * @returns Registro de verificación.
 * @throws Error si no se encuentra el registro.
 */
export const findVerificationRecordPhoneVerify = async (userId: number) => {
    const verificationRecord = await Verificacion.findOne({ where: { usuario_id: userId } });
    if (!verificationRecord) {
        throw new Error(errorMessages.invalidVerificationCode);
    }
    return verificationRecord;
};
