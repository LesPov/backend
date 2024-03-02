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
exports.sendCodeVerification = void 0;
const usuariosModel_1 = __importDefault(require("../../../../../models/usuarios/usuariosModel"));
const validationUtils_1 = require("../../../../../utils/singup/validation/validationUtils");
const verificationsModel_1 = __importDefault(require("../../../../../models/verificaciones/verificationsModel"));
const generateCode_1 = require("../../../../../utils/singup/paswword_generate/generateCode");
const resendUser_1 = require("../../../../../utils/email/userVerification/resendUserVerification/resendUser");
const twilio_1 = __importDefault(require("twilio"));
const validationUtils_2 = require("../../../../../utils/telefono/userVerification/sendCodeVerification/validationUtils/validationUtils");
const verificationUtils_1 = require("../../../../../utils/telefono/userVerification/sendCodeVerification/verificationUtils/verificationUtils");
const VERIFICATION_CODE_EXPIRATION_HOURS = 24;
/**
 * Función que calcula y devuelve la fecha de expiración para un código de verificación,
 * establecida en 2 minutos después de la generación.
 * @returns Fecha de expiración del código de verificación.
 */
const generateVerificationDataPhoneSend = () => {
    const verificationCode = (0, generateCode_1.generateVerificationCode)();
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getHours() + VERIFICATION_CODE_EXPIRATION_HOURS);
    return { verificationCode, expirationDate };
};
/**
 * Buscar o crear un registro de verificación para el usuario.
 * @param user Usuario encontrado.
 * @returns Registro de verificación.
 */
const findOrCreateVerificationRecordPhoneSend = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const usuario_id = user.usuario_id;
    let verificationRecord = yield verificationsModel_1.default.findOne({ where: { usuario_id } });
    if (!verificationRecord) {
        verificationRecord = yield verificationsModel_1.default.create({ usuario_id });
    }
    return verificationRecord;
});
// Función para enviar el código de verificación por SMS usando Twilio
const sendVerificationCodeViaSMSPhoneSend = (celular, codigo_verificacion) => __awaiter(void 0, void 0, void 0, function* () {
    const client = (0, twilio_1.default)(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    try {
        const message = yield client.messages.create({
            body: `Tu código de verificación es: ${codigo_verificacion}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: celular,
        });
        console.log('Código de verificación enviado por SMS:', message.sid);
        return true; // Indica que el mensaje se envió correctamente
    }
    catch (error) {
        console.error('Error al enviar el código de verificación por SMS:', error);
        throw error;
    }
});
///////////////////////////////////////////////////////////////////////////////////////////
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
/**
 * Enviar código de verificación por SMS.
 * @param req Objeto de solicitud HTTP.
 * @param res Objeto de respuesta HTTP.
 */
const sendCodeVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { usuario, celular } = req.body;
        // Validar campos
        const validationErrors = (0, validationUtils_2.validateVerificationFieldsPhoneSend)(usuario, celular);
        (0, validationUtils_1.handleInputValidationErrors)(validationErrors, res);
        // Buscar al usuario por nombre de usuario
        const user = yield (0, validationUtils_2.findUserByUsernamePhoneSend)(usuario, res);
        // Verificar estado de verificación del usuario
        (0, verificationUtils_1.checkUserVerificationStatusPhoneSend)(user);
        // Verificar si el usuario ya tiene un número de teléfono asociado
        (0, verificationUtils_1.checkUserPhoneNumberExistsPhoneSend)(user, celular);
        // Verificar si el teléfono ya está verificado
        yield (0, verificationUtils_1.checkPhoneNumberAvailabilityPhoneSend)(celular);
        // Generar un código de verificación
        const { verificationCode, expirationDate } = generateVerificationDataPhoneSend();
        // Buscar o crear un registro de verificación para el usuario.
        const verificationRecord = yield findOrCreateVerificationRecordPhoneSend(user);
        // Actualizar la información del código de verificación en la base de datos.
        yield (0, resendUser_1.updateVerificationCodeInfo)(verificationRecord, verificationCode, expirationDate);
        // Enviar el código de verificación por SMS
        yield sendVerificationCodeViaSMSPhoneSend(celular, verificationCode);
        // Actualizar la información del usuario después de enviar el código de verificación
        yield updateUserInfoAfterVerificationCodeSentPhoneSend(celular, usuario, user);
        // Resto de la lógica para enviar el código de verificación por SMS
    }
    catch (error) {
        (0, validationUtils_2.handleServerErrorPhoneSend)(error, res);
    }
});
exports.sendCodeVerification = sendCodeVerification;
