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
exports.handleemailServerError = exports.sendVerificationCodeByEmail = exports.updateVerificationCodeInfo = exports.findOrCreateVerificationRecord = exports.generateVerificationData = exports.checkUserExistence = exports.validateVerificationFieldsResend = void 0;
const errorMessages_1 = require("../../../../middleware/errorMessages");
const usuariosModel_1 = __importDefault(require("../../../../models/usuarios/usuariosModel"));
const verificationsModel_1 = __importDefault(require("../../../../models/verificaciones/verificationsModel"));
const emailUtils_1 = require("../../../singup/emailsend/emailUtils");
const generateCode_1 = require("../../../singup/paswword_generate/generateCode");
/**
 * Constante que define la cantidad de horas antes de que expire un código de verificación.
 */
const VERIFICATION_CODE_EXPIRATION_HOURS = 24;
const validateVerificationFieldsResend = (usuario) => {
    const errors = [];
    if (!usuario) {
        errors.push(errorMessages_1.errorMessages.requiredFields);
    }
    return errors;
};
exports.validateVerificationFieldsResend = validateVerificationFieldsResend;
/**
 * Función que verifica si el usuario existe en la base de datos.
 * @param usuario - Nombre de usuario.
 * @param res - Objeto de respuesta.
 * @returns Usuario si existe, de lo contrario, devuelve un mensaje de error.
 */
const checkUserExistence = (usuario, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield usuariosModel_1.default.findOne({ where: { usuario }, include: [verificationsModel_1.default] });
    if (!user) {
        // Devuelve un error si el usuario no existe
        res.status(400).json({ msg: errorMessages_1.errorMessages.userNotExists(usuario) });
        // En este punto, puedes lanzar un error o devolver un objeto que indique la ausencia del usuario.
        throw new Error("Usuario no encontrado");
    }
    return user;
});
exports.checkUserExistence = checkUserExistence;
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
exports.generateVerificationData = generateVerificationData;
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
exports.findOrCreateVerificationRecord = findOrCreateVerificationRecord;
/**
 * Función que actualiza la información del código de verificación y su fecha de expiración
 * en el registro de verificación en la base de datos.
 * @param verificationRecord - Registro de verificación.
 * @param newVerificationCode - Nuevo código de verificación.
 * @param expirationDate - Fecha de expiración del nuevo código de verificación.
 */
const updateVerificationCodeInfo = (verificationRecord, newVerificationCode, expirationDate) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield verificationRecord.update({
            codigo_verificacion: newVerificationCode,
            expiracion_codigo_verificacion: expirationDate
        });
    }
    catch (error) {
        // Manejar errores específicos de la actualización
        throw new Error("Error actualizando el código de verificación");
    }
});
exports.updateVerificationCodeInfo = updateVerificationCodeInfo;
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
exports.sendVerificationCodeByEmail = sendVerificationCodeByEmail;
/**
 * Maneja errores internos del servidor.
 * @param error El error ocurrido.
 * @param res La respuesta HTTP saliente.
 */
const handleemailServerError = (error, res) => {
    console.error("Error en el controlador email:", error);
    if (!res.headersSent) {
        res.status(400).json({
            msg: error.message || errorMessages_1.errorMessages.databaseError,
            error,
        });
    }
};
exports.handleemailServerError = handleemailServerError;
