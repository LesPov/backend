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
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendVerificationCodePhoneResend = void 0;
const successMessages_1 = require("../../../../../middleware/successMessages");
const validationUtils_1 = require("../../../../../utils/singup/validation/validationUtils");
const resendUser_1 = require("../../../../../utils/email/userVerification/resendUserVerification/resendUser");
const userUtils_1 = require("../../../../../utils/telefono/userVerification/resendCodeVerification/userUtils/userUtils");
const verifcationUtils_1 = require("../../../../../utils/telefono/userVerification/resendCodeVerification/verifcationUtils/verifcationUtils");
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
        (0, verifcationUtils_1.checkUserVerificationStatusPhoneResend)(user);
        // Generar código y fecha de expiración
        const { verificationCode, expirationDate } = (0, resendUser_1.generateVerificationData)();
        // Buscar o crear un registro de verificación para el usuario.
        const verificationRecord = yield (0, resendUser_1.findOrCreateVerificationRecord)(user.usuario_id);
        // Actualizar la información del código de verificación en la base de datos.
        yield (0, resendUser_1.updateVerificationCodeInfo)(verificationRecord, verificationCode, expirationDate);
        // Enviar el código de verificación por SMS
        yield (0, userUtils_1.sendVerificationCodeViaSMSPhoneResend)(user.celular, verificationCode);
        // Responder con un mensaje de éxito si el correo electrónico se envía correctamente.
        res.json({
            msg: successMessages_1.successMessages.verificationCodeSent,
        });
    }
    catch (error) {
        // Manejar errores internos
        (0, userUtils_1.handleemailServerErrorPhoneResend)(error, res);
    }
});
exports.resendVerificationCodePhoneResend = resendVerificationCodePhoneResend;
