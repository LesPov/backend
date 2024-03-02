import twilio from "twilio";
import Verificacion from "../../../../../models/verificaciones/verificationsModel";
import { generateVerificationCode } from "../../../../singup/paswword_generate/generateCode";
const VERIFICATION_CODE_EXPIRATION_HOURS = 24;

/**
 * Buscar o crear un registro de verificación para el usuario.
 * @param user Usuario encontrado.
 * @returns Registro de verificación.
 */
export const findOrCreateVerificationRecordPhoneSend = async (user: any) => {
    const usuario_id = user.usuario_id;

    let verificationRecord = await Verificacion.findOne({ where: { usuario_id } });

    if (!verificationRecord) {
        verificationRecord = await Verificacion.create({ usuario_id });
    }

    return verificationRecord;
};

// Función para enviar el código de verificación por SMS usando Twilio
export const sendVerificationCodeViaSMSPhoneSend = async (celular: string, codigo_verificacion: string) => {
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
 * Función que calcula y devuelve la fecha de expiración para un código de verificación,
 * establecida en 2 minutos después de la generación.
 * @returns Fecha de expiración del código de verificación.
 */
export const generateVerificationDataPhoneSend = () => {
    const verificationCode = generateVerificationCode();
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getHours() + VERIFICATION_CODE_EXPIRATION_HOURS);
    return { verificationCode, expirationDate };
};

