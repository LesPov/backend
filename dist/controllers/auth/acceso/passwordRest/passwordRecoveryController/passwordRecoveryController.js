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
exports.handleServerErrorRecoveryPass = exports.passwordRecoveryPass = exports.updateVerificationCodeInfo = exports.findOrCreateVerificationRecord = exports.generateRandomVerificationDataRecoveryPass = exports.generateRandomPasswordRecoveryPass = exports.findUserByUsernameRecoveryPass = exports.validateVerificationFieldsRecoveryPass = void 0;
const errorMessages_1 = require("../../../../../middleware/errorMessages");
const validationUtils_1 = require("../../../../../utils/singup/validation/validationUtils");
const usuariosModel_1 = __importDefault(require("../../../../../models/usuarios/usuariosModel"));
const verificationsModel_1 = __importDefault(require("../../../../../models/verificaciones/verificationsModel"));
const rolModel_1 = __importDefault(require("../../../../../models/rol/rolModel"));
const sequelize_1 = require("sequelize");
const userVerification_1 = require("../../../../../utils/acceso/login/userVerification/userVerification");
const emailUtils_1 = require("../../../../../utils/singup/emailsend/emailUtils");
const successMessages_1 = require("../../../../../middleware/successMessages");
/**
 * Constante que define la cantidad de horas antes de que expire un código de verificación.
 */
const VERIFICATION_CODE_EXPIRATION_HOURS = 5;
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
    const user = yield usuariosModel_1.default.findOne({
        where: {
            [sequelize_1.Op.or]: [
                { usuario: usernameOrEmail },
                { email: usernameOrEmail }
            ]
        },
        include: [
            {
                model: verificationsModel_1.default, // Incluye la relación Verificacion
            },
            {
                model: rolModel_1.default, // Incluye la relación con el modelo de rol
            },
        ],
    });
    if (!user) {
        // Devuelve un error si el usuario no existe
        res.status(400).json({ msg: errorMessages_1.errorMessages.userNotExists(usernameOrEmail) });
        // En este punto, puedes lanzar un error o devolver un objeto que indique la ausencia del usuario.
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
    const newPassword = (0, exports.generateRandomPasswordRecoveryPass)(8);
    // Calculate expiration date 24 hours from now
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getMinutes() + VERIFICATION_CODE_EXPIRATION_HOURS);
    // Log the generated password
    console.log('Generated Password:', newPassword);
    return { verificationCode: newPassword, expirationDate };
};
exports.generateRandomVerificationDataRecoveryPass = generateRandomVerificationDataRecoveryPass;
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
const updateVerificationCodeInfo = (verificationRecord, newPassCode, expirationDate) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield verificationRecord.update({
            contrasena_aleatoria: newPassCode,
            expiracion_codigo_verificacion: expirationDate
        });
    }
    catch (error) {
        // Manejar errores específicos de la actualización
        throw new Error("Error actualizando el código de verificación");
    }
});
exports.updateVerificationCodeInfo = updateVerificationCodeInfo;
const passwordRecoveryPass = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { usernameOrEmail } = req.body;
        // Validar la entrada de datos
        const inputValidationErrors = (0, exports.validateVerificationFieldsRecoveryPass)(usernameOrEmail);
        (0, validationUtils_1.handleInputValidationErrors)(inputValidationErrors, res);
        // Buscar al usuario por nombre de usuario
        const user = yield (0, exports.findUserByUsernameRecoveryPass)(usernameOrEmail, res);
        // Verificar la propiedad de verificación del usuario
        (0, userVerification_1.checkUserVerificationStatusLogin)(user, res);
        // Generar código y fecha de expiración
        const { verificationCode, expirationDate } = (0, exports.generateRandomVerificationDataRecoveryPass)();
        // Buscar o crear un registro de verificación para el usuario
        const verificationRecord = yield (0, exports.findOrCreateVerificationRecord)(user.usuario_id);
        // Actualizar la información del código de verificación en la base de datos
        yield (0, exports.updateVerificationCodeInfo)(verificationRecord, verificationCode, expirationDate);
        // Envía un correo electrónico con la nueva contraseña aleatoria
        const emailSent = yield (0, emailUtils_1.sendPasswordResetEmail)(user.email, user.usuario, verificationCode);
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
