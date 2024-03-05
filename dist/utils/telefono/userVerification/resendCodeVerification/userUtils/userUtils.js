"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleemailServerErrorPhoneResend = exports.sendVerificationCodeViaSMSPhoneResend = void 0;
const twilio_1 = __importDefault(require("twilio"));
const errorMesages_1 = require("../../../../../middleware/errorMesages");
// Función para enviar el código de verificación por SMS usando Twilio
const sendVerificationCodeViaSMSPhoneResend = (celular, codigo_verificacion) => __awaiter(void 0, void 0, void 0, function* () {
    const client = (0, twilio_1.default)(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    try {
        const message = yield client.messages.create({
            body: `Tu código de verificación es: ${codigo_verificacion}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: celular,
        });
        console.log('Código de verificación enviado por SMS:', message.sid);
        return true; // Indica que el mensaje se envió correctamente
    }
    catch (error) {
        console.error('Error al enviar el código de verificación por SMS:', error);
        throw error;
    }
});
exports.sendVerificationCodeViaSMSPhoneResend = sendVerificationCodeViaSMSPhoneResend;
/**
 * Maneja errores internos del servidor.
 * @param error El error ocurrido.
 * @param res La respuesta HTTP saliente.
 */
const handleemailServerErrorPhoneResend = (error, res) => {
    console.error("Error en el controlador phoneresend:", error);
    if (!res.headersSent) {
        res.status(400).json({
            msg: error.message || errorMesages_1.errorMessages.databaseError,
            error,
        });
    }
};
exports.handleemailServerErrorPhoneResend = handleemailServerErrorPhoneResend;
