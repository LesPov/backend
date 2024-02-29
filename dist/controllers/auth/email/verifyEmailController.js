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
exports.verifyUser = void 0;
const successMessages_1 = require("../../../middleware/successMessages");
const validationUtils_1 = require("../../../utils/singup/validation/validationUtils");
const databaseUtils_1 = require("../../../utils/singup/database/databaseUtils");
const email_UserVerified_util_1 = require("../../../utils/email/email&userverified/email&UserVerified.util");
const verificationUtils_1 = require("../../../utils/email/verification/verificationUtils");
const userVerification_1 = require("../../../utils/email/userVerification/userVerification");
// Controlador principal para verificar al usuario
const verifyUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { usuario, codigo_verificacion } = req.body;
        // Validar campos
        const validationErrors = (0, verificationUtils_1.validateVerificationFields)(usuario, codigo_verificacion);
        (0, validationUtils_1.handleInputValidationErrors)(validationErrors, res);
        // Buscar al usuario por nombre de usuario
        const user = yield (0, verificationUtils_1.findUserByUsername)(usuario, res);
        // Validar si el usuario ya está verificado
        (0, userVerification_1.checkUserVerificationStatus)(user);
        // Validar si el código de verificación ha expirado
        const currentDate = new Date();
        (0, userVerification_1.checkVerificationCodeExpiration)(user, currentDate);
        // Validar si el código de verificación proporcionado es válido
        (0, userVerification_1.checkInvalidVerificationCode)(user, codigo_verificacion);
        // Realizar las operaciones de verificación
        yield (0, email_UserVerified_util_1.handleVerification)(user, codigo_verificacion, currentDate);
        // Responder con un mensaje de éxito
        res.json({ msg: successMessages_1.successMessages.userVerified });
    }
    catch (error) {
        // Manejar errores
        (0, databaseUtils_1.handleServerError)(error, res);
    }
});
exports.verifyUser = verifyUser;
