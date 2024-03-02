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
exports.handleServerErrorPhoneSend = exports.sendVerificationCode = void 0;
const errorMesages_1 = require("../../../../../middleware/errorMesages");
const usuariosModel_1 = __importDefault(require("../../../../../models/usuarios/usuariosModel"));
const validationUtils_1 = require("../../../../../utils/singup/validation/validationUtils");
const verificationsModel_1 = __importDefault(require("../../../../../models/verificaciones/verificationsModel"));
const validateVerificationFieldsPhoneSend = (usuario, celular) => {
    const errors = [];
    if (!usuario || !celular) {
        errors.push(errorMesages_1.errorMessages.requiredFields);
    }
    return errors;
};
// Busca un usuario por nombre de usuario, incluyendo su información de verificación
const findUserByUsernamePhoneSend = (usuario, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield usuariosModel_1.default.findOne({ where: { usuario: usuario }, include: [verificationsModel_1.default] });
    if (!user) {
        return res.status(400).json({ msg: errorMesages_1.errorMessages.userNotExists(usuario) });
    }
    return user;
});
const checkUserVerificationStatusPhoneSend = (user) => {
    if (isUserAlreadyVerifiedPhoneSend(user)) {
        throw new Error(errorMesages_1.errorMessages.userAlreadyVerified);
    }
};
const isUserAlreadyVerifiedPhoneSend = (user) => {
    return user.verificacion.verificado || user.verificacion.correo_verificado;
};
const checkPhoneNumberAvailability = (celular, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingUser = yield usuariosModel_1.default.findOne({ where: { celular: celular } });
        if (existingUser) {
            return res.status(400).json({
                msg: errorMesages_1.errorMessages.phoneNumberExists,
            });
        }
    }
    catch (error) {
        (0, exports.handleServerErrorPhoneSend)(error, res);
    }
});
const sendVerificationCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { usuario, celular } = req.body;
        // Validar campos
        const validationErrors = validateVerificationFieldsPhoneSend(usuario, celular);
        (0, validationUtils_1.handleInputValidationErrors)(validationErrors, res);
        // Buscar al usuario por nombre de usuario
        const user = yield findUserByUsernamePhoneSend(usuario, res);
        checkUserVerificationStatusPhoneSend(user);
        // Verificar si el teléfono ya está verificado
        yield checkPhoneNumberAvailability(celular, res);
    }
    catch (error) {
        (0, exports.handleServerErrorPhoneSend)(error, res);
    }
});
exports.sendVerificationCode = sendVerificationCode;
/**
 * Maneja errores internos del servidor.
 * @param error El error ocurrido.
 * @param res La respuesta HTTP saliente.
 */
const handleServerErrorPhoneSend = (error, res) => {
    console.error("Error en el controlador phonesend:", error);
    if (!res.headersSent) {
        res.status(400).json({
            msg: error.message || errorMesages_1.errorMessages.databaseError,
            error,
        });
    }
};
exports.handleServerErrorPhoneSend = handleServerErrorPhoneSend;
