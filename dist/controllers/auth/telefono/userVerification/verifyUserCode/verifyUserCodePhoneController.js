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
exports.handleServerErrorPhoneVerify = exports.verifyPhoneNumber = exports.validateVerificationFieldsPhoneVerify = void 0;
const errorMesages_1 = require("../../../../../middleware/errorMesages");
const validationUtils_1 = require("../../../../../utils/singup/validation/validationUtils");
/**
 * Validar campos requeridos para el envío de códigos de verificación por SMS.
 * @param usuario Nombre de usuario.
 * @param celular Número de teléfono.
 * @returns Array de mensajes de error, vacío si no hay errores.
 */
const validateVerificationFieldsPhoneVerify = (usuario, celular, codigo_verificacion) => {
    const errors = [];
    if (!usuario || !celular || !codigo_verificacion) {
        errors.push(errorMesages_1.errorMessages.requiredFields);
    }
    return errors;
};
exports.validateVerificationFieldsPhoneVerify = validateVerificationFieldsPhoneVerify;
/**
 * Enviar código de verificación por SMS.
 * @param req Objeto de solicitud HTTP.
 * @param res Objeto de respuesta HTTP.
 */
const verifyPhoneNumber = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { usuario, celular, codigo_verificacion } = req.body;
        // Validar campos
        const validationErrors = (0, exports.validateVerificationFieldsPhoneVerify)(usuario, celular, codigo_verificacion);
        (0, validationUtils_1.handleInputValidationErrors)(validationErrors, res);
    }
    catch (error) {
        (0, exports.handleServerErrorPhoneVerify)(error, res);
    }
});
exports.verifyPhoneNumber = verifyPhoneNumber;
/**
 * Maneja errores internos del servidor.
 * @param error El error ocurrido.
 * @param res La respuesta HTTP saliente.
 */
const handleServerErrorPhoneVerify = (error, res) => {
    console.error("Error en el controlador phoneverify:", error);
    if (!res.headersSent) {
        res.status(400).json({
            msg: error.message || errorMesages_1.errorMessages.databaseError,
            error,
        });
    }
};
exports.handleServerErrorPhoneVerify = handleServerErrorPhoneVerify;
