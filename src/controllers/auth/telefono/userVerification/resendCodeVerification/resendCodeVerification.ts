import { Request, Response } from 'express';
import { successMessages } from '../../../../../middleware/successMessages';
import { handleInputValidationErrors } from '../../../../../utils/singup/validation/validationUtils';
import { validateVerificationFieldsResend, checkUserExistence, generateVerificationData, findOrCreateVerificationRecord, updateVerificationCodeInfo, sendVerificationCodeByEmail, handleemailServerError } from '../../../../../utils/email/userVerification/resendUserVerification/resendUser';
import { errorMessages } from '../../../../../middleware/errorMesages';
import twilio from 'twilio';


// Verifica el estado de verificación del usuario
export const checkUserVerificationStatusPhoneResend = (user: any) => {
    if (isUserAlreadyVerifiedPhoneResend(user)) {
        throw new Error(errorMessages.phoneAlreadyVerified);
    }

};
// Verifica si el usuario ya está verificado por correo electrónico
export const isUserAlreadyVerifiedPhoneResend = (user: any) => {
    return user.verificacion.celular_verificado;
};


// Función para enviar el código de verificación por SMS usando Twilio
export const sendVerificationCodeViaSMSPhoneResend = async (celular: string, codigo_verificacion: string) => {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    try {
        const message = await client.messages.create({
            body: `Tu código de verificación es: ${codigo_verificacion}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: celular,
        });

        console.log('Código de verificación enviado por SMS:', message.sid);
        return true; // Indica que el mensaje se envió correctamente
    } catch (error) {
        console.error('Error al enviar el código de verificación por SMS:', error);
        throw error;
    }
};

/**
 * Controlador para reenviar el código de verificacion de celular.

 */
export const resendVerificationCodePhoneResend = async (req: Request, res: Response) => {

    try {
        // Extraer el nombre de usuario de la solicitud
        const { usuario } = req.body;

        // Validar campos 
        const validationErrors = validateVerificationFieldsResend(usuario);
        handleInputValidationErrors(validationErrors, res);

        // Buscar al usuario en la base de datos junto con su registro de verificación.
        const user = await checkUserExistence(usuario, res);
        // Verificar el estado de verificación del usuario
        checkUserVerificationStatusPhoneResend(user);

        // Generar código y fecha de expiración
        const { verificationCode, expirationDate } = generateVerificationData();
        // Buscar o crear un registro de verificación para el usuario.
        const verificationRecord = await findOrCreateVerificationRecord(user.usuario_id);

        // Actualizar la información del código de verificación en la base de datos.
        await updateVerificationCodeInfo(verificationRecord, verificationCode, expirationDate);

        // Enviar el código de verificación por SMS
        await sendVerificationCodeViaSMSPhoneResend(user.celular, verificationCode);

        // Responder con un mensaje de éxito si el correo electrónico se envía correctamente.
        res.json({
            msg: successMessages.verificationCodeSent,
        });
    } catch (error) {
        // Manejar errores internos
        handleemailServerErrorPhoneResend(error, res);
    }
};

/** 
 * Maneja errores internos del servidor.
 * @param error El error ocurrido.
 * @param res La respuesta HTTP saliente.
 */
export const handleemailServerErrorPhoneResend = (error: any, res: Response) => {
    console.error("Error en el controlador phoneresend:", error);
    if (!res.headersSent) {
        res.status(400).json({
            msg: error.message || errorMessages.databaseError,
            error,
        });
    }
};
