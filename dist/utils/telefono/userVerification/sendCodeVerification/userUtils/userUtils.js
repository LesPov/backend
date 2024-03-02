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
exports.generateVerificationDataPhoneSend = exports.sendVerificationCodeViaSMSPhoneSend = exports.findOrCreateVerificationRecordPhoneSend = void 0;
const twilio_1 = __importDefault(require("twilio"));
const verificationsModel_1 = __importDefault(require("../../../../../models/verificaciones/verificationsModel"));
const generateCode_1 = require("../../../../singup/paswword_generate/generateCode");
const VERIFICATION_CODE_EXPIRATION_HOURS = 24;
/**
 * Buscar o crear un registro de verificación para el usuario.
 * @param user Usuario encontrado.
 * @returns Registro de verificación.
 */
const findOrCreateVerificationRecordPhoneSend = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const usuario_id = user.usuario_id;
    let verificationRecord = yield verificationsModel_1.default.findOne({ where: { usuario_id } });
    if (!verificationRecord) {
        verificationRecord = yield verificationsModel_1.default.create({ usuario_id });
    }
    return verificationRecord;
});
exports.findOrCreateVerificationRecordPhoneSend = findOrCreateVerificationRecordPhoneSend;
// Función para enviar el código de verificación por SMS usando Twilio
const sendVerificationCodeViaSMSPhoneSend = (celular, codigo_verificacion) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.sendVerificationCodeViaSMSPhoneSend = sendVerificationCodeViaSMSPhoneSend;
/**
 * Función que calcula y devuelve la fecha de expiración para un código de verificación,
 * establecida en 2 minutos después de la generación.
 * @returns Fecha de expiración del código de verificación.
 */
const generateVerificationDataPhoneSend = () => {
    const verificationCode = (0, generateCode_1.generateVerificationCode)();
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getHours() + VERIFICATION_CODE_EXPIRATION_HOURS);
    return { verificationCode, expirationDate };
};
exports.generateVerificationDataPhoneSend = generateVerificationDataPhoneSend;
