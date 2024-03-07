import { VerificacionModel } from '../../../../../models/verificaciones/verificationsModel';
import { errorMessages } from '../../../../../middleware/errorMessages';
import { findVerificationRecordPhoneVerify, handleServerErrorPhoneVerify } from '../validationUtils/validationUtils';
import { Response } from 'express';

/**
 * Valida el código de verificación proporcionado.
 * @param verificationRecord Registro de verificación.
 * @param verificationCode Código de verificación proporcionado.
 * @throws Error si el código de verificación no coincide.
 */
const validateVerificationCodePhoneVerify = (verificationRecord: VerificacionModel, verificationCode: string) => {
    if (verificationRecord.codigo_verificacion !== verificationCode) {
        throw new Error(errorMessages.invalidVerificationCode);
    }
};

/**
 * Actualiza el registro de verificación marcando el número de teléfono y el usuario como verificados si es necesario.
 * @param verificationRecord Registro de verificación.
 */
const updateVerificationRecordPhoneVerify = async (verificationRecord: VerificacionModel) => {
    await verificationRecord.update({ celular_verificado: true });
    if (verificationRecord.correo_verificado) {
        await verificationRecord.update({ verificado: true });
    }
};

/**
 * Función para verificar el código de verificación por SMS.
 * @param user Usuario para el que se verifica el código.
 * @param verificationCode Código de verificación proporcionado.
 * @param res Objeto de respuesta HTTP.
 */
export const verifySMSCodePhoneVerify = async (user: any, verificationCode: string, res: Response) => {
    try {
        // Buscar el registro de verificación correspondiente al usuario
        const verificationRecord = await findVerificationRecordPhoneVerify(user.usuario_id);

        // Validar el código de verificación proporcionado
        validateVerificationCodePhoneVerify(verificationRecord, verificationCode);

        // Actualizar el registro de verificación
        await updateVerificationRecordPhoneVerify(verificationRecord);

    } catch (error: any) {
        handleServerErrorPhoneVerify(error, res);
    }
};

