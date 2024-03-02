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
const generateCode_1 = require("../../../../../utils/singup/paswword_generate/generateCode");
const resendUser_1 = require("../../../../../utils/email/userVerification/resendUserVerification/resendUser");
const twilio_1 = __importDefault(require("twilio"));
const VERIFICATION_CODE_EXPIRATION_HOURS = 24;
/**
 * Validar campos requeridos para el envío de códigos de verificación por SMS.
 * @param usuario Nombre de usuario.
 * @param celular Número de teléfono.
 * @returns Array de mensajes de error, vacío si no hay errores.
 */
const validateVerificationFieldsPhoneSend = (usuario, celular) => {
    const errors = [];
    if (!usuario || !celular) {
        errors.push(errorMesages_1.errorMessages.requiredFields);
    }
    return errors;
};
/**
 * Buscar un usuario por nombre de usuario, incluyendo su información de verificación.
 * @param usuario Nombre de usuario.
 * @param res Objeto de respuesta HTTP.
 * @returns Usuario encontrado.
 */
const findUserByUsernamePhoneSend = (usuario, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield usuariosModel_1.default.findOne({ where: { usuario: usuario }, include: [verificationsModel_1.default] });
    if (!user) {
        return res.status(400).json({ msg: errorMesages_1.errorMessages.userNotExists(usuario) });
    }
    return user;
});
/**
 * Verificar si el usuario ya ha sido verificado previamente.
 * @param user Usuario a verificar.
 * @throws Error si el usuario ya ha sido verificado.
 */
const checkUserVerificationStatusPhoneSend = (user) => {
    if (isUserAlreadyVerifiedPhoneSend(user)) {
        throw new Error(errorMesages_1.errorMessages.userAlreadyVerified);
    }
};
/**
 * Verificar si el usuario ya ha sido verificado en las tablas verifcado o correo_verifcado.
 * @param user Usuario a verificar.
 * @returns true si el usuario ya ha sido verificado, false de lo contrario.
 */
const isUserAlreadyVerifiedPhoneSend = (user) => {
    return user.verificacion.verificado || user.verificacion.correo_verificado;
};
/**
 * Verificar la disponibilidad del número de teléfono en la base de datos.
 * @param celular Número de teléfono a verificar.
 * @param res Objeto de respuesta HTTP.
 * @throws Error si el número de teléfono ya está registrado.
 */
const checkPhoneNumberAvailability = (celular) => __awaiter(void 0, void 0, void 0, function* () {
    const existingUser = yield usuariosModel_1.default.findOne({ where: { celular: celular } });
    if (existingUser) {
        throw new Error(errorMesages_1.errorMessages.phoneNumberExists);
    }
});
/**
 * Verificar si el número de teléfono ya está asociado al usuario actual.
 * @param user Usuario actual.
 * @param celular Número de teléfono a verificar.
 * @throws Error si el número de teléfono ya está asociado al usuario actual.
 */
const checkUserPhoneNumberExistsPhoneSend = (user, celular) => {
    if (user.celular === celular) {
        throw new Error(errorMesages_1.errorMessages.phoneNumberInUse);
    }
};
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
const sendVerificationCodeViaSMS = (celular, codigo_verificacion) => __awaiter(void 0, void 0, void 0, function* () {
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
// Actualizar la información del usuario después de enviar el código de verificación
const updateUserInfoAfterVerificationCodeSent = (celular, usuario, user) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updateResult = yield usuariosModel_1.default.update({
            celular: celular,
            isPhoneVerified: false,
        }, { where: { usuario: usuario || user.usuario } });
        console.log('Resultado de la actualización de Auth:', updateResult);
        return updateResult;
    }
    catch (error) {
        console.error('Error al actualizar la información del usuario después de enviar el código de verificación:', error);
        throw error;
    }
});
/**
 * Enviar código de verificación por SMS.
 * @param req Objeto de solicitud HTTP.
 * @param res Objeto de respuesta HTTP.
 */
const sendVerificationCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { usuario, celular } = req.body;
        // Validar campos
        const validationErrors = validateVerificationFieldsPhoneSend(usuario, celular);
        (0, validationUtils_1.handleInputValidationErrors)(validationErrors, res);
        // Buscar al usuario por nombre de usuario
        const user = yield findUserByUsernamePhoneSend(usuario, res);
        // Verificar estado de verificación del usuario
        checkUserVerificationStatusPhoneSend(user);
        // Verificar si el usuario ya tiene un número de teléfono asociado
        checkUserPhoneNumberExistsPhoneSend(user, celular);
        // Verificar si el teléfono ya está verificado
        yield checkPhoneNumberAvailability(celular);
        // Generar un código de verificación
        const { verificationCode, expirationDate } = generateVerificationDataPhoneSend();
        // Buscar o crear un registro de verificación para el usuario.
        const verificationRecord = yield findOrCreateVerificationRecordPhoneSend(user);
        // Actualizar la información del código de verificación en la base de datos.
        yield (0, resendUser_1.updateVerificationCodeInfo)(verificationRecord, verificationCode, expirationDate);
        // Enviar el código de verificación por SMS
        yield sendVerificationCodeViaSMS(celular, verificationCode);
        // Actualizar la información del usuario después de enviar el código de verificación
        yield updateUserInfoAfterVerificationCodeSent(celular, usuario, user);
        // Resto de la lógica para enviar el código de verificación por SMS
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
