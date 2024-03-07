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
exports.findVerificationRecordPhoneVerify = exports.handleServerErrorPhoneVerify = exports.validatePhoneNumberMatchPhoneVerify = exports.validateVerificationFieldsPhoneVerify = void 0;
const errorMessages_1 = require("../../../../../middleware/errorMessages");
const verificationsModel_1 = __importDefault(require("../../../../../models/verificaciones/verificationsModel"));
/**
 * Validar campos requeridos para el envío de códigos de verificación por SMS.
 * @param usuario Nombre de usuario.
 * @param celular Número de teléfono.
 * @returns Array de mensajes de error, vacío si no hay errores.
 */
const validateVerificationFieldsPhoneVerify = (usuario, celular, codigo_verificacion) => {
    const errors = [];
    if (!usuario || !celular || !codigo_verificacion) {
        errors.push(errorMessages_1.errorMessages.requiredFields);
    }
    return errors;
};
exports.validateVerificationFieldsPhoneVerify = validateVerificationFieldsPhoneVerify;
/**
 * Validar si el número de teléfono coincide con el almacenado en la base de datos.
 * @param user Objeto de usuario.
 * @param phoneNumber Número de teléfono a verificar.
 * @param res Objeto de respuesta HTTP.
 * @throws Error si el número de teléfono no coincide.
 */
const validatePhoneNumberMatchPhoneVerify = (user, celular, res) => {
    if (user.celular !== celular) {
        throw new Error(errorMessages_1.errorMessages.incorrectPhoneNumber);
    }
};
exports.validatePhoneNumberMatchPhoneVerify = validatePhoneNumberMatchPhoneVerify;
/**
 * Maneja errores internos del servidor.
 * @param error El error ocurrido.
 * @param res La respuesta HTTP saliente.
 */
const handleServerErrorPhoneVerify = (error, res) => {
    console.error("Error en el controlador phoneverify:", error);
    if (!res.headersSent) {
        res.status(400).json({
            msg: error.message || errorMessages_1.errorMessages.databaseError,
            error,
        });
    }
};
exports.handleServerErrorPhoneVerify = handleServerErrorPhoneVerify;
/**
 * Busca el registro de verificación correspondiente al usuario.
 * @param userId ID del usuario.
 * @returns Registro de verificación.
 * @throws Error si no se encuentra el registro.
 */
const findVerificationRecordPhoneVerify = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const verificationRecord = yield verificationsModel_1.default.findOne({ where: { usuario_id: userId } });
    if (!verificationRecord) {
        throw new Error(errorMessages_1.errorMessages.invalidVerificationCode);
    }
    return verificationRecord;
});
exports.findVerificationRecordPhoneVerify = findVerificationRecordPhoneVerify;
