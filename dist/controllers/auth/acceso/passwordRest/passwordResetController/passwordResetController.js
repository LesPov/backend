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
exports.passwordresetPass = void 0;
const successMessages_1 = require("../../../../../middleware/successMessages");
const validationUtils_1 = require("../../../../../utils/singup/validation/validationUtils");
const checkVerificationStatus_1 = require("../../../../../utils/acceso/login/checkVerificationStatus/checkVerificationStatus");
const userVerification_1 = require("../../../../../utils/acceso/login/userVerification/userVerification");
const chekLoginBlockAcount_1 = require("../../../../../utils/acceso/login/chekLoginBlockAcount/chekLoginBlockAcount");
const validateFields_1 = require("../../../../../utils/acceso/passwordRest/passwordResetController/validateFields/validateFields");
const validateNewPassword_1 = require("../../../../../utils/acceso/passwordRest/passwordResetController/validateNewPassword/validateNewPassword");
const updatePassword_1 = require("../../../../../utils/acceso/passwordRest/passwordResetController/updatePassword/updatePassword");
const searchUser_1 = require("../../../../../utils/acceso/passwordRest/passwordRecoveryController/searchUser/searchUser");
//////////////////////////////////////////////////////
const passwordresetPass = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { usernameOrEmail, contrasena_aleatoria, newPassword } = req.body;
        // Validar la entrada de datos
        const inputValidationErrors = (0, validateFields_1.validateVerificationFieldsResetPass)(usernameOrEmail, contrasena_aleatoria, newPassword);
        (0, validationUtils_1.handleInputValidationErrors)(inputValidationErrors, res);
        // Buscar al usuario por nombre de usuario
        const user = yield (0, searchUser_1.findUserByUsernameRecoveryPass)(usernameOrEmail, res);
        // Verificar la propiedad de verificación del usuario
        (0, checkVerificationStatus_1.checkUserVerificationStatusLogin)(user, res);
        // Buscar o crear un registro de verificación para el usuario
        const verification = yield (0, searchUser_1.findOrCreateVerificationRecoveryPass)(user.usuario_id);
        // Verificar la contraseña del usuario
        yield (0, userVerification_1.verifyUserPasswordelogin)(contrasena_aleatoria, user, res);
        // Verificar si el usuario ha excedido el número máximo de intentos de inicio de sesión y manejar el bloqueo de la cuenta
        yield (0, chekLoginBlockAcount_1.checkLoginAttemptsAndBlockAccountlogin)(user, res);
        // Validar la nueva contraseña
        const passwordErrors = (0, validateNewPassword_1.validatePasswordErrorsResetPass)(res, newPassword);
        if (passwordErrors.length > 0) {
            // Si hay errores en la nueva contraseña, no se actualiza la contraseña en la base de datos
            return;
        }
        // Actualizar y borrar la contraseña del usuario
        yield (0, updatePassword_1.updateAndClearPasswordResetPass)(user, verification, newPassword);
        // Restablecimiento de contraseña exitoso
        res.status(200).json({ msg: successMessages_1.successMessages.passwordUpdated });
    }
    catch (error) {
        // Manejar errores internos del servidor
        (0, validateFields_1.handleServerErrordResetPass)(error, res);
    }
});
exports.passwordresetPass = passwordresetPass;
