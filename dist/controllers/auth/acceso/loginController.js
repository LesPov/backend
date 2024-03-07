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
const validationUtils_1 = require("../../../utils/singup/validation/validationUtils");
const userValidation_1 = require("../../../utils/acceso/userValidation/userValidation");
const userVerification_1 = require("../../../utils/acceso/userVerification/userVerification");
const passwordValidation_1 = require("../../../utils/acceso/passwordValidation/passwordValidation");
const handleSuccessfulLogin_1 = require("../../../utils/acceso/handleSuccessfulLogin/handleSuccessfulLogin");
////////////////////////////////////////////////////////////////////
/**
 * Controlador para inicar sesion.
 * @param req La solicitud HTTP entrante.
 * @param res La respuesta HTTP saliente.
 */
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { usuario, contrasena_aleatoria } = req.body;
        // Validar la entrada de datos
        const inputValidationErrors = (0, userValidation_1.validateVerificationFieldsLogin)(usuario, contrasena_aleatoria);
        (0, validationUtils_1.handleInputValidationErrors)(inputValidationErrors, res);
        // Buscar al usuario por nombre de usuario
        const user = yield (0, userValidation_1.findUserByUsernameLogin)(usuario, res);
        // Verificar la propiedad de verificación del usuario
        (0, userVerification_1.checkUserVerificationStatusLogin)(user, res);
        // Verificar la contraseña del usuario
        yield (0, passwordValidation_1.verifyUserPassworde)(contrasena_aleatoria, user, res);
        // Verificar si el usuario ha excedido el número máximo de intentos de inicio de sesión y manejar el bloqueo de la cuenta
        yield (0, userVerification_1.checkLoginAttemptsAndBlockAccount)(user, res);
        yield (0, handleSuccessfulLogin_1.handleSuccessfulLogin)(user, res, contrasena_aleatoria);
    }
    catch (error) {
        // Manejar errores internos del servidor
        (0, userValidation_1.handleServerErrorLogin)(error, res);
    }
});
exports.loginUser = loginUser;
