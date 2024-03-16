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
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkLoginAttemptsAndBlockAccount = exports.checkUserVerificationStatusLogin = void 0;
const errorMessages_1 = require("../../../../middleware/errorMessages");
const unlockAccoun_1 = require("../unlockAccount/unlockAccoun");
const MAX_LOGIN_ATTEMPTS = 5;
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
////////////////////////////////////////////////////////////////////////////////
/**
 * Verifica si la cuenta del usuario está bloqueada debido a intentos fallidos de inicio de sesión.
 * @param user Usuario encontrado.
 * @returns true si la cuenta está bloqueada, false si no lo está.
 */
const isAccountBlocked = (user) => {
    return user.verificacion.intentos_ingreso >= MAX_LOGIN_ATTEMPTS;
};
/**
 * Verifica si la cuenta está bloqueada temporalmente y maneja la respuesta HTTP en consecuencia.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const handleTemporaryLock = (user, res) => {
    const currentDate = new Date();
    const expirationDate = user.verificacion.expiracion_intentos_ingreso;
    if (expirationDate && expirationDate > currentDate) {
        const timeLeft = Math.ceil((expirationDate.getTime() - currentDate.getTime()) / (60 * 1000));
        res.status(400).json({
            msg: `La cuenta está bloqueada temporalmente debido a múltiples intentos fallidos. Inténtalo de nuevo más tarde. Tiempo restante: ${timeLeft} minutos`,
        });
    }
    else {
        (0, unlockAccoun_1.unlockAccount)(user.usuario);
    }
};
/**
 * Verifica si la cuenta está bloqueada y maneja la respuesta HTTP en consecuencia.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const checkAndHandleAccountBlock = (user, res) => {
    if (isAccountBlocked(user)) {
        handleTemporaryLock(user, res);
    }
};
/**
 * Verifica si la cuenta está bloqueada según la nueva lógica proporcionada y maneja la respuesta HTTP en consecuencia.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const checkAndHandleNewAccountBlockLogic = (user, res) => {
    const currentDate = new Date();
    const blockExpiration = user.verificacion.blockExpiration;
    if (blockExpiration && blockExpiration > currentDate) {
        const timeLeft = Math.ceil((blockExpiration.getTime() - currentDate.getTime()) / (60 * 1000));
        res.status(400).json({
            msg: `La cuenta está bloqueada temporalmente debido a múltiples intentos fallidos. Inténtalo de nuevo más tarde. Tiempo restante: ${timeLeft} minutos`,
        });
    }
};
/**
 * Verifica el estado de bloqueo de la cuenta y maneja la respuesta HTTP en consecuencia.
 * @param user Usuario encontrado.
 * @param res Objeto de respuesta HTTP.
 */
const checkLoginAttemptsAndBlockAccount = (user, res) => __awaiter(void 0, void 0, void 0, function* () {
    checkAndHandleAccountBlock(user, res);
    checkAndHandleNewAccountBlockLogic(user, res);
});
exports.checkLoginAttemptsAndBlockAccount = checkLoginAttemptsAndBlockAccount;
