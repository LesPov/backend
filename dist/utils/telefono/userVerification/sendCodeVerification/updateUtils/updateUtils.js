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
exports.updateUserInfoAfterVerificationCodeSentPhoneSend = void 0;
const usuariosModel_1 = __importDefault(require("../../../../../models/usuarios/usuariosModel"));
/**
 * Actualizar la información del usuario después de enviar el código de verificación.
 * @param celular Número de teléfono.
 * @param usuario Nombre de usuario.
 * @param user Objeto de usuario.
 * @returns Resultado de la actualización.
 */
const updateUserInfoAfterVerificationCodeSentPhoneSend = (celular, usuario, user) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updateData = buildUpdateDataPhoneSend(celular);
        const whereClause = buildWhereClausePhoneSend(usuario, user);
        const updateResult = yield updateUserInfoPhoneSend(updateData, whereClause);
        logUpdateResultPhoneSend(updateResult);
        return updateResult;
    }
    catch (error) {
        handleUpdateErrorPhoneSend(error);
    }
});
exports.updateUserInfoAfterVerificationCodeSentPhoneSend = updateUserInfoAfterVerificationCodeSentPhoneSend;
/**
 * Construir los datos de actualización para la información del usuario.
 * @param celular Número de teléfono.
 * @returns Objeto con datos de actualización.
 */
const buildUpdateDataPhoneSend = (celular) => {
    return {
        celular: celular,
        isPhoneVerified: false,
    };
};
/**
 * Construir la cláusula WHERE para la actualización.
 * @param usuario Nombre de usuario.
 * @param user Objeto de usuario.
 * @returns Objeto con cláusula WHERE.
 */
const buildWhereClausePhoneSend = (usuario, user) => {
    return {
        where: { usuario: usuario || user.usuario },
    };
};
/**
 * Actualizar la información del usuario en la base de datos.
 * @param updateData Datos de actualización.
 * @param whereClause Cláusula WHERE.
 * @returns Resultado de la actualización.
 * @throws Error si ocurre un error durante la actualización.
 */
const updateUserInfoPhoneSend = (updateData, whereClause) => __awaiter(void 0, void 0, void 0, function* () {
    const updateResult = yield usuariosModel_1.default.update(updateData, whereClause);
    return updateResult;
});
/**
 * Registrar el resultado de la actualización en la consola.
 * @param updateResult Resultado de la actualización.
 */
const logUpdateResultPhoneSend = (updateResult) => {
    console.log('Resultado de la actualización de Usuarios:', updateResult);
};
/**
 * Manejar errores durante la actualización de la información del usuario.
 * @param error Error ocurrido durante la actualización.
 */
const handleUpdateErrorPhoneSend = (error) => {
    console.error('Error al actualizar la información del usuario después de enviar el código de verificación:', error);
    throw error;
};
