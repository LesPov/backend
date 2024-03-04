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
exports.handleemailServerErrorPhoneResend = exports.resendVerificationCodePhoneResend = exports.sendVerificationCodeViaSMSPhoneResend = exports.isUserAlreadyVerifiedPhoneResend = exports.checkUserVerificationStatusPhoneResend = void 0;
const successMessages_1 = require("../../../../../middleware/successMessages");
const validationUtils_1 = require("../../../../../utils/singup/validation/validationUtils");
const resendUser_1 = require("../../../../../utils/email/userVerification/resendUserVerification/resendUser");
const errorMesages_1 = require("../../../../../middleware/errorMesages");
const twilio_1 = __importDefault(require("twilio"));
// Verifica el estado de verificación del usuario
const checkUserVerificationStatusPhoneResend = (user) => {
    if ((0, exports.isUserAlreadyVerifiedPhoneResend)(user)) {
        throw new Error(errorMesages_1.errorMessages.phoneAlreadyVerified);
    }
};
exports.checkUserVerificationStatusPhoneResend = checkUserVerificationStatusPhoneResend;
// Verifica si el usuario ya está verificado por correo electrónico
const isUserAlreadyVerifiedPhoneResend = (user) => {
    return user.verificacion.celular_verificado;
};
exports.isUserAlreadyVerifiedPhoneResend = isUserAlreadyVerifiedPhoneResend;
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
 * Controlador para reenviar el código de verificacion de celular.

 */
const resendVerificationCodePhoneResend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Extraer el nombre de usuario de la solicitud
        const { usuario } = req.body;
        // Validar campos 
        const validationErrors = (0, resendUser_1.validateVerificationFieldsResend)(usuario);
        (0, validationUtils_1.handleInputValidationErrors)(validationErrors, res);
        // Buscar al usuario en la base de datos junto con su registro de verificación.
        const user = yield (0, resendUser_1.checkUserExistence)(usuario, res);
        // Verificar el estado de verificación del usuario
        (0, exports.checkUserVerificationStatusPhoneResend)(user);
        // Generar código y fecha de expiración
        const { verificationCode, expirationDate } = (0, resendUser_1.generateVerificationData)();
        // Buscar o crear un registro de verificación para el usuario.
        const verificationRecord = yield (0, resendUser_1.findOrCreateVerificationRecord)(user.usuario_id);
        // Actualizar la información del código de verificación en la base de datos.
        yield (0, resendUser_1.updateVerificationCodeInfo)(verificationRecord, verificationCode, expirationDate);
        // Enviar el código de verificación por SMS
        yield (0, exports.sendVerificationCodeViaSMSPhoneResend)(user.celular, verificationCode);
        // Responder con un mensaje de éxito si el correo electrónico se envía correctamente.
        res.json({
            msg: successMessages_1.successMessages.verificationCodeSent,
        });
    }
    catch (error) {
        // Manejar errores internos
        (0, exports.handleemailServerErrorPhoneResend)(error, res);
    }
});
exports.resendVerificationCodePhoneResend = resendVerificationCodePhoneResend;
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
