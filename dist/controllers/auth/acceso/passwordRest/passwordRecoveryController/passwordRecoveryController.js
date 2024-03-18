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
exports.handleServerErrorRecoveryPass = exports.passwordRecoveryPass = void 0;
const errorMessages_1 = require("../../../../../middleware/errorMessages");
const validationUtils_1 = require("../../../../../utils/singup/validation/validationUtils");
const emailUtils_1 = require("../../../../../utils/singup/emailsend/emailUtils");
const successMessages_1 = require("../../../../../middleware/successMessages");
const checkVerificationStatus_1 = require("../../../../../utils/acceso/login/checkVerificationStatus/checkVerificationStatus");
const validateFields_1 = require("../../../../../utils/acceso/passwordRest/passwordRecoveryController/validateFields/validateFields");
const searchUser_1 = require("../../../../../utils/acceso/passwordRest/passwordRecoveryController/searchUser/searchUser");
const generateRandomPassword_1 = require("../../../../../utils/acceso/passwordRest/passwordRecoveryController/generateRandomPassword/generateRandomPassword");
const updatePassRandom_1 = require("../../../../../utils/acceso/passwordRest/passwordRecoveryController/updatePassRandom/updatePassRandom");
const passwordRecoveryPass = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { usernameOrEmail } = req.body;
        // Validar la entrada de datos
        const inputValidationErrors = (0, validateFields_1.validateVerificationFieldsRecoveryPass)(usernameOrEmail);
        (0, validationUtils_1.handleInputValidationErrors)(inputValidationErrors, res);
        // Buscar al usuario por nombre de usuario
        const user = yield (0, searchUser_1.findUserByUsernameRecoveryPass)(usernameOrEmail, res);
        // Verificar la propiedad de verificación del usuario
        (0, checkVerificationStatus_1.checkUserVerificationStatusLogin)(user, res);
        // Generar código y fecha de expiración
        const { randomPassword, expirationDate } = (0, generateRandomPassword_1.generateRandomVerificationDataRecoveryPass)();
        // Buscar o crear un registro de verificación para el usuario
        const verificationRecord = yield (0, searchUser_1.findOrCreateVerificationRecoveryPass)(user.usuario_id);
        // Actualizar la información del código de verificación en la base de datos
        yield (0, updatePassRandom_1.updateVerificationCodeInfoRecoveryPass)(verificationRecord, randomPassword, expirationDate);
        // Envía un correo electrónico con la nueva contraseña aleatoria
        const emailSent = yield (0, emailUtils_1.sendPasswordResetEmail)(user.email, user.usuario, randomPassword);
        // Responder con un mensaje de éxito si el correo electrónico se envía correctamente.
        res.json({
            msg: successMessages_1.successMessages.passwordResetEmailSent,
        });
    }
    catch (error) {
        // Manejar errores internos del servidor
        (0, exports.handleServerErrorRecoveryPass)(error, res);
    }
});
exports.passwordRecoveryPass = passwordRecoveryPass;
/**
 * Maneja errores internos del servidor.
 * @param error El error ocurrido.
 * @param res La respuesta HTTP saliente.
 */
const handleServerErrorRecoveryPass = (error, res) => {
    console.error("Error en el controlador passwordRecoveryPass:", error);
    if (!res.headersSent) {
        res.status(400).json({
            msg: error.message || errorMessages_1.errorMessages.databaseError,
            error,
        });
    }
};
exports.handleServerErrorRecoveryPass = handleServerErrorRecoveryPass;
