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
exports.handleServerErrorPhoneSend = exports.findUserByUsernamePhoneSend = exports.validateVerificationFieldsPhoneSend = void 0;
const errorMessages_1 = require("../../../../../middleware/errorMessages");
const usuariosModel_1 = __importDefault(require("../../../../../models/usuarios/usuariosModel"));
const verificationsModel_1 = __importDefault(require("../../../../../models/verificaciones/verificationsModel"));
/**
 * Validar campos requeridos para el envío de códigos de verificación por SMS.
 * @param usuario Nombre de usuario.
 * @param celular Número de teléfono.
 * @returns Array de mensajes de error, vacío si no hay errores.
 */
const validateVerificationFieldsPhoneSend = (usuario, celular) => {
    const errors = [];
    if (!usuario || !celular) {
        errors.push(errorMessages_1.errorMessages.requiredFields);
    }
    return errors;
};
exports.validateVerificationFieldsPhoneSend = validateVerificationFieldsPhoneSend;
/**
 * Buscar un usuario por nombre de usuario, incluyendo su información de verificación.
 * @param usuario Nombre de usuario.
 * @param res Objeto de respuesta HTTP.
 * @returns Usuario encontrado.
 */
const findUserByUsernamePhoneSend = (usuario, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield usuariosModel_1.default.findOne({ where: { usuario: usuario }, include: [verificationsModel_1.default] });
    if (!user) {
        return res.status(400).json({ msg: errorMessages_1.errorMessages.userNotExists(usuario) });
    }
    return user;
});
exports.findUserByUsernamePhoneSend = findUserByUsernamePhoneSend;
/**
 * Maneja errores internos del servidor.
 * @param error El error ocurrido.
 * @param res La respuesta HTTP saliente.
 */
const handleServerErrorPhoneSend = (error, res) => {
    console.error("Error en el controlador phonesend:", error);
    if (!res.headersSent) {
        res.status(400).json({
            msg: error.message || errorMessages_1.errorMessages.databaseError,
            error,
        });
    }
};
exports.handleServerErrorPhoneSend = handleServerErrorPhoneSend;
