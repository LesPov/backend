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
exports.verifyPhoneNumber = void 0;
const validationUtils_1 = require("../../../../../utils/singup/validation/validationUtils");
const successMessages_1 = require("../../../../../middleware/successMessages");
const validationUtils_2 = require("../../../../../utils/telefono/userVerification/sendCodeVerification/validationUtils/validationUtils");
const userVerification_1 = require("../../../../../utils/email/userVerification/verifiedUser/user&codeVerification/userVerification");
const validationUtils_3 = require("../../../../../utils/telefono/userVerification/verifyUserCodeVerication/validationUtils/validationUtils");
const userUtils_1 = require("../../../../../utils/telefono/userVerification/verifyUserCodeVerication/userUtils/userUtils");
const verificationUtils_1 = require("../../../../../utils/telefono/userVerification/verifyUserCodeVerication/verificationUtils/verificationUtils");
///////////////////////////////////////////////////////////////////////
/**
 * Enviar código de verificación por SMS.
 * @param req Objeto de solicitud HTTP.
 * @param res Objeto de respuesta HTTP.
 */
const verifyPhoneNumber = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { usuario, celular, codigo_verificacion } = req.body;
        // Validar campos
        const validationErrors = (0, validationUtils_3.validateVerificationFieldsPhoneVerify)(usuario, celular, codigo_verificacion);
        (0, validationUtils_1.handleInputValidationErrors)(validationErrors, res);
        // Buscar al usuario por nombre de usuario
        const user = yield (0, validationUtils_2.findUserByUsernamePhoneSend)(usuario, res);
        // Verificar estado de verificación del usuario
        (0, verificationUtils_1.checkUserVerificationStatusPhoneVerify)(user);
        // Validar si el código de verificación ha expirado
        const currentDate = new Date();
        (0, userVerification_1.checkVerificationCodeExpiration)(user, currentDate);
        // Validar si el número de teléfono coincide con el almacenado en la base de datos
        (0, validationUtils_3.validatePhoneNumberMatchPhoneVerify)(user, celular, res);
        // Verificar el código de verificación por SMS
        yield (0, userUtils_1.verifySMSCodePhoneVerify)(user, codigo_verificacion, res);
        res.status(200).json({ msg: successMessages_1.successMessages.phoneVerified });
    }
    catch (error) {
        (0, validationUtils_3.handleServerErrorPhoneVerify)(error, res);
    }
});
exports.verifyPhoneNumber = verifyPhoneNumber;
