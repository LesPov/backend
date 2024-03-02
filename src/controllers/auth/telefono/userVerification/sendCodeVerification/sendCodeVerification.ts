import { errorMessages } from "../../../../../middleware/errorMesages";
import Usuario from "../../../../../models/usuarios/usuariosModel";
import { Request, Response } from 'express';
import { handleInputValidationErrors } from "../../../../../utils/singup/validation/validationUtils";
import Verificacion from "../../../../../models/verificaciones/verificationsModel";
import { generateVerificationCode } from "../../../../../utils/singup/paswword_generate/generateCode";
import { updateVerificationCodeInfo } from "../../../../../utils/email/userVerification/resendUserVerification/resendUser";
import twilio from "twilio";
import { findUserByUsernamePhoneSend, handleServerErrorPhoneSend, validateVerificationFieldsPhoneSend } from "../../../../../utils/telefono/userVerification/sendCodeVerification/validationUtils/validationUtils";
import { checkUserVerificationStatusPhoneSend, checkUserPhoneNumberExistsPhoneSend, checkPhoneNumberAvailabilityPhoneSend } from "../../../../../utils/telefono/userVerification/sendCodeVerification/verificationUtils/verificationUtils";
const VERIFICATION_CODE_EXPIRATION_HOURS = 24;





/**
 * Función que calcula y devuelve la fecha de expiración para un código de verificación,
 * establecida en 2 minutos después de la generación.
 * @returns Fecha de expiración del código de verificación.
 */
const generateVerificationDataPhoneSend = () => {
    const verificationCode = generateVerificationCode();
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getHours() + VERIFICATION_CODE_EXPIRATION_HOURS);
    return { verificationCode, expirationDate };
};



/**
 * Buscar o crear un registro de verificación para el usuario.
 * @param user Usuario encontrado.
 * @returns Registro de verificación.
 */
const findOrCreateVerificationRecordPhoneSend = async (user: any) => {
    const usuario_id = user.usuario_id;

    let verificationRecord = await Verificacion.findOne({ where: { usuario_id } });

    if (!verificationRecord) {
        verificationRecord = await Verificacion.create({ usuario_id });
    }

    return verificationRecord;
};

// Función para enviar el código de verificación por SMS usando Twilio
const sendVerificationCodeViaSMSPhoneSend = async (celular: string, codigo_verificacion: string) => {
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

///////////////////////////////////////////////////////////////////////////////////////////
/**
 * Actualizar la información del usuario después de enviar el código de verificación.
 * @param celular Número de teléfono.
 * @param usuario Nombre de usuario.
 * @param user Objeto de usuario.
 * @returns Resultado de la actualización.
 */
const updateUserInfoAfterVerificationCodeSentPhoneSend = async (celular: string, usuario: string | null, user: any) => {
    try {
        const updateData = buildUpdateDataPhoneSend(celular);
        const whereClause = buildWhereClausePhoneSend(usuario, user);

        const updateResult = await updateUserInfoPhoneSend(updateData, whereClause);

        logUpdateResultPhoneSend(updateResult);
        return updateResult;
    } catch (error) {
        handleUpdateErrorPhoneSend(error);
    }
};

/**
 * Construir los datos de actualización para la información del usuario.
 * @param celular Número de teléfono.
 * @returns Objeto con datos de actualización.
 */
const buildUpdateDataPhoneSend = (celular: string) => {
    return {
        celular: celular,
        isPhoneVerified: false,
    };
};

/**
 * Construir la cláusula WHERE para la actualización.
 * @param usuario Nombre de usuario.
 * @param user Objeto de usuario.
 * @returns Objeto con cláusula WHERE.
 */
const buildWhereClausePhoneSend = (usuario: string | null, user: any) => {
    return {
        where: { usuario: usuario || user.usuario },
    };
};

/**
 * Actualizar la información del usuario en la base de datos.
 * @param updateData Datos de actualización.
 * @param whereClause Cláusula WHERE.
 * @returns Resultado de la actualización.
 * @throws Error si ocurre un error durante la actualización.
 */
const updateUserInfoPhoneSend = async (updateData: any, whereClause: any) => {
    const updateResult = await Usuario.update(updateData, whereClause);
    return updateResult;
};

/**
 * Registrar el resultado de la actualización en la consola.
 * @param updateResult Resultado de la actualización.
 */
const logUpdateResultPhoneSend = (updateResult: any) => {
    console.log('Resultado de la actualización de Usuarios:', updateResult);
};

/**
 * Manejar errores durante la actualización de la información del usuario.
 * @param error Error ocurrido durante la actualización.
 */
const handleUpdateErrorPhoneSend = (error: any) => {
    console.error('Error al actualizar la información del usuario después de enviar el código de verificación:', error);
    throw error;
};

/**
 * Enviar código de verificación por SMS.
 * @param req Objeto de solicitud HTTP.
 * @param res Objeto de respuesta HTTP.
 */
export const sendCodeVerification = async (req: Request, res: Response) => {
    try {
        const { usuario, celular } = req.body;

        // Validar campos
        const validationErrors = validateVerificationFieldsPhoneSend(usuario, celular);
        handleInputValidationErrors(validationErrors, res);

        // Buscar al usuario por nombre de usuario
        const user = await findUserByUsernamePhoneSend(usuario, res);

        // Verificar estado de verificación del usuario
        checkUserVerificationStatusPhoneSend(user);

        // Verificar si el usuario ya tiene un número de teléfono asociado
        checkUserPhoneNumberExistsPhoneSend(user,celular);

        // Verificar si el teléfono ya está verificado
        await checkPhoneNumberAvailabilityPhoneSend(celular);

        // Generar un código de verificación
        const { verificationCode, expirationDate } = generateVerificationDataPhoneSend();

        // Buscar o crear un registro de verificación para el usuario.
        const verificationRecord = await findOrCreateVerificationRecordPhoneSend(user);

        // Actualizar la información del código de verificación en la base de datos.
        await updateVerificationCodeInfo(verificationRecord, verificationCode, expirationDate);

        // Enviar el código de verificación por SMS
        await sendVerificationCodeViaSMSPhoneSend(celular, verificationCode);

        // Actualizar la información del usuario después de enviar el código de verificación
        await updateUserInfoAfterVerificationCodeSentPhoneSend(celular, usuario, user);

        // Resto de la lógica para enviar el código de verificación por SMS

    } catch (error: any) {
        handleServerErrorPhoneSend(error, res);
    }
};

