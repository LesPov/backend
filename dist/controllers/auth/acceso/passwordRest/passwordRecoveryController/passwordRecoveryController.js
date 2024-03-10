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
exports.handleServerErrorRecoveryPass = exports.passwordRecoveryPass = exports.validateVerificationFieldsRecoveryPass = void 0;
const errorMessages_1 = require("../../../../../middleware/errorMessages");
const validationUtils_1 = require("../../../../../utils/singup/validation/validationUtils");
/**
 * Validar campos requeridos para el envío de .
 * @param usuario Nombre de usuario.
 * @param celular Número de teléfono.
 * @returns Array de mensajes de error, vacío si no hay errores.
 */
const validateVerificationFieldsRecoveryPass = (usernameOrEmail) => {
    const errors = [];
    if (!usernameOrEmail) {
        errors.push(errorMessages_1.errorMessages.requiredFields);
    }
    return errors;
};
exports.validateVerificationFieldsRecoveryPass = validateVerificationFieldsRecoveryPass;
const passwordRecoveryPass = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { usernameOrEmail } = req.body;
        // Validar la entrada de datos
        const inputValidationErrors = (0, exports.validateVerificationFieldsRecoveryPass)(usernameOrEmail);
        (0, validationUtils_1.handleInputValidationErrors)(inputValidationErrors, res);
    }
    catch (error) {
        // Manejar errores internos del servidor
        (0, exports.handleServerErrorRecoveryPass)(error, res);
    }
});
exports.passwordRecoveryPass = passwordRecoveryPass;
/**
 * Maneja errores internos del servidor.
 * @param error El error ocurrido.
 * @param res La respuesta HTTP saliente.
 */
const handleServerErrorRecoveryPass = (error, res) => {
    console.error("Error en el controlador login:", error);
    if (!res.headersSent) {
        res.status(400).json({
            msg: error.message || errorMessages_1.errorMessages.databaseError,
            error,
        });
    }
};
exports.handleServerErrorRecoveryPass = handleServerErrorRecoveryPass;
