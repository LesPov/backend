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
exports.sendCodeVerification = void 0;
const validationUtils_1 = require("../../../../../utils/singup/validation/validationUtils");
const resendUser_1 = require("../../../../../utils/email/userVerification/resendUserVerification/resendUser");
const validationUtils_2 = require("../../../../../utils/telefono/userVerification/sendCodeVerification/validationUtils/validationUtils");
const verificationUtils_1 = require("../../../../../utils/telefono/userVerification/sendCodeVerification/verificationUtils/verificationUtils");
const userUtils_1 = require("../../../../../utils/telefono/userVerification/sendCodeVerification/userUtils/userUtils");
const updateUtils_1 = require("../../../../../utils/telefono/userVerification/sendCodeVerification/updateUtils/updateUtils");
const successMessages_1 = require("../../../../../middleware/successMessages");
/**
 * Enviar código de verificación por SMS.
 * @param req Objeto de solicitud HTTP.
 * @param res Objeto de respuesta HTTP.
 */
const sendCodeVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { usuario, celular } = req.body;
        // Validar campos
        const validationErrors = (0, validationUtils_2.validateVerificationFieldsPhoneSend)(usuario, celular);
        (0, validationUtils_1.handleInputValidationErrors)(validationErrors, res);
        // Buscar al usuario por nombre de usuario
        const user = yield (0, validationUtils_2.findUserByUsernamePhoneSend)(usuario, res);
        // Verificar estado de verificación del usuario
        (0, verificationUtils_1.checkUserVerificationStatusPhoneSend)(user);
        // Verificar si el usuario ya tiene un número de teléfono asociado
        (0, verificationUtils_1.checkUserPhoneNumberExistsPhoneSend)(user, celular);
        // Verificar si el teléfono ya está verificado
        yield (0, verificationUtils_1.checkPhoneNumberAvailabilityPhoneSend)(celular);
        // Generar un código de verificación
        const { verificationCode, expirationDate } = (0, userUtils_1.generateVerificationDataPhoneSend)();
        // Buscar o crear un registro de verificación para el usuario.
        const verificationRecord = yield (0, userUtils_1.findOrCreateVerificationRecordPhoneSend)(user);
        // Actualizar la información del código de verificación en la base de datos.
        yield (0, resendUser_1.updateVerificationCodeInfo)(verificationRecord, verificationCode, expirationDate);
        // Enviar el código de verificación por SMS
        yield (0, userUtils_1.sendVerificationCodeViaSMSPhoneSend)(celular, verificationCode);
        // Actualizar la información del usuario después de enviar el código de verificación
        yield (0, updateUtils_1.updateUserInfoAfterVerificationCodeSentPhoneSend)(celular, usuario, user);
        // Resto de la lógica para enviar el código de verificación por SMS
        // Responder con un mensaje de éxito
        res.json({ msg: successMessages_1.successMessages.verificationCodeSent });
    }
    catch (error) {
        (0, validationUtils_2.handleServerErrorPhoneSend)(error, res);
    }
});
exports.sendCodeVerification = sendCodeVerification;
