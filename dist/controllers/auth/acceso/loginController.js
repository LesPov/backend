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
exports.handleServerErrorLogin = exports.loginUser = exports.checkUserVerificationStatusLogin = exports.findUserByUsernameLogin = exports.validateVerificationFieldsLogin = void 0;
const successMessages_1 = require("../../../middleware/successMessages");
const validationUtils_1 = require("../../../utils/singup/validation/validationUtils");
const errorMesages_1 = require("../../../middleware/errorMesages");
const usuariosModel_1 = __importDefault(require("../../../models/usuarios/usuariosModel"));
const verificationsModel_1 = __importDefault(require("../../../models/verificaciones/verificationsModel"));
/**
 * Validar campos requeridos para el envío de códigos de verificación por SMS.
 * @param usuario Nombre de usuario.
 * @param celular Número de teléfono.
 * @returns Array de mensajes de error, vacío si no hay errores.
 */
const validateVerificationFieldsLogin = (usuario, contrasena_aleatoria) => {
    const errors = [];
    if (!usuario || !contrasena_aleatoria) {
        errors.push(errorMesages_1.errorMessages.requiredFields);
    }
    return errors;
};
exports.validateVerificationFieldsLogin = validateVerificationFieldsLogin;
/**
 * Buscar un usuario por nombre de usuario, incluyendo su información de verificación.
 * @param usuario Nombre de usuario.
 * @param res Objeto de respuesta HTTP.
 * @returns Usuario encontrado.
 */
const findUserByUsernameLogin = (usuario, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield usuariosModel_1.default.findOne({
        where: { usuario: usuario },
        include: [verificationsModel_1.default], // Asegúrate de incluir la relación Verificacion
    });
    if (!user) {
        return res.status(400).json({ msg: errorMesages_1.errorMessages.userNotExists(usuario) });
    }
    return user;
});
exports.findUserByUsernameLogin = findUserByUsernameLogin;
/**
 * Verifica el estado de verificación del usuario.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const checkUserVerificationStatusLogin = (user, res) => {
    // Verificar si el correo electrónico del usuario está verificado
    if (!user.Verificacion || !user.Verificacion.correo_verificado) {
        return res.status(400).json({
            msg: errorMesages_1.errorMessages.userNotVerified,
        });
    }
    // Verificar si el teléfono del usuario está verificado
    if (!user.Verificacion || !user.Verificacion.celular_verificado) {
        return res.status(400).json({
            msg: errorMesages_1.errorMessages.phoneVerificationRequired,
        });
    }
};
exports.checkUserVerificationStatusLogin = checkUserVerificationStatusLogin;
/**
 * Controlador para registrar un nuevo usuario.
 * @param req La solicitud HTTP entrante.
 * @param res La respuesta HTTP saliente.
 */
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { usuario, contrasena_aleatoria } = req.body;
        // Validar la entrada de datos
        const inputValidationErrors = (0, exports.validateVerificationFieldsLogin)(usuario, contrasena_aleatoria);
        (0, validationUtils_1.handleInputValidationErrors)(inputValidationErrors, res);
        // Buscar al usuario por nombre de usuario
        const user = yield (0, exports.findUserByUsernameLogin)(usuario, res);
        // Verificar la propiedad de verificación del usuario
        (0, exports.checkUserVerificationStatusLogin)(user, res);
        // Responder con un mensaje de éxito
        res.json({
            msg: successMessages_1.successMessages.userLoggedIn
        });
    }
    catch (error) {
        // Manejar errores internos del servidor
        (0, exports.handleServerErrorLogin)(error, res);
    }
});
exports.loginUser = loginUser;
/**
 * Maneja errores internos del servidor.
 * @param error El error ocurrido.
 * @param res La respuesta HTTP saliente.
 */
const handleServerErrorLogin = (error, res) => {
    console.error("Error en el controlador login:", error);
    if (!res.headersSent) {
        res.status(400).json({
            msg: error.message || errorMesages_1.errorMessages.databaseError,
            error,
        });
    }
};
exports.handleServerErrorLogin = handleServerErrorLogin;
