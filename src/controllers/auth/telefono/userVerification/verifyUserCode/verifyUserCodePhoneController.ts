
import { Request, Response } from 'express';
import { errorMessages } from '../../../../../middleware/errorMesages';
import { handleInputValidationErrors } from '../../../../../utils/singup/validation/validationUtils';
import Verificacion, { VerificacionModel } from '../../../../../models/verificaciones/verificationsModel';
import { successMessages } from '../../../../../middleware/successMessages';
import { findUserByUsernamePhoneSend } from '../../../../../utils/telefono/userVerification/sendCodeVerification/validationUtils/validationUtils';
import { checkVerificationCodeExpiration } from '../../../../../utils/email/userVerification/verifiedUser/user&codeVerification/userVerification';


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
 * Verificar si el usuario ya ha sido verificado previamente.
 * @param user Usuario a verificar.
 * @throws Error si el usuario ya ha sido verificado.
 */
export const checkUserVerificationStatusPhoneVerify = (user: any) => {
    if (isUserAlreadyVerifiedPhoneVerify(user)) {
        throw new Error(errorMessages.userAlreadyVerified);
    }
};
/**
 * Verificar si el usuario ya ha sido verificado en celular_verificado.
 * @param user Usuario a verificar.
 * @returns true si el usuario ya ha sido verificado, false de lo contrario.
 */
export const isUserAlreadyVerifiedPhoneVerify = (user: any) => {
    return user.verificacion.celular_verificado;
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
 * Busca el registro de verificación correspondiente al usuario.
 * @param userId ID del usuario.
 * @returns Registro de verificación.
 * @throws Error si no se encuentra el registro.
 */
const findVerificationRecord = async (userId: number) => {
    const verificationRecord = await Verificacion.findOne({ where: { usuario_id: userId } });
    if (!verificationRecord) {
        throw new Error(errorMessages.invalidVerificationCode);
    }
    return verificationRecord;
};

/**
 * Valida el código de verificación proporcionado.
 * @param verificationRecord Registro de verificación.
 * @param verificationCode Código de verificación proporcionado.
 * @throws Error si el código de verificación no coincide.
 */
const validateVerificationCode = (verificationRecord: VerificacionModel, verificationCode: string) => {
    if (verificationRecord.codigo_verificacion !== verificationCode) {
        throw new Error(errorMessages.invalidVerificationCode);
    }
};

/**
 * Actualiza el registro de verificación marcando el número de teléfono y el usuario como verificados si es necesario.
 * @param verificationRecord Registro de verificación.
 */
const updateVerificationRecord = async (verificationRecord: VerificacionModel) => {
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
export const verifySMSCode = async (user: any, verificationCode: string, res: Response) => {
    try {
        // Buscar el registro de verificación correspondiente al usuario
        const verificationRecord = await findVerificationRecord(user.usuario_id);

        // Validar el código de verificación proporcionado
        validateVerificationCode(verificationRecord, verificationCode);

        // Actualizar el registro de verificación
        await updateVerificationRecord(verificationRecord);

    } catch (error: any) {
        handleServerErrorPhoneVerify(error, res);
    }
};


///////////////////////////////////////////////////////////////////////
/**
 * Enviar código de verificación por SMS. 
 * @param req Objeto de solicitud HTTP.
 * @param res Objeto de respuesta HTTP.
 */
export const verifyPhoneNumber = async (req: Request, res: Response) => {
    try {
        const { usuario, celular, codigo_verificacion } = req.body;
        // Validar campos
        const validationErrors = validateVerificationFieldsPhoneVerify(usuario, celular, codigo_verificacion);
        handleInputValidationErrors(validationErrors, res);

        // Buscar al usuario por nombre de usuario
        const user = await findUserByUsernamePhoneSend(usuario, res);
        // Verificar estado de verificación del usuario
        checkUserVerificationStatusPhoneVerify(user);
        // Validar si el código de verificación ha expirado
        const currentDate = new Date();
        checkVerificationCodeExpiration(user, currentDate);

        // Validar si el número de teléfono coincide con el almacenado en la base de datos
        validatePhoneNumberMatchPhoneVerify(user, celular, res);

        // Verificar el código de verificación por SMS
        await verifySMSCode(user, codigo_verificacion, res);


        res.status(200).json({ msg: successMessages.phoneVerified });

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
