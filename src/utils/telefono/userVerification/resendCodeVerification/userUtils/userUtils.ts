import twilio from "twilio";
import { errorMessages } from "../../../../../middleware/errorMessages";
import { Request, Response } from 'express';

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