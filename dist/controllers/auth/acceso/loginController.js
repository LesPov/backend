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
exports.loginUser = exports.checkUserVerificationStatusLogin = exports.findUserByUsernameLogin = exports.verifyUserPassworde = exports.validateVerificationFieldslogin = void 0;
const userValidation_1 = require("../../../utils/acceso/login/userValidation/userValidation");
const errorMessages_1 = require("../../../middleware/errorMessages");
const validationUtils_1 = require("../../../utils/singup/validation/validationUtils");
const usuariosModel_1 = __importDefault(require("../../../models/usuarios/usuariosModel"));
const verificationsModel_1 = __importDefault(require("../../../models/verificaciones/verificationsModel"));
const rolModel_1 = __importDefault(require("../../../models/rol/rolModel"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const handleSuccessfulLogin_1 = require("../../../utils/acceso/login/handleSuccessfulLogin/handleSuccessfulLogin");
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/**
 * Validar campos requeridos para el envío de .
 * @param usuario Nombre de usuario.
 * @param contraseña  Contraseña proporcionada.
 * @returns Array de mensajes de error, vacío si no hay errores.
 */
const validateVerificationFieldslogin = (usernameOrEmail, contrasena) => {
    const errors = [];
    if (!usernameOrEmail || !contrasena) {
        errors.push(errorMessages_1.errorMessages.missingUsernameOrEmail);
    }
    else if (!EMAIL_REGEX.test(usernameOrEmail) && !/^[a-zA-Z0-9_]+$/.test(usernameOrEmail)) {
        errors.push(errorMessages_1.errorMessages.invalidEmail);
    }
    return errors;
};
exports.validateVerificationFieldslogin = validateVerificationFieldslogin;
/**
 * Verifica la contraseña del usuario.
 * @param passwordOrRandomPassword Contraseña o contraseña aleatoria proporcionada.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const verifyUserPassworde = (passwordOrRandomPassword, user, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Verifica si la contraseña es válida
        const passwordValid = yield isPasswordValid(passwordOrRandomPassword, user);
        if (!passwordValid) {
            // Si la contraseña no es válida, devuelve un error de contraseña incorrecta
            res.status(401).json({ msg: "Contraseña incorrecta" });
        }
        // Si la contraseña es válida, continúa con el proceso de inicio de sesión
        // Aquí puedes agregar el código necesario para iniciar sesión correctamente
    }
    catch (error) {
        console.error('Error al verificar la contraseña:', error);
        // Maneja el error si ocurre durante la verificación de la contraseña
        res.status(500).json({ msg: "Error interno del servidor" });
    }
});
exports.verifyUserPassworde = verifyUserPassworde;
/**
 * Verifica si la contraseña proporcionada es válida.
 * @param passwordOrRandomPassword Contraseña o contraseña aleatoria proporcionada.
 * @param user Usuario encontrado.
 * @returns True si la contraseña es válida, false en caso contrario.
 */
const isPasswordValid = (passwordOrRandomPassword, user) => __awaiter(void 0, void 0, void 0, function* () {
    // Verifica si la longitud de la contraseña es igual a 8 para determinar si es una contraseña aleatoria
    return passwordOrRandomPassword.length === 8
        ? verifyRandomPassword(passwordOrRandomPassword, user)
        : yield verifyBcryptPassword(passwordOrRandomPassword, user.contrasena);
});
/**
 * Verifica la contraseña aleatoria del usuario.
 * @param randomPassword Contraseña aleatoria proporcionada.
 * @param user Usuario encontrado.
 * @returns true si la contraseña aleatoria es válida, false en caso contrario.
 */
const verifyRandomPassword = (randomPassword, user) => {
    console.log('Contraseña aleatoria.');
    return randomPassword === user.verificacion.contrasena_aleatoria;
};
/**
 * Verifica la contraseña normal.
 * @param password Contraseña proporcionada.
 * @param contrasena Contraseña almacenada en la base de datos.
 * @returns true si la contraseña es válida, false en caso contrario.
 */
const verifyBcryptPassword = (password, hashedPassword) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Contraseña normal.');
    return yield bcryptjs_1.default.compare(password, hashedPassword);
});
/**
 * Buscar un usuario por nombre de usuari o email  incluyendo su información de verificación y rol.
 * @param usuario Nombre de usuario.
 * @param res Objeto de respuesta HTTP.
 * @returns Usuario encontrado.
 */
const findUserByUsernameLogin = (usernameOrEmail, res) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.findUserByUsernameLogin = findUserByUsernameLogin;
/**
 * Verifica si el correo electrónico del usuario está verificado.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const checkEmailVerification = (user, res) => {
    if (!user.verificacion.correo_verificado) {
        return res.status(400).json({
            msg: errorMessages_1.errorMessages.userNotVerified,
        });
    }
};
/**
 * Verifica si el teléfono del usuario está verificado.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const checkPhoneVerification = (user, res) => {
    if (!user.verificacion.celular_verificado) {
        return res.status(400).json({
            msg: errorMessages_1.errorMessages.phoneVerificationRequired,
        });
    }
};
/**
 * Verifica si esta  usuario está verificado.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const checkVerificationverificado = (user, res) => {
    if (!user.verificacion.verificado) {
        return res.status(400).json({
            msg: errorMessages_1.errorMessages.verificadoVericationRequired,
        });
    }
};
/**
 * Verifica el estado de verificación del usuario.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const checkUserVerificationStatusLogin = (user, res) => {
    checkEmailVerification(user, res);
    checkPhoneVerification(user, res);
    checkVerificationverificado(user, res);
};
exports.checkUserVerificationStatusLogin = checkUserVerificationStatusLogin;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { usernameOrEmail, contrasena } = req.body;
        // Validar la entrada de datos
        const inputValidationErrors = (0, exports.validateVerificationFieldslogin)(usernameOrEmail, contrasena);
        (0, validationUtils_1.handleInputValidationErrors)(inputValidationErrors, res);
        // Buscar al usuario por nombre de usuario
        const user = yield (0, exports.findUserByUsernameLogin)(usernameOrEmail, res);
        // Verificar la propiedad de verificación del usuario
        (0, exports.checkUserVerificationStatusLogin)(user, res);
        // Verificar la contraseña del usuario
        yield (0, exports.verifyUserPassworde)(contrasena, user, res);
        yield (0, handleSuccessfulLogin_1.handleSuccessfulLogin)(user, res, contrasena);
    }
    catch (error) {
        // Manejar errores internos del servidor
        (0, userValidation_1.handleServerErrorLogin)(error, res);
    }
});
exports.loginUser = loginUser;
