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
exports.handleemailServerError = exports.resendVerificationCode = void 0;
const errorMesages_1 = require("../../../../middleware/errorMesages");
const successMessages_1 = require("../../../../middleware/successMessages");
const usuariosModel_1 = __importDefault(require("../../../../models/usuarios/usuariosModel"));
const verificationsModel_1 = __importDefault(require("../../../../models/verificaciones/verificationsModel"));
const emailUtils_1 = require("../../../../utils/singup/emailsend/emailUtils");
const generateCode_1 = require("../../../../utils/singup/paswword_generate/generateCode");
const validationUtils_1 = require("../../../../utils/singup/validation/validationUtils");
const userVerification_1 = require("../../../../utils/email/userVerification/verifiedUser/user&codeVerification/userVerification");
/**
 * Constante que define la cantidad de horas antes de que expire un código de verificación.
 */
const VERIFICATION_CODE_EXPIRATION_HOURS = 24;
const VERIFICATION_CODE_EXPIRATION_MINUTES = 1;
const validateVerificationFieldsResend = (usuario) => {
    const errors = [];
    if (!usuario) {
        errors.push(errorMesages_1.errorMessages.requiredFields);
    }
    return errors;
};
/**
 * Función que calcula y devuelve la fecha de expiración para un código de verificación,
 * establecida en 2 minutos después de la generación.
 * @returns Fecha de expiración del código de verificación.
 */
const generateVerificationData = () => {
    const verificationCode = (0, generateCode_1.generateVerificationCode)();
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getHours() + VERIFICATION_CODE_EXPIRATION_HOURS);
    return { verificationCode, expirationDate };
};
/**
 * Función que busca un registro de verificación para un usuario en la base de datos.
 * Si no existe, crea uno nuevo.
 * @param usuario_id - ID del usuario.
 * @returns Registro de verificación.
 */
const findOrCreateVerificationRecord = (usuario_id) => __awaiter(void 0, void 0, void 0, function* () {
    let verificationRecord = yield verificationsModel_1.default.findOne({ where: { usuario_id } });
    if (!verificationRecord) {
        verificationRecord = yield verificationsModel_1.default.create({ usuario_id });
    }
    return verificationRecord;
});
/**
 * Función que actualiza la información del código de verificación y su fecha de expiración
 * en el registro de verificación en la base de datos.
 * @param verificationRecord - Registro de verificación.
 * @param newVerificationCode - Nuevo código de verificación.
 * @param expirationDate - Fecha de expiración del nuevo código de verificación.
 */
const updateVerificationCodeInfo = (verificationRecord, newVerificationCode, expirationDate) => __awaiter(void 0, void 0, void 0, function* () {
    yield verificationRecord.update({
        codigo_verificacion: newVerificationCode,
        expiracion_codigo_verificacion: expirationDate
    });
});
/**
 * Función que utiliza la función `sendVerificationEmail` para enviar el nuevo código de verificación
 * por correo electrónico al usuario.
 * @param email - Correo electrónico del usuario.
 * @param username - Nombre de usuario del usuario.
 * @param newVerificationCode - Nuevo código de verificación.
 * @returns Verdadero si el correo electrónico se envía correctamente, de lo contrario, falso.
 */
const sendVerificationCodeByEmail = (email, username, newVerificationCode) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, emailUtils_1.sendVerificationEmail)(email, username, newVerificationCode);
});
/**
 * Controlador para reenviar el código de verificación a un usuario no verificado.
 * @param req - Objeto de solicitud.
 * @param res - Objeto de respuesta.
 */
const resendVerificationCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { usuario } = req.body;
        // Validar campos
        const validationErrors = validateVerificationFieldsResend(usuario);
        (0, validationUtils_1.handleInputValidationErrors)(validationErrors, res);
        // Buscar al usuario en la base de datos junto con su registro de verificación.
        const user = yield usuariosModel_1.default.findOne({ where: { usuario }, include: [verificationsModel_1.default] });
        (0, userVerification_1.checkUserVerificationStatus)(user);
        // Generar código y fecha de expiración
        const { verificationCode, expirationDate } = generateVerificationData();
        // Buscar o crear un registro de verificación para el usuario.
        const verificationRecord = yield findOrCreateVerificationRecord(user.usuario_id);
        // Actualizar la información del código de verificación en la base de datos.
        yield updateVerificationCodeInfo(verificationRecord, verificationCode, expirationDate);
        // Enviar el nuevo código de verificación por correo electrónico.
        yield sendVerificationCodeByEmail(user.email, user.usuario, verificationCode);
        // Responder con un mensaje de éxito si el correo electrónico se envía correctamente.
        res.json({
            msg: successMessages_1.successMessages.verificationCodeResent,
        });
    }
    catch (error) {
        // Manejar errores
        (0, exports.handleemailServerError)(error, res);
    }
});
exports.resendVerificationCode = resendVerificationCode;
/**
 * Maneja errores internos del servidor.
 * @param error El error ocurrido.
 * @param res La respuesta HTTP saliente.
 */
const handleemailServerError = (error, res) => {
    console.error("Error en el controlador email:", error);
    if (!res.headersSent) {
        res.status(400).json({
            msg: error.message || errorMesages_1.errorMessages.databaseError,
            error,
        });
    }
};
exports.handleemailServerError = handleemailServerError;
