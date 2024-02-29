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
exports.isInvalidVerificationCode = exports.isVerificationCodeExpired = exports.isUserAlreadyVerified = exports.findUserByUsername = exports.validateVerificationFields = void 0;
const errorMesages_1 = require("../../../../middleware/errorMesages");
const usuariosModel_1 = __importDefault(require("../../../../models/usuarios/usuariosModel"));
const verificationsModel_1 = __importDefault(require("../../../../models/verificaciones/verificationsModel"));
const validateVerificationFields = (usuario, codigo_verificacion) => {
    const errors = [];
    if (!usuario || !codigo_verificacion) {
        errors.push(errorMesages_1.errorMessages.requiredFields);
    }
    return errors;
};
exports.validateVerificationFields = validateVerificationFields;
// Busca un usuario por nombre de usuario, incluyendo su información de verificación
const findUserByUsername = (usuario, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield usuariosModel_1.default.findOne({ where: { usuario: usuario }, include: [verificationsModel_1.default] });
    if (!user) {
        return res.status(400).json({ msg: errorMesages_1.errorMessages.userNotExists(usuario) });
    }
    return user;
});
exports.findUserByUsername = findUserByUsername;
// Verifica si el usuario ya está verificado por correo electrónico
const isUserAlreadyVerified = (user) => {
    return user.verificacion.correo_verificado;
};
exports.isUserAlreadyVerified = isUserAlreadyVerified;
// Verifica si el código de verificación ha expirado
const isVerificationCodeExpired = (user, currentDate) => {
    return user.verificacion.expiracion_codigo_verificacion &&
        user.verificacion.expiracion_codigo_verificacion < currentDate;
};
exports.isVerificationCodeExpired = isVerificationCodeExpired;
// Verifica si el código de verificación proporcionado es válido
const isInvalidVerificationCode = (user, codigo_verificacion) => {
    return user.verificacion.codigo_verificacion !== codigo_verificacion.trim();
};
exports.isInvalidVerificationCode = isInvalidVerificationCode;
