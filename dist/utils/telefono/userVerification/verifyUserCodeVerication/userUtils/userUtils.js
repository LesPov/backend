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
exports.verifySMSCodePhoneVerify = void 0;
const errorMessages_1 = require("../../../../../middleware/errorMessages");
const validationUtils_1 = require("../validationUtils/validationUtils");
/**
 * Valida el código de verificación proporcionado.
 * @param verificationRecord Registro de verificación.
 * @param verificationCode Código de verificación proporcionado.
 * @throws Error si el código de verificación no coincide.
 */
const validateVerificationCodePhoneVerify = (verificationRecord, verificationCode) => {
    if (verificationRecord.codigo_verificacion !== verificationCode) {
        throw new Error(errorMessages_1.errorMessages.invalidVerificationCode);
    }
};
/**
 * Actualiza el registro de verificación marcando el número de teléfono y el usuario como verificados si es necesario.
 * @param verificationRecord Registro de verificación.
 */
const updateVerificationRecordPhoneVerify = (verificationRecord) => __awaiter(void 0, void 0, void 0, function* () {
    yield verificationRecord.update({ celular_verificado: true });
    if (verificationRecord.correo_verificado) {
        yield verificationRecord.update({ verificado: true });
    }
});
/**
 * Función para verificar el código de verificación por SMS.
 * @param user Usuario para el que se verifica el código.
 * @param verificationCode Código de verificación proporcionado.
 * @param res Objeto de respuesta HTTP.
 */
const verifySMSCodePhoneVerify = (user, verificationCode, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Buscar el registro de verificación correspondiente al usuario
        const verificationRecord = yield (0, validationUtils_1.findVerificationRecordPhoneVerify)(user.usuario_id);
        // Validar el código de verificación proporcionado
        validateVerificationCodePhoneVerify(verificationRecord, verificationCode);
        // Actualizar el registro de verificación
        yield updateVerificationRecordPhoneVerify(verificationRecord);
    }
    catch (error) {
        (0, validationUtils_1.handleServerErrorPhoneVerify)(error, res);
    }
});
exports.verifySMSCodePhoneVerify = verifySMSCodePhoneVerify;
