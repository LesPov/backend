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
exports.updateVerificationTable = exports.calculateBlockExpirationDate = exports.findUserByUserName = exports.handleLockAccountError = exports.handleAccountLock = exports.findUserAndBlockAccount = exports.lockAccount = void 0;
const usuariosModel_1 = __importDefault(require("../../../../models/usuarios/usuariosModel"));
const verificationsModel_1 = __importDefault(require("../../../../models/verificaciones/verificationsModel"));
// Máximo de intentos de inicio de sesión permitidos
const BLOCK_DURATION_MINUTES = 3;
const MAX_LOGIN_ATTEMPTS = 5;
/**
 * Bloquea la cuenta del usuario después de varios intentos fallidos de inicio de sesión.
 * @async
 * @param {string} usuario - El nombre de usuario del usuario cuya cuenta se bloqueará.
 * @returns {Promise<void>} - Resuelve después de bloquear la cuenta del usuario si se encuentra en la base de datos.
 */
const lockAccount = (usuario) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield (0, exports.findUserAndBlockAccount)(usuario);
        if (user) {
            yield (0, exports.handleAccountLock)(user);
        }
    }
    catch (error) {
        (0, exports.handleLockAccountError)(error);
    }
});
exports.lockAccount = lockAccount;
const findUserAndBlockAccount = (usuario) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, exports.findUserByUserName)(usuario);
    if (!user) {
        throw new Error('Usuario no encontrado');
    }
    const expirationDate = (0, exports.calculateBlockExpirationDate)();
    yield (0, exports.updateVerificationTable)(user, expirationDate);
    return user;
});
exports.findUserAndBlockAccount = findUserAndBlockAccount;
const handleAccountLock = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const expirationDate = (0, exports.calculateBlockExpirationDate)();
    yield (0, exports.updateVerificationTable)(user, expirationDate);
});
exports.handleAccountLock = handleAccountLock;
const handleLockAccountError = (error) => {
    console.error('Error al bloquear la cuenta:', error);
};
exports.handleLockAccountError = handleLockAccountError;
/**
 * Encuentra a un usuario por nombre de usuario e incluye información de verificación.
 * @param {string} usuario - El nombre de usuario del usuario a buscar.
 * @returns {Promise<any>} - Resuelve con el objeto de usuario si se encuentra, de lo contrario, null.
 */
const findUserByUserName = (usuario) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield usuariosModel_1.default.findOne({
        where: { usuario: usuario },
        include: [verificationsModel_1.default],
    });
    return user || null;
});
exports.findUserByUserName = findUserByUserName;
/**
 * Calcula la fecha de vencimiento para el bloqueo de la cuenta.
 * @returns {Date} - La fecha de vencimiento calculada.
 */
const calculateBlockExpirationDate = () => {
    const currentDate = new Date();
    return new Date(currentDate.getTime() + BLOCK_DURATION_MINUTES * 60 * 1000);
};
exports.calculateBlockExpirationDate = calculateBlockExpirationDate;
/**
 * Actualiza la tabla de verificación para reflejar el bloqueo de la cuenta.
 * @param {any} user - El objeto de usuario.
 * @param {Date} expirationDate - La fecha de vencimiento para el bloqueo de la cuenta.
 * @returns {Promise<void>} - Resuelve después de actualizar la tabla de verificación.
 */
const updateVerificationTable = (user, expirationDate) => __awaiter(void 0, void 0, void 0, function* () {
    yield verificationsModel_1.default.update({
        intentos_ingreso: MAX_LOGIN_ATTEMPTS,
        expiracion_intentos_ingreso: expirationDate,
    }, { where: { usuario_id: user.usuario_id } });
});
exports.updateVerificationTable = updateVerificationTable;
