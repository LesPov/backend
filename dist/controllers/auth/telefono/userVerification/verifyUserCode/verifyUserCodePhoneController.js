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
exports.handleServerErrorPhoneVerify = exports.verifyPhoneNumber = exports.verifySMSCode = exports.validatePhoneNumberMatchPhoneVerify = exports.isUserAlreadyVerifiedPhoneVerify = exports.checkUserVerificationStatusPhoneVerify = exports.validateVerificationFieldsPhoneVerify = void 0;
const errorMesages_1 = require("../../../../../middleware/errorMesages");
const validationUtils_1 = require("../../../../../utils/singup/validation/validationUtils");
const verificationsModel_1 = __importDefault(require("../../../../../models/verificaciones/verificationsModel"));
const successMessages_1 = require("../../../../../middleware/successMessages");
const validationUtils_2 = require("../../../../../utils/telefono/userVerification/sendCodeVerification/validationUtils/validationUtils");
const userVerification_1 = require("../../../../../utils/email/userVerification/verifiedUser/user&codeVerification/userVerification");
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
 * Verificar si el usuario ya ha sido verificado previamente.
 * @param user Usuario a verificar.
 * @throws Error si el usuario ya ha sido verificado.
 */
const checkUserVerificationStatusPhoneVerify = (user) => {
    if ((0, exports.isUserAlreadyVerifiedPhoneVerify)(user)) {
        throw new Error(errorMesages_1.errorMessages.userAlreadyVerified);
    }
};
exports.checkUserVerificationStatusPhoneVerify = checkUserVerificationStatusPhoneVerify;
/**
 * Verificar si el usuario ya ha sido verificado en celular_verificado.
 * @param user Usuario a verificar.
 * @returns true si el usuario ya ha sido verificado, false de lo contrario.
 */
const isUserAlreadyVerifiedPhoneVerify = (user) => {
    return user.verificacion.celular_verificado;
};
exports.isUserAlreadyVerifiedPhoneVerify = isUserAlreadyVerifiedPhoneVerify;
/**
 * Validar si el número de teléfono coincide con el almacenado en la base de datos.
 * @param user Objeto de usuario.
 * @param phoneNumber Número de teléfono a verificar.
 * @param res Objeto de respuesta HTTP.
 * @throws Error si el número de teléfono no coincide.
 */
const validatePhoneNumberMatchPhoneVerify = (user, celular, res) => {
    if (user.celular !== celular) {
        throw new Error(errorMesages_1.errorMessages.incorrectPhoneNumber);
    }
};
exports.validatePhoneNumberMatchPhoneVerify = validatePhoneNumberMatchPhoneVerify;
/**
 * Busca el registro de verificación correspondiente al usuario.
 * @param userId ID del usuario.
 * @returns Registro de verificación.
 * @throws Error si no se encuentra el registro.
 */
const findVerificationRecord = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const verificationRecord = yield verificationsModel_1.default.findOne({ where: { usuario_id: userId } });
    if (!verificationRecord) {
        throw new Error(errorMesages_1.errorMessages.invalidVerificationCode);
    }
    return verificationRecord;
});
/**
 * Valida el código de verificación proporcionado.
 * @param verificationRecord Registro de verificación.
 * @param verificationCode Código de verificación proporcionado.
 * @throws Error si el código de verificación no coincide.
 */
const validateVerificationCode = (verificationRecord, verificationCode) => {
    if (verificationRecord.codigo_verificacion !== verificationCode) {
        throw new Error(errorMesages_1.errorMessages.invalidVerificationCode);
    }
};
/**
 * Actualiza el registro de verificación marcando el número de teléfono y el usuario como verificados si es necesario.
 * @param verificationRecord Registro de verificación.
 */
const updateVerificationRecord = (verificationRecord) => __awaiter(void 0, void 0, void 0, function* () {
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
const verifySMSCode = (user, verificationCode, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Buscar el registro de verificación correspondiente al usuario
        const verificationRecord = yield findVerificationRecord(user.usuario_id);
        // Validar el código de verificación proporcionado
        validateVerificationCode(verificationRecord, verificationCode);
        // Actualizar el registro de verificación
        yield updateVerificationRecord(verificationRecord);
    }
    catch (error) {
        (0, exports.handleServerErrorPhoneVerify)(error, res);
    }
});
exports.verifySMSCode = verifySMSCode;
///////////////////////////////////////////////////////////////////////
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
        // Buscar al usuario por nombre de usuario
        const user = yield (0, validationUtils_2.findUserByUsernamePhoneSend)(usuario, res);
        // Verificar estado de verificación del usuario
        (0, exports.checkUserVerificationStatusPhoneVerify)(user);
        // Validar si el código de verificación ha expirado
        const currentDate = new Date();
        (0, userVerification_1.checkVerificationCodeExpiration)(user, currentDate);
        // Validar si el número de teléfono coincide con el almacenado en la base de datos
        (0, exports.validatePhoneNumberMatchPhoneVerify)(user, celular, res);
        // Verificar el código de verificación por SMS
        yield (0, exports.verifySMSCode)(user, codigo_verificacion, res);
        res.status(200).json({ msg: successMessages_1.successMessages.phoneVerified });
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
