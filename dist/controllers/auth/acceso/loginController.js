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
exports.loginUser = void 0;
const userValidation_1 = require("../../../utils/acceso/login/userValidation/userValidation");
const validationUtils_1 = require("../../../utils/singup/validation/validationUtils");
const handleSuccessfulLogin_1 = require("../../../utils/acceso/login/handleSuccessfulLogin/handleSuccessfulLogin");
const userVerification_1 = require("../../../utils/acceso/login/userVerification/userVerification");
const chekLoginBlockAcount_1 = require("../../../utils/acceso/login/chekLoginBlockAcount/chekLoginBlockAcount");
const checkVerificationStatus_1 = require("../../../utils/acceso/login/checkVerificationStatus/checkVerificationStatus");
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { usernameOrEmail, contrasena } = req.body;
        // Validar la entrada de datos
        const inputValidationErrors = (0, userValidation_1.validateVerificationFieldslogin)(usernameOrEmail, contrasena);
        (0, validationUtils_1.handleInputValidationErrors)(inputValidationErrors, res);
        // Buscar al usuario por nombre de usuario
        const user = yield (0, userValidation_1.findUserByUsernameLogin)(usernameOrEmail, res);
        // Verificar la propiedad de verificación del usuario
        (0, checkVerificationStatus_1.checkUserVerificationStatusLogin)(user, res);
        // Verificar la contraseña del usuario
        yield (0, userVerification_1.verifyUserPasswordelogin)(contrasena, user, res);
        // Verificar si el usuario ha excedido el número máximo de intentos de inicio de sesión y manejar el bloqueo de la cuenta
        yield (0, chekLoginBlockAcount_1.checkLoginAttemptsAndBlockAccountlogin)(user, res);
        yield (0, handleSuccessfulLogin_1.handleSuccessfulLogin)(user, res, contrasena);
    }
    catch (error) {
        // Manejar errores internos del servidor
        (0, userValidation_1.handleServerErrorLogin)(error, res);
    }
});
exports.loginUser = loginUser;
