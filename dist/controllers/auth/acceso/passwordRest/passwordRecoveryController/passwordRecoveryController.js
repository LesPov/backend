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
exports.handleServerErrorRecoveryPass = exports.passwordRecoveryPass = exports.updateVerificationCodeInfoRecoveryPass = exports.findOrCreateVerificationRecoveryPass = exports.generateRandomVerificationDataRecoveryPass = exports.generateRandomPasswordRecoveryPass = exports.findUserByUsernameRecoveryPass = exports.validateVerificationFieldsRecoveryPass = void 0;
const errorMessages_1 = require("../../../../../middleware/errorMessages");
const validationUtils_1 = require("../../../../../utils/singup/validation/validationUtils");
const usuariosModel_1 = __importDefault(require("../../../../../models/usuarios/usuariosModel"));
const verificationsModel_1 = __importDefault(require("../../../../../models/verificaciones/verificationsModel"));
const rolModel_1 = __importDefault(require("../../../../../models/rol/rolModel"));
const loginController_1 = require("../../loginController");
const emailUtils_1 = require("../../../../../utils/singup/emailsend/emailUtils");
const successMessages_1 = require("../../../../../middleware/successMessages");
/**
 * Constante que define la cantidad de horas antes de que expire un código de verificación.
 */
const VERIFICATION_CODE_EXPIRATION_MINUTES = 3;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
/**
 * Validar campos requeridos para el envío de .
 * @param usuario Nombre de usuario.
 * @param celular Número de teléfono.
 * @returns Array de mensajes de error, vacío si no hay errores.
 */
const validateVerificationFieldsRecoveryPass = (usernameOrEmail) => {
    const errors = [];
    if (!usernameOrEmail) {
        errors.push(errorMessages_1.errorMessages.missingUsernameOrEmail);
    }
    else if (!EMAIL_REGEX.test(usernameOrEmail) && !/^[a-zA-Z0-9_]+$/.test(usernameOrEmail)) {
        errors.push(errorMessages_1.errorMessages.invalidEmail);
    }
    return errors;
};
exports.validateVerificationFieldsRecoveryPass = validateVerificationFieldsRecoveryPass;
/**
 * Buscar un usuario por nombre de usuari o email  incluyendo su información de verificación y rol.
 * @param usuario Nombre de usuario.
 * @param res Objeto de respuesta HTTP.
 * @returns Usuario encontrado.
 */
const findUserByUsernameRecoveryPass = (usernameOrEmail, res) => __awaiter(void 0, void 0, void 0, function* () {
    let user = null;
    if (EMAIL_REGEX.test(usernameOrEmail)) {
        user = yield usuariosModel_1.default.findOne({
            where: { email: usernameOrEmail },
            include: [verificationsModel_1.default, rolModel_1.default],
        });
    }
    else {
        user = yield usuariosModel_1.default.findOne({
            where: { usuario: usernameOrEmail },
            include: [verificationsModel_1.default, rolModel_1.default],
        });
    }
    if (!user) {
        res.status(400).json({ msg: errorMessages_1.errorMessages.userNotExists(usernameOrEmail) });
        throw new Error("Usuario no encontrado");
    }
    return user;
});
exports.findUserByUsernameRecoveryPass = findUserByUsernameRecoveryPass;
/**
 * Genera una contraseña aleatoria.
 * @param {number} length - Longitud de la contraseña generada.
 * @returns {string} - Contraseña aleatoria.
 */
const generateRandomPasswordRecoveryPass = (length) => {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomPassword = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomPassword += characters.charAt(randomIndex);
    }
    return randomPassword;
};
exports.generateRandomPasswordRecoveryPass = generateRandomPasswordRecoveryPass;
/**
 * Función que calcula y devuelve la fecha de expiración para un código de verificación,
 * establecida en 2 minutos después de la generación.
 * @returns Objeto con la contraseña aleatoria de 8 dígitos y la fecha de expiración del código de verificación.
 */
const generateRandomVerificationDataRecoveryPass = () => {
    // Generate an 8-digit random password
    const randomPassword = (0, exports.generateRandomPasswordRecoveryPass)(8);
    // Calculate expiration date 2 MINUTOS
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + VERIFICATION_CODE_EXPIRATION_MINUTES);
    // Log the generated password
    console.log('Generated Password:', randomPassword);
    return { randomPassword: randomPassword, expirationDate };
};
exports.generateRandomVerificationDataRecoveryPass = generateRandomVerificationDataRecoveryPass;
/**
 * Función que busca un registro de verificación para un usuario en la base de datos.
 * Si no existe, crea uno nuevo.
 * @param usuario_id - ID del usuario.
 * @returns Registro de verificación.
 */
const findOrCreateVerificationRecoveryPass = (usuario_id) => __awaiter(void 0, void 0, void 0, function* () {
    let verificationRecord = yield verificationsModel_1.default.findOne({ where: { usuario_id } });
    if (!verificationRecord) {
        verificationRecord = yield verificationsModel_1.default.create({ usuario_id });
    }
    return verificationRecord;
});
exports.findOrCreateVerificationRecoveryPass = findOrCreateVerificationRecoveryPass;
/**
 * Función que actualiza la información del código de verificación y su fecha de expiración
 * en el registro de verificación en la base de datos.
 * @param verificationRecord - Registro de verificación.
 * @param newVerificationCode - Nuevo código de verificación.
 * @param expirationDate - Fecha de expiración del nuevo código de verificación.
 */
const updateVerificationCodeInfoRecoveryPass = (verificationRecord, randomPassword, expirationDate) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield verificationRecord.update({
            contrasena_aleatoria: randomPassword,
            expiracion_codigo_verificacion: expirationDate
        });
    }
    catch (error) {
        // Manejar errores específicos de la actualización
        throw new Error("Error actualizando el código de verificación");
    }
});
exports.updateVerificationCodeInfoRecoveryPass = updateVerificationCodeInfoRecoveryPass;
const passwordRecoveryPass = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { usernameOrEmail } = req.body;
        // Validar la entrada de datos
        const inputValidationErrors = (0, exports.validateVerificationFieldsRecoveryPass)(usernameOrEmail);
        (0, validationUtils_1.handleInputValidationErrors)(inputValidationErrors, res);
        // Buscar al usuario por nombre de usuario
        const user = yield (0, exports.findUserByUsernameRecoveryPass)(usernameOrEmail, res);
        // Verificar la propiedad de verificación del usuario
        (0, loginController_1.checkUserVerificationStatusLogin)(user, res);
        // Generar código y fecha de expiración
        const { randomPassword, expirationDate } = (0, exports.generateRandomVerificationDataRecoveryPass)();
        // Buscar o crear un registro de verificación para el usuario
        const verificationRecord = yield (0, exports.findOrCreateVerificationRecoveryPass)(user.usuario_id);
        // Actualizar la información del código de verificación en la base de datos
        yield (0, exports.updateVerificationCodeInfoRecoveryPass)(verificationRecord, randomPassword, expirationDate);
        // Envía un correo electrónico con la nueva contraseña aleatoria
        const emailSent = yield (0, emailUtils_1.sendPasswordResetEmail)(user.email, user.usuario, randomPassword);
        // Responder con un mensaje de éxito si el correo electrónico se envía correctamente.
        res.json({
            msg: successMessages_1.successMessages.passwordResetEmailSent,
        });
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
    console.error("Error en el controlador passwordRecoveryPass:", error);
    if (!res.headersSent) {
        res.status(400).json({
            msg: error.message || errorMessages_1.errorMessages.databaseError,
            error,
        });
    }
};
exports.handleServerErrorRecoveryPass = handleServerErrorRecoveryPass;
