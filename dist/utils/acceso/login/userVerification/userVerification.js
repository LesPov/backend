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
exports.updateLoginAttemptslogin = exports.handleMaxLoginAttemptslogin = exports.isRandomPasswordExpiredlogin = exports.verifyUserPasswordelogin = void 0;
const errorMessages_1 = require("../../../../middleware/errorMessages");
const lockAccount_1 = require("../lockAccount/lockAccount");
const verificationsModel_1 = __importDefault(require("../../../../models/verificaciones/verificationsModel"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const MAX_LOGIN_ATTEMPTS = 5;
/**
 * Verifica la contraseña del usuario.
 * @param passwordOrRandomPassword Contraseña o contraseña aleatoria proporcionada.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const verifyUserPasswordelogin = (passwordOrRandomPassword, user, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Verifica si la contraseña es válida
        const passwordValid = yield isPasswordValidlogin(passwordOrRandomPassword, user, res);
        if (!passwordValid) {
            // Si la contraseña no es válida, devuelve un error de contraseña incorrecta
            yield handleFailedLogin(user, res);
        }
    }
    catch (error) {
        console.error('Error al verificar la contraseña:', error);
    }
});
exports.verifyUserPasswordelogin = verifyUserPasswordelogin;
/**
 * Verifica si la contraseña proporcionada es válida.
 * @param passwordOrRandomPassword Contraseña o contraseña aleatoria proporcionada.
 * @param user Usuario encontrado.
 * @returns True si la contraseña es válida, false en caso contrario.
 */
const isPasswordValidlogin = (passwordOrRandomPassword, user, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Verifica si la longitud de la contraseña es igual a 8 para determinar si es una contraseña noramla o  aleatoria
    return passwordOrRandomPassword.length === 8
        ? verifyRandomPasswordlogin(passwordOrRandomPassword, user, res)
        : yield verifyBcryptPasswordlogin(passwordOrRandomPassword, user.contrasena);
});
/**
 * Verifica la contraseña aleatoria del usuario.
 * @param randomPassword Contraseña aleatoria proporcionada.
 * @param user Usuario encontrado.
 * @returns true si la contraseña aleatoria es válida, false en caso contrario.
 */
const verifyRandomPasswordlogin = (randomPassword, user, res) => {
    if ((0, exports.isRandomPasswordExpiredlogin)(user)) {
        return false;
    }
    console.log('Contraseña aleatoria válida.');
    return randomPassword === user.verificacion.contrasena_aleatoria;
};
/**
 * Verifica si la contraseña aleatoria ha expirado.
 * @param user Usuario encontrado.
 * @returns true si la contraseña aleatoria ha expirado, false si aún es válida.
 */
const isRandomPasswordExpiredlogin = (user) => {
    const expirationDate = new Date(user.verificacion.expiracion_codigo_verificacion);
    const currentDate = new Date();
    return currentDate > expirationDate;
};
exports.isRandomPasswordExpiredlogin = isRandomPasswordExpiredlogin;
/**
 * Verifica la contraseña normal.
 * @param contrasena Contraseña proporcionada.
 * @param contrasena Contraseña almacenada en la base de datos.
 * @returns true si la contraseña es válida, false en caso contrario.
 */
const verifyBcryptPasswordlogin = (contrasena, hashedPassword) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Contraseña normal.');
    return yield bcryptjs_1.default.compare(contrasena, hashedPassword);
});
/**
 * Maneja un intento fallido de inicio de sesión.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const handleFailedLogin = (user, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Actualiza el número de intentos de inicio de sesión
    yield (0, exports.updateLoginAttemptslogin)(user);
    // Obtener el número actualizado de intentos de inicio de sesión desde la base de datos
    const updatedUser = yield (0, lockAccount_1.findUserByUserName)(user.usuario);
    // Maneja el bloqueo de la cuenta si es necesario
    yield (0, exports.handleMaxLoginAttemptslogin)(updatedUser, res);
    // Envía un mensaje de error al cliente
    res.status(400).json({
        msg: errorMessages_1.errorMessages.incorrectPassword(updatedUser.verificacion.intentos_ingreso),
    });
});
/**
 * Bloquea la cuenta si se excede el número máximo de intentos de inicio de sesión.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const handleMaxLoginAttemptslogin = (user, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (user.verificacion.intentos_ingreso >= MAX_LOGIN_ATTEMPTS) {
        yield (0, lockAccount_1.lockAccount)(user.usuario);
        res.status(400).json({
            msg: errorMessages_1.errorMessages.accountLocked,
        });
    }
});
exports.handleMaxLoginAttemptslogin = handleMaxLoginAttemptslogin;
/**
 * Actualiza el número de intentos de inicio de sesión en la tabla de Verificacion.
 * @param user Usuario encontrado.
 */
const updateLoginAttemptslogin = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const currentLoginAttempts = user.verificacion.intentos_ingreso || 0;
    const updatedLoginAttempts = currentLoginAttempts >= MAX_LOGIN_ATTEMPTS ? MAX_LOGIN_ATTEMPTS : currentLoginAttempts + 1;
    yield verificationsModel_1.default.update({ intentos_ingreso: updatedLoginAttempts }, { where: { usuario_id: user.usuario_id } });
});
exports.updateLoginAttemptslogin = updateLoginAttemptslogin;
